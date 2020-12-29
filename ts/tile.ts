import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Cube } from "./cube";
import { ThingState } from "./thingState";

export class Tile extends Cube {
  constructor(gl: WebGLRenderingContext, state: ThingState) {
    super(gl, "Basic Bot-5.png", state);
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    return objectTransform;
  }
}