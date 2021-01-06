import { Ground } from "./ground";
import { ThingState } from "./thingState";

export class Tile extends Ground {
  constructor(gl: WebGLRenderingContext, state: ThingState) {
    super(gl, "Basic Bot-5.png", state);
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    return objectTransform;
  }
}