import { ProgramInfo } from "./programInfo"
import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { MasterControl } from "./masterControl";
import { Thing } from "./thing";
import { Log } from "./log";
import { BoundingBox } from "./quadTreeView";
import { State } from "./state";
import { WorldClient } from "./worldClient";
import { HeartbeatGroup } from "./heartbeatGroup";

export class Render {
  private canvas: HTMLCanvasElement;
  private programInfo: ProgramInfo;
  private gl: WebGLRenderingContext;
  private masterControl: MasterControl;
  private focusContainer: HTMLElement;
  private worldClient: WorldClient;
  private state: State;
  constructor() {
    for (let h of document.getElementsByTagName('h1')) {
      h.remove();
    }
    this.canvas = document.createElement("canvas");
    this.canvas.id = "glCanvas";
    this.canvas.width = 1024 * 2;
    this.canvas.height = 768 * 2;
    let body = document.getElementsByTagName("body")[0];
    this.focusContainer = document.createElement('div');
    this.focusContainer.appendChild(this.canvas);
    this.focusContainer.tabIndex = 1;
    body.appendChild(this.focusContainer);
    this.focusContainer.focus();
  }

  main(heartbeatGroup: HeartbeatGroup) {
    const username = heartbeatGroup.getUsername();
    this.gl = this.canvas.getContext("webgl");
    if (this.gl == null) {
      alert("Your browser doesn't support WebGL");
      return;
    }

    const shaderProgram: WebGLProgram = this.initShaderProgram(this.gl,
      this.getVertexShaderSource(), this.getFragmentShaderSource());

    this.programInfo = new ProgramInfo();
    this.programInfo.program = shaderProgram;

    this.programInfo.vertexPosition =
      this.gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    this.programInfo.vertexNormal =
      this.gl.getAttribLocation(shaderProgram, 'aVertexNormal');
    this.programInfo.textureCoord =
      this.gl.getAttribLocation(shaderProgram, 'aTextureCoord');

    this.programInfo.uSampler =
      this.gl.getUniformLocation(shaderProgram, 'uSampler');
    this.programInfo.projectionMatrix =
      this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    this.programInfo.modelViewMatrix =
      this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
    this.programInfo.objectTransform =
      this.gl.getUniformLocation(shaderProgram, 'uObjectTransform');
    this.programInfo.eyePosition =
      this.gl.getUniformLocation(shaderProgram, "uEyePosition");

    Log.info(JSON.stringify(this.programInfo));
    // http://butterfly.ucdavis.edu/butterfly/latin
    const worldName = "vialis"
    this.worldClient =
      new WorldClient(this.gl, worldName, heartbeatGroup);

    this.worldClient.getWorldState().then((state: State) => {
      this.state = state;
      this.masterControl = new MasterControl(this.gl,
        state, this.focusContainer, username);
      this.focusContainer.focus();
      this.renderLoop();
    });
  }

  private renderLoop() {
    const playerCoords = this.state.getPlayerCoords();
    this.setScene(this.gl, this.programInfo,
      playerCoords);
    for (const thing of this.state.getThings(
      new BoundingBox(playerCoords[0], playerCoords[2] - 5, 26))) {
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
    GLM.mat4.perspective(projectionMatrix,
      fieldOfView, aspect, zNear, zFar);

    const modelViewMatrix = GLM.mat4.create();
    const px = playerCoords[0];
    const py = playerCoords[1];
    const pz = playerCoords[2];
    const eyePosition = GLM.vec3.fromValues(px, py + 60, pz + 60);
    GLM.mat4.lookAt(modelViewMatrix,
      /*eye=*/eyePosition,
      /*center=*/[px, py + 4, pz - 2],
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
    gl.uniformMatrix3fv(programInfo.eyePosition, false,
      GLM.vec3.fromValues(px, py, pz));
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
    uniform vec3 uVertexNormal;
    uniform vec3 uEyePosition;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;
    varying highp float vFog;

    void main(void) {
      gl_Position = uProjectionMatrix * 
        uModelViewMatrix * 
        uObjectTransform *
        aVertexPosition;
      vTextureCoord = aTextureCoord;

      highp vec4 physicalPosition = uObjectTransform * aVertexPosition;
      highp float dist = uEyePosition.z - physicalPosition.z;
      // vFog = max(min(dist / 20.0, 1.0), 0.0);
      vFog = 0.0;

      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor = vec3(0.7, 0.7, 0.7);
      highp vec3 directionalVector = normalize(vec3(0.3, 0.9, 0.75));

      highp vec3 transformedNormal = 
        normalize(mat3(uObjectTransform) * aVertexNormal);

      highp float directional = max(dot(
        transformedNormal, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
  `;
  }

  private getFragmentShaderSource() {
    return `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;
    varying highp float vFog;

    uniform sampler2D uSampler;

    void main(void) {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
      highp vec4 pureColor = vec4(texelColor.rgb * vLighting, texelColor.a);      
      highp vec4 fogPart = vFog * vec4(1.0, 1.0, 1.0, 1.0);
      highp float q = 1.0 - vFog;
      highp vec4 colorPart = q * pureColor;
      gl_FragColor = fogPart + colorPart;
    }
    `;
  }
}