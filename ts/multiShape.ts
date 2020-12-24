import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { ProgramInfo } from "./programInfo";
import { Shape } from "./shape";
import { Thing } from "./thing";

export class MultiShape extends Thing {
  x: number; // TODO: move these to Thing
  z: number;
  shapes: Shape[];

  constructor(x: number, z: number) {
    super();
    this.x = x;
    this.z = z;
    this.shapes = [];
  }

  addShape(s: Shape) {
    this.shapes.push(s);
  }

  getObjectTransform() {
    const objectTransform = GLM.mat4.create();
    GLM.mat4.translate(objectTransform, objectTransform,
      [this.x, 1.0, this.z])
    return objectTransform;
  }

  render(gl: WebGLRenderingContext, programInfo: ProgramInfo) {
    for (const s of this.shapes) {
      s.render(gl, programInfo);
    }
  }

}