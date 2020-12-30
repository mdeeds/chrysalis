export class ProgramInfo {
  program: WebGLProgram;
  vertexPosition: number;
  vertexNormal: number;
  textureCoord: number;
  uSampler: WebGLUniformLocation;
  projectionMatrix: WebGLUniformLocation;
  modelViewMatrix: WebGLUniformLocation;
  objectTransform: WebGLUniformLocation;
  eyePosition: WebGLUniformLocation;
  constructor() { }
}
