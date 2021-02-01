import { BasicBot } from "./basicBot";
import { Beacon } from "./beacon";
import { Bubble } from "./bubble";
import { Cog } from "./cog";
import { Computer } from "./computer";
import { Flower } from "./flower";
import { Gem } from "./gem";
import { Gopher } from "./gopher";
import { GopherHole } from "./gopherHole";
import { Ground } from "./ground";
import { Hazard } from "./hazard";
import { Intention } from "./intention";
import { Log } from "./log";
import { Ocean } from "./ocean";
import { Perspective } from "./perspective";
import { Player } from "./player";
import { BoundingBox } from "./quadTreeView";
import { Shape } from "./shape";
import { State } from "./state";
import { Tablet } from "./tablet";
import { Terminal } from "./terminal";
import { Thing } from "./thing";
import { ThingState } from "./thingState";
import { ThingStateDelta } from "./thingStateDelta";
import { Tile } from "./tile";

export class MasterControl {
  state: State;
  private cogs: Map<number, Cog>;
  startTimeMs: number;
  frameNumber: number;
  pendingEvents: Intention[];
  private keysDown: Set<string>;
  private gl: WebGLRenderingContext;
  private username: string;
  private keyFocusElement: HTMLElement;
  private terminal: Terminal;

  constructor(gl: WebGLRenderingContext, state: State,
    keyFocusElement: HTMLElement, username: string) {
    this.gl = gl;
    this.state = state;
    this.keyFocusElement = keyFocusElement;
    this.username = username;

    this.cogs = new Map<number, Cog>();
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
      })

    this.terminal = new Terminal(keyFocusElement);

    for (const thing of this.state.getEverything().allEntries()) {
      if (thing.state.code && thing instanceof Shape
        && !(thing instanceof Tablet)) {
        const computer = new Computer(
          thing.state.code, thing.state.libraryList, this.state.library);
        const cog = new Cog(thing, computer);
        if (!(thing.state.id > 0) || this.cogs.has(thing.state.id)) {
          Log.error(`Invalid thing: ${thing.state.id}`);
        } else {
          this.cogs.set(thing.state.id, cog);
        }
      }
    }

    if (!this.state.players.has(this.username)) {
      Log.error(`${this.username} is not here.`);
    } else {
      Log.info(`Materializing ${this.username}.`);
      const playerState = this.state.players.get(this.username);
      const playerId = playerState.id;
      let newPlayer = null;
      if (this.state.thingIndex.has(playerId)) {
        newPlayer = this.state.thingIndex.get(playerId);
      } else {
        newPlayer = new Player(this.gl, playerState);
        this.state.thingIndex.set(playerId, newPlayer);
      }
      Log.info("Building computer for player.");
      const playerComputer =
        new Computer(playerState.code,
          playerState.libraryList, this.state.library);
      const youCog = new Cog(newPlayer, playerComputer);
      this.state.insert(newPlayer.state.xyz[0], newPlayer.state.xyz[2],
        newPlayer);

      if (this.cogs.has(newPlayer.state.id)) {
        Log.error(`Duplicate: ${newPlayer.state.id}`);
      }
      this.cogs.set(newPlayer.state.id, youCog);
      this.terminal.setCog(youCog);
      this.keyFocusElement.focus();
    }

    requestAnimationFrame((ts) => { this.eventLoop(ts); });
  }

  private setGround(
    selector: (thing: Thing) => boolean,
    factory: (state: ThingState) => Ground, things: Thing[]) {
    for (const thing of things) {
      if (thing instanceof Ground && !selector(thing)) {
        this.state.remove(thing);
        const newGround = factory(thing.state);
        this.state.insert(
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
    this.state.insert(
      newThing.state.xyz[0], newThing.state.xyz[2], newThing);
  }

  private static removeThing(list: Thing[], toRemove: Thing) {
    const index = list.indexOf(toRemove);
    if (index < 0) {
      return;
    }
    list[index] = list[list.length - 1];
    list.pop();
  }

  handleAdminAction(actor: Thing, action: string) {
    let targetX: number;
    let targetZ: number;
    [targetX, targetZ] = actor.state.inFrontXZ(2.0);
    const things: Thing[] = [];
    this.state.getEverything().appendFromRange(
      new BoundingBox(targetX, targetZ, 1.0), things);
    MasterControl.removeThing(things, actor);
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
      if (action === "setFlower") {
        this.setItem((thing: Thing) => { return thing instanceof Flower; },
          () => {
            const state: ThingState = new ThingState([targetX, 0, targetZ]);
            state.data = { position: 1.0 };
            return new Flower(this.gl, state);
          }, things);
      }
      if (action === "setApi") {
        this.setItem((thing: Thing) => { return thing instanceof Tablet; },
          () => {
            const state: ThingState = new ThingState([targetX, 0, targetZ]);
            state.data = { type: "api" };
            return new Tablet(this.gl, state);
          }, things);
      }
      if (action === "setNote") {
        this.setItem((thing: Thing) => { return thing instanceof Tablet; },
          () => {
            const state: ThingState = new ThingState([targetX, 0, targetZ]);
            state.data = { type: "note" };
            return new Tablet(this.gl, state);
          }, things);
      }
      if (action === "setLib") {
        this.setItem((thing: Thing) => { return thing instanceof Tablet; },
          () => {
            const state: ThingState = new ThingState([targetX, 0, targetZ]);
            state.data = { type: "lib" };
            return new Tablet(this.gl, state);
          }, things);
      }
      if (action === "setGem") {
        this.setItem((thing: Thing) => { return thing instanceof Gem; },
          () => {
            const state: ThingState = new ThingState([targetX, 0, targetZ]);
            state.data = { position: 1.0 };
            return new Gem(this.gl, state);
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
        this.setItem((thing: Thing) => { return thing instanceof Bubble; },
          () => {
            const state: ThingState = new ThingState([targetX, 0, targetZ]);
            return new Bubble(this.gl, "Hi!  I'm Gigi.", state);
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
          if (this.cogs.has(state.id)) {
            Log.error(`Duplicate!? ${state.id}`);
          }
          const robot = new BasicBot(this.gl, state);
          this.state.insert(robot.state.xyz[0], robot.state.xyz[2], robot);
          robot.state.code = "delta = {turn: 1.0, drive: 0.05}";
          robot.state.libraryList = "";
          const computer = new Computer(
            robot.state.code, robot.state.libraryList, this.state.library);
          const cog = new Cog(robot, computer);
          this.cogs.set(robot.state.id, cog);
        }
      }
      if (action === "clear") {
        for (const thing of things) {
          if (!(thing instanceof Ground)) {
            this.state.remove(thing);
          }
        }
      }
    }
  }

  updateMiddleObject(oldThing: Thing, newThing: Thing, x: number, z: number) {
    if (oldThing === null) {
      return newThing;
    }
    const oldDx = oldThing.state.xyz[0] - x;
    const oldDz = oldThing.state.xyz[2] - z;
    const oldR2 = oldDx * oldDx + oldDz * oldDz;
    const newDx = newThing.state.xyz[0] - x;
    const newDz = newThing.state.xyz[2] - z;
    const newR2 = newDx * newDx + newDz * newDz;
    if (newR2 < oldR2) {
      return newThing;
    } else {
      return oldThing;
    }
  }

  actOnThing(actor: Thing, other: Thing) {
    if (actor instanceof Shape && other instanceof Shape) {
      if (actor.lift(other)) {
        if (this.cogs.has(other.state.id)) {
          const otherCog: Cog = this.cogs.get(other.state.id);
          this.terminal.setCog(otherCog);
        } else {
          this.terminal.setThing(other);
        }
      }
    }
  }

  raiseRobot(actor: Thing, tile: Tile) {
  }

  handleAction(actor: Thing) {
    if (actor instanceof Shape && actor.isLifting()) {
      const droppedThing = actor.liftedThing();
      if (actor.drop() && this.cogs.has(actor.state.id)) {
        this.terminal.setCog(
          this.cogs.get(actor.state.id), /*takeFocus=*/false);
        this.state.move(droppedThing.state.xyz[0],
          droppedThing.state.xyz[2], droppedThing);
      }
      return;
    }
    let targetX: number;
    let targetZ: number;
    [targetX, targetZ] = actor.state.inFrontXZ(2.0);
    const things: Thing[] = [];
    this.state.getEverything().appendFromRange(
      new BoundingBox(targetX, targetZ, 2.0), things);
    MasterControl.removeThing(things, actor);
    let frontTile: Tile = null;
    let middleObject: Thing = null;
    for (const t of things) {
      if (t instanceof Tile) {
        frontTile = t;
      }
      if (!(t instanceof Ground)) {
        middleObject = this.updateMiddleObject(middleObject, t,
          actor.state.xyz[0], actor.state.xyz[2]);
      }
    }
    if (middleObject != null) {
      this.actOnThing(actor, middleObject);
      return;
    }
    if (frontTile != null && actor instanceof Player) {
      this.raiseRobot(actor, frontTile);
    }
  }

  private distance2(a: Float32Array, b: Float32Array) {
    const dx = a[0] - b[0];
    const dz = a[2] - b[2];
    return dx * dx + dz * dz;
  }

  private distance(a: Float32Array, b: Float32Array) {
    return Math.sqrt(this.distance2(a, b));
  }

  private closerOfTwo(
    reference: Float32Array, a: Float32Array, b: Float32Array): Float32Array {
    if (a === null) {
      return b;
    } else if (b === null) {
      return a;
    }
    const d2a = this.distance2(reference, a);
    const d2b = this.distance2(reference, b);
    return (d2a < d2b) ? a : b;
  }

  getCogPerspective(cog: Cog): Perspective {
    const cogPerspective = new Perspective();
    cogPerspective.keysDown = this.keysDown;
    cogPerspective.currentHeading = cog.thing.state.heading;
    if (cog.thing instanceof Shape) {
      cogPerspective.isLifted = cog.thing.isLifted();
      cogPerspective.isLifting = cog.thing.isLifting();
    }
    if (cog.thing.state.data) {
      cogPerspective.data = cog.thing.state.data;
    }
    const things: Thing[] = [];

    const cogLocation = cog.thing.state.xyz;
    if (cogLocation) {
      this.state.getEverything().appendFromRange(
        new BoundingBox(cogLocation[0],
          cogLocation[2], 10.0), things);
      let closestPlayer: Float32Array = null;
      let closestBeacon: Float32Array = null;
      for (const t of things) {
        if (t instanceof Player) {
          closestPlayer = this.closerOfTwo(
            cogLocation, closestPlayer, t.state.xyz);
        } else if (t instanceof Beacon) {
          if (t.getIsOn()) {
            closestBeacon = this.closerOfTwo(
              cogLocation, closestBeacon, t.state.xyz);
          }
        }
      }
      if (closestBeacon) {
        cogPerspective.closestBeacon = [
          closestBeacon[0] - cogLocation[0],
          closestBeacon[2] - cogLocation[2]];
      }
      if (closestPlayer) {
        cogPerspective.closestPlayer = [
          closestPlayer[0] - cogLocation[0],
          closestPlayer[2] - cogLocation[2]];
      }
    }
    return cogPerspective;
  }

  collideThing(t: Thing, deltaStorage: Map<Thing, Float32Array>) {
    if (t.lightness === 0) {
      return;
    }
    if (t instanceof Shape && t.isLifted()) {
      t.trackWithLifter();
      return;
    }
    if (!t.state.data) {
      t.state.data = {};
    }
    t.state.data.bumped = false;
    const otherThings: Thing[] = [];
    this.state.getEverything().appendFromRange(
      new BoundingBox(t.state.xyz[0], t.state.xyz[2], 2.1), otherThings);
    MasterControl.removeThing(otherThings, t);
    for (const other of otherThings) {
      if (other instanceof Tile) {
        continue;
      }
      if (t instanceof BasicBot && other instanceof Hazard) {
        continue;
      }
      if (other instanceof Shape && other.isLifted()) {
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
        t.state.data.bumped = true;
        if (other instanceof Beacon) {
          other.toggle();
        }
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

  eventLoop(ts: number) {
    const targetFrame = this.frameNumber + 5;
    for (const cog of this.cogs.values()) {
      const cogPerspective = this.getCogPerspective(cog);
      cog.computer.getDelta(cogPerspective)
        .then((delta: ThingStateDelta) => {
          if (delta.state && delta.state.log) {
            Log.info(delta.state.log);
            delta.state.log = null;
          }
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
        if (i.delta.state != null && i.delta.state.action != null) {
          this.handleAction(i.cog.thing);
        }
        this.state.applyThing(i.cog.thing, i.delta);
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
    this.state.getEverything().appendFromRange(
      this.state.getEverything().getBoundary(), allThings);

    for (const t of allThings) {
      this.collideThing(t, deltaStorage);
    }

    for (const thing of deltaStorage.keys()) {
      const state = thing.state;
      const arr = deltaStorage.get(thing);
      if (arr[0] != 0 && arr[2] != 0) {
        state.xyz[0] += arr[0];
        state.xyz[2] += arr[2];
        this.state.move(state.xyz[0], state.xyz[2], thing);
      }
    }

    this.frameNumber++;
    requestAnimationFrame((ts) => { this.eventLoop(ts); });
  }
}