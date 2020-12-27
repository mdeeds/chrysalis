import { BasicBot } from "./basicBot";
import { Bubble } from "./bubble";
import { Gem } from "./gem";
import { Ocean } from "./ocean";
import { PeerConnection } from "./peerConnection";
import { Player } from "./player";
import { State } from "./state";
import { Thing } from "./thing";
import { Tile } from "./tile";
import { Log } from "./log";

export class World {
  private gl: WebGLRenderingContext;
  private things: Thing[];
  private state: State;
  private personalConnection: PeerConnection;
  private worldServer: PeerConnection;
  private worldName: string;

  constructor(worldName: string, gl: WebGLRenderingContext) {
    this.worldName = worldName;
    this.gl = gl;
    this.things = [];
    this.state = new State();

    const url = new URL(document.URL);
    Log.info("Document URL: " + url)
    if (url.searchParams.get('local')) {
      this.loadFromSavedState()
        .then((data: string) => {
          this.buildFromString(data);
        })
    } else {
      this.setStateFromInternet();
    }
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

  getPlayerCoords() {
    if (this.state != null && this.state.you.xyz != null) {
      return this.state.you.xyz;
    } else {
      return [20, 0, 12];
    }
  }

  getThings() {
    return this.things;
  }

  private saveLoop() {
    window.localStorage.setItem(`${this.worldName}-world`, JSON.stringify(this.state));
    setTimeout(() => { this.saveLoop(); }, 2000);
  }

  private async loadFromSavedState() {
    const worldData = window.localStorage.getItem(`${this.worldName}-world`);
    if (worldData) {
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

  applyDelta(delta: State) {
    this.state.apply(delta);
  }

  buildFromString(data: string) {
    const dict = JSON.parse(data) as State;
    this.state.apply(dict);
    Log.info("Loaded size: " + data.length);
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
            this.things.push(new Tile(this.gl, x, z));
            break;
          case '~':
            this.things.push(new Ocean(this.gl, x, z));
        }
      }
    }
    this.things.push(new BasicBot(this.gl, 2, 0));
    this.things.push(new Player(this.gl,
      this.state.you.xyz[0], this.state.you.xyz[2]));
    this.things.push(new Gem(this.gl, -2, -2));

    // this.things.push(new Bubble(this.gl, "Hello, World!", 10, 10));

    this.saveLoop();
  }
}