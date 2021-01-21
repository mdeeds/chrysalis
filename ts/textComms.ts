import { Log } from "./log";
import { State } from "./state";
import { World } from "./world";
import { WorldClient } from "./worldClient";
import { WorldServer } from "./worldServer";
const stringify = require("json-stringify-pretty-compact");

export class TextComms {
  worldServer: WorldServer;
  worldClient: WorldClient;
  div: HTMLDivElement;
  worldServerId: string;
  world: World;
  state: State;
  previousText: string;

  constructor(username: string) {
    this.worldServerId = `chrysalis-vialis-72361`;
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext("webgl");

    this.world = new World("vialis", gl, username);
    this.worldClient = this.world.getClient();
    this.worldClient.addCallback((text) => {
      this.setText(text);
    });
    this.state = null;

    this.div = document.createElement('div');
    this.div.classList.add('bigbox');
    this.div.innerText = "[ Content will appear here ]";
    this.previousText = this.div.innerText;
    this.div.contentEditable = "true";
    this.div.spellcheck = false;
    document.getElementsByTagName('body')[0].appendChild(this.div);
    this.world.getState()
      .then((state) => {
        this.state = state;
        this.setText(state.serialize());
      })
    this.sendUpdates();
  }

  setText(worldData: string) {
    this.div.innerText = stringify(
      JSON.parse(worldData), { maxLength: 80, indent: " " });
    // We only want to broadcast "natural" changes.  I.e. when the user
    // edits the text box directly.
    this.previousText = this.div.innerText;
  }

  sendUpdates() {
    if (this.previousText !== this.div.innerText) {
      try {
        const dict: any = JSON.parse(this.div.innerText);
        this.world.buildFromString(this.div.innerText);
        this.div.classList.remove("error");
        this.worldClient.sendNewState(this.div.innerText);
        this.previousText = this.div.innerText;
      }
      catch (e) {
        Log.error(e);
        this.div.classList.add("error");
        this.previousText = this.div.innerText;
      }
    }
    requestAnimationFrame(() => { this.sendUpdates(); });
  }
}