import { Shape } from "./shape";
import { ThingState } from "./thingState";

export class Bubble extends Shape {
  private gl: WebGLRenderingContext;
  private canvas: HTMLCanvasElement;

  constructor(gl: WebGLRenderingContext, text: string, state: ThingState) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.clearRect(0, 0, 1024, 512);
    ctx.fillStyle = "pink";
    ctx.fillRect(100, 100, 400, 400);

    // NOTE: Animation of the canvas doesn't work...

    super(gl, canvas, state);
    this.gl = gl;
    this.canvas = canvas;
    const positions: number[] = [
      -2, 1, 0,
      2, 1, 0,
      -2, 0, 0,
      2, 1, 0,
      -2, 0, 0,
      2, 0, 0,
    ];

    const textureCoordinates: number[] = [
      0, 0,
      1, 0,
      0, 1,
      1, 0,
      0, 1,
      1, 1,
    ];
    const vertexNormals: number[] = [
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
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

}