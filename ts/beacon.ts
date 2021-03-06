import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Geometry } from "./geometry";
import { Log } from "./log";
import { Shape } from "./shape";
import { ThingState } from "./thingState";

export class Beacon extends Shape {
  private isOn: boolean;
  private lastToggle: number;
  private lastSuccessfulToggle: number;
  constructor(gl: WebGLRenderingContext, state: ThingState) {
    super(gl, "img/Beacon.png", state);
    this.radius = 0.4;
    this.state.gemLevel = 12;

    const positions = [];
    const vertexNormals = [];
    const textureCoordinates = [];

    Geometry.addCubeData(positions, textureCoordinates, vertexNormals,
      0.4, 0.6, 0.4);
    Geometry.translate(positions, 0, 1.8, 0);
    Geometry.addTubeData(positions, textureCoordinates, vertexNormals, 0.2);
    this.createBuffers(gl, positions, textureCoordinates, vertexNormals);
    this.isOn = true;
    this.lastToggle = window.performance.now();
    this.lastSuccessfulToggle = window.performance.now();
  }

  toggle() {
    const currentTime = window.performance.now();
    if (currentTime - this.lastToggle < 500 &&
      currentTime - this.lastSuccessfulToggle < 2000) {
      this.lastToggle = currentTime;
      return;
    } else {
      this.lastSuccessfulToggle = currentTime;
      this.lastToggle = currentTime;
      if (this.isOn) {
        this.turnOff();
      } else {
        this.turnOn();
      }
    }
  }

  turnOn() {
    if (!this.isOn) {
      this.isOn = true;
      super.setTextureImage("img/Beacon.png");
    }
  }

  turnOff() {
    if (this.isOn) {
      this.isOn = false;
      super.setTextureImage("img/BeaconOff.png");
    }
  }

  getIsOn() {
    return this.isOn;
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    GLM.mat4.translate(objectTransform, objectTransform,
      [0, 2, 0]);
    return objectTransform;
  }
}