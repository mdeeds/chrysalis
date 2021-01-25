import { Log } from "./log";
import { PeerConnection } from "./peerConnection";

export class HeartbeatGroup {
  readonly connection: PeerConnection;
  readonly otherConnections: Map<string, number>;
  private status: HTMLDivElement;

  constructor(id: string = null) {
    this.connection = new PeerConnection(id);
    this.otherConnections = new Map<string, number>();
    if (id === null) {
      this.status = document.createElement('div');
      this.status.innerText = "Status";
      this.status.classList.add("status")
      document.getElementsByTagName('body')[0].appendChild(this.status);
    } else {
      this.status = null;
    }

    this.connection.addCallback("thump: ", (peerId: string) => {
      if (peerId === this.connection.id()) {
        return;
      }
      if (!this.otherConnections.has(peerId)) {
        Log.info(`Out of sequence: ${peerId}`);
      }
      this.otherConnections.set(peerId, window.performance.now());
    })

    this.beat();
  }

  broadcast(message: string) {
    for (const other of this.otherConnections.keys()) {
      this.connection.send(other, message);
    }
  }

  private beat() {
    const now = window.performance.now();
    if (this.status) {
      this.status.innerText = `I am: ${this.connection.id()}`;
    }
    const keysToRemove = [];
    for (const peerId of this.otherConnections.keys()) {
      const d = document.createElement('div');
      const latency = now - this.otherConnections.get(peerId);
      if (latency > 5000) {
        keysToRemove.push(peerId);
      }
      if (this.status) {
        d.innerText = `${peerId}: ${latency.toFixed(1)}`;
        this.status.appendChild(d);
      }
    }
    for (const peerId of keysToRemove) {
      this.otherConnections.delete(peerId);
      Log.info(`We lost: ${peerId}.`);
    }
    this.broadcast(`thump: ${this.connection.id()}`);
    setTimeout(() => this.beat(), 1000);
  }

}