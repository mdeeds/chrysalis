import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Cube } from "./cube";

export class Tile extends Cube {
  constructor(gl: WebGLRenderingContext, x: number, z: number) {
    super(gl, "Basic Bot-5.png", x, z);
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    GLM.mat4.translate(objectTransform, objectTransform,
      [0, -1, 0])
    return objectTransform;
  }
}