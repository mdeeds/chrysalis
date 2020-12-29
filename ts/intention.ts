import { StateDelta } from "./stateDelta";

export class Intention {
  effectiveTime: number;
  delta: StateDelta;
  constructor(effectiveTime: number, delta: StateDelta) {
    this.effectiveTime = effectiveTime;
    this.delta = delta;
  }
}