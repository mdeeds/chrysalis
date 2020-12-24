
class ThingState {
  xyz: number[];
  dxyz: number[];
  constructor() { }

  apply(other: ThingState) {
    if (other.xyz != null) {
      this.xyz = other.xyz;
    }
    if (other.dxyz != null) {
      for (const i of this.xyz) {
        this.xyz[i] += other.dxyz[i];
      }
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