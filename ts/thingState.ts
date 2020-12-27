// Pure data class with no dependencies.
export class ThingState {
  xyz: Float32Array;
  heading: number;  // orientation on the X-Z plane.  Zero is Z-positive.

  // TODO: Should this be a ThingStateDelta?
  dxyz: Float32Array;
  turn: number;  // Turn rate.  Negative is left, positive is right.
  drive: number;  // Movement speed.  Zero is minimum (stopped), one is fastest.
  constructor() { }
}

