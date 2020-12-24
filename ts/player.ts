import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Cube } from "./cube";

export class Player extends Cube {
  constructor(gl: WebGLRenderingContext, x: number, z: number) {
    super(gl, "Head-1.png", x, 1.5, z);
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    const elapsedSeconds = window.performance.now() / 1000 - this.startTimeSeconds;
    const rotation = Math.sin(elapsedSeconds) * 3;
    GLM.mat4.rotate(objectTransform, objectTransform,
      rotation, [0, 1, 0]);
    GLM.mat4.translate(objectTransform, objectTransform,
      [0, 0, 0]);
    GLM.mat4.scale(objectTransform, objectTransform,
      [0.4, 0.4, 0.4])
    return objectTransform;
  }
}