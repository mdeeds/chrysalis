import { State } from "./state";

export class Intention {
  effectiveTime: number;
  delta: State;
  constructor(effectiveTime: number, delta: State) {
    this.effectiveTime = effectiveTime;
    this.delta = delta;
  }
}