import { Log } from "./log"
import { Perspective } from "./perspective";
import { ThingStateDelta } from "./thingStateDelta";

export class Computer {

  private worker: Worker;
  private stateResponse: ThingStateDelta;
  private working: boolean;

  constructor(code: string, libraryCode: string) {
    this.startWorker(code, libraryCode);
  }

  private startWorker(code: string, libraryCode: string) {
    code = code;
    libraryCode = libraryCode;
    const computeSource = `
    var perspective;
    var delta;
    ${libraryCode}
    onmessage = function(eventMessage) {
      perspective = eventMessage.data;
      delta = { turn: 0.0 };
      ${code}
      postMessage(delta); 
    }
    `;
    console.log(computeSource);
    const dataUrl = "data:text/javascript;base64," + btoa(computeSource);
    this.worker = new Worker(dataUrl);
    this.stateResponse = null;
    this.working = false;
    this.worker.onmessage = (ev: MessageEvent) => {
      this.stateResponse = ev.data;
    }
    this.worker.onerror = (ev: ErrorEvent) => {
      Log.error(`line ${ev.lineno - 2}: ${ev.message}`);
      this.worker.terminate();
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
    if (this.stateResponse !== null) {
      const result = this.stateResponse as ThingStateDelta;
      this.stateResponse = null;
      this.working = false;
      resolve(result);
    } else {
      setTimeout(() => this.waitForResponse(resolve, reject), 10);
    }
  }

  upload(code: string, libraryCode: string) {
    this.worker.terminate();
    this.startWorker(code, libraryCode);
  }
}