import { Cog } from "./cog";
import { ThingStateDelta } from "./thingStateDelta";

export class Intention {
  effectiveTime: number;
  delta: ThingStateDelta;
  cog: Cog;
  constructor(effectiveTime: number, delta: ThingStateDelta, cog: Cog) {
    this.effectiveTime = effectiveTime;
    this.delta = delta;
    this.cog = cog;
  }
}