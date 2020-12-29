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