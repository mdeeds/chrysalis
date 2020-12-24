export class TriangleStrip {
  private positions: number[];
  private colors: number[];
  positionBuffer: WebGLBuffer;
  colorBuffer: WebGLBuffer;
  vertexCount: number;
  constructor(gl: WebGLRenderingContext,
    xStart: number, zCenter: number, size: number, count: number) {
    this.vertexCount = 0;
    this.positions = [];
    this.colors = [];

    for (let i = 0; i < count; ++i) {
      let x = xStart + i * size;
      this.positions.push(x);
      this.positions.push(0.0);
      this.positions.push(zCenter - size / 2.0);
      let v = Math.random() * 0.1 + 0.8;
      this.colors.push(v);
      this.colors.push(v);
      this.colors.push(v);
      this.colors.push(1.0);

      this.positions.push(x);
      this.positions.push(0.0);
      this.positions.push(zCenter + size / 2.0);
      v = Math.random() * 0.1 + 0.8;
      this.colors.push(v);
      this.colors.push(v);
      this.colors.push(v);
      this.colors.push(1.0);
      this.vertexCount += 2;
    }

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(this.positions), gl.STATIC_DRAW);

    this.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(this.colors), gl.STATIC_DRAW);
  }
}