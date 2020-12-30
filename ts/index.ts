import { Computer } from "./computer";
import { Log } from "./log";
import { Perspective } from "./perspective";
import { Render } from "./render";

const logs = document.createElement("div");
document.getElementsByTagName("body")[0].appendChild(logs);
Log.setTargetElement(logs);
Log.info("Initiating start sequence.");

const r = new Render();
r.main();

const computer = new Computer("delta.drive = 0.5; delta.turn = 0.8;");

computer.getDelta(new Perspective())
  .then((delta) => console.log("Response: " + JSON.stringify(delta)));

Log.info("Systems are active.");
