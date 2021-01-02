export class Terminal {
  div: HTMLDivElement;
  constructor() {
    this.div = document.createElement('div');
    this.div.classList.add("terminal");
    this.div.contentEditable = "true";
    const body = document.getElementsByTagName("body")[0];
    body.appendChild(this.div);
  }
}