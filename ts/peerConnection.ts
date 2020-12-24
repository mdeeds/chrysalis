import Peer, { DataConnection } from "peerjs";

export class PeerConnection {
  private peer: Peer;
  private conn: DataConnection;
  private ready: boolean;
  constructor(id: string) {
    this.peer = new Peer(id);
    this.ready = false;
    this.peer.on('open', (id: string) => {
      console.log("My id is: " + id);
      this.ready = true;
    })
    this.peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        console.log(data);
      });
    });
  }

  sayHello(targetId: string) {
    if (!this.ready) {
      setTimeout(() => { this.sayHello(targetId); }, 100);
    } else {
      this.conn = this.peer.connect(targetId);
      this.conn.on('open', () => {
        console.log("Saying hello.");
        this.conn.send("Hi!");
      });
    }
  }

}