import { Computer } from "./computer";
import { Perspective } from "./perspective";
import { Thing } from "./thing";

export class Cog {
  thing: Thing;
  computer: Computer;
  constructor(thing: Thing, computer: Computer) {
    this.thing = thing;
    this.computer = computer;
  }

  async update(perspective: Perspective) {
    const delta = await this.computer.getDelta(perspective);
    return delta;
  }
}