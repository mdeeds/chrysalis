import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Cube } from "./cube";
import { Shape } from "./shape";

export class Player extends Shape {
  static translate(positions: number[], dx: number, dy: number, dz: number) {
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += dx;
      positions[i + 1] += dy;
      positions[i + 2] += dz;
    }
  }

  static addCylinderData(
    positions: number[], textureCoords: number[], normals: number[],
    r: number) {
    const numPoints = 16;
    const dt = (Math.PI * 2 / numPoints);
    const ds = 0.75 / numPoints;
    for (let i: number = 0; i < numPoints; ++i) {
      let t = i * dt - Math.PI / 2;
      const x1 = Math.cos(t) * r;
      const z1 = Math.sin(t) * r;
      const x2 = Math.cos(t + dt) * r;
      const z2 = Math.sin(t + dt) * r;

      positions.push(x1);
      positions.push(1.0);
      positions.push(z1);
      positions.push(x2);
      positions.push(1.0);
      positions.push(z2);
      positions.push(x1);
      positions.push(-1.0);
      positions.push(z1);

      positions.push(x2);
      positions.push(1.0);
      positions.push(z2);
      positions.push(x1);
      positions.push(-1.0);
      positions.push(z1);
      positions.push(x2);
      positions.push(-1.0);
      positions.push(z2);

      let s = 0.25 + i * ds;
      textureCoords.push(s);
      textureCoords.push(0);
      textureCoords.push(s + ds);
      textureCoords.push(0);
      textureCoords.push(s);
      textureCoords.push(0.5);

      textureCoords.push(s + ds);
      textureCoords.push(0);
      textureCoords.push(s);
      textureCoords.push(0.5);
      textureCoords.push(s + ds);
      textureCoords.push(0.5);

      normals.push(x1);
      normals.push(0);
      normals.push(z1);
      normals.push(x2);
      normals.push(0);
      normals.push(z2);
      normals.push(x1);
      normals.push(0);
      normals.push(z1);

      normals.push(x2);
      normals.push(0);
      normals.push(z2);
      normals.push(x1);
      normals.push(0);
      normals.push(z1);
      normals.push(x2);
      normals.push(0);
      normals.push(z2);

    }
  }

  constructor(gl: WebGLRenderingContext, x: number, z: number) {
    super(gl, "Head-1.png", x, 1.5, z);

    const positions = Cube.cubePositions(0.65, 0.65, 0.65);
    const vertexNormals = Cube.vertexNormals();
    const textureCoordinates = Cube.textureCoordinates();

    Player.translate(positions, 0, 1.3, 0);
    Player.addCylinderData(positions, textureCoordinates, vertexNormals, 0.6);

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
    const elapsedSeconds = window.performance.now() / 1000 - this.startTimeSeconds;
    const rotation = Math.sin(elapsedSeconds) * 3;
    GLM.mat4.rotate(objectTransform, objectTransform,
      rotation, [0, 1, 0]);
    GLM.mat4.translate(objectTransform, objectTransform,
      [0, 0.5, 0]);
    return objectTransform;
  }
}