import { Log } from "./log"
import { Perspective } from "./perspective";
import { State } from "./state";
import { ThingStateDelta } from "./thingStateDelta";

export class Computer {

  private worker: Worker;
  private stateResponse: State;
  private working: boolean;
  private code: string;

  constructor(code: string) {
    this.code = code;
    const computeSource = `
    onmessage = function(eventMessage) {
      const perspective = eventMessage.data;
      const delta = {};
      ${this.code}
      postMessage(delta); 
    }
    `;
    console.log("Source: " + computeSource);
    const dataUrl = "data:text/javascript;base64," + btoa(computeSource);
    this.worker = new Worker(dataUrl);
    this.stateResponse = null;
    this.working = false;
    this.worker.onmessage = (ev: MessageEvent) => {
      this.stateResponse = ev.data;
    }
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