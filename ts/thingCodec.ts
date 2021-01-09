import { Gopher } from "./gopher";
import { GopherHole } from "./gopherHole";
import { Log } from "./log";
import { Thing } from "./thing";
import { ThingState } from "./thingState";

export class ThingCodec {
  static encode(thing: Thing) {
    const result: any = {};
    result.typeName = thing.constructor.name;
    result.state = thing.state;
    return result;
  }

  static decode(gl: WebGLRenderingContext, dict: any): Thing{
    switch (dict.typeName) {
      case "Gopher":
        return new Gopher(gl, dict.state as ThingState);
      case "GohperHole":
        return new GopherHole(gl, dict.state as ThingState);
    }
    Log.error(`Cannot decode type: ${dict.typeName}`);
    return null;
  }

}