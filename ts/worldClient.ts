import { HeartbeatGroup } from "./heartbeatGroup";
import { Log } from "./log";
import { State } from "./state";
import { ThingCodec } from "./thingCodec";
import { WorldServer } from "./worldServer";
import { PeerConnection } from "./peerConnection";

export class WorldClient {
  private worldServerId: string;
  private updateCallbacks: Function[];
  private gl: WebGLRenderingContext;
  private worldName: string;
  private username: string;
  private state: State;
  private heartbeatGroup: HeartbeatGroup;
  private connection: PeerConnection;
  private loadedCallback: Function = null;

  constructor(gl: WebGLRenderingContext,
    worldName: string, heartbeatGroup: HeartbeatGroup) {
    this.heartbeatGroup = heartbeatGroup;
    this.connection = this.heartbeatGroup.getConnection();
    this.gl = gl;
    this.worldName = worldName;
    this.username = heartbeatGroup.getUsername();
    this.state = null;
    this.updateCallbacks = [];

    this.connection.addCallback("Move: ", (serialized: string) => {
      // Log.info("AAAAA: Moving...");
      if (!this.state) {
        Log.info("Discarding move... No state.");
        return;
      }
      const dict: any = JSON.parse(serialized);
      const movedThing = ThingCodec.decode(this.gl, dict, this.state.library);
      this.state.mergeThing(movedThing);
    });
  }

  addCallback(callback: Function) {
    this.updateCallbacks.push(callback);
  }

  getConnection() {
    return this.connection;
  }

  setState(state: State) {
    this.state = state;
  }
}