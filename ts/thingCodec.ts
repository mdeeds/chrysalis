import { BasicBot } from "./basicBot";
import { Beacon } from "./beacon";
import { Gopher } from "./gopher";
import { GopherHole } from "./gopherHole";
import { Log } from "./log";
import { Tablet } from "./tablet";
import { Thing } from "./thing";
import { ThingState } from "./thingState";

export class ThingCodec {
  static encode(thing: Thing) {
    const result: any = {};
    if (thing instanceof Gopher) {
      result.typeName = "Gopher";
    } else if (thing instanceof GopherHole) {
      result.typeName = "GopherHole";
    } else if (thing instanceof Tablet) {
      result.typeName = "Tablet";
    } else if (thing instanceof BasicBot) {
      result.typeName = "BasicBot";
    } else if (thing instanceof Beacon) {
      result.typeName = "Beacon";
    } else {
      Log.error(`Missing encoding ${thing.constructor.name}`);
      return null;
    }
    result.state = thing.state;
    return result;
  }

  static decode(gl: WebGLRenderingContext, dict: any): Thing {
    switch (dict.typeName) {
      case "Gopher":
        return new Gopher(gl, dict.state as ThingState);
      case "GopherHole":
        return new GopherHole(gl, dict.state as ThingState);
      case "BasicBot":
        return new BasicBot(gl, dict.state as ThingState);
      case "Beacon":
        return new Beacon(gl, dict.state as ThingState);
      case "Tablet":
        return new Tablet(gl, dict.state as ThingState);
    }
    Log.error(`Cannot decode type: ${dict.typeName}`);
    return null;
  }

}