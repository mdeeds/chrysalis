import { Log } from "./log";
import { PeerConnection } from "./peerConnection";

export class HeartbeatGroup {
  private username: string;
  private connection: PeerConnection;
  // Maps peer Id to username.
  private otherConnections: Map<string, string>;
  private status: HTMLDivElement;
  private heartStatus: Map<string, HTMLDivElement>;
  private leader: boolean;
  private leaderId: string;

  constructor(username: string, joinId: string = null) {
    this.username = username;
    this.connection = new PeerConnection(null);
    this.otherConnections = new Map<string, string>();
    this.heartStatus = new Map<string, HTMLDivElement>();
    if (joinId) {
      this.leaderId = joinId;
      this.otherConnections.set(joinId, null)
      this.leader = false;
    } else {
      this.leader = true;
    }

    this.status = document.createElement('div');
    this.status.innerText = "Status";
    this.status.classList.add("status")
    document.getElementsByTagName('body')[0].appendChild(this.status);

    this.connection.addCallback("thump: ",
      (peers: string) => {
        const peerKVs = peers.split(',');
        for (let i = 0; i < peerKVs.length; ++i) {
          const peerKV = peerKVs[i];
          let peerUser: string;
          let peerId: string;
          [peerId, peerUser] = peerKV.split('=');
          if (peerId === this.getConnection().id()) {
            continue;
          }
          if (i === 0) {
            this.updateId(peerId, peerUser);
          }
          if (!this.otherConnections.has(peerId) ||
            this.otherConnections.get(peerId) === null) {
            Log.info(`Meeting: ${peerId}`);
          }
          this.otherConnections.set(peerId, peerUser);
        }
      })
    this.connection.waitReady()
      .then(() => { this.beat(); });
  }

  isLeader() {
    return this.leader;
  }

  getConnection() {
    return this.connection;
  }

  getUsername() {
    return this.username;
  }

  broadcast(message: string) {
    for (const other of this.otherConnections.keys()) {
      this.connection.send(other, message);
    }
  }

  sendToLeader(message: string): Promise<string> {
    if (!this.leaderId) {
      Log.error("Leaders shouldn't talk to themselves.");
    }
    return this.connection.sendAndPromiseResponse(this.leaderId, message);
  }

  private updateId(id: string, username: string) {
    if (!this.heartStatus.has(id)) {
      const div = document.createElement('div');
      div.innerText = `♡ ${username}`;
      div.classList.add('pulse');
      this.heartStatus.set(id, div);
      this.status.appendChild(div);
    }
    const div = this.heartStatus.get(id);
    div.classList.remove('pulse');
    setTimeout(() => { div.classList.add('pulse') }, 10);
  }

  private beat() {
    this.updateId(this.connection.id(), this.username);

    const otherList: string[] = [`${this.connection.id()}=${this.username}`];
    for (const [k, v] of this.otherConnections) {
      otherList.push(`${k}=${v}`);
    }
    this.broadcast(`thump: ${otherList.join(',')}`);
    setTimeout(() => this.beat(), 1000);
  }
}