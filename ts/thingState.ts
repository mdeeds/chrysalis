// Pure data class with no dependencies.
export class ThingState {
  xyz: Float32Array;
  heading: number;  // orientation on the X-Z plane.  Zero is Z-positive.
  code: string;
  libraryList: string;
  imageSource: string;
  data: any;

  constructor(position: number[]) {
    if (position != null) {
      this.xyz = new Float32Array(position);
    } else {
      this.xyz = new Float32Array(3);
    }
    this.heading = 0.0;
    this.code = null;
    this.libraryList = null;
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
    if (other.libraryList != null) {
      this.libraryList = other.libraryList;
    }
    if (other.imageSource != null) {
      this.imageSource = other.imageSource;
    }
    if (other.data != null) {
      // TODO: Should this merge?
      this.data = other.data;
    }
  }

  inFrontXZ(): number[] {
    const x = this.xyz[0] - Math.sin(this.heading) * 2.0;
    const z = this.xyz[2] + Math.cos(this.heading) * 2.0;
    return [x, z];
  }
}

