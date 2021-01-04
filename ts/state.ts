import { Log } from "./log";
import { Ocean } from "./ocean";
import { BoundingBox, QuadTree } from "./quadTree";
import { StateDelta } from "./stateDelta";
import { Thing } from "./thing";
import { ThingState } from "./thingState";
import { ThingStateDelta } from "./thingStateDelta";
import { Tile } from "./tile";

export class State {
  players: Map<string, ThingState>;
  everything: QuadTree<Thing>;
  gl: WebGLRenderingContext;
  radius: number;
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.players = new Map<string, ThingState>();
    this.everything = new QuadTree(new BoundingBox(0, 0, 1024));
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
    if (other.drive > 0 && other.turn != null) {
      const drive = Math.max(0.0, Math.min(1.0, other.drive));
      const turn = Math.max(-1.0, Math.min(1.0, other.turn));
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
    dict.radius = this.radius;

    for (const t of this.everything.allEntries()) {
      if (t instanceof Tile) {
        dict.tiles.push([t.state.xyz[0], t.state.xyz[2]]);
      }
    }

    dict.players = {};
    for (const playerName of this.players.keys()) {
      dict.players[playerName] = this.players.get(playerName);
    }

    return JSON.stringify(dict);
  }

  deserialize(data: string) {
    const dict: any = JSON.parse(data);
    this.mergeFromObject(dict);
    Log.info("Loaded size: " + data.length.toLocaleString());
    const map: any = dict.map;
    this.radius = dict.radius;

    for (const tilePosition of dict.tiles) {
      const x: number = tilePosition[0];
      const z: number = tilePosition[1];
      const tile = new Tile(this.gl,
        new ThingState([x, 0, z]));
      this.everything.insert(x, z, tile);
    }

    const scan: Thing[] = [];
    for (let j = -this.radius; j < this.radius; j += 2) {
      const z = j;
      for (let i = -this.radius; i < this.radius; i += 2) {
        const x = i;
        while (scan.length > 0) {
          scan.pop();
        }
        this.everything.appendFromRange(new BoundingBox(x, z, 0.5), scan);
        if (scan.length == 0) {
          const ocean = new Ocean(this.gl, new ThingState([x, 0, z]));
          this.everything.insert(x, z, ocean);
        }
      }
    }
  }
}