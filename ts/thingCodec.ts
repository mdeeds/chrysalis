import { BasicBot } from "./basicBot";
import { Beacon } from "./beacon";
import { Gem } from "./gem";
import { Gopher } from "./gopher";
import { GopherHole } from "./gopherHole";
import { Library } from "./library";
import { LibTablet } from "./libTablet";
import { Log } from "./log";
import { Player } from "./player";
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
    } else if (thing instanceof Gem) {
      result.typeName = "Gem";
    } else if (thing instanceof Tablet) {
      result.typeName = "Tablet";
    } else if (thing instanceof BasicBot) {
      result.typeName = "BasicBot";
    } else if (thing instanceof Beacon) {
      result.typeName = "Beacon";
    } else if (thing instanceof Player) {
      result.typeName = "Player";
    } else {
      Log.error(`Missing encoding ${thing.constructor.name}`);
      return null;
    }
    result.state = thing.state;
    return result;
  }

  static decode(gl: WebGLRenderingContext, dict: any, library: Library): Thing {
    const thingState = new ThingState([0, 0, 0]);
    if (dict.state) {
      thingState.mergeFrom(dict.state as ThingState);
    }
    switch (dict.typeName) {
      case "Gem":
        return new Gem(gl, thingState);
      case "Gopher":
        return new Gopher(gl, thingState);
      case "GopherHole":
        return new GopherHole(gl, thingState);
      case "BasicBot":
        const bot = new BasicBot(gl, thingState);
        if (thingState.imageSource) {
          bot.setTextureImage(thingState.imageSource);
        }
        return bot;
      case "Beacon":
        return new Beacon(gl, thingState);
      case "Tablet":
        if (thingState.libraryList && thingState.data.type === "lib") {
          Log.info(`Tablet: ${thingState.libraryList}`)
          return new LibTablet(gl, library, thingState);
        } else {
          return new Tablet(gl, thingState);
        }
      case "Player":
        return new Player(gl, thingState);
    }
    Log.error(`Cannot decode type: ${dict.typeName}`);
    return null;
  }

}