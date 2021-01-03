export class Log {
  private static target: HTMLDivElement;
  private static messages: HTMLDivElement[] = [];

  static setTargetElement(target: HTMLDivElement) {
    Log.target = target;
    target.classList.add("log");
  }

  static info(message: string) {
    const div = document.createElement("div");
    div.innerText = message;
    Log.messages.push(div);
    Log.target.appendChild(div);
    if (Log.messages.length > 10) {
      Log.target.removeChild(Log.messages[0]);
      Log.messages.splice(0, 1);
    }
  }
}