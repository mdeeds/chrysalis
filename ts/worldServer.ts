import { HeartbeatGroup } from "./heartbeatGroup";
import { Log } from "./log";
import { State } from "./state";

export class WorldServer extends HeartbeatGroup {
  private loaded: boolean;
  private state: State;
  private worldName: string;
  private worldServerId: string;

  constructor(
    gl: WebGLRenderingContext,
    worldServerId: string,
    worldName: string,
    username: string,
    state: State) {
    Log.info("Creating new server for the world.")
    super(worldServerId);
    this.worldServerId = worldServerId;
    this.worldName = worldName;
    this.loaded = false;
    this.state = state;
    (async function () { await this.getState(); }.bind(this))();

    // The "Hi!" message is the protocol for establishing the presence of
    // a WorldServer.
    this.connection.addCallback("Hi!", () => {
      return `Welcome to ${worldName}`;
    });

    this.connection.addCallback("World, please.",
      async () => {
        Log.info("World request recieved.");
        let worldState: State;
        worldState = await this.getState();
        return worldState.serialize();
      })
    this.connection.addCallback("My id is: ",
      (value: string) => {
        Log.info(`Sending introductions to ${this.otherConnections.size}`);
        for (const other of this.otherConnections.keys()) {
          if (other !== value) {
            Log.info(`${other}, please meet ${value}`);
            this.connection.send(other, `Meet ${value}`);
            Log.info(`${value}, please meet ${other}`);
            this.connection.send(value, `Meet ${other}`);
          }
        }
        if (value !== this.connection.id()) {
          this.otherConnections.set(value, window.performance.now());
        }
        return "";
      });
    this.connection.addCallback("Who is here?",
      (value: string) => {
        const others: string[] = [];
        for (const other of this.otherConnections.keys()) {
          others.push(other);
        }
        return JSON.stringify(others);
      });
  }

  private async loadFromSavedState(): Promise<string> {
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

  private async getState(): Promise<State> {
    if (this.loaded) {
      return new Promise((resolve, reject) => {
        resolve(this.state);
      });
    } else {
      return new Promise(async (resolve, reject) => {
        Log.info('Loading world from saved state.');
        const serialized = await this.loadFromSavedState();
        this.state.buildFromString(serialized);
        resolve(this.state);
      })
    }
  }
}