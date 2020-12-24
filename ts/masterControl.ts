import { Intention } from "./intention";
import { Shape } from "./shape";
import { State } from "./state";
import { World } from "./world";

export class MasterControl {
  world: World;
  startTimeMs: number;
  frameNumber: number;
  pendingEvents: Intention[];
  private keysDown: Set<string>;

  constructor(world: World) {
    this.world = world;
    this.frameNumber = 0;
    this.pendingEvents = [];
    this.keysDown = new Set<string>();
    document.addEventListener("keydown",
      (ev) => { this.handleKey(ev); });
    document.addEventListener("keyup",
      (ev) => { this.handleKey(ev); });
    requestAnimationFrame((ts) => { this.eventLoop(ts); });
  }

  handleKey(ev: KeyboardEvent) {
    if (ev.type == "keydown") {
      this.keysDown.add(ev.code);
    } else if (ev.type == "keyup") {
      this.keysDown.delete(ev.code);
    }
  }

  eventLoop(ts: number) {
    if (this.keysDown.has("ArrowLeft")) {
      const delta = new State();
      delta.you.dxyz = [-0.1, 0.0, 0.0];
      const intention = new Intention(this.frameNumber + 15,
        delta);
      this.pendingEvents.push(intention);
    } else if (this.keysDown.has("ArrowRight")) {
      const delta = new State();
      delta.you.dxyz = [0.1, 0.0, 0.0];
      const intention = new Intention(this.frameNumber + 15,
        delta);
      this.pendingEvents.push(intention);
    }

    const futureStack: Intention[] = [];
    for (const i of this.pendingEvents) {
      if (i.effectiveTime <= this.frameNumber) {
        this.world.applyDelta(i.delta);
      } else {
        futureStack.push(i);
      }
    }
    this.pendingEvents = futureStack;

    this.frameNumber++;
    requestAnimationFrame((ts) => { this.eventLoop(ts); });
  }
}