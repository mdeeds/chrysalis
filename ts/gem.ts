import { Shape } from "./shape";
import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { ThingState } from "./thingState";

export class Gem extends Shape {
  vertexCount: number;

  constructor(gl: WebGLRenderingContext, state: ThingState) {
    super(gl, "Gem-2.png", state);
    let positions: number[] = [];
    let textureCoords: number[] = [];
    let normals: number[] = [];

    const numFaces = 4;
    const radius = 0.8;
    const tStep = Math.PI * 2 / numFaces;
    for (let i = 0; i < numFaces; ++i) {
      let t = i * tStep;

      let x1 = 0;
      let y1 = 0.7;
      let z1 = 0;
      let x2 = Math.cos(t);
      let y2 = 0;
      let z2 = Math.sin(t);
      let x3 = Math.cos(t + tStep);
      let y3 = 0;
      let z3 = Math.sin(t + tStep);

      // Top = 1
      this.addXYZ(positions, x1 * radius, y1, z1 * radius);
      this.addXYZ(normals, (x2 + x3) / 4, 0, (z2 + z3) / 4);
      textureCoords.push(0.25); textureCoords.push(0.5);
      // 3
      this.addXYZ(positions, x3 * radius, y3, z3 * radius);
      this.addXYZ(normals, x3, y3, z3);
      textureCoords.push(0.25 + x3 * 0.25); textureCoords.push(0.5 + z3 * 0.5);
      // 2
      this.addXYZ(positions, x2 * radius, y2, z2 * radius);
      this.addXYZ(normals, x2, y2, z2);
      textureCoords.push(0.25 + x2 * 0.25); textureCoords.push(0.5 + z2 * 0.5);

      y1 = -y1;
      // Top = 1
      this.addXYZ(positions, x1 * radius, y1, z1 * radius);
      this.addXYZ(normals, (x2 + x3) / 4, 0, (z2 + z3) / 4);
      textureCoords.push(0.75); textureCoords.push(0.5);
      // 3
      this.addXYZ(positions, x3 * radius, y3, z3 * radius);
      this.addXYZ(normals, x3, y3, z3);
      textureCoords.push(0.75 + x3 * 0.25); textureCoords.push(0.5 + z3 * 0.5);
      // 2
      this.addXYZ(positions, x2 * radius, y2, z2 * radius);
      this.addXYZ(normals, x2, y2, z2);
      textureCoords.push(0.75 + x2 * 0.25); textureCoords.push(0.5 + z2 * 0.5);


    }


    this.vertexCount = positions.length / 3;

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(positions), gl.STATIC_DRAW);

    this.textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(textureCoords), gl.STATIC_DRAW);

    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals),
      gl.STATIC_DRAW);
  }

  private addXYZ(positions: number[], x: number, y: number, z: number) {
    positions.push(x);
    positions.push(y);
    positions.push(z);
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