import { Cog } from "./cog";
import { Log } from "./log";
import { Shape } from "./shape";

class CodeHolder {
  private static allHolders: CodeHolder[] = [];

  static activateHolder(holder: CodeHolder) {
    for (const h of CodeHolder.allHolders) {
      if (h === holder) {
        h.activate();
      } else {
        h.deactivate();
      }
    }
  }

  private div: HTMLDivElement;
  private img: HTMLImageElement;
  constructor(code: string, container: HTMLElement, img: HTMLImageElement) {
    this.img = img;
    this.img.width = 64;
    this.img.onclick = (ev: MouseEvent) => {
      CodeHolder.activateHolder(this);
    };

    this.div = document.createElement('div');
    this.div.classList.add("terminal");
    this.div.contentEditable = "true";
    this.div.spellcheck = false;
    this.div.innerText = code;
    container.appendChild(this.div);

    CodeHolder.allHolders.push(this);
    CodeHolder.activateHolder(this);
  }

  setCode(code: string) {
    this.div.innerText = code;
    // this.format();
  }

  getCode() {
    const newContent = this.div.innerText;
    const cleanContent = newContent.replace(/[^\n\x20-\x7e]/g, " ");
    return cleanContent;
  }

  private format() {
    let code: string = this.getCode();
    code = code.replace(/\{\s*/g, "{\n");
    code = code.replace(/\;\s+/g, ";\n");
    code = code.replace(/\n\s+/g, "\n");
    const reOpen = /[\(\{\[]/;
    const reClose = /[\)\}\]]/;

    let newCode = "";
    let indentation = "";
    for (const ch of code) {
      newCode += ch;
      if (ch.match(reOpen)) {
        indentation += " ";
      }
      if (ch.match(reClose)) {
        indentation = indentation.substr(0, indentation.length - 1);
      }
      if (ch == "\n") {
        newCode += indentation;
      }
    }
    this.div.innerText = newCode;
  }

  private activate() {
    this.div.classList.remove("hidden");
    this.img.classList.remove("deactivated");
    this.div.focus();
  }

  private deactivate() {
    this.div.classList.add("hidden");
    this.img.classList.add("deactivated");
  }
}

export class Terminal {
  private cog: Cog;
  private lastContent: string;
  private uploadButton: HTMLImageElement;
  private dirty: boolean;
  private imageCode: CodeHolder;
  private programCode: CodeHolder;
  private libraryCode: CodeHolder;
  private otherFocusElement: HTMLElement;
  constructor(otherFocusElement: HTMLElement) {
    this.otherFocusElement = otherFocusElement;
    const body = document.getElementsByTagName("body")[0];

    const toolbar = document.createElement('div');
    toolbar.classList.add("toolbar");

    const cameraButton = document.createElement('img');
    cameraButton.src = "Camera.png";
    toolbar.appendChild(cameraButton);
    this.imageCode = new CodeHolder("", body, cameraButton);

    const libraryButton = document.createElement('img');
    libraryButton.src = "Library.gif";
    toolbar.appendChild(libraryButton);
    this.libraryCode = new CodeHolder("", body, libraryButton);

    const playerButton = document.createElement('img');
    playerButton.src = "PlayerCode.gif";
    toolbar.appendChild(playerButton);
    this.programCode = new CodeHolder("", body, playerButton);

    {
      const sp = document.createElement('span');
      sp.innerText = ' ';
      toolbar.appendChild(sp);
    }

    this.uploadButton = document.createElement('img');
    this.uploadButton.src = "Upload.gif";
    this.uploadButton.alt = "Upload";
    this.uploadButton.width = 64;
    this.uploadButton.addEventListener("click", (ev) => {
      this.upload();
    });
    toolbar.appendChild(this.uploadButton);
    this.dirty = true;

    body.appendChild(toolbar);
  }

  setCog(cog: Cog) {
    this.cog = cog;
    this.programCode.setCode(cog.thing.state.code);
    this.libraryCode.setCode(cog.thing.state.libraryList);
    this.imageCode.setCode("");
    if (cog.thing instanceof Shape) {
      const textureImage = cog.thing.getTextureImage();
      if (textureImage) {
        this.imageCode.setCode(textureImage);
      }
    }
    CodeHolder.activateHolder(this.programCode);
  }

  upload() {
    const imageCode = this.imageCode.getCode();
    if (imageCode && this.cog.thing instanceof Shape) {
      this.cog.thing.setTextureImage(imageCode);
      this.cog.thing.state.imageSource = imageCode;
    }
    this.cog.upload(this.programCode.getCode(), this.libraryCode.getCode());
    this.otherFocusElement.focus();
  }


}