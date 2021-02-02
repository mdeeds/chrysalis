import beautify from "js-beautify";

import { BasicBot } from "./basicBot";
import { Cog } from "./cog";
import { Log } from "./log";
import { Player } from "./player";
import { Shape } from "./shape";
import { Tablet } from "./tablet";
import { Thing } from "./thing";

class CodeHolder {
  private static allHolders: CodeHolder[] = [];

  static activateHolder(holder: CodeHolder, takeFocus: boolean) {
    for (const h of CodeHolder.allHolders) {
      if (h === holder) {
        h.activate(takeFocus);
      } else {
        h.deactivate();
      }
    }
  }

  private div: HTMLDivElement;
  private img: HTMLImageElement;
  private lastStyleClass: string;
  constructor(code: string, container: HTMLElement, img: HTMLImageElement,
    styleClass: string, autoFormat: boolean = true) {
    this.img = img;
    this.img.width = 64;
    this.img.onclick = (ev: MouseEvent) => {
      CodeHolder.activateHolder(this, true);
    };

    this.div = document.createElement('div');
    this.div.classList.add("terminal");
    if (styleClass) {
      this.div.classList.add(styleClass);
      this.img.classList.add(styleClass);
    }
    this.div.contentEditable = "true";
    this.div.spellcheck = false;
    this.div.innerText = code;
    if (autoFormat) {
      this.div.addEventListener('focusout', () => { this.format(); });
      this.div.addEventListener('focusin', () => { this.format(); });
    }
    container.appendChild(this.div);

    CodeHolder.allHolders.push(this);
    CodeHolder.activateHolder(this, false);
  }

  setStyle(imgSrc: string, styleClass: string) {
    this.div.classList.remove(this.lastStyleClass);
    this.div.classList.add(styleClass);
    this.img.src = imgSrc;
    this.img.classList.remove(this.lastStyleClass);
    this.img.classList.add(styleClass);

    this.lastStyleClass = styleClass;
  }

  setCode(code: string) {
    this.div.innerText = code;
  }

  getCode() {
    return this.div.innerText;
  }

  format() {
    let code = this.getCode();
    code = beautify(code, {
      "indent_size": 2,
      "indent_char": " ",
      "max_preserve_newlines": 1,
      "preserve_newlines": true,
      "keep_array_indentation": false,
      "break_chained_methods": false,
      "brace_style": "collapse",
      "space_before_conditional": true,
      "unescape_strings": false,
      "jslint_happy": false,
      "end_with_newline": false,
      "wrap_line_length": 80,
      "comma_first": false,
      "e4x": false,
      "indent_empty_lines": false
    });
    Log.info("Formatting...");
    this.setCode(code);
  }

  private activate(takeFocus: boolean) {
    this.div.classList.remove("hidden");
    this.img.classList.remove("deactivated");
    if (takeFocus) {
      this.div.focus();
    }
  }

  private deactivate() {
    this.div.classList.add("hidden");
    this.img.classList.add("deactivated");
  }
}

export class Terminal {
  private cog: Cog;
  private thing: Thing;
  private uploadButton: HTMLImageElement;
  private imageCode: CodeHolder;
  private libraryList: CodeHolder;
  private programCode: CodeHolder;

  private otherFocusElement: HTMLElement;
  constructor(otherFocusElement: HTMLElement) {
    this.otherFocusElement = otherFocusElement;
    const body = document.getElementsByTagName("body")[0];

    const toolbar = document.createElement('div');
    toolbar.classList.add("toolbar");

    const cameraButton = document.createElement('img');
    cameraButton.src = "img/Camera.png";
    toolbar.appendChild(cameraButton);
    this.imageCode = new CodeHolder("", body, cameraButton,
      null, /*autoFormat=*/false);

    const libraryButton = document.createElement('img');
    libraryButton.src = "img/Library.gif";
    toolbar.appendChild(libraryButton);
    this.libraryList = new CodeHolder("", body, libraryButton, null);

    const playerButton = document.createElement('img');
    playerButton.src = "img/PlayerCode.gif";
    toolbar.appendChild(playerButton);
    this.programCode = new CodeHolder("", body, playerButton, null);

    {
      const sp = document.createElement('span');
      sp.innerText = ' ';
      toolbar.appendChild(sp);
    }

    this.uploadButton = document.createElement('img');
    this.uploadButton.src = "img/Upload.gif";
    this.uploadButton.alt = "Upload";
    this.uploadButton.width = 64;
    this.uploadButton.addEventListener("click", (ev) => {
      this.upload();
    });
    toolbar.appendChild(this.uploadButton);
    body.appendChild(toolbar);
  }

  setCog(cog: Cog, takeFocus: boolean = false) {
    this.cog = cog;
    this.setThing(cog.thing, takeFocus, true);
  }

  setThing(thing: Thing, takeFocus: boolean = false, isCog: boolean = false) {
    if (!isCog) {
      this.cog = null;
    }
    this.thing = thing;
    this.libraryList.setCode(thing.state.libraryList);
    this.programCode.setCode(thing.state.code);

    if (thing instanceof Player) {
      this.programCode.setStyle("img/PlayerCode.gif", "player");
    } else if (thing instanceof Tablet) {
      this.programCode.setStyle("img/LibraryCode.png", "library");
    } else if (thing instanceof BasicBot) {
      this.programCode.setStyle("img/RobotCode.gif", "robot");
    } else {
      Log.error("unknown!");
      Log.info(thing.constructor.toString())
      this.programCode.setStyle("img/PlayerCode.gif", "player");
    }

    this.imageCode.setCode("");
    if (thing instanceof Shape) {
      const textureImage = thing.getTextureImage();
      if (textureImage) {
        this.imageCode.setCode(textureImage);
      }
    }
    CodeHolder.activateHolder(this.programCode, takeFocus);
  }

  upload() {
    const imageCode = this.imageCode.getCode();
    if (imageCode && this.thing instanceof Shape) {
      this.thing.setTextureImage(imageCode);
      this.thing.state.imageSource = imageCode;
    }
    this.programCode.format();
    this.libraryList.format();
    const programCode: string = this.programCode.getCode();
    if (this.cog) {
      Log.info(`Uploading ${programCode.length} bytes to cog.`);
      this.cog.upload(programCode, this.libraryList.getCode());
    } else {
      Log.info(`Updating state with ${programCode.length} bytes.`);
      if (this.thing instanceof Tablet) {
        (this.thing as Tablet).upload(programCode, this.libraryList.getCode());
      } else {
        this.thing.upload(programCode, this.libraryList.getCode());
      }
    }
    this.otherFocusElement.focus();
  }
}