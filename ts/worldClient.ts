import { Log } from "./log";
import { PeerConnection } from "./peerConnection";

export class WorldClient {
  private personalConnection: PeerConnection;
  private worldServerId: string;
  private otherConnections: Set<string>;
  constructor(worldServerId: string) {
    this.personalConnection = new PeerConnection(null);
    this.worldServerId = worldServerId;
    this.otherConnections = new Set<string>();

    this.personalConnection.addCallback("Meet ", (other: string) => {
      Log.info(`Hello there, ${other}`);
      this.otherConnections.add(other);
    });
    this.personalConnection.waitReady().then(() => {
      Log.info("Introducing myself.")
      console.log("AAAAA");
      this.introduce();
    });
  }

  introduce() {
    this.personalConnection.send(this.worldServerId,
      `My id is: ${this.personalConnection.id()}`);
  }

  broadcast(message: string) {
    for (const other of this.otherConnections) {
      this.personalConnection.send(other, message);
    }
  }

  getConnection() {
    return this.personalConnection;
  }


}