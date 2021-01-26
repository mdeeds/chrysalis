import { HeartbeatGroup } from "./heartbeatGroup";
import { Log } from "./log";
import { State } from "./state";
import { WorldServer } from "./worldServer";

export class WorldClient extends HeartbeatGroup {
  private worldServerId: string;
  private updateCallbacks: Function[];
  private gl: WebGLRenderingContext;
  private worldName: string;
  private username: string;

  constructor(gl: WebGLRenderingContext, worldServerId: string,
    worldName: string, username: string) {
    super();
    this.gl = gl;
    this.worldName = worldName;
    this.username = username;
    Log.info("Creating new client to the world.");
    this.worldServerId = worldServerId;
    this.updateCallbacks = [];

    this.connection.addCallback("Meet ", (other: string) => {
      Log.info(`Hello there, ${other}`);
      if (other !== this.connection.id()) {
        this.otherConnections.set(other, window.performance.now());
      }
    });

    this.connection.addCallback("State: ", (serialized: string) => {
      Log.info(`Recieved new state: ${serialized.length}`);
      for (const callback of this.updateCallbacks) {
        callback(serialized);
      }
    });

    this.connection.waitReady().then(() => {
      Log.info("Introducing myself.")
      this.introduce();
    });

    this.findWorldServer();
  }

  addCallback(callback: Function) {
    this.updateCallbacks.push(callback);
  }

  findWorldServer() {
    return new Promise<void>((resolve, reject) => {
      this.getConnection()
        .sendAndPromiseResponse(this.worldServerId, "Hi!")
        .then((id) => {
          Log.info(`Connected to world server: ${id}`);
          resolve();
        })
        .catch((reason) => {
          Log.info('Initiating new world server');
          const worldServer = new WorldServer(
            this.gl, this.worldServerId, this.worldName, this.username);
          resolve();
        });
    });
  }

  async getWorldState(): Promise<State> {
    await this.findWorldServer();
    return new Promise((resolve, reject) => {
      this.getConnection().sendAndPromiseResponse(
        this.worldServerId, "World, please.")
        .then((serialized: string) => {
          const state = new State(this.gl, this.worldName, this.username);
          state.buildFromString(serialized);
          resolve(state);
        })
        .catch((reason) => {
          reject(reason);
        });
    });
  }

  introduce() {
    this.connection.sendAndPromiseResponse(this.worldServerId,
      `My id is: ${this.connection.id()}`)
      .then(() => {
        Log.info("I was heard.");
      })
      .catch((reason) => {
        Log.info(`No one is listening. ${reason}`);
        setTimeout(() => { this.introduce(); }, 500);
      });
  }

  sendNewState(serialized: string) {
    Log.info("Broadcasting update.");
    this.broadcast(`State: ${serialized}`);
  }

  getConnection() {
    return this.connection;
  }
}