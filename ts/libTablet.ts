import { Library } from "./library";
import { Tablet } from "./tablet";
import { Thing } from "./thing";
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
    super.upload(code, libraryList);
    this.library.setCode(libraryList, code);
  }
}
