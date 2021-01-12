export class Geometry {
  static translate(positions: number[], dx: number, dy: number, dz: number) {
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += dx;
      positions[i + 1] += dy;
      positions[i + 2] += dz;
    }
  }

  static addTubeData(
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
  static addDiscData(positions: number[], textureCoords: number[], normals: number[],
    r: number) {
    const numPoints = 16;
    const dt = (Math.PI * 2 / numPoints);
    const ds = 1.0 / numPoints;
    for (let i: number = 0; i < numPoints; ++i) {
      let t = i * dt - Math.PI / 2;
      const x1 = Math.cos(t) * r;
      const z1 = Math.sin(t) * r;
      const x2 = Math.cos(t + dt) * r;
      const z2 = Math.sin(t + dt) * r;

      positions.push(0, 1.0, 0);
      positions.push(x1, 1.0, z1);
      positions.push(x2, 1.0, z2);

      const s1 = 0.125 + Math.cos(t) * 0.125;
      const t1 = 0.125 + Math.sin(t) * 0.125;
      const s2 = 0.125 + Math.cos(t + dt) * 0.125;
      const t2 = 0.125 + Math.sin(t + dt) * 0.125;
      textureCoords.push(0.125, 0.125);
      textureCoords.push(s1, t1);
      textureCoords.push(s2, t2);

      normals.push(0, 1, 0);
      normals.push(0, 1, 0);
      normals.push(0, 1, 0);
    }
  }

  static addCylinderData(positions: number[], textureCoords: number[], normals: number[],
    r: number) {
    Geometry.addTubeData(positions, textureCoords, normals, r);
    Geometry.addDiscData(positions, textureCoords, normals, r);
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

  static addGemData(positions: number[], normals: number[], textureCoords: number[]) {
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
      positions.push(x1 * radius, y1, z1 * radius);
      normals.push((x2 + x3) / 4, 0, (z2 + z3) / 4);
      textureCoords.push(0.25, 0.5);
      // 3
      positions.push(x3 * radius, y3, z3 * radius);
      normals.push(x3, y3, z3);
      textureCoords.push(0.25 + x3 * 0.25, 0.5 + z3 * 0.5);
      // 2
      positions.push(x2 * radius, y2, z2 * radius);
      normals.push(x2, y2, z2);
      textureCoords.push(0.25 + x2 * 0.25, 0.5 + z2 * 0.5);

      y1 = -y1;
      // Top = 1
      positions.push(x1 * radius, y1, z1 * radius);
      normals.push((x2 + x3) / 4, 0, (z2 + z3) / 4);
      textureCoords.push(0.75, 0.5);
      // 3
      positions.push(x3 * radius, y3, z3 * radius);
      normals.push(x3, y3, z3);
      textureCoords.push(0.75 + x3 * 0.25, 0.5 + z3 * 0.5);
      // 2
      positions.push(x2 * radius, y2, z2 * radius);
      normals.push(x2, y2, z2);
      textureCoords.push(0.75 + x2 * 0.25, 0.5 + z2 * 0.5);
    }
  }

  static addRectangleData(positions: number[], normals: number[],
    textureCoords: number[], rx: number, ry: number) {
    positions.push(-rx, ry, 0);
    positions.push(rx, ry, 0);
    positions.push(-rx, -ry, 0);
    positions.push(rx, ry, 0);
    positions.push(-rx, -ry, 0);
    positions.push(rx, -ry, 0);

    textureCoords.push(0, 0);
    textureCoords.push(1, 0);
    textureCoords.push(0, 1);
    textureCoords.push(1, 0);
    textureCoords.push(0, 1);
    textureCoords.push(1, 1);

    normals.push(-rx, ry, 1);
    normals.push(rx, ry, 1);
    normals.push(-rx, -ry, 1);
    normals.push(rx, ry, 1);
    normals.push(-rx, -ry, 1);
    normals.push(rx, -ry, 1);
  }


}