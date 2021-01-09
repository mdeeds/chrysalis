import { Geometry } from "./geometry";
import { Shape } from "./shape";
import { ThingState } from "./thingState";

export class Cube extends Shape {

  constructor(gl: WebGLRenderingContext, url: string, state: ThingState) {
    super(gl, url, state);
    this.loadTexture(gl, url)

    const positions = [];
    const textureCoordinates = [];
    const vertexNormals = [];
    Geometry.addCubeData(positions, textureCoordinates, vertexNormals,
      1, 1, 1);
    this.createBuffers(gl, positions, textureCoordinates, vertexNormals);
  }

}