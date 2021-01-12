import { Log } from "./log";
import { Render } from "./render";

const logs = document.createElement("div");
document.getElementsByTagName("body")[0].appendChild(logs);
Log.setTargetElement(logs);
Log.info("Initiating start sequence.");

const url = new URL(document.URL);
const login = url.searchParams.get('login');
if (login) {
  const r = new Render();
  r.main(login);
  Log.info("Systems are active.");
} else {
  Log.info("Unrecognized user.");
  Log.info("");
  Log.info("Enter your username")

  const body = document.getElementsByTagName('body')[0];
  const prompt = document.createElement('span');
  prompt.innerText = "login: ";
  body.appendChild(prompt);
  const loginBox = document.createElement('span');
  loginBox.classList.add("login");
  loginBox.contentEditable = "true";
  loginBox.spellcheck = false;
  loginBox.innerText = "";
  loginBox.tabIndex = 1;
  body.appendChild(loginBox);
  const forward = document.createElement('a');
  body.appendChild(forward);
  const updateUsername = () => {
    const loginName = loginBox.innerText.trim();
    if (loginName.match(/[A-Za-z][A-Za-z0-9]+/)) {
      const newUrl = new URL(url.href);
      newUrl.searchParams.append("login", loginName);
      forward.href = newUrl.href;
      forward.innerText = "Let's go!";
    } else {
      forward.href = "";
      forward.innerText = "";
    }
    setTimeout(updateUsername, 100);
  }
  updateUsername();
}

