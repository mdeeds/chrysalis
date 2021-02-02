import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Geometry } from "./geometry";
import { Shape } from "./shape";
import { ThingState } from "./thingState";

export class Flower extends Shape {
  constructor(gl: WebGLRenderingContext, state: ThingState) {
    let imageSource = "img/Flower.png";
    super(gl, imageSource, state);
    this.lightness = 0.0;
    this.radius = 0.2;

    const positions = []
    const vertexNormals = [];
    const textureCoordinates = [];

    Geometry.addCylinderData(positions, textureCoordinates, vertexNormals,
      0.2);
    this.createBuffers(gl, positions, textureCoordinates, vertexNormals);
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    GLM.mat4.translate(objectTransform, objectTransform,
      [0, 0.7 * this.state.data.position, 0]);
    return objectTransform;
  }
}