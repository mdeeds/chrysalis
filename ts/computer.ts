import { Log } from "./log"
import { Perspective } from "./perspective";
import { State } from "./state";

export class Computer {

  private worker: Worker;
  private stateResponse: State;
  private working: boolean;

  constructor() {
    const computerFunction: Function = function (e: MessageEvent) {
      console.log("Recieved message: " + JSON.stringify(e.data));
      postMessage("Done.", e.origin);
    }

    // Maybe consider something like this:
    /*
      `
      exports = {};
      ${loaded js code from src directory}
      onmessage = ${computerFunction.toString()}
    
      `
    */
    const computeSource = `
    onmessage = ${computerFunction.toString()}
    `;
    const dataUrl = "data:text/javascript;base64," + btoa(computeSource);
    this.worker = new Worker(dataUrl);
    this.stateResponse = null;
    this.working = false;
  }

  async getDelta(perspective: Perspective) {
    if (this.working) {
      return new Promise((resolve, reject) => {
        reject("Worker is busy.");
      });
    } else {
      this.worker.postMessage(perspective);
      return new Promise((resolve, reject) => {
        this.waitForResponse(resolve, reject);
      });
    }
  }

  waitForResponse(resolve: Function, reject: Function) {
    if (this.stateResponse != null) {
      const result = this.stateResponse;
      this.stateResponse = null;
      this.working = false;
      resolve(result);
    } else {
      setTimeout(() => this.waitForResponse(resolve, reject), 1);
    }
  }
}