import { PeerConnection } from "./peerConnection";
import { Render } from "./render";

console.log("Program sequence initiated.");

const r = new Render();
r.main();

console.log("Systems are active.");

const p1 = new PeerConnection("chrysalis-1");
const p2 = new PeerConnection("chrysalis-2");

p1.sayHello("chrysalis-2");
p2.sayHello("chrysalis-1");
