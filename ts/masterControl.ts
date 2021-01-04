import { Cog } from "./cog";
import { Intention } from "./intention";
import { Log } from "./log";
import { Perspective } from "./perspective";
import { BoundingBox } from "./quadTree";
import { State } from "./state";
import { StateDelta } from "./stateDelta";
import { Thing } from "./thing";
import { ThingStateDelta } from "./thingStateDelta";
import { Tile } from "./tile";

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
    if (ev.type === "keydown") {
      this.keysDown.add(ev.code);
    } else if (ev.type === "keyup") {
      this.keysDown.delete(ev.code);
    }
  }

  eventLoop(ts: number) {
    const targetFrame = this.frameNumber + 15;
    for (const cog of this.cogs) {
      const cogPerspective = new Perspective();
      cogPerspective.keysDown = this.keysDown;
      cogPerspective.currentHeading = cog.thing.state.heading;
      cog.computer.getDelta(cogPerspective)
        .then((delta: ThingStateDelta) => {
          const intention = new Intention(targetFrame, delta, cog);
          this.state.applyThing(cog.thing.state, delta);
        });
    }

    const futureStack: Intention[] = [];
    for (const i of this.pendingEvents) {
      if (i.effectiveTime <= this.frameNumber) {
        this.state.applyThing(i.cog.thing.state, i.delta);
      } else {
        futureStack.push(i);
      }
    }
    this.pendingEvents = futureStack;

    const allThings: Thing[] = [];
    this.state.everything.appendFromRange(
      this.state.everything.getBoundary(), allThings);

    for (const t of allThings) {
      if (t.lightness === 0) {
        continue;
      }
      const otherThings: Thing[] = [];
      this.state.everything.appendFromRange(
        new BoundingBox(t.state.xyz[0], t.state.xyz[2], 2.1), otherThings);
      for (const other of otherThings) {
        if (other instanceof Tile) {
          continue;
        }
        const dx = t.state.xyz[0] - other.state.xyz[0];
        const dz = t.state.xyz[2] - other.state.xyz[2];
        if (dx === 0 && dz === 0) {
          // Probably the same thing, but even if they aren't
          // which way would we move?
          continue;
        }
        const r2 = dx * dx + dz * dz;
        const hit2 = (t.radius + other.radius) * (t.radius + other.radius);
        if (r2 < hit2) {
          const p = t.lightness / (t.lightness + other.lightness);
          const r = Math.sqrt(r2);
          const distanceToMove = p * Math.sqrt(hit2) - r;
          const ndx = dx / r;
          const ndz = dz / r;
          const mx = ndx * distanceToMove;
          const mz = ndz * distanceToMove;
          t.state.xyz[0] = t.state.xyz[0] + mx;
          t.state.xyz[2] = t.state.xyz[2] + mz;
        }
      }
    }

    this.frameNumber++;
    requestAnimationFrame((ts) => { this.eventLoop(ts); });
  }
}