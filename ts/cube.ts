import { Shape } from "./shape";

export class Cube extends Shape {

  constructor(gl: WebGLRenderingContext, url: string,
    x: number, y: number, z: number) {
    super(gl, url, x, y, z);
    this.loadTexture(gl, url)

    let positions = [];

    // 0      1
    //   Top
    // 3      2       1      0      3
    //   Front  Right   Back   Left 
    // 5      4       7      8      5

    this.addXYZ(positions, -1, 1, -1);  // 0
    this.addXYZ(positions, 1, 1, -1);  // 1
    this.addXYZ(positions, 1, 1, 1);  // 2
    this.addXYZ(positions, -1, 1, -1);  // 0
    this.addXYZ(positions, 1, 1, 1);  // 2
    this.addXYZ(positions, -1, 1, 1);  // 3

    this.addXYZ(positions, -1, 1, 1);  // 3
    this.addXYZ(positions, 1, 1, 1);  // 2
    this.addXYZ(positions, 1, -1, 1);  // 4
    this.addXYZ(positions, -1, 1, 1);  // 3
    this.addXYZ(positions, 1, -1, 1);  // 4
    this.addXYZ(positions, -1, -1, 1);  // 5

    this.addXYZ(positions, 1, 1, 1);  // 2
    this.addXYZ(positions, 1, 1, -1);  // 1
    this.addXYZ(positions, 1, -1, -1);  // 7
    this.addXYZ(positions, 1, 1, 1);  // 2
    this.addXYZ(positions, 1, -1, -1);  // 7
    this.addXYZ(positions, 1, -1, 1);  // 4

    this.addXYZ(positions, 1, 1, -1);  // 1
    this.addXYZ(positions, -1, 1, -1);  // 0
    this.addXYZ(positions, -1, -1, -1);  // 8
    this.addXYZ(positions, 1, 1, -1);  // 1
    this.addXYZ(positions, -1, -1, -1);  // 8
    this.addXYZ(positions, 1, -1, -1);  // 7

    this.addXYZ(positions, -1, 1, -1);  // 0
    this.addXYZ(positions, -1, 1, 1);  // 3
    this.addXYZ(positions, -1, -1, 1);  // 5
    this.addXYZ(positions, -1, 1, -1);  // 0
    this.addXYZ(positions, -1, -1, 1);  // 5
    this.addXYZ(positions, -1, -1, -1);  // 8

    const textureCoordinates = [
      0.00, 0.00,  // 0
      0.25, 0.00,  // 1
      0.25, 0.50,  // 2
      0.00, 0.00,  // 0
      0.25, 0.50,  // 2
      0.00, 0.50,  // 3

      0.00, 0.50, // 3
      0.25, 0.50,  // 2
      0.25, 1.00, // 4
      0.00, 0.50, // 3
      0.25, 1.00, // 4
      0.00, 1.00, // 5

      0.25, 0.50,
      0.50, 0.50,
      0.50, 1.00,
      0.25, 0.50,
      0.50, 1.00,
      0.25, 1.00,

      0.50, 0.50,
      0.75, 0.50,
      0.75, 1.00,
      0.50, 0.50,
      0.75, 1.00,
      0.50, 1.00,

      0.75, 0.50,
      1.00, 0.50,
      1.00, 1.00,
      0.75, 0.50,
      1.00, 1.00,
      0.75, 1.00,

    ];

    const vertexNormals = [
      // Top
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,

      // Front
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,

      // Right
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,

      // Back
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,

      // Left
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
    ];

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

  private addXYZ(positions: number[], x: number, y: number, z: number) {
    positions.push(x);
    positions.push(y);
    positions.push(z);
  }

}