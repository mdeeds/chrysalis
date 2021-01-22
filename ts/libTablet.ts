import { Library } from "./library";
import { Log } from "./log";
import { Tablet } from "./tablet";
import { ThingState } from "./thingState";

export class LibTablet extends Tablet {
  library: Library;
  constructor(gl: WebGLRenderingContext,
    library: Library, state: ThingState) {
    if (state.data) {
      state.data.type = "lib";
    } else {
      state.data = { type: "lib" };
    }
    super(gl, state);
    this.library = library;
    this.upload(state.code, state.libraryList);
  }

  upload(code: string, libraryList: string) {
    Log.info(`Updating library: ${libraryList}`);
    super.upload(code, libraryList);
    this.library.setCode(libraryList, code);
  }
}
