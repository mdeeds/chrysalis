import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Ground } from "./ground";
import { ThingState } from "./thingState";

export class Ocean extends Ground {
  rate: number;
  x: number;
  constructor(gl: WebGLRenderingContext, state: ThingState) {
    super(gl, "Ocean-1.png", state);
    this.rate = (3 + Math.random() * 2) / 6;
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    const elapsedSeconds = window.performance.now() / 1000 - this.startTimeSeconds;
    let d = Math.sin(elapsedSeconds / this.rate) * 0.2 - 0.1;
    GLM.mat4.translate(objectTransform, objectTransform,
      [0, d, 0])
    return objectTransform;
  }
}