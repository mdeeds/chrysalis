import { Shape } from "./shape";
import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { ThingState } from "./thingState";
import { Geometry } from "./geometry";

export class Gem extends Shape {
  vertexCount: number;

  constructor(gl: WebGLRenderingContext, state: ThingState) {
    super(gl, "img/Gem-2.png", state);
    let positions: number[] = [];
    let normals: number[] = [];
    let textureCoords: number[] = [];

    Geometry.addGemData(positions, normals, textureCoords);
    this.createBuffers(gl, positions, textureCoords, normals);
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    const elapsedSeconds = window.performance.now() / 1000
      - this.startTimeSeconds;
    const rotation = elapsedSeconds * 3;
    GLM.mat4.translate(objectTransform, objectTransform,
      [0, 1.5, 0]);
    GLM.mat4.rotate(objectTransform, objectTransform,
      rotation, [0, 1, 0]);
    GLM.mat4.scale(objectTransform, objectTransform,
      [0.8, 0.8, 0.8])
    return objectTransform;
  }
}