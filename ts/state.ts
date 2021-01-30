import { Hazard } from "./hazard";
import { Library } from "./library";
import { Log } from "./log";
import { Ocean } from "./ocean";
import { Player } from "./player";
import { BoundingBox, QuadTreeView } from "./quadTreeView";
import { QuadTree } from "./quadTree";
import { StateDelta } from "./stateDelta";
import { Thing } from "./thing";
import { ThingCodec } from "./thingCodec";
import { ThingState } from "./thingState";
import { ThingStateDelta } from "./thingStateDelta";
import { Tile } from "./tile";

export class State {
  radius: number;
  readonly players: Map<string, number>;
  private everything: QuadTree<Thing>;
  private thingIndex: Map<number, Thing>;
  readonly library: Library;

  private gl: WebGLRenderingContext;
  private worldName: string;
  private saveButton: HTMLAnchorElement;
  private username: string;
  private broadcast: Function;
  constructor(gl: WebGLRenderingContext, worldName: string,
    username: string, broadcast: Function = null) {
    this.gl = gl;
    this.worldName = worldName;
    this.username = username;
    this.broadcast = broadcast;
    this.players = new Map<string, number>();
    this.everything = new QuadTree(new BoundingBox(0, 0, 1024));
    this.thingIndex = new Map<number, Thing>();
    this.library = new Library();
    this.radius = 0;

    this.saveButton = document.createElement('a');
    this.saveButton.innerText = "Download";
    // this.saveButton.download = "vialis.json";
    const saveDiv = document.createElement('div');
    saveDiv.appendChild(this.saveButton);
    saveDiv.classList.add("download");
    document.getElementsByTagName('body')[0].appendChild(saveDiv);
  }

  getEverything(): QuadTreeView<Thing> {
    return this.everything as QuadTreeView<Thing>;
  }

  // TODO: Broadcast
  insert(x: number, z: number, thing: Thing) {
    this.everything.insert(x, z, thing);
  }

  // TODO: Broadcast
  remove(thing: Thing) {
    this.everything.remove(thing);
  }

  // TODO: Broadcast
  move(newX: number, newZ: number, thing: Thing) {
    if (this.broadcast !== null) {
      if (thing instanceof Player || thing.state.id === 1) {
        this.broadcast(`Move: ${JSON.stringify(ThingCodec.encode(thing))}`);
      }
    }
    this.everything.move(newX, newZ, thing);
  }

  applyThing(thing: Thing, other: ThingStateDelta) {
    const target = thing.state;
    let moved = false;
    if (other.turn !== NaN && other.drive !== NaN &&
      other.drive != null && other.drive != 0 && other.turn != null) {
      const drive = Math.max(-1.0, Math.min(1.0, other.drive));
      let turn = Math.max(-1.0, Math.min(1.0, other.turn));
      if (other.drive < 0) {
        turn = -turn;
      }
      const kSpeed = 0.2;
      const radius = 0.8;
      const dr = drive * kSpeed * (1 - Math.abs(turn));
      const dt = (drive * kSpeed / radius) * turn;

      const dz = Math.cos(target.heading) * dr;
      const dx = -Math.sin(target.heading) * dr;
      target.heading += dt;
      target.heading =
        (target.heading + Math.PI) % (Math.PI * 2) - Math.PI;
      target.xyz[0] = target.xyz[0] + dx;
      target.xyz[2] = target.xyz[2] + dz;
      moved = (dx !== 0 || dz !== 0);
    }
    if (other.state != null) {
      target.data = other.state;
    }
    if (moved) {
      this.move(target.xyz[0], target.xyz[2], thing);
    }
  }

  private mergeFromObject(other: any) {
    if (other.players != null) {
      for (let name of Object.keys(other.players)) {
        Log.info(`Loading ${name} player info`);
        const playerDict = other.players[name];
        if (this.players.has(name)) {
          const playerId = this.players.get(name);
          const playerThing = this.thingIndex.get(playerId);
          playerThing.state.mergeFrom(playerDict);
        } else {
          const playerId: number = playerDict.id;
          const newPlayer = new Player(this.gl, new ThingState([0, 0, 0]));
          newPlayer.state.mergeFrom(other.players[name]);
          this.everything.insert(newPlayer.state.xyz[0], newPlayer.state.xyz[2],
            newPlayer);
          this.thingIndex.set(playerId, newPlayer);
          this.players.set(name, playerId);
        }
      }
    }
  }

  getThings(bb: BoundingBox) {
    const result: Thing[] = [];
    this.everything.appendFromRange(bb, result);
    return result;
  }

  serialize() {
    const dict: any = {};

    dict.tiles = [];
    dict.hazards = [];
    dict.things = [];
    dict.radius = this.radius;

    for (const t of this.everything.allEntries()) {
      if (t instanceof Ocean) {
        continue;
      } else if (t instanceof Tile) {
        dict.tiles.push([t.state.xyz[0], t.state.xyz[2]]);
      } else if (t instanceof Hazard) {
        dict.hazards.push([t.state.xyz[0], t.state.xyz[2]]);
      } else if (!(t instanceof Player)) {
        const encoded: any = ThingCodec.encode(t);
        if (encoded !== null) {
          dict.things.push(encoded);
        }
      }
    }

    dict.players = {};
    for (const playerName of this.players.keys()) {
      dict.players[playerName] = this.players.get(playerName);
    }

    return JSON.stringify(dict);
  }

  mergeThing(thing: Thing) {
    if (thing instanceof Tile) {
      // TODO: Support tile updates?
      return;
    }
    if (this.thingIndex.has(thing.state.id)) {
      const oldThing = this.thingIndex.get(thing.state.id);
      const moved = (oldThing.state.xyz[0] != thing.state.xyz[0] ||
        oldThing.state.xyz[2] != thing.state.xyz[2]);
      oldThing.state.mergeFrom(thing.state);
      if (moved) {
        this.everything.move(oldThing.state.xyz[0], oldThing.state.xyz[2],
          oldThing);
      }
    } else {
      this.everything.insert(thing.state.xyz[0], thing.state.xyz[2], thing);
      this.thingIndex.set(thing.state.id, thing);
    }
  }

  mergeThings(thingsDict: any) {
    for (const encoded of thingsDict) {
      const thing: Thing = ThingCodec.decode(this.gl, encoded, this.library);
      this.mergeThing(thing);
    }
  }

  private deserialize(data: string) {
    const dict: any = JSON.parse(data);
    this.mergeFromObject(dict);
    Log.info("Loaded size: " + data.length.toLocaleString());
    const map: any = dict.map;
    this.radius = dict.radius;

    const tilePositions: Set<string> = new Set<string>();
    for (const tilePosition of dict.tiles) {
      const x: number = tilePosition[0];
      const z: number = tilePosition[1];
      const pos = `${x},${z}`;
      if (!tilePositions.has(pos)) {
        tilePositions.add(pos);
        const tile = new Tile(this.gl, new ThingState([x, 0, z]));
        this.everything.insert(x, z, tile);
      }
    }

    if (dict.hazards) {
      for (const hazardPosition of dict.hazards) {
        const x: number = hazardPosition[0];
        const z: number = hazardPosition[1];
        const pos = `${x},${z}`;
        if (!tilePositions.has(pos)) {
          tilePositions.add(pos);
          const hazard = new Hazard(this.gl, new ThingState([x, 0, z]));
          this.everything.insert(x, z, hazard);
        }
      }
    }

    if (dict.things) {
      this.mergeThings(dict.things);
    }

    const scan: Thing[] = [];
    for (let j = -this.radius; j < this.radius; j += 2) {
      const z = j;
      for (let i = -this.radius; i < this.radius; i += 2) {
        const x = i;
        scan.splice(0, scan.length);
        this.everything.appendFromRange(new BoundingBox(x, z, 0.5), scan);
        if (scan.length === 0) {
          const ocean = new Ocean(this.gl, new ThingState([x, 0, z]));
          this.everything.insert(x, z, ocean);
        }
      }
    }
  }

  materializeUser(username: string) {
    if (!this.players.has(username)) {
      Log.info(`${username} is new to this world.`);
      const playerState = this.players.get("_prototype");
      this.players.set(username, playerState);
    } else {
      Log.info(`Welcome back, ${username}.`);
    }
  }

  getPlayerCoords() {
    if (!this.players.has(this.username)) {
      this.materializeUser(this.username);
    }
    return this.players.get(this.username).xyz;
  }

  private saveLoop() {
    const serializedState = this.serialize();
    window.localStorage.setItem(`${this.worldName}-world`, serializedState);
    setTimeout(() => { this.saveLoop(); }, 2000);
    const dataUrl = "data:text/javascript;base64," + btoa(serializedState);
    this.saveButton.href = dataUrl;
  }

  buildFromString(data: string) {
    Log.info(`Deserializing ${data.length} bytes of encoded state.`);
    if (data.length < 100) {
      Log.error(`Data: ${data}`);
    }
    this.deserialize(data);

    Log.info(`Loaded ${this.library.size()} libraries.`);
    for (const libName of this.library.libraryNames()) {
      Log.info(`Library: ${libName}`);
    }

    this.saveLoop();
  }
}