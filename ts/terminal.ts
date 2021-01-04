import { Cog } from "./cog";
import { Log } from "./log";

export class Terminal {
  div: HTMLDivElement;
  cog: Cog;
  lastContent: string;
  uploadButton: HTMLImageElement;
  dirty: boolean;
  constructor() {
    const body = document.getElementsByTagName("body")[0];
    this.div = document.createElement('div');
    this.div.classList.add("terminal");
    this.div.contentEditable = "true";
    body.appendChild(this.div);

    const toolbar = document.createElement('div');
    toolbar.classList.add("toolbar");
    this.uploadButton = document.createElement('img')
    this.uploadButton.src = "Upload.gif";
    this.uploadButton.alt = "Upload";
    this.uploadButton.width = 64;
    this.uploadButton.addEventListener("click", (ev) => {
      this.upload();
    });
    this.dirty = true;

    const undoButton = document.createElement('img');
    undoButton.src = "Undo.gif"
    undoButton.alt = "Undo";
    undoButton.width = 64;

    toolbar.appendChild(undoButton);
    toolbar.appendChild(this.uploadButton);

    body.appendChild(toolbar);

    this.maintainUploadState();
  }

  private getSource() {
    const newContent = this.div.innerText.trim();
    const cleanContent = newContent.replace(/[^\x20-\x7e]/g, " ");
    return cleanContent;
  }

  setCog(cog: Cog) {
    this.cog = cog;
    this.div.innerText = cog.thing.state.code;
    this.lastContent = this.getSource();
  }

  private maintainUploadState() {
    const newContent = this.getSource();
    if (this.lastContent === newContent && this.dirty) {
      this.uploadButton.src = "Deactivated Upload.gif";
      this.dirty = false;
    }
    if (this.lastContent !== newContent && !this.dirty) {
      this.dirty = true;
      this.uploadButton.src = "Upload.gif";
    }
    setTimeout(() => this.maintainUploadState(), 100);
  }

  upload() {
    const newCode = this.getSource();
    this.cog.upload(newCode);
    this.lastContent = newCode;
  }


}