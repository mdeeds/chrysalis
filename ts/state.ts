import { Log } from "./log";
import { StateDelta } from "./stateDelta";
import { ThingState } from "./thingState";
import { ThingStateDelta } from "./thingStateDelta";

export class State {
  players: Map<string, ThingState>;
  map: string[];
  constructor() {
    this.players = new Map<string, ThingState>();
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

  mergeFromObject(other: any) {
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
}