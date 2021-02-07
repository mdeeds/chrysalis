// Pure data class with no dependencies.
export class ThingState {

  static numberOfThings: number = 0;

  xyz: Float32Array;
  heading: number;  // orientation on the X-Z plane.  Zero is Z-positive.
  code: string;
  libraryList: string;
  imageSource: string;
  data: any;
  id: number;
  gemLevel: number;

  constructor(position: number[]) {
    ThingState.numberOfThings += 1;
    this.id = ThingState.numberOfThings;
    if (position != null) {
      this.xyz = new Float32Array(position);
    } else {
      this.xyz = new Float32Array(3);
    }
    this.heading = 0.0;
    this.code = null;
    this.libraryList = null;
    this.gemLevel = 0;
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
    if (other.id) {
      this.id = other.id;
      ThingState.numberOfThings = Math.max(this.id, ThingState.numberOfThings);
    }
    if (other.gemLevel != null) {
      this.gemLevel = other.gemLevel;
    }
  }

  inFrontXZ(distance: number): number[] {
    const x = this.xyz[0] - Math.sin(this.heading) * distance;
    const z = this.xyz[2] + Math.cos(this.heading) * distance;
    return [x, z];
  }
}

