export class ThingStateDelta {
  // TODO: Should this be a ThingStateDelta?
  dxyz: Float32Array;
  turn: number;  // Turn rate.  Negative is left, positive is right.
  drive: number;  // Movement speed.  Zero is minimum (stopped), one is fastest.
  constructor() {
    this.dxyz = new Float32Array(3);
    this.turn = 0.0;
    this.drive = 0.0;
  }
}