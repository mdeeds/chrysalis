import { Cog } from "./cog";

export class Terminal {
  div: HTMLDivElement;
  cog: Cog;
  constructor() {
    this.div = document.createElement('div');
    this.div.classList.add("terminal");
    this.div.contentEditable = "true";
    const body = document.getElementsByTagName("body")[0];
    body.appendChild(this.div);
  }

  setCog(cog: Cog) {
    this.cog = cog;
    this.div.innerText = cog.thing.state.code;
  }


}