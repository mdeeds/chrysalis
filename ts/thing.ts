import { ProgramInfo } from "./programInfo";
import { ThingState } from "./thingState";

export class Thing {
  state: ThingState;
  lightness: number;
  collisionLayer: number;
  radius: number;

  constructor() {
    this.lightness = 0.0;

    // pi r^2 = 4.0
    // r^2 = 4.0 / pi
    // r = sqrt(4 / pi)
    this.radius = Math.sqrt(4 / Math.PI);
  }

  render(gl: WebGLRenderingContext, programInfo: ProgramInfo) {
  }
}