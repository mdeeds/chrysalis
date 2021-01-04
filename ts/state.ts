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
  map: string[];
  gl: WebGLRenderingContext;
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.players = new Map<string, ThingState>();
    this.everything = new QuadTree(new BoundingBox(0, 0, 1000));
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
      const kSpeed = 0.2;
      const radius = 0.8;
      const dr = other.drive * kSpeed * (1 - Math.abs(other.turn));
      const dt = (dr / radius) * other.turn;

      const dz = Math.cos(target.heading) * dr;
      const dx = Math.sin(target.heading) * dr;
      target.heading += dt;
      target.xyz[0] = target.xyz[0] + dx;
      target.xyz[2] = target.xyz[2] + dz;
    }
    if (other.state != null) {
      target.data = other.state;
    }
  }

  private mergeFromObject(other: any) {
    if (other.map != null) {
      this.map = other.map;
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
  }

  getThings(bb: BoundingBox) {
    const result: Thing[] = [];
    this.everything.appendFromRange(bb, result);
    return result;
  }

  serialize() {
    return "TODO";
  }

  deserialize(data: string) {
    const dict: any = JSON.parse(data);
    this.mergeFromObject(dict);
    Log.info("Loaded size: " + data.length.toLocaleString());
    const map: any = dict.map;
    const height = map.length;
    let width = 0;
    for (let l of map) {
      width = Math.max(width, l.length);
    }

    for (let j = 0; j < height; ++j) {
      const l = map[j];
      const z = j * 2.0;
      for (let i = 0; i < width; ++i) {
        const x = i * 2.0;
        let c = '~';
        if (i < l.length) {
          c = l[i];
        }
        switch (c) {
          case '#':
            const tile = new Tile(this.gl, new ThingState([x, 0, z]));
            this.everything.insert(x, z, tile);
            break;
          case '~':
            const ocean = new Ocean(this.gl, new ThingState([x, 0, z]));
            this.everything.insert(x, z, ocean);
        }
      }
    }

  }
}