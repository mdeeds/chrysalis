import { HeartbeatGroup } from "./heartbeatGroup";
import { Log } from "./log";
import { Render } from "./render";
import { State } from "./state";
import { WorldClient } from "./worldClient";
import { WorldServer } from "./worldServer";

export class Meet {
  private heartbeatGroup: HeartbeatGroup;
  private username: string;
  private worldClient: WorldClient;
  private worldName: string;
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  constructor(
    worldName: string, username: string, joinId: string) {
    this.username = username;
    this.worldName = worldName;
    this.heartbeatGroup = new HeartbeatGroup(username, joinId);

    const body = document.getElementsByTagName('body')[0];
    const localGameDiv = document.createElement('div');
    localGameDiv.id = "localGameDiv";
    localGameDiv.innerText = "Local";
    body.appendChild(localGameDiv);
    const meetDiv = document.createElement('div');

    if (!joinId) {
      const startDiv = document.createElement('div');
      const startSpan = document.createElement('span');
      startDiv.appendChild(startSpan);
      startSpan.id = "startSpan";
      startSpan.innerText = "Start!";
      body.appendChild(startDiv);
      startSpan.addEventListener("click", () => {
        startDiv.remove();
        meetDiv.remove();
        this.startAsServer();
      });
    }

    if (joinId) {
      const url = new URL(document.URL);
      url.searchParams.delete("login");
      meetDiv.innerText = url.toString();
      this.heartbeatGroup.getConnection()
        .waitReady()
        .then((connection) => {
          Log.info("Ready to play.");
          this.heartbeatGroup.getConnection().addCallback("Start: ",
            (serialized: string) => {
              this.startAsClient(serialized);
            });
        });
    } else {
      meetDiv.innerText = "Loading...";
      this.heartbeatGroup.getConnection()
        .waitReady()
        .then((connection) => {
          const url = new URL(document.URL);
          url.searchParams.delete("login");
          url.searchParams.append("join", connection.id());
          meetDiv.innerText = url.toString();
        });
    }
    this.canvas = this.makeCanvas();
    this.gl = this.canvas.getContext("webgl");
    this.worldClient = new WorldClient(this.gl, worldName, this.heartbeatGroup)
    body.appendChild(meetDiv);
  }

  makeCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.id = "glCanvas";
    canvas.width = 1024 * 2;
    canvas.height = 768 * 2;
    return canvas;
  }

  startAsClient(serialized: string) {
    Log.info("Starting game as client.");
    const state = new State(this.gl, this.worldName, this.username,
      (message) => { this.heartbeatGroup.broadcast(message); });
    this.worldClient.setState(state);
    state.buildFromString(serialized);
    const r = new Render(state, this.canvas);
    r.main(this.heartbeatGroup);
  }

  startAsServer() {
    WorldServer.getState(this.gl, this.worldName, this.username,
      (message: string) => { this.heartbeatGroup.broadcast(message); })
      .then((state: State) => {
        this.worldClient.setState(state);
        Log.info("Starting game as server.");
        this.heartbeatGroup.broadcast(`Start: ${state.serialize()}`);
        const r = new Render(state, this.canvas);
        r.main(this.heartbeatGroup);
        Log.info("Systems are active.");
      });
  }
}