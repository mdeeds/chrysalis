import { Cube } from "./cube";
import { ThingState } from "./thingState";

export class Ground extends Cube {
  constructor(gl: WebGLRenderingContext, url: string, state: ThingState) {
    super(gl, url, state);
  }
}