import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Cube } from "./cube";
import { ThingState } from "./thingState";

export class BasicBot extends Cube {
  constructor(gl: WebGLRenderingContext, state: ThingState) {
    super(gl, "Basic Bot.png", state);
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    const elapsedSeconds = window.performance.now() / 1000 - this.startTimeSeconds;
    GLM.mat4.rotate(objectTransform, objectTransform,
      elapsedSeconds, [0, 1, 0]);
    let d = Math.sin(elapsedSeconds * 10) * 0.1;
    GLM.mat4.translate(objectTransform, objectTransform,
      [0, d, 0])
    return objectTransform;
  }
}