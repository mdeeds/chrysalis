import { Log } from "./log";
import { PeerConnection } from "./peerConnection";
import { State } from "./state";
import { World } from "./world";

export class WorldServer {
  private connection: PeerConnection;
  private otherConnections: Set<string>;

  constructor(worldServerId: string, world: World) {
    Log.info("Creating new server for the world.")
    this.connection = new PeerConnection(worldServerId);
    this.otherConnections = new Set<string>();

    this.connection.addCallback("World, please.",
      async () => {
        Log.info("World request recieved.");
        let worldState: State;
        worldState = await world.getState();
        return worldState.serialize();
      })
    this.connection.addCallback("My id is: ",
      (value: string) => {
        Log.info(`Sending introductions to ${this.otherConnections.size}`);
        for (const other of this.otherConnections) {
          if (other !== value) {
            Log.info(`${other}, please meet ${value}`);
            this.connection.send(other, `Meet ${value}`);
            Log.info(`${value}, please meet ${other}`);
            this.connection.send(value, `Meet ${other}`);
          }
        }
        this.connection.send(value, "Nice to meet you.");
        this.otherConnections.add(value);
        return "";
      });
    this.connection.addCallback("Who is here?",
      (value: string) => {
        const others: string[] = [];
        for (const other of this.otherConnections) {
          others.push(other);
        }
        return JSON.stringify(others);
      });

  }
}