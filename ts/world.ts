import { BasicBot } from "./basicBot";
import { Bubble } from "./bubble";
import { Cog } from "./cog";
import { Computer } from "./computer";
import { Gem } from "./gem";
import { Log } from "./log";
import { Ocean } from "./ocean";
import { PeerConnection } from "./peerConnection";
import { Player } from "./player";
import { State } from "./state";
import { Thing } from "./thing";
import { Tile } from "./tile";
import { ThingState } from "./thingState";
import { StateDelta } from "./stateDelta";
import { Terminal } from "./terminal";
import { BoundingBox } from "./quadTree";

export class World {
  private worldName: string;
  private gl: WebGLRenderingContext;
  private username: string;
  private cogs: Cog[];
  private state: State;
  private personalConnection: PeerConnection;
  private worldServer: PeerConnection;
  private terminal: Terminal;
  private saveButton: HTMLAnchorElement;
  private gameFocusElement: HTMLElement;

  constructor(worldName: string,
    gl: WebGLRenderingContext, username: string,
    gameFocusElement: HTMLElement) {
    this.worldName = worldName;
    this.gl = gl;
    this.username = username;
    this.cogs = [];
    this.state = new State(gl);
    this.gameFocusElement = gameFocusElement;
    this.terminal = new Terminal(gameFocusElement);

    const url = new URL(document.URL);
    if (url.searchParams.get('local')) {
      this.loadFromSavedState()
        .then((data: string) => {
          this.buildFromString(data);
        })
    } else {
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
    this.personalConnection = new PeerConnection(null);
    this.worldServer = null;
    const worldServerId = `chrysalis-${this.worldName}-72361`;
    this.personalConnection.sendAndPromiseResponse(worldServerId, "Hi!")
      .then((id) => {
        Log.info("Thank you: " + id);
        this.personalConnection.sendAndPromiseResponse(
          worldServerId, "World, please.")
          .then((worldData: string) => {
            this.buildFromString(worldData);
          })
          .catch((reason) => {
            Log.info("Failed to get world: " + reason)
          });
      })
      .catch((reason) => {
        Log.info("Failed to say hello: " + reason);
        this.worldServer = new PeerConnection(worldServerId);
        this.worldServer.addCallback("World, please.",
          async () => { return await this.loadFromSavedState(); })
        this.personalConnection.sendAndPromiseResponse(
          worldServerId, "World, please.")
          .then((worldData: string) => {
            this.buildFromString(worldData);
          })
          .catch((reason) => {
            Log.info("Failed to get world: " + reason)
          });
      })
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

  private async loadFromSavedState() {
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

  private async load(url: string) {
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

  getState() {
    return this.state;
  }

  getCogs() {
    return this.cogs;
  }

  applyDelta(delta: StateDelta) {
    this.state.apply(delta);
  }

  buildFromString(data: string) {
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
    // TODO: We need to do something similar to this when a new player logs in.

    if (!this.state.players.has(this.username)) {
      Log.error(`${this.username} is not here.`);
    } else {
      Log.info(`Materializing ${this.username}.`);
      const playerState = this.state.players.get(this.username);
      const playerThing = new Player(this.gl, playerState);
      const playerComputer =
        new Computer(playerState.code,
          playerState.libraryList, this.state.library);
      const youCog = new Cog(playerThing, playerComputer);
      this.cogs.push(youCog);
      this.terminal.setCog(youCog);
      this.gameFocusElement.focus();
      this.state.everything.insert(
        playerState.xyz[0], playerState.xyz[2], playerThing);
    }

    // this.things.push(new BasicBot(this.gl, 2, 0));
    // this.things.push(new Gem(this.gl, -2, -2));

    // this.things.push(new Bubble(this.gl, "Hello, World!", 10, 10));

    this.saveLoop();
  }
}