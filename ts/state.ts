import { ThingState } from "./thingState";

export class State {
  you: ThingState;
  map: string[];
  constructor() {
    this.you = new ThingState();
  }

  apply(other: State) {
    if (other.you != null) {
      this.applyThing(this.you, other.you);
    }
    if (other.map != null) {
      this.map = other.map;
    }
  }

  applyThing(target: ThingState, other: ThingState) {
    if (other.xyz != null) {
      target.xyz = other.xyz;
    }
    if (other.dxyz != null) {
      for (let i = 0; i < 3; ++i) {
        target.xyz[i] += other.dxyz[i];
      }
    }
  }
}