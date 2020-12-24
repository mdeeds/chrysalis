import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Cube } from "./cube";

export class BasicBot extends Cube {
  constructor(gl: WebGLRenderingContext, x: number, z: number) {
    super(gl, "Basic Bot.png", x, 1.0, z);
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