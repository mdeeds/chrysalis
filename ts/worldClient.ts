import { Log } from "./log";
import { PeerConnection } from "./peerConnection";

export class WorldClient {
  private personalConnection: PeerConnection;
  private worldServerId: string;
  private otherConnections: Set<string>;
  private updateCallbacks: Function[];

  constructor(worldServerId: string) {
    Log.info("Creating new client to the world.");
    this.personalConnection = new PeerConnection(null);
    this.worldServerId = worldServerId;
    this.otherConnections = new Set<string>();
    this.updateCallbacks = [];

    this.personalConnection.addCallback("Meet ", (other: string) => {
      Log.info(`Hello there, ${other}`);
      if (other !== this.personalConnection.id()) {
        this.otherConnections.add(other);
      }
    });

    this.personalConnection.addCallback("State: ", (serialized: string) => {
      Log.info(`Recieved new state: ${serialized.length}`);
      for (const callback of this.updateCallbacks) {
        callback(serialized);
      }
    })

    this.personalConnection.waitReady().then(() => {
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
    this.personalConnection.sendAndPromiseResponse(this.worldServerId,
      `My id is: ${this.personalConnection.id()}`)
      .then(() => {
        Log.info("I was heard.");
      })
      .catch((reason) => {
        Log.info(`No one is listening. ${reason}`);
        setTimeout(() => { this.introduce(); }, 500);
      });
  }

  broadcast(message: string) {
    Log.info(`Broadcasting to ${this.otherConnections.size}`)
    for (const other of this.otherConnections) {
      this.personalConnection.send(other, message);
    }
  }

  sendNewState(serialized: string) {
    Log.info("Broadcasting update.");
    this.broadcast(`State: ${serialized}`);
  }

  getConnection() {
    return this.personalConnection;
  }


}