// Pure data class with no dependencies.
export class ThingState {
  xyz: Float32Array;
  heading: number;  // orientation on the X-Z plane.  Zero is Z-positive.
  code: string;

  constructor(position: number[]) {
    if (position != null) {
      this.xyz = new Float32Array(position);
    } else {
      this.xyz = new Float32Array(3);
    }
    this.heading = 0.0;
    this.code = null;
  }

  mergeFrom(other: ThingState) {
    if (other.xyz != null) {
      this.xyz[0] = other.xyz[0];
      this.xyz[1] = other.xyz[1];
      this.xyz[2] = other.xyz[2];
    }
    if (other.heading != null) {
      this.heading = other.heading;
    }
    if (other.code != null) {
      this.code = other.code;
    }
  }
}

