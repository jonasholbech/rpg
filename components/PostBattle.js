export default class PostBattle extends HTMLElement {
  constructor() {
    super();
  }

  set state(state) {
    this._state = state;
    this._render();
  }
  set send(val) {
    this._send = val;
  }
  connectedCallback() {
    //this._render();
  }
  _render() {
    this.innerHTML = `
      <section>
        <h1>Post Battle</h1>
        <div class="player">
            <h2>Player Weapons</h2>
            <ol>${this._setWeaponsPlayer()}</ol>
            <h2>Player Items</h2>
            <ol>${this._setItemsPlayer()}</ol>
        </div>
        <div class="monster">
            <h2>Monster Weapons</h2>
            <ol>${this._setWeaponsMonster()}</ol>
            <h2>Monster Items</h2>
            <ol>${this._setItemsMonster()}</ol>
        </div>
        <button id="next">Leave</button>
        <button id="teleport">Teleport to town</button>
      </section>`;
    this.querySelector("#next").addEventListener("click", (e) => {
      this._send("NEXT");
      this.remove();
    });
    this.querySelector("#teleport").addEventListener("click", (e) => {
      this._send("TELEPORT");
      this.remove();
    });
    this._toggleButtons();
  }
  _setWeaponsPlayer() {
    //TODO:: setWeap, setitem player, monster are the same, refractor
    let data = "";
    this._state.context.players[0].weapons.forEach((w, i) => {
      data += `<li><button data-type="weapon" data-id="${w.id}">Drop</button> ${w.name} (${w.damageMin}-${w.damageMax})</li>`;
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
      data += `<li><button ${disabled} data-type="weapon" data-id="${w.id}">Take</button> ${w.name} (${w.damageMin}-${w.damageMax})</li>`;
    });
    return data;
  }
  _setItemsPlayer() {
    let data = "";
    this._state.context.players[0].items.forEach((w, i) => {
      data += `<li><button data-type="item" data-id="${w.id}">Drop</button> ${w.name}</li>`;
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
      )}' data-type="item" data-id="${w.id}">Take</button> ${w.name}</li>`;
    });
    return data;
  }
  _toggleButtons() {
    this.querySelectorAll(".player button").forEach((btn) => {
      btn.addEventListener("click", (evt) => {
        const id = evt.target.dataset.id;
        const type = evt.target.dataset.type;
        if (type === "weapon") {
          this._send({
            type: "DROP_WEAPON",
            id: id,
          });
        } else {
          this._send({
            type: "DROP_ITEM",
            id: id,
          });
        }
        this.remove();
      });
    });
    this.querySelectorAll(".monster button").forEach((btn) => {
      btn.addEventListener("click", (evt) => {
        const id = evt.target.dataset.id;
        const type = evt.target.dataset.type;
        if (type === "weapon") {
          this._send({
            type: "PICKUP_WEAPON",
            id: id,
          });
        } else {
          this._send({
            type: "PICKUP_ITEM",
            id: id,
            //payload: JSON.parse(evt.target.dataset.payload),
          });
        }

        this.remove();
      });
    });
  }
}
/*
this._completeCallback({
        type: "NEW_STATS",
        stats: {
          str: Number(this.getAttribute("str")),
          dex: Number(this.getAttribute("dex")),
          con: Number(this.getAttribute("con")),
        },
      });
*/
customElements.define("rpg-postbattle", PostBattle);
