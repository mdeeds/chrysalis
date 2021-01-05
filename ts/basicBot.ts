import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Cube } from "./cube";
import { ThingState } from "./thingState";

export class BasicBot extends Cube {
  constructor(gl: WebGLRenderingContext, state: ThingState) {
    super(gl, "Basic Bot.png", state);
    this.lightness = 0.5;
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    GLM.mat4.translate(objectTransform, objectTransform,
      [0, 2.0, 0])
    return objectTransform;
  }
}