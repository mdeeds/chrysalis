import { BasicBot } from "./basicBot";
import { Bubble } from "./bubble";
import { Gem } from "./gem";
import { Ocean } from "./ocean";
import { Player } from "./player";
import { State } from "./state";
import { Thing } from "./thing";
import { Tile } from "./tile";

export class World {
  private gl: WebGLRenderingContext;
  private things: Thing[];
  private state: State;

  constructor(url: string, gl: WebGLRenderingContext) {
    this.gl = gl;
    this.things = [];
    this.state = new State();
    this.load(url);
  }

  getPlayerCoords() {
    if (this.state != null && this.state.you.xyz != null) {
      return this.state.you.xyz;
    } else {
      return [20, 0, 12];
    }
  }

  getThings() {
    return this.things;
  }

  load(url: string) {
    const xhr = new XMLHttpRequest();
    const method = "GET";
    xhr.open(method, url, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        var status = xhr.status;
        if (status === 0 || (status >= 200 && status < 400)) {
          this.buildFromString(xhr.responseText);
        } else {
          alert("Failed to load world.");
        }
      }
    };
    xhr.send();
  }

  getState() {
    return this.state;
  }

  applyDelta(delta: State) {
    this.state.apply(delta);
  }

  buildFromString(data: string) {
    const dict = JSON.parse(data) as State;
    this.state.apply(dict);
    console.log("Loaded size: " + data.length);
    const map: any = dict.map;
    const height = map.length;
    let width = 0;
    for (let l of map) {
      width = Math.max(width, l.length);
    }

    for (let j = 0; j < height; ++j) {
      const l = map[j];
      const z = j * 2.0;
      for (let i = 0; i < width; ++i) {
        const x = i * 2.0;
        let c = '~';
        if (i < l.length) {
          c = l[i];
        }
        switch (c) {
          case '#':
            this.things.push(new Tile(this.gl, x, z));
            break;
          case '~':
            this.things.push(new Ocean(this.gl, x, z));
        }
      }
    }
    this.things.push(new BasicBot(this.gl, 2, 0));
    this.things.push(new Player(this.gl,
      this.state.you.xyz[0], this.state.you.xyz[2]));
    this.things.push(new Gem(this.gl, -2, -2));

    this.things.push(new Bubble(this.gl, "Hello, World!", 10, 10));
  }
}