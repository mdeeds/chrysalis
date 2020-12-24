import { Intention } from "./intention";
import { State } from "./state";
import { World } from "./world";

export class MasterControl {
  world: World;
  startTimeMs: number;
  frameNumber: number;
  pendingEvents: Intention[];

  constructor(world: World) {
    this.world = world;
    this.frameNumber = 0;
    this.pendingEvents = [];
    document.addEventListener("keydown",
      (ev) => { this.handleKey(ev); });
    requestAnimationFrame((ts) => { this.eventLoop(ts); });
  }

  handleKey(ev: KeyboardEvent) {
    if (ev.type == "keydown") {
      console.log("Keydown: " + ev.code);
      switch (ev.code) {
        case "ArrowLeft":
          const delta = new State();
          delta.you.x = 10;
          const intention = new Intention(this.frameNumber + 15,
            delta);
          console.log("Queued: " + JSON.stringify(intention));
          this.pendingEvents.push(intention);
          break;
      }
    }
  }

  eventLoop(ts: number) {
    const futureStack: Intention[] = [];
    for (const i of this.pendingEvents) {
      if (i.effectiveTime <= this.frameNumber) {
        console.log(JSON.stringify(this.world.getState()));
        console.log("Delta: " + JSON.stringify(i.delta));
        this.world.applyDelta(i.delta);
        console.log(JSON.stringify(this.world.getState()));
      } else {
        futureStack.push(i);
      }
    }
    this.pendingEvents = futureStack;

    this.frameNumber++;
    requestAnimationFrame((ts) => { this.eventLoop(ts); });
  }
}