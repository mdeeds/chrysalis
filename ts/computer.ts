import { Library } from "./library";
import { Log } from "./log"
import { Perspective } from "./perspective";
import { ThingStateDelta } from "./thingStateDelta";

export class Computer {

  private worker: Worker;
  private working: boolean;
  private library: Library;

  constructor(code: string, libraryList: string, library: Library) {
    this.library = library;
    this.startWorker(code, libraryList);
  }

  private startWorker(code: string, libraryList: string) {
    let libraryCode = "";
    for (const libraryName of libraryList.split(/[ ,\n\r]+/)) {
      libraryCode += this.library.getCode(libraryName);
      libraryCode += "\n";
    }
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
    this.working = false;
    this.worker.onerror = (ev: ErrorEvent) => {
      Log.error(`line ${ev.lineno - 2}: ${ev.message}`);
      this.worker.terminate();
    }
    this.clearResponseHandler();
  }

  async getDelta(perspective: Perspective) {
    if (this.working) {
      return new Promise((resolve, reject) => {
        reject("Worker is busy.");
      });
    } else {
      this.worker.postMessage(perspective);
      return new Promise((resolve, reject) => {
        this.worker.onmessage = (ev: MessageEvent) => {
          resolve(ev.data);
        }
      });
    }
  }

  clearResponseHandler() {
    this.worker.onmessage = (ev: MessageEvent) => {
      Log.error("No one is listening.");
    }
  }

  upload(code: string, libraryCode: string) {
    this.worker.terminate();
    this.startWorker(code, libraryCode);
  }
}