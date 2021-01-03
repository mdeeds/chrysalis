import { Cog } from "./cog";

export class Terminal {
  div: HTMLDivElement;
  cog: Cog;
  constructor() {
    const body = document.getElementsByTagName("body")[0];
    this.div = document.createElement('div');
    this.div.classList.add("terminal");
    this.div.contentEditable = "true";
    body.appendChild(this.div);

    const toolbar = document.createElement('div');
    toolbar.classList.add("toolbar");
    const uploadButton = document.createElement('img')
    uploadButton.src = "Upload.gif";
    uploadButton.alt = "Upload";
    uploadButton.width = 64;

    const undoButton = document.createElement('img');
    undoButton.src = "Undo.gif"
    undoButton.alt = "Undo";
    undoButton.width = 64;

    toolbar.appendChild(undoButton);
    toolbar.appendChild(uploadButton);

    body.appendChild(toolbar);
  }

  setCog(cog: Cog) {
    this.cog = cog;
    this.div.innerText = cog.thing.state.code;
  }


}