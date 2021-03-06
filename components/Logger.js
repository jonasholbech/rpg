import { observer } from "../modules/observer";

export default class Logger extends HTMLElement {
  constructor() {
    super();
    this.logs = [];
    this.backLog = [];
    this.addLogItem = this.addLogItem.bind(this);
    observer.subscribe("LOG", this.addLogItem);
  }
  addLogItem(text) {
    const log = {
      ts: new Date(),
      message: text,
    };

    this.logs.push(log);
    this._updateLog(log);
  }
  connectedCallback() {
    this.innerHTML = `<h2>Log</h2><dl></dl>`;
  }
  _updateLog(log) {
    const dt = document.createElement("dt");
    dt.textContent = `${String(log.ts.getHours()).padStart(2, "0")}:${String(
      log.ts.getMinutes()
    ).padStart(2, "0")}:${String(log.ts.getSeconds()).padStart(2, "0")}`;
    const dd = document.createElement("dd");
    dd.textContent = log.message;
    this.querySelector("dl").prepend(dd);
    this.querySelector("dl").prepend(dt);
  }
}
customElements.define("rpg-logger", Logger);
