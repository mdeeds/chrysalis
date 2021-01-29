import { HeartbeatGroup } from "./heartbeatGroup";
import { Log } from "./log";
import { State } from "./state";
import { ThingCodec } from "./thingCodec";
import { WorldServer } from "./worldServer";
import { Thing } from "./thing";

export class WorldClient extends HeartbeatGroup {
  private worldServerId: string;
  private updateCallbacks: Function[];
  private gl: WebGLRenderingContext;
  private worldName: string;
  private username: string;
  private state: State;

  constructor(gl: WebGLRenderingContext, worldServerId: string,
    worldName: string, username: string) {
    super();
    this.gl = gl;
    this.worldName = worldName;
    this.username = username;
    this.state = null;
    Log.info("Creating new client to the world.");
    this.worldServerId = worldServerId;
    this.updateCallbacks = [];

    this.connection.addCallback("Meet ", (other: string) => {
      Log.info(`Hello there, ${other}`);
      if (other !== this.connection.id()) {
        this.otherConnections.set(other, window.performance.now());
      }
    });

    this.connection.addCallback("Move: ", (serialized: string) => {
      if (!this.state) { return; }
      const dict: any = JSON.parse(serialized);
      const movedThing = ThingCodec.decode(this.gl, dict, this.state.library);
      this.state.mergeThing(movedThing);
    })

    this.connection.waitReady().then(() => {
      Log.info("Introducing myself.")
      this.introduce();
    });

    this.findWorldServer();
  }

  addCallback(callback: Function) {
    this.updateCallbacks.push(callback);
  }

  move(movedThing: Thing) {
    const serialized = ThingCodec.encode(movedThing);
    this.broadcast(`Move: ${serialized}`);
  }

  findWorldServer() {
    return new Promise<void>((resolve, reject) => {
      this.getConnection()
        .sendAndPromiseResponse(this.worldServerId, "Hi!")
        .then((message) => {
          Log.info(`Connected to world server: ${message}`);
          resolve();
        })
        .catch((reason) => {
          Log.info('Initiating new world server');
          this.state = new State(this.gl, this.worldName, this.username);
          const worldServer = new WorldServer(
            this.gl, this.worldServerId, this.worldName, this.username,
            this.state);
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
          this.state = new State(this.gl, this.worldName, this.username);
          this.state.buildFromString(serialized);
          resolve(this.state);
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