import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Ground } from "./ground";
import { ThingState } from "./thingState";

export class Hazard extends Ground {
  nextChangeTime: number;
  orientation: number;
  constructor(gl: WebGLRenderingContext, state: ThingState) {
    super(gl, "img/Hazard.png", state)
    this.nextChangeTime = this.startTimeSeconds + Math.random() * 3;
    if (Math.random() < 0.5) {
      this.orientation = 0.0;
    } else {
      this.orientation = Math.PI / 2;
    }
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    const nowTimeSeconds = window.performance.now() / 1000;
    if (nowTimeSeconds > this.nextChangeTime) {
      if (this.orientation === 0) {
        this.orientation = Math.PI / 2;
      } else {
        this.orientation = 0;
      }
      this.nextChangeTime = nowTimeSeconds + Math.random() * 3;
    }
    GLM.mat4.rotate(objectTransform, objectTransform,
      this.orientation, [0, 1, 0])
    return objectTransform;
  }

}