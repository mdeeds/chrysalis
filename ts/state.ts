import { StateDelta } from "./stateDelta";
import { ThingState } from "./thingState";
import { ThingStateDelta } from "./thingStateDelta";

export class State {
  you: ThingState;
  map: string[];
  constructor() {
  }

  apply(other: StateDelta) {
    if (other.you != null) {
      if (this.you == null) {
        this.you = new ThingState([0, 0, 0]);
      }
      this.applyThing(this.you, other.you);
    }
  }

  applyThing(target: ThingState, other: ThingStateDelta) {
    if (other.dxyz != null) {
      for (let i = 0; i < 3; ++i) {
        target.xyz[i] += other.dxyz[i];
      }
    }
    if (other.drive > 0) {
      const dt = (other.turn == null) ? 0 : other.turn / 10;
      const dr = Math.max(0, Math.min(1, (other.drive) - dt));
      const dz = Math.cos(target.heading) * dr;
      const dx = Math.sin(target.heading) * dr;
      target.heading += dt;
      target.xyz[0] = target.xyz[0] + dx;
      target.xyz[2] = target.xyz[2] + dz;
    }
  }

  mergeFrom(other: State) {
    if (other.map != null) {
      this.map = other.map;
    }
    if (other.you != null) {
      if (this.you == null) {
        this.you = new ThingState([0, 0, 0]);
      }
      this.you.mergeFrom(other.you);
    }
  }
}