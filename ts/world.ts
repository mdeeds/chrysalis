import { Log } from "./log";
import { State } from "./state";
import { Thing } from "./thing";
import { StateDelta } from "./stateDelta";
import { BoundingBox } from "./quadTree";
import { Library } from "./library";
import { WorldServer } from "./worldServer";
import { WorldClient } from "./worldClient";

export class World {
  private worldName: string;
  private username: string;
  private state: State;
  private saveButton: HTMLAnchorElement;
  private loaded: boolean;
  private loadedCallback: Function;
  private worldServer: WorldServer;
  private worldClient: WorldClient;

  constructor(worldName: string,
    gl: WebGLRenderingContext, username: string) {
    this.worldName = worldName;
    this.username = username;
    this.state = new State(gl);
    this.loaded = false;
    this.loadedCallback = null;
    this.worldServer = null;

    const url = new URL(document.URL);
    if (url.searchParams.get('local')) {
      this.loadFromSavedState()
        .then((data: string) => {
          this.buildFromString(data);
        });
    } else {
      Log.info("Searching internet for chrysalis installation.");
      this.setStateFromInternet();
    }

    this.saveButton = document.createElement('a');
    this.saveButton.innerText = "Download";
    // this.saveButton.download = "vialis.json";
    const saveDiv = document.createElement('div');
    saveDiv.appendChild(this.saveButton);
    saveDiv.classList.add("download");
    document.getElementsByTagName('body')[0].appendChild(saveDiv);
  }

  setStateFromInternet() {
    this.worldServer = null;
    const worldServerId = `chrysalis-${this.worldName}-72361`;
    this.worldClient = new WorldClient(worldServerId);
    this.worldClient.getWorldStateText()
      .then((worldData) => {
        this.buildFromString(worldData);
      })
      .catch(async (reason) => {
        Log.info("Failed to say hello: " + reason);
        this.worldServer = new WorldServer(worldServerId, this);
        const serializedState = await this.loadFromSavedState();
        this.buildFromString(serializedState);
      });
  }

  getPlayerCoords(): Float32Array {
    const playerState = this.state.players.get(this.username);
    if (playerState != null) {
      return playerState.xyz;
    } else {
      return new Float32Array([20, 0, 12]);
    }
  }

  getThings(bb: BoundingBox): Thing[] {
    return this.state.getThings(bb);
  }

  private saveLoop() {
    const serializedState = this.state.serialize();
    window.localStorage.setItem(`${this.worldName}-world`, serializedState);
    setTimeout(() => { this.saveLoop(); }, 2000);
    const dataUrl = "data:text/javascript;base64," + btoa(serializedState);
    this.saveButton.href = dataUrl;
  }

  async loadFromSavedState(): Promise<string> {
    const worldData = window.localStorage.getItem(`${this.worldName}-world`);
    const url = new URL(document.URL);
    if (worldData && !url.searchParams.get('reset')) {
      return new Promise((resolve, reject) => {
        Log.info("Loading from local storage.");
        resolve(worldData);
      });
    } else {
      Log.info("Loading from json");
      return this.load("emptyWorld.json");
    }
  }

  private async load(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const method = "GET";
      xhr.open(method, url, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          var status = xhr.status;
          if (status === 0 || (status >= 200 && status < 400)) {
            resolve(xhr.responseText);
          } else {
            reject("Failed to load world.");
          }
        }
      };
      xhr.send();
    });
  }

  getState(): Promise<State> {
    if (this.loaded) {
      return new Promise((resolve, reject) => {
        resolve(this.state);
      });
    } else {
      return new Promise((resolve, reject) => {
        this.loadedCallback = resolve;
      });
    }
  }

  applyDelta(delta: StateDelta) {
    this.state.apply(delta);
  }

  buildFromString(data: string) {
    Log.info(`Deserializing ${data.length} bytes of encoded state.`);
    this.state.deserialize(data);
    if (!this.state.players.has(this.username)) {
      Log.info(`${this.username} is new to this world.`);
      const playerState = this.state.players.get("_prototype");
      this.state.players.set(this.username, playerState);
    } else {
      Log.info(`Welcome back, ${this.username}.`);
    }

    Log.info(`Loaded ${this.state.library.size()} libraries.`);
    for (const libName of this.state.library.libraryNames()) {
      Log.info(`Library: ${libName}`);
    }

    this.loaded = true;
    Log.info(`World loaded.  Notifying ${!!this.loadedCallback}`);
    if (this.loadedCallback) {
      this.loadedCallback(this.state);
      this.loadedCallback = null;
    }
    this.saveLoop();
  }

  getClient() {
    return this.worldClient;
  }
}