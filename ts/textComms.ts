import { Log } from "./log";
import { State } from "./state";
import { WorldClient } from "./worldClient";
import stringify from "json-stringify-pretty-compact";

export class TextComms {
  worldClient: WorldClient;
  div: HTMLDivElement;
  worldServerId: string;
  state: State;
  previousText: string;

  constructor(username: string) {
    this.worldServerId = `chrysalis-vialis-72361`;
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext("webgl");

    this.worldClient =
      new WorldClient(gl, this.worldServerId, "vialis", username);
    this.worldClient.addCallback((text: string) => {
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
    this.worldClient.getWorldState()
      .then((state: State) => {
        const serializedState = state.serialize();
        this.setText(serializedState);
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
        // Parse the JSON and only send if it is valid.
        JSON.parse(this.div.innerText);
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