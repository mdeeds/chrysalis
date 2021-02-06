import { Log } from "./log";
import { State } from "./state";

export class WorldServer {
  private static loadFromSavedState(worldName: string)
    : Promise<string> {
    const worldData = window.localStorage.getItem(`${worldName}-world`);
    const url = new URL(document.URL);
    if (worldData && !url.searchParams.get('reset')) {
      return new Promise((resolve, reject) => {
        Log.info("Loading from local storage.");
        resolve(worldData);
      });
    } else {
      Log.info("Loading from json");
      return WorldServer.load("emptyWorld.json");
    }
  }

  private static load(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const method = "GET";
      xhr.open(method, url, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          var status = xhr.status;
          if (status === 0 || (status >= 200 && status < 400)) {
            resolve(xhr.responseText);
          } else {
            reject("Failed to load world.");
          }
        }
      };
      xhr.send();
    });
  }

  static getState(gl: WebGLRenderingContext,
    worldName: string, username: string, broadcast: Function): Promise<State> {
    return new Promise(async (resolve, reject) => {
      Log.info('Loading world from saved state.');
      WorldServer.loadFromSavedState(worldName)
        .then((serialized: string) => {
          const state = new State(gl, worldName, username, broadcast);
          state.buildFromString(serialized);
          resolve(state);
        })
        .catch((reason: string) => {
          reject(reason);
        })
    })
  }
}