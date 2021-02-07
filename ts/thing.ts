import { ProgramInfo } from "./programInfo";
import { ThingState } from "./thingState";

export class Thing {
  state: ThingState;
  lightness: number;
  collisionLayer: number;
  radius: number;

  constructor() {
    this.lightness = 0.0;

    // 1.128 which makes the circle's area equal to 4.
    this.radius = 1.128;
  }

  render(gl: WebGLRenderingContext, programInfo: ProgramInfo) {
  }

  upload(code: string, libraryList: string) {
    this.state.code = code;
    this.state.libraryList = libraryList;
  }
}