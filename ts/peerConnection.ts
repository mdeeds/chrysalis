import Peer, { DataConnection } from "peerjs";
import { Log } from "./log";

export class PeerConnection {
  private peer: Peer;
  private ready: boolean;

  private peers: Map<string, DataConnection>;
  private responses: Map<string, string>;
  private callbacks: Map<string, Function>;
  private readyCallbacks: Function[];

  constructor(id: string) {
    this.peer = new Peer(id);
    this.peers = new Map<string, DataConnection>();
    this.responses = new Map<string, string>();
    this.callbacks = new Map<string, Function>();
    this.ready = false;
    this.readyCallbacks = [];
    this.peer.on('open', (id: string) => {
      Log.info(`${this.peer.id}: I am on.`);
      this.ready = true;
      for (const readyCallback of this.readyCallbacks) {
        readyCallback(this);
      }
    })
    this.peer.on('connection', (conn) => {
      conn.on('data', (data: string) => {
        this.responses.set(conn.peer, data);
        if (this.callbacks.has(data)) {
          const responseMessage = this.callbacks.get(data)();
          if (responseMessage instanceof Promise) {
            responseMessage.then((message) => { this.send(conn.peer, message); });
          } else {
            this.send(conn.peer, responseMessage);
          }
        } else {
          for (const prefix of this.callbacks.keys()) {
            if (data.startsWith(prefix)) {
              const value = data.substr(prefix.length);
              this.callbacks.get(prefix)(value);
            }
          }
        }
      });
    });
  }

  async waitReady(): Promise<PeerConnection> {
    return new Promise((resolve, reject) => {
      if (this.ready) {
        resolve(this);
      } else {
        Log.info(`${this.peer.id}: Not ready.`);
        this.readyCallbacks.push(resolve);
      }
    });
  }

  id() {
    return this.peer.id;
  }

  addCallback(keyPhrase: string, callback: Function) {
    Log.info(`${this.peer.id}: Listening for ${keyPhrase}`);
    this.callbacks.set(keyPhrase, callback);
  }

  send(targetId: string, message: string, clearResponse: boolean = false) {
    let messageSent = false;
    if (this.peers.has(targetId)) {
      const conn = this.peers.get(targetId);
      if (conn.open) {
        if (clearResponse) {
          this.responses.delete(targetId);
        }
        conn.send(message);
        messageSent = true;
      } else {
        Log.info(`Connection is not open to: ${targetId}`)
      }
    }
    if (!messageSent) {
      const conn = this.peer.connect(targetId);
      this.peers.set(targetId, conn);
      conn.on('open', () => {
        Log.info(`New connection open to: ${targetId}`);
        if (clearResponse) {
          this.responses.delete(targetId);
        }
        conn.send(message);
      });
    }
  }

  async sendAndPromiseResponse(targetId: string, message: string) {
    this.waitReady()
      .then(() => {
        this.send(targetId, message, /*clearResponse=*/true);
      });
    return new Promise((resolve, reject) => {
      const deadline = window.performance.now() + 5000;
      this.waitForResponse(targetId, deadline, resolve, reject);
    });
  }

  waitForResponse(id: string, deadline: number,
    resolve: Function, reject: Function) {
    if (this.responses.has(id)) {
      const response = this.responses.get(id);
      this.responses.delete(id);
      Log.info(`${this.peer.id}: I heard you, ${id}`);
      resolve(response);
    } else {
      if (window.performance.now() >= deadline) {
        Log.info(`${this.peer.id}: `
          + `Deadline exceeded: ${(window.performance.now() - deadline)}`);
        reject("Deadline exceeded.");
      } else {
        setTimeout(() => {
          this.waitForResponse(id, deadline, resolve, reject);
        }, 10);
      }
    }
  }

}