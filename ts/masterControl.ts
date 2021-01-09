import { BasicBot } from "./basicBot";
import { Beacon } from "./beacon";
import { Cog } from "./cog";
import { Computer } from "./computer";
import { Gopher } from "./gopher";
import { GopherHole } from "./gopherHole";
import { Ground } from "./ground";
import { Hazard } from "./hazard";
import { Intention } from "./intention";
import { Log } from "./log";
import { Ocean } from "./ocean";
import { Perspective } from "./perspective";
import { BoundingBox } from "./quadTree";
import { State } from "./state";
import { StateDelta } from "./stateDelta";
import { Tablet } from "./tablet";
import { Thing } from "./thing";
import { ThingState } from "./thingState";
import { ThingStateDelta } from "./thingStateDelta";
import { Tile } from "./tile";

export class MasterControl {
  state: State;
  cogs: Cog[];
  startTimeMs: number;
  frameNumber: number;
  pendingEvents: Intention[];
  private keysDown: Set<string>;
  private gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext, state: State, cogs: Cog[],
    keyFocusElement: HTMLElement) {
    this.gl = gl;
    this.state = state;
    this.cogs = cogs;
    this.frameNumber = 0;
    this.pendingEvents = [];
    this.keysDown = new Set<string>();
    keyFocusElement.addEventListener("keydown",
      (ev) => { this.keysDown.add(ev.code); });
    keyFocusElement.addEventListener("keyup",
      (ev) => { this.keysDown.delete(ev.code); });
    keyFocusElement.addEventListener("focusout",
      (ev) => {
        this.keysDown.clear();
        Log.info("Lost focus.");
      })
    requestAnimationFrame((ts) => { this.eventLoop(ts); });
  }

  private setGround(
    selector: (thing: Thing) => boolean,
    factory: (state: ThingState) => Ground, things: Thing[]) {
    for (const thing of things) {
      if (thing instanceof Ground && !selector(thing)) {
        this.state.everything.remove(thing);
        const newGround = factory(thing.state);
        this.state.everything.insert(
          newGround.state.xyz[0], newGround.state.xyz[2], newGround);
        break;
      }
    }
  }

  private setItem(selector: (thing: Thing) => boolean,
    factory: () => Thing, things: Thing[]) {
    for (const thing of things) {
      if (selector(thing)) {
        return;
      }
    }
    const newThing = factory();
    this.state.everything.insert(
      newThing.state.xyz[0], newThing.state.xyz[2], newThing);
  }

  handleAdminAction(actor: Thing, action: string) {
    let targetX: number;
    let targetZ: number;
    [targetX, targetZ] = actor.state.inFrontXZ();
    const things: Thing[] = [];
    this.state.everything.appendFromRange(
      new BoundingBox(targetX, targetZ, 0.99), things);
    if (things.length == 0) {
      Log.info('Missed.');
      return;
    } else {
      if (action === "setTile") {
        this.setGround(
          (thing: Thing) => { return thing instanceof Tile; },
          (state: ThingState) => { return new Tile(this.gl, state); },
          things);
      }
      if (action === "setOcean") {
        this.setGround(
          (thing: Thing) => { return thing instanceof Ocean; },
          (state: ThingState) => { return new Ocean(this.gl, state); },
          things);
      }
      if (action === "setHazard") {
        this.setGround(
          (thing: Thing) => { return thing instanceof Hazard; },
          (state: ThingState) => { return new Hazard(this.gl, state); },
          things);
      }
      if (action === "setBeacon") {
        this.setItem((thing: Thing) => { return thing instanceof Beacon; },
          () => {
            const state: ThingState = new ThingState([targetX, 0, targetZ]);
            return new Beacon(this.gl, state);
          }, things);
      }
      if (action === "setApi") {
        this.setItem((thing: Thing) => { return thing instanceof Tablet; },
          () => {
            const state: ThingState = new ThingState([targetX, 0, targetZ]);
            return new Tablet(this.gl, "api", state);
          }, things);
      }
      if (action === "setNote") {
        this.setItem((thing: Thing) => { return thing instanceof Tablet; },
          () => {
            const state: ThingState = new ThingState([targetX, 0, targetZ]);
            return new Tablet(this.gl, "note", state);
          }, things);
      }
      if (action === "setLib") {
        this.setItem((thing: Thing) => { return thing instanceof Tablet; },
          () => {
            const state: ThingState = new ThingState([targetX, 0, targetZ]);
            return new Tablet(this.gl, "lib", state);
          }, things);
      }
      if (action === "setGopher") {
        this.setItem((thing: Thing) => { return thing instanceof Gopher; },
          () => {
            const state: ThingState = new ThingState([targetX, 0, targetZ]);
            return new Gopher(this.gl, state);
          }, things);
        this.setItem((thing: Thing) => { return thing instanceof GopherHole; },
          () => {
            const state: ThingState = new ThingState([targetX, 0, targetZ]);
            return new GopherHole(this.gl, state);
          }, things);
      }

      if (action === "setRobot") {
        let hasRobot: boolean = false;
        for (const thing of things) {
          if (thing instanceof BasicBot) {
            hasRobot = true;
            break;
          }
        }
        if (!hasRobot) {
          const state: ThingState = new ThingState([targetX, 0, targetZ]);
          const robot = new BasicBot(this.gl, state);
          this.state.everything.insert(robot.state.xyz[0], robot.state.xyz[2], robot);
          const computer = new Computer("delta = {turn: 1.0, drive: 0.05}",
            "", this.state.library);
          const cog = new Cog(robot, computer);
          this.cogs.push(cog);
        }
      }
      if (action === "clear") {
        for (const thing of things) {
          if (!(thing instanceof Ground)) {
            this.state.everything.remove(thing);
          }
        }
      }
    }
  }

  eventLoop(ts: number) {
    const targetFrame = this.frameNumber + 5;
    for (const cog of this.cogs) {
      const cogPerspective = new Perspective();
      cogPerspective.keysDown = this.keysDown;
      cogPerspective.currentHeading = cog.thing.state.heading;
      cog.computer.getDelta(cogPerspective)
        .then((delta: ThingStateDelta) => {
          const intention = new Intention(targetFrame, delta, cog);
          this.pendingEvents.push(intention);
        });
    }

    const futureStack: Intention[] = [];
    const deltaStorage = new Map<Thing, Float32Array>();
    for (const i of this.pendingEvents) {
      if (i.effectiveTime <= this.frameNumber) {
        if (i.delta.state != null && i.delta.state.adminAction != null) {
          this.handleAdminAction(i.cog.thing, i.delta.state.adminAction);
          i.delta.state.adminAction = null;
        }
        this.state.applyThing(i.cog.thing.state, i.delta);
        if (!deltaStorage.has(i.cog.thing)) {
          // Register the fact that it has moved.
          deltaStorage.set(i.cog.thing, new Float32Array(3));
        }
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
        if (other instanceof Tile ||
          (t instanceof BasicBot && !(other instanceof Ocean))) {
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
          const distanceToMove = p * (Math.sqrt(hit2) - r);
          const ndx = dx / r;
          const ndz = dz / r;
          const mx = ndx * distanceToMove;
          const mz = ndz * distanceToMove;
          if (mx !== 0 || mz !== 0) {
            if (!deltaStorage.has(t)) {
              deltaStorage.set(t, new Float32Array(3));
            }
            const arr = deltaStorage.get(t);
            arr[0] = arr[0] + mx;
            arr[2] = arr[2] + mz;
          }
        }
      }
    }
    for (const thing of deltaStorage.keys()) {
      const state = thing.state;
      const arr = deltaStorage.get(thing);
      state.xyz[0] += arr[0];
      state.xyz[2] += arr[2];
      this.state.everything.move(state.xyz[0], state.xyz[2], thing);
    }

    this.frameNumber++;
    requestAnimationFrame((ts) => { this.eventLoop(ts); });
  }
}