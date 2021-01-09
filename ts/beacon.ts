import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Geometry } from "./geometry";
import { Shape } from "./shape";
import { ThingState } from "./thingState";

export class Beacon extends Shape {
  constructor(gl: WebGLRenderingContext, state: ThingState) {
    super(gl, "Beacon.png", state);
    this.radius = 0.4;

    const positions = []
    const vertexNormals = [];
    const textureCoordinates = [];

    Geometry.addCubeData(positions, textureCoordinates, vertexNormals,
      0.4, 0.6, 0.4);
    Geometry.translate(positions, 0, 1.8, 0);
    Geometry.addCylinderData(positions, textureCoordinates, vertexNormals, 0.2);
    this.createBuffers(gl, positions, textureCoordinates, vertexNormals);
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    GLM.mat4.translate(objectTransform, objectTransform,
      [0, 2, 0]);
    return objectTransform;
  }
}