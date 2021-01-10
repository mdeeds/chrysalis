import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Geometry } from "./geometry";
import { Shape } from "./shape";
import { ThingState } from "./thingState";

export class Tablet extends Shape {
  constructor(gl: WebGLRenderingContext, state: ThingState) {
    let source = "tabletNote.png";
    if (state.data && state.data.type) {
      switch (state.data.type) {
        case "lib": source = "tabletLib.png"; break;
        case "api": source = "tabletApi.png"; break;
        case "note": source = "tabletNote.png"; break;
      }
    }
    super(gl, source, state);
    this.lightness = 0.0;
    this.radius = 0.8;

    const positions = [];
    const vertexNormals = [];
    const textureCoordinates = [];

    Geometry.addCubeData(positions, textureCoordinates, vertexNormals,
      0.8, 0.8, 0.15);
    Geometry.translate(positions, 0, 0.5, 0);
    Geometry.addCylinderData(positions, textureCoordinates, vertexNormals, 0.1);

    this.vertexCount = positions.length / 3;

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(positions), gl.STATIC_DRAW);

    this.textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
      gl.STATIC_DRAW);
  }
  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    GLM.mat4.translate(objectTransform, objectTransform,
      [0, 2, 0]);
    return objectTransform;
  }
}