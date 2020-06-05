export default class InterpreterComponent extends HTMLElement {
  constructor() {
    super();
    //console.log("constructor");
  }
  set nextEvents(value) {
    //console.log("setting events in the component");
    this._events = value;
    this._render();
  }
  set service(service) {
    this._service = service;
  }
  set state(state) {
    this._state = state;
    this._render();
  }
  get nextEvents() {
    return this._events;
  }
  connectedCallback() {
    if (!this._events) {
      this._events = [];
    }
    this._render();
  }
  _render() {
    const state = this._state ? this._state.value : "not known";
    this.innerHTML = `<h1>hi im the interpreter ${state}</h1>
    <ul></ul>
    
    
    `;
    this._getButtons();
  }
  _getButtons() {
    this._events.forEach((ev) => {
      const b = document.createElement("button");
      b.textContent = ev;
      b.dataset.event = ev;
      b.addEventListener("click", (e) => {
        this._service.send(ev);
      });
      const li = document.createElement("li");
      li.appendChild(b);
      this.querySelector("ul").appendChild(li);
    });
  }
}

customElements.define("rpg-interpreter", InterpreterComponent);
