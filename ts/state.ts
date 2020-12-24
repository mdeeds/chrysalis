
class ThingState {
  x: number;
  z: number;

  apply(other: ThingState) {
    if (other.x != null) {
      this.x = other.x;
    }
    if (other.z != null) {
      this.z = other.z;
    }
  }
}

export class State {
  you: ThingState;
  map: string[];
  constructor() {
    this.you = new ThingState();
  }

  apply(other: State) {
    if (other.you != null) {
      this.you.apply(other.you);
    }
  }
}