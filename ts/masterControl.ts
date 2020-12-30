import { Cog } from "./cog";
import { Intention } from "./intention";
import { Perspective } from "./perspective";
import { State } from "./state";
import { StateDelta } from "./stateDelta";
import { ThingStateDelta } from "./thingStateDelta";

export class MasterControl {
  state: State;
  cogs: Cog[];
  startTimeMs: number;
  frameNumber: number;
  pendingEvents: Intention[];
  private keysDown: Set<string>;

  constructor(state: State, cogs: Cog[]) {
    this.state = state;
    this.cogs = cogs;
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

  private intentionFromDelta(dxyz: number[]) {
    const delta = new StateDelta();
    // TODO: Performance, copy element by element?
    delta.you = new ThingStateDelta();
    delta.you.dxyz = new Float32Array(dxyz);
    const intention = new Intention(this.frameNumber + 15,
      delta);
    return intention;
  }

  eventLoop(ts: number) {
    if (this.keysDown.has("ArrowLeft")) {
      this.pendingEvents.push(this.intentionFromDelta([-0.25, 0, 0]));
    }
    if (this.keysDown.has("ArrowRight")) {
      this.pendingEvents.push(this.intentionFromDelta([0.25, 0, 0]));
    }
    if (this.keysDown.has("ArrowDown")) {
      this.pendingEvents.push(this.intentionFromDelta([0, 0, 0.25]));
    }
    if (this.keysDown.has("ArrowUp")) {
      this.pendingEvents.push(this.intentionFromDelta([0, 0, -0.25]));
    }

    const youPerspective = new Perspective();
    youPerspective.keysDown = this.keysDown;
    youPerspective.currentHeading = 1;

    for (const cog of this.cogs) {
      cog.computer.getDelta(youPerspective)
        .then((delta: ThingStateDelta) => {
          this.state.applyThing(this.state.you, delta);
        });
    }

    // TODO: Send this to the youComputer.

    const futureStack: Intention[] = [];
    for (const i of this.pendingEvents) {
      if (i.effectiveTime <= this.frameNumber) {
        this.state.apply(i.delta);
      } else {
        futureStack.push(i);
      }
    }
    this.pendingEvents = futureStack;

    this.frameNumber++;
    requestAnimationFrame((ts) => { this.eventLoop(ts); });
  }
}