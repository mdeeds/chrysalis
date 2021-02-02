import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Geometry } from "./geometry";
import { Shape } from "./shape";
import { ThingState } from "./thingState";

export class Gopher extends Shape {
  constructor(gl: WebGLRenderingContext, state: ThingState) {
    super(gl, "img/Gopher.png", state);
    this.radius = 0.5;

    const positions = []
    const vertexNormals = [];
    const textureCoordinates = [];

    Geometry.addCubeData(positions, textureCoordinates, vertexNormals,
      0.5, 0.8, 0.5);
    Geometry.translate(positions, 0, 0, 0);
    this.createBuffers(gl, positions, textureCoordinates, vertexNormals);
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    GLM.mat4.translate(objectTransform, objectTransform,
      [0, 1.6, 0]);
    GLM.mat4.rotate(objectTransform, objectTransform, Math.PI / 4,
      [0, -1, 0]);
    return objectTransform;
  }
}