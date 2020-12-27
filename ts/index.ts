import { Log } from "./log";
import { Render } from "./render";

const logs = document.createElement("div");
document.getElementsByTagName("body")[0].appendChild(logs);
Log.setTargetElement(logs);
Log.info("Initiating start sequence.");

const r = new Render();
r.main();

Log.info("Systems are active.");
