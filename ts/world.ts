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

export class World {
  private worldName: string;
  private gl: WebGLRenderingContext;
  private username: string;
  private things: Thing[];
  private cogs: Cog[];
  private state: State;
  private personalConnection: PeerConnection;
  private worldServer: PeerConnection;
  private terminal: Terminal;
  private saveButton: HTMLAnchorElement;


  constructor(worldName: string, gl: WebGLRenderingContext, username: string) {
    this.worldName = worldName;
    this.gl = gl;
    this.username = username;
    this.things = [];
    this.cogs = [];
    this.state = new State();
    this.terminal = new Terminal();

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

  getThings(): Thing[] {
    return this.things;
  }

  private saveLoop() {
    const serializedState = JSON.stringify(this.state);
    Log.info(`Saving. ${this.things.length} things`);
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
    const dict: any = JSON.parse(data);
    this.state.mergeFromObject(dict);
    if (!this.state.players.has(this.username)) {
      Log.info(`${this.username} is new to this world.`);
    } else {
      Log.info(`Welcome back, ${this.username}.`);
    }
    Log.info("Loaded size: " + data.length.toLocaleString());
    const map: any = dict.map;
    const height = map.length;
    let width = 0;
    for (let l of map) {
      width = Math.max(width, l.length);
    }

    for (let j = 0; j < height; ++j) {
      const l = map[j];
      const z = j * 2.0;
      for (let i = 0; i < width; ++i) {
        const x = i * 2.0;
        let c = '~';
        if (i < l.length) {
          c = l[i];
        }
        switch (c) {
          case '#':
            this.things.push(new Tile(this.gl, new ThingState([x, 0, z])));
            break;
          case '~':
            this.things.push(new Ocean(this.gl, new ThingState([x, 0, z])));
        }
      }
    }

    for (const name of this.state.players.keys()) {
      Log.info(`Materializing ${name}.`);
      const playerState = this.state.players.get(name);
      const playerThing = new Player(this.gl, playerState);
      const playerComputer = new Computer(playerState.code);
      const youCog = new Cog(playerThing, playerComputer);
      this.cogs.push(youCog);
      this.terminal.setCog(youCog);
      this.things.push(playerThing);
    }
    if (!this.state.players.has(this.username)) {
      Log.error(`${this.username} is not here.`);
    }

    // this.things.push(new BasicBot(this.gl, 2, 0));
    // this.things.push(new Gem(this.gl, -2, -2));

    // this.things.push(new Bubble(this.gl, "Hello, World!", 10, 10));

    this.saveLoop();
  }
}