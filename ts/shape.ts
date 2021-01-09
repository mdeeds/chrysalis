import { ProgramInfo } from "./programInfo";
import { TextureCache } from "./textureCache";
import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Thing } from "./thing";
import { Log } from "./log";
import { ThingState } from "./thingState";

export class Shape extends Thing {
  positionBuffer: WebGLBuffer;
  textureCoordBuffer: WebGLBuffer;
  normalBuffer: WebGLBuffer;
  startTimeSeconds: number;
  vertexCount: number;

  private texture: WebGLTexture;
  private textureImage: string;
  private gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext,
    source: string | HTMLCanvasElement | HTMLImageElement,
    state: ThingState) {
    super();
    this.gl = gl;
    this.startTimeSeconds = window.performance.now() / 1000;
    this.state = state;
    this.setTextureImage(source);
  }

  createBuffers(gl: WebGLRenderingContext, positions, textureCoordinates, vertexNormals) {
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

  getTextureImage() {
    return this.textureImage;
  }

  setTextureImage(source: string | HTMLCanvasElement | HTMLImageElement) {
    if (typeof source === "string") {
      this.loadTexture(this.gl, source as string);
      this.textureImage = source;
    } else {
      Log.info("Binding canvas.");
      this.texture = TextureCache.buildTexture(this.gl,
        source as HTMLCanvasElement | HTMLImageElement);
    }
  }

  loadTexture(gl: WebGLRenderingContext, url: string) {
    this.texture = TextureCache.load(gl, url);
  }

  getObjectTransform() {
    const objectTransform = GLM.mat4.create();
    GLM.mat4.translate(objectTransform, objectTransform,
      this.state.xyz);
    GLM.mat4.rotate(objectTransform, objectTransform,
      this.state.heading, [0, -1, 0]);
    return objectTransform;
  }

  render(gl: WebGLRenderingContext, programInfo: ProgramInfo) {
    const objectTransform = this.getObjectTransform();
    gl.uniformMatrix4fv(
      programInfo.objectTransform,
      false,
      objectTransform);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(
      programInfo.vertexPosition,
      /*numComponents=*/3,
      /*type=*/gl.FLOAT,
      /*normalize=*/false,
      /*stride=*/0,
      /*offset=*/0);
    gl.enableVertexAttribArray(
      programInfo.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
    gl.vertexAttribPointer(programInfo.textureCoord,
      /*num=*/2,
      /*type=*/ gl.FLOAT,
      /*normalize=*/false,
      /*stride=*/0,
      /*offset=*/0);
    gl.enableVertexAttribArray(programInfo.textureCoord);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(
      programInfo.vertexNormal,
      /*numComponents=*/3,
      /*type=*/gl.FLOAT,
      /*normalize=*/true,
      /*stride=*/0,
      /*offset=*/0);
    gl.enableVertexAttribArray(
      programInfo.vertexNormal);

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uSampler, 0);

    // Finally, render the data.
    {
      const vertexCount = this.vertexCount;
      const offset = 0;
      gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
    }
  }

}