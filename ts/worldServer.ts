import { HeartbeatGroup } from "./heartbeatGroup";
import { Log } from "./log";
import { PeerConnection } from "./peerConnection";
import { State } from "./state";
import { World } from "./world";

export class WorldServer extends HeartbeatGroup {
  constructor(worldServerId: string, world: World) {
    Log.info("Creating new server for the world.")
    super(worldServerId);

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
        for (const other of this.otherConnections.keys()) {
          if (other !== value) {
            Log.info(`${other}, please meet ${value}`);
            this.connection.send(other, `Meet ${value}`);
            Log.info(`${value}, please meet ${other}`);
            this.connection.send(value, `Meet ${other}`);
          }
        }
        if (value !== this.connection.id()) {
          this.connection.send(value, "Nice to meet you.");
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
}