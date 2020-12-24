import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Cube } from "./cube";

export class Ocean extends Cube {
  rate: number;
  x: number;
  constructor(gl: WebGLRenderingContext, x: number, z: number) {
    super(gl, "Ocean-1.png", x, z);
    this.rate = (3 + Math.random() * 2) / 6;
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    const elapsedSeconds = window.performance.now() / 1000 - this.startTimeSeconds;
    let d = Math.sin(elapsedSeconds / this.rate) * 0.2;
    GLM.mat4.translate(objectTransform, objectTransform,
      [0, -1 - d, 0])
    return objectTransform;
  }
}