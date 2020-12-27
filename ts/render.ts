import { ProgramInfo } from "./programInfo"
import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { World } from "./world";
import { MasterControl } from "./masterControl";
import { Thing } from "./thing";
import { Log } from "./log";

export class Render {
  private canvas: HTMLCanvasElement;
  private programInfo: ProgramInfo;
  private gl: WebGLRenderingContext;
  private world: World;
  private masterControl: MasterControl;
  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "glCanvas";
    this.canvas.width = 1024 * 2;
    this.canvas.height = 768 * 2;
    this.canvas.style.setProperty("width", "1024px");
    this.canvas.style.setProperty("height", "768px");
    let body = document.getElementsByTagName("body")[0];
    body.appendChild(this.canvas);
  }

  main() {
    this.gl = this.canvas.getContext("webgl");
    if (this.gl === null) {
      alert("Your browser doesn't support WebGL");
      return;
    }

    const shaderProgram: WebGLProgram = this.initShaderProgram(this.gl,
      this.getVertexShaderSource(), this.getFragmentShaderSource());

    this.programInfo = new ProgramInfo();
    this.programInfo.program = shaderProgram;

    this.programInfo.vertexPosition = this.gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    this.programInfo.vertexNormal = this.gl.getAttribLocation(shaderProgram, 'aVertexNormal');
    this.programInfo.textureCoord = this.gl.getAttribLocation(shaderProgram, 'aTextureCoord');

    this.programInfo.uSampler = this.gl.getUniformLocation(shaderProgram, 'uSampler');
    this.programInfo.projectionMatrix = this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    this.programInfo.modelViewMatrix = this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
    this.programInfo.objectTransform = this.gl.getUniformLocation(shaderProgram, 'uObjectTransform');
    this.programInfo.normalMatrix = this.gl.getUniformLocation(shaderProgram, 'uNormalMatrix');

    Log.info(JSON.stringify(this.programInfo));
    // http://butterfly.ucdavis.edu/butterfly/latin
    this.world = new World("vialis", this.gl);
    this.masterControl = new MasterControl(this.world);

    this.renderLoop();
  }

  private renderLoop() {
    const playerCoords = this.world.getPlayerCoords();
    this.setScene(this.gl, this.programInfo,
      playerCoords);
    for (const thing of this.world.getThings()) {
      thing.render(this.gl, this.programInfo);
    }

    requestAnimationFrame(() => this.renderLoop());
  }

  private setScene(gl: WebGLRenderingContext, programInfo: ProgramInfo,
    playerCoords: Float32Array) {
    gl.clearColor(0.8, 0.9, 1.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = 15 * Math.PI / 180;   // in radians
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 400.0;
    const projectionMatrix = GLM.mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    GLM.mat4.perspective(projectionMatrix,
      fieldOfView,
      aspect,
      zNear,
      zFar);

    const modelViewMatrix = GLM.mat4.create();
    const px = playerCoords[0];
    const py = playerCoords[1];
    const pz = playerCoords[2];
    GLM.mat4.lookAt(modelViewMatrix,
      /*eye=*/[px, py + 40.0, pz + 60.0],
      /*center=*/[px, py, pz],
      /*up=*/[0.0, 1.0, 0.0]);

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(
      programInfo.projectionMatrix,
      false,
      projectionMatrix);
    gl.uniformMatrix4fv(
      programInfo.modelViewMatrix,
      false,
      modelViewMatrix);
  }

  private initShaderProgram(gl: WebGLRenderingContext,
    vsSource: string, fsSource: string) {
    const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  }

  private loadShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' +
        gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private getVertexShaderSource() {
    return `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uObjectTransform;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
      gl_Position = uProjectionMatrix * 
        uModelViewMatrix * 
        uObjectTransform *
        aVertexPosition;
      vTextureCoord = aTextureCoord;

      highp vec3 ambientLight = vec3(0.4, 0.4, 0.4);
      highp vec3 directionalLightColor = vec3(0.6, 0.6, 0.6);
      highp vec3 directionalVector = normalize(vec3(0.0, 0.9, 0.75));

      highp vec4 transformedNormal = 
        normalize(uNormalMatrix * vec4(aVertexNormal, 1.0));

      highp float directional = max(dot(
        transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
  `;
  }

  private getFragmentShaderSource() {
    return `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main(void) {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
    `;
  }
}