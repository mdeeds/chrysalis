import { Shape } from "./shape";

export class Cube extends Shape {

  private static addXYZ(positions: number[], x: number, y: number, z: number) {
    positions.push(x);
    positions.push(y);
    positions.push(z);
  }

  static cubePositions(rx: number, ry: number, rz: number) {
    const positions = [];
    // 0      1
    //   Top
    // 3      2       1      0      3
    //   Front  Right   Back   Left 
    // 5      4       7      8      5

    Cube.addXYZ(positions, -rx, ry, -rz);  // 0
    Cube.addXYZ(positions, rx, ry, -rz);  // 1
    Cube.addXYZ(positions, rx, ry, rz);  // 2
    Cube.addXYZ(positions, -rx, ry, -rz);  // 0
    Cube.addXYZ(positions, rx, ry, rz);  // 2
    Cube.addXYZ(positions, -rx, ry, rz);  // 3

    Cube.addXYZ(positions, -rx, ry, rz);  // 3
    Cube.addXYZ(positions, rx, ry, rz);  // 2
    Cube.addXYZ(positions, rx, -ry, rz);  // 4
    Cube.addXYZ(positions, -rx, ry, rz);  // 3
    Cube.addXYZ(positions, rx, -ry, rz);  // 4
    Cube.addXYZ(positions, -rx, -ry, rz);  // 5

    Cube.addXYZ(positions, rx, ry, rz);  // 2
    Cube.addXYZ(positions, rx, ry, -rz);  // 1
    Cube.addXYZ(positions, rx, -ry, -rz);  // 7
    Cube.addXYZ(positions, rx, ry, rz);  // 2
    Cube.addXYZ(positions, rx, -ry, -rz);  // 7
    Cube.addXYZ(positions, rx, -ry, rz);  // 4

    Cube.addXYZ(positions, rx, ry, -rz);  // 1
    Cube.addXYZ(positions, -rx, ry, -rz);  // 0
    Cube.addXYZ(positions, -rx, -ry, -rz);  // 8
    Cube.addXYZ(positions, rx, ry, -rz);  // 1
    Cube.addXYZ(positions, -rx, -ry, -rz);  // 8
    Cube.addXYZ(positions, rx, -ry, -rz);  // 7

    Cube.addXYZ(positions, -rx, ry, -rz);  // 0
    Cube.addXYZ(positions, -rx, ry, rz);  // 3
    Cube.addXYZ(positions, -rx, -ry, rz);  // 5
    Cube.addXYZ(positions, -rx, ry, -rz);  // 0
    Cube.addXYZ(positions, -rx, -ry, rz);  // 5
    Cube.addXYZ(positions, -rx, -ry, -rz);  // 8

    return positions;
  }

  static textureCoordinates() {
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
    return textureCoordinates;
  }

  static vertexNormals() {
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

    return vertexNormals;
  }

  constructor(gl: WebGLRenderingContext, url: string,
    x: number, y: number, z: number) {
    super(gl, url, x, y, z);
    this.loadTexture(gl, url)

    const positions = Cube.cubePositions(1, 1, 1);
    const textureCoordinates = Cube.textureCoordinates();
    const vertexNormals = Cube.vertexNormals();

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

}