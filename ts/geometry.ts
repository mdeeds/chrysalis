export class Geometry {
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

      positions.push(x1, 1.0, z1);
      positions.push(x2, 1.0, z2);
      positions.push(x1, -1.0, z1);

      positions.push(x2, 1.0, z2);
      positions.push(x1, -1.0, z1);
      positions.push(x2, -1.0, z2);

      let s = 0.25 + i * ds;
      textureCoords.push(s, 0);
      textureCoords.push(s + ds, 0);
      textureCoords.push(s, 0.5);

      textureCoords.push(s + ds, 0);
      textureCoords.push(s, 0.5);
      textureCoords.push(s + ds, 0.5);

      normals.push(x1, 0, z1);
      normals.push(x2, 0, z2);
      normals.push(x1, 0, z1);

      normals.push(x2, 0, z2);
      normals.push(x1, 0, z1);
      normals.push(x2, 0, z2);
    }
  }

  static addCubeData(positions: number[], textureCoords: number[], normals: number[],
    rx: number, ry: number, rz: number) {
    // 0      1
    //   Top
    // 3      2       1      0      3
    //   Front  Right   Back   Left 
    // 5      4       7      8      5

    positions.push(-rx, ry, -rz);  // 0
    positions.push(rx, ry, -rz);  // 1
    positions.push(rx, ry, rz);  // 2
    positions.push(-rx, ry, -rz);  // 0
    positions.push(rx, ry, rz);  // 2
    positions.push(-rx, ry, rz);  // 3

    positions.push(-rx, ry, rz);  // 3
    positions.push(rx, ry, rz);  // 2
    positions.push(rx, -ry, rz);  // 4
    positions.push(-rx, ry, rz);  // 3
    positions.push(rx, -ry, rz);  // 4
    positions.push(-rx, -ry, rz);  // 5

    positions.push(rx, ry, rz);  // 2
    positions.push(rx, ry, -rz);  // 1
    positions.push(rx, -ry, -rz);  // 7
    positions.push(rx, ry, rz);  // 2
    positions.push(rx, -ry, -rz);  // 7
    positions.push(rx, -ry, rz);  // 4

    positions.push(rx, ry, -rz);  // 1
    positions.push(-rx, ry, -rz);  // 0
    positions.push(-rx, -ry, -rz);  // 8
    positions.push(rx, ry, -rz);  // 1
    positions.push(-rx, -ry, -rz);  // 8
    positions.push(rx, -ry, -rz);  // 7

    positions.push(-rx, ry, -rz);  // 0
    positions.push(-rx, ry, rz);  // 3
    positions.push(-rx, -ry, rz);  // 5
    positions.push(-rx, ry, -rz);  // 0
    positions.push(-rx, -ry, rz);  // 5
    positions.push(-rx, -ry, -rz);  // 8

    textureCoords.push(
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
      0.75, 1.00);

    normals.push(
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
      -1.0, 0.0, 0.0);
  }


}