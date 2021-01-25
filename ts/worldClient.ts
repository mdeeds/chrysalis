import { HeartbeatGroup } from "./heartbeatGroup";
import { Log } from "./log";
import { PeerConnection } from "./peerConnection";

export class WorldClient extends HeartbeatGroup {
  private worldServerId: string;
  private updateCallbacks: Function[];

  constructor(worldServerId: string) {
    super();
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
  }

  addCallback(callback: Function) {
    this.updateCallbacks.push(callback);
  }

  getWorldStateText(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.getConnection()
        .sendAndPromiseResponse(this.worldServerId, "Hi!")
        .then((id) => {
          Log.info("Thank you: " + id);
          this.getConnection().sendAndPromiseResponse(
            this.worldServerId, "World, please.")
            .then((worldData: string) => {
              Log.info("Recieved world from server.");
              resolve(worldData);
            })
            .catch((reason) => {
              reject(reason);
            });
        })
        .catch((reason) => {
          reject(reason);
        })
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