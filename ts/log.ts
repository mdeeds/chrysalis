export class Log {
  private static target: HTMLDivElement;
  private static messages: HTMLDivElement[] = [];
  private static lastMessage = "";
  private static startTime = window.performance.now();

  static setTargetElement(target: HTMLDivElement) {
    Log.target = target;
    target.classList.add("log");
  }

  private static addToLog(div: HTMLDivElement) {
    Log.messages.push(div);
    Log.target.appendChild(div);
    if (Log.messages.length > 10) {
      Log.target.removeChild(Log.messages[0]);
      Log.messages.splice(0, 1);
    }
  }

  static info(message: string) {
    if (message === this.lastMessage) { return; }
    const elapsedSeconds = (window.performance.now() - Log.startTime) / 1000;
    console.log(`${elapsedSeconds.toFixed(3)}: ${message}`);
    this.lastMessage = message;
    const div = document.createElement("div");
    div.innerText = message;
    Log.addToLog(div);
  }

  static error(message: string) {
    if (message === this.lastMessage) { return; }
    console.error(message);
    this.lastMessage = message;
    const div = document.createElement("div");
    div.classList.add("error");
    div.innerText = message;
    Log.addToLog(div);
  }

}