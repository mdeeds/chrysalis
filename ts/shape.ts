import { ProgramInfo } from "./programInfo";
import { TextureCache } from "./textureCache";
import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Thing } from "./thing";
import { Log } from "./log";
import { State } from "./state";
import { ThingState } from "./thingState";

export class Shape extends Thing {
  positionBuffer: WebGLBuffer;
  textureCoordBuffer: WebGLBuffer;
  normalBuffer: WebGLBuffer;
  texture: WebGLTexture;
  vertexCount: number;
  startTimeSeconds: number;

  constructor(gl: WebGLRenderingContext,
    source: string | HTMLCanvasElement | HTMLImageElement,
    state: ThingState) {
    super();
    this.startTimeSeconds = window.performance.now() / 1000;
    this.state = state;
    if (typeof source == "string") {
      this.loadTexture(gl, source as string);
    } else {
      Log.info("Binding canvas.");
      this.texture = TextureCache.buildTexture(gl,
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
      this.state.heading, [0, 1, 0]);
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