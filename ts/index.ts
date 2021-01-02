import { Log } from "./log";
import { Render } from "./render";
import { Terminal } from "./terminal";

const logs = document.createElement("div");
document.getElementsByTagName("body")[0].appendChild(logs);
Log.setTargetElement(logs);
Log.info("Initiating start sequence.");

const t = new Terminal();

const r = new Render();
r.main();

Log.info("Systems are active.");
