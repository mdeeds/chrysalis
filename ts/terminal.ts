import { Cog } from "./cog";
import { Log } from "./log";

class CodeHolder {
  code: string;
  constructor(code: string) {
    this.code = code;
  }
}

export class Terminal {
  div: HTMLDivElement;
  cog: Cog;
  lastContent: string;
  uploadButton: HTMLImageElement;
  dirty: boolean;
  programCode: CodeHolder;
  libraryCode: CodeHolder;
  currentCode: CodeHolder;
  constructor() {
    this.programCode = new CodeHolder("");
    this.libraryCode = new CodeHolder("");
    this.currentCode = this.programCode;

    const body = document.getElementsByTagName("body")[0];
    this.div = document.createElement('div');
    this.div.classList.add("terminal");
    this.div.contentEditable = "true";
    this.div.spellcheck = false;
    body.appendChild(this.div);

    const toolbar = document.createElement('div');
    toolbar.classList.add("toolbar");

    const libraryButton = document.createElement('img');
    libraryButton.src = "Library.gif";
    libraryButton.width = 64;
    libraryButton.onclick = (ev: MouseEvent) => {
      playerButton.classList.remove("deactivated");
      libraryButton.classList.add("deactivated");
      this.currentCode = this.libraryCode;
      this.div.innerText = this.currentCode.code;
    };
    toolbar.appendChild(libraryButton);

    const playerButton = document.createElement('img');
    playerButton.src = "PlayerCode.gif";
    playerButton.width = 64;
    playerButton.classList.add("deactivated");
    playerButton.onclick = (ev: MouseEvent) => {
      libraryButton.classList.remove("deactivated");
      playerButton.classList.add("deactivated");
      this.currentCode = this.programCode;
      this.div.innerText = this.currentCode.code;
    };
    toolbar.appendChild(playerButton);

    const robotButton = document.createElement('img');
    robotButton.src = "RobotCode.gif";
    robotButton.classList.add("deactivated");
    robotButton.width = 64;
    toolbar.appendChild(robotButton);

    const sp = document.createElement('span');
    sp.innerText = ' ';
    toolbar.appendChild(sp);

    this.uploadButton = document.createElement('img');
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
    const newContent = this.div.innerText;
    const cleanContent = newContent.replace(/[^\n\x20-\x7e]/g, " ");
    return cleanContent;
  }

  setCog(cog: Cog) {
    this.cog = cog;
    this.programCode = new CodeHolder(cog.thing.state.code);
    this.libraryCode = new CodeHolder(cog.thing.state.libraryCode);
    this.currentCode = this.programCode;

    this.div.innerText = this.currentCode.code;
    this.lastContent = this.getSource();
  }

  private maintainUploadState() {
    const newContent = this.getSource();
    if (this.lastContent === newContent && this.dirty) {
      this.uploadButton.classList.add("deactivated");
      this.dirty = false;
    }
    if (this.lastContent !== newContent && !this.dirty) {
      this.dirty = true;
      this.uploadButton.classList.remove("deactivated");
    }
    if (this.lastContent !== newContent) {
      this.currentCode.code = newContent;
    }
    setTimeout(() => this.maintainUploadState(), 100);
  }

  upload() {
    const newCode = this.getSource();
    this.cog.upload(this.programCode.code, this.libraryCode.code);
    this.lastContent = newCode;
  }


}