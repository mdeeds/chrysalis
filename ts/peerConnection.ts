import Peer, { DataConnection } from "peerjs";

export class PeerConnection {
  private peer: Peer;
  private conn: DataConnection;
  private ready: boolean;

  private peers: Map<string, DataConnection>;
  private responses: Map<string, string>;
  private callbacks: Map<string, Function>;

  constructor(id: string) {
    this.peer = new Peer(id);
    this.peers = new Map<string, DataConnection>();
    this.responses = new Map<string, string>();
    this.callbacks = new Map<string, Function>();
    this.addCallback("Hi!", () => { return "Hello." });
    this.ready = false;
    this.peer.on('open', (id: string) => {
      console.log("My id is: " + id);
      this.ready = true;
    })
    this.peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        console.log(`${conn.peer} says: ${data}`);
        this.responses.set(conn.peer, data);
        if (this.callbacks.has(data)) {
          const responseMessage = this.callbacks.get(data)();
          if (responseMessage instanceof Promise) {
            responseMessage.then((message) => { this.send(conn.peer, message); });
          } else {
            this.send(conn.peer, responseMessage);
          }
        }
      });
    });
  }

  addCallback(keyPhrase: string, callback: Function) {
    this.callbacks.set(keyPhrase, callback);
  }

  async waitReady() {
    return new Promise((resolve, reject) => {
      if (this.ready) {
        resolve();
      } else {
        setTimeout(() => {
          this.waitReady()
            .then(() => { resolve(); });
        }, 100);
      }
    })
  }

  send(targetId: string, message: string) {
    const conn = this.peer.connect(targetId);
    conn.on('open', () => {
      console.log(`to ${targetId}, ${this.peer.id} says: ${message}`);
      conn.send(message);
    });
  }

  async sendAndPromiseResponse(targetId: string, message: string) {
    this.waitReady()
      .then(() => {
        this.conn = this.peer.connect(targetId);
        this.conn.on('open', () => {
          console.log(`to ${targetId}, ${this.peer.id} says: ${message}`);
          this.responses.delete(targetId);
          this.conn.send(message);
        });
      });
    return new Promise((resolve, reject) => {
      const deadline = window.performance.now() + 5000;
      console.log("Deadline: " + deadline.toFixed(0));
      this.waitForResponse(targetId, deadline, resolve, reject);
    });
  }

  waitForResponse(id: string, deadline: number,
    resolve: Function, reject: Function) {
    if (this.responses.has(id)) {
      const response = this.responses.get(id);
      this.responses.delete(id);
      console.log("I heard you, " + id);
      resolve(response);
    } else {
      if (window.performance.now() >= deadline) {
        console.log("Deadline exceeded: " +
          (window.performance.now() - deadline));
        reject("Deadline exceeded.");
      } else {
        setTimeout(() => {
          this.waitForResponse(id, deadline, resolve, reject);
        }, 1);
      }
    }
  }

}