import { HeartbeatGroup } from "./heartbeatGroup";
import { Log } from "./log";
import { Render } from "./render";

export class Meet {
  heartbeatGroup: HeartbeatGroup;
  username: string;
  constructor(username: string, joinId: string) {
    this.username = username;
    this.heartbeatGroup = new HeartbeatGroup(username, joinId);

    const body = document.getElementsByTagName('body')[0];
    const localGameDiv = document.createElement('div');
    localGameDiv.id = "localGameDiv";
    localGameDiv.innerText = "Local";
    body.appendChild(localGameDiv);
    const meetDiv = document.createElement('div');

    if (!joinId) {
      const startDiv = document.createElement('div');
      const startSpan = document.createElement('span');
      startDiv.appendChild(startSpan);
      startSpan.id = "startSpan";
      startSpan.innerText = "Start!";
      body.appendChild(startDiv);
      startSpan.addEventListener("click", () => {
        startDiv.remove();
        meetDiv.remove();
        this.start();
      });
    }

    if (joinId) {
      const url = new URL(document.URL);
      url.searchParams.delete("login");
      meetDiv.innerText = url.toString();
    } else {
      meetDiv.innerText = "Loading...";
      this.heartbeatGroup.getConnection()
        .waitReady()
        .then((connection) => {
          const url = new URL(document.URL);
          url.searchParams.delete("login");
          url.searchParams.append("join", connection.id());
          meetDiv.innerText = url.toString();
        });
    }
    body.appendChild(meetDiv);
  }

  start() {
    const r = new Render();
    r.main(this.heartbeatGroup);
    Log.info("Systems are active.");
  }
}