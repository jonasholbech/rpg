export default class Town extends HTMLElement {
  constructor() {
    super();
    this.nodes = null;
    this.lastState = null;
  }

  set state(state) {
    this._state = state;
    this._update();
  }
  set send(val) {
    this._send = val;
  }
  connectedCallback() {
    console.log(this._state);
    if (this.lastState !== this._state.value) {
      this._initialRender();
    }
    this.lastState = this._state.value;
  }
  _initialRender() {
    console.log("first render of town");
    this.innerHTML = `
    <section>
      <h1>Town</h1>
      <nav><button data-event="VISIT_HEALER">Healer</button><button data-event="VISIT_BLACKSMITH">Blacksmith</button><button  data-event="LEAVE">Leave</button></nav>
      <div class="merchant"></div>
    </section>`;
    this.querySelector(`[data-event="VISIT_HEALER"]`).addEventListener(
      "click",
      (e) => {}
    );
  }
  _update() {
    /* this.querySelector("#next").addEventListener("click", (e) => {
      this._send("NEXT");
      this.remove();
    });
    this.querySelector("#teleport").addEventListener("click", (e) => {
      this._send("TELEPORT");
      this.remove();
    });
    this._toggleButtons();*/
  }
  _setWeaponsPlayer() {
    //TODO:: setWeap, setitem player, monster are the same, refractor
    let data = "";
    this._state.context.players[0].weapons.forEach((w, i) => {
      data += `<li><button data-type="weapon" data-index="${i}">Drop</button> ${w.name} (${w.damageMin}-${w.damageMax})</li>`;
    });
    return data;
  }
  _setWeaponsMonster() {
    let data = "";
    let disabled =
      this._state.context.players[0].attributes.str >
      this._state.context.players[0].weapons.length
        ? ""
        : "disabled";
    this._state.context.players[1].weapons.forEach((w, i) => {
      if (w.hasOwnProperty("notCollectable")) {
        disabled = "disabled";
      }
      data += `<li><button ${disabled} data-type="weapon" data-index="${i}">Take</button> ${w.name} (${w.damageMin}-${w.damageMax})</li>`;
    });
    return data;
  }
  _setItemsPlayer() {
    let data = "";
    this._state.context.players[0].items.forEach((w, i) => {
      data += `<li><button data-type="item" data-index="${i}">Drop</button> ${w.name}</li>`;
    });
    return data;
  }
  _setItemsMonster() {
    let data = "";
    const disabled =
      this._state.context.players[0].attributes.str >
      this._state.context.players[0].items.length
        ? ""
        : "disabled";
    this._state.context.players[1].items.forEach((w, i) => {
      data += `<li><button ${disabled} data-payload='${JSON.stringify(
        w.payload
      )}' data-type="item" data-index="${i}">Take</button> ${w.name}</li>`;
    });
    return data;
  }
  _toggleButtons() {
    this.querySelectorAll(".player button").forEach((btn) => {
      btn.addEventListener("click", (evt) => {
        const index = evt.target.dataset.index;
        const type = evt.target.dataset.type;
        if (type === "weapon") {
          this._send({
            type: "DROP_WEAPON",
            index: index,
          });
        } else {
          this._send({
            type: "DROP_ITEM",
            index: index,
          });
        }
        this.remove();
      });
    });
    this.querySelectorAll(".monster button").forEach((btn) => {
      btn.addEventListener("click", (evt) => {
        const index = evt.target.dataset.index;
        const type = evt.target.dataset.type;
        if (type === "weapon") {
          this._send({
            type: "PICKUP_WEAPON",
            index: index,
          });
        } else {
          this._send({
            type: "PICKUP_ITEM",
            index: index,
            //payload: JSON.parse(evt.target.dataset.payload),
          });
        }

        this.remove();
      });
    });
  }
}
customElements.define("rpg-town", Town);
