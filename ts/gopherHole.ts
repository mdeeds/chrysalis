import { Geometry } from "./geometry";
import { Shape } from "./shape";
import * as GLM from "gl-matrix"  // npm install -D gl-matrix

import { ThingState } from "./thingState";

export class GopherHole extends Shape {
  constructor(gl: WebGLRenderingContext, state: ThingState) {
    super(gl, "GopherHole.png", state);

    const positions = [];
    const textureCoordinates = [];
    const vertexNormals = [];
    Geometry.addCubeData(positions, textureCoordinates, vertexNormals,
      1.0, 1, 1.0);
    Geometry.translate(positions, 0, 0.3, 0);

    this.createBuffers(gl, positions, textureCoordinates, vertexNormals);
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    GLM.mat4.rotate(objectTransform, objectTransform, Math.PI / 4,
      [0, -1, 0]);
    return objectTransform;
  }
}