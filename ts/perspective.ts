// This class is purely data.  It conveys information to our Web Workers,
// and we don't want to use any bandwidth moving code around.

// I haven't confirmed if that's a thing...
export class Perspective {
  currentHeading: number;  // Measured in radians.
  keysDown: Set<string>;
  data: any;
  closestPlayer: number[];
  closestBeacon: number[];
  countBeacons: number;
  isLifting: boolean;
  isLifted: boolean;
  constructor() {
    this.data = {};
  }
}