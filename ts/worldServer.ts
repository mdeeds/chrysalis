import { Log } from "./log";
import { PeerConnection } from "./peerConnection";
import { State } from "./state";
import { World } from "./world";

export class WorldServer {
  private connection: PeerConnection;
  private otherConnections: Set<string>;
  private world: World;

  constructor(worldServerId: string, world: World) {
    this.connection = new PeerConnection(worldServerId);
    this.otherConnections = new Set<string>();
    this.world = world;

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
            this.connection.send(other, `Meet ${value}`);
          }
        }
        Log.info(`Nice to meet you ${value}`);
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