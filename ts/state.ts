import { Hazard } from "./hazard";
import { Library } from "./library";
import { Log } from "./log";
import { Ocean } from "./ocean";
import { Player } from "./player";
import { BoundingBox, QuadTree } from "./quadTree";
import { StateDelta } from "./stateDelta";
import { Thing } from "./thing";
import { ThingCodec } from "./thingCodec";
import { ThingState } from "./thingState";
import { ThingStateDelta } from "./thingStateDelta";
import { Tile } from "./tile";

export class State {
  radius: number;
  readonly players: Map<string, ThingState>;
  readonly everything: QuadTree<Thing>;
  private thingIndex: Map<number, Thing>;
  readonly library: Library;

  gl: WebGLRenderingContext;
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.players = new Map<string, ThingState>();
    this.everything = new QuadTree(new BoundingBox(0, 0, 1024));
    this.thingIndex = new Map<number, Thing>();
    this.library = new Library();
    this.radius = 0;
  }

  apply(other: StateDelta) {
    if (other.players != null) {
      for (let name of other.players.keys()) {
        if (!this.players.has(name)) {
          Log.info("Orphaned ThingStateDelta for " + name);
          this.players[name] = new ThingState([0, 0, 0]);
        }
        this.applyThing(this.players[name], other.players[name]);
      }
    }
  }

  applyThing(target: ThingState, other: ThingStateDelta) {
    if (other.dxyz != null) {
      for (let i = 0; i < 3; ++i) {
        target.xyz[i] += other.dxyz[i];
      }
    }
    if (other.drive != null && other.drive != 0 && other.turn != null) {
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
      target.heading = target.heading % (Math.PI * 2);
      target.xyz[0] = target.xyz[0] + dx;
      target.xyz[2] = target.xyz[2] + dz;
    }
    if (other.state != null) {
      target.data = other.state;
    }
  }

  private mergeFromObject(other: any) {
    if (other.players != null) {
      for (let name of Object.keys(other.players)) {
        Log.info(`Loading ${name} player info`);
        if (!this.players.has(name)) {
          this.players.set(name, new ThingState([0, 0, 0]));
        }
        this.players.get(name).mergeFrom(other.players[name]);
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

  mergeThings(thingsDict: any) {
    for (const encoded of thingsDict) {
      const thing: Thing = ThingCodec.decode(this.gl, encoded, this.library);
      if (thing instanceof Tile) {
        // TODO: Support tile updates?
        continue;
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
  }

  deserialize(data: string) {
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
}