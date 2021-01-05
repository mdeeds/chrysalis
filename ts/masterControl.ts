import { BasicBot } from "./basicBot";
import { Beacon } from "./beacon";
import { Cog } from "./cog";
import { Computer } from "./computer";
import { Intention } from "./intention";
import { Log } from "./log";
import { Ocean } from "./ocean";
import { Perspective } from "./perspective";
import { BoundingBox } from "./quadTree";
import { State } from "./state";
import { StateDelta } from "./stateDelta";
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

  constructor(gl: WebGLRenderingContext, state: State, cogs: Cog[]) {
    this.gl = gl;
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
        for (const thing of things) {
          if (thing instanceof Ocean) {
            this.state.everything.remove(thing);
            const tile: Tile = new Tile(this.gl, thing.state);
            this.state.everything.insert(tile.state.xyz[0], tile.state.xyz[2], tile);
            break;
          }
        }
      }
      if (action === "setBeacon") {
        let hasBeacon: boolean = false;
        for (const thing of things) {
          if (thing instanceof Beacon) {
            hasBeacon = true;
            break;
          }
        }
        if (!hasBeacon) {
          const state: ThingState = new ThingState([targetX, 0, targetZ]);
          const beacon: Beacon = new Beacon(this.gl, state);
          this.state.everything.insert(beacon.state.xyz[0], beacon.state.xyz[2], beacon);
        }
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
    for (const i of this.pendingEvents) {
      if (i.effectiveTime <= this.frameNumber) {
        if (i.delta.state != null && i.delta.state.adminAction != null) {
          this.handleAdminAction(i.cog.thing, i.delta.state.adminAction);
          i.delta.state.adminAction = null;
        }
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

      const deltaStorage = new Map<ThingState, Float32Array>();
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
          const distanceToMove = p * (Math.sqrt(hit2) - r);
          const ndx = dx / r;
          const ndz = dz / r;
          const mx = ndx * distanceToMove;
          const mz = ndz * distanceToMove;
          if (!deltaStorage.has(t.state)) {
            deltaStorage.set(t.state, new Float32Array(3));
          }
          const arr = deltaStorage.get(t.state);
          arr[0] = arr[0] + mx;
          arr[2] = arr[2] + mz;
        }
      }
      for (const state of deltaStorage.keys()) {
        const arr = deltaStorage.get(state);
        state.xyz[0] += arr[0];
        state.xyz[2] += arr[2];
      }
    }

    this.frameNumber++;
    requestAnimationFrame((ts) => { this.eventLoop(ts); });
  }
}