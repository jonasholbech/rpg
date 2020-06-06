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
            <h2>Player</h2>
            <ol>${this._setWeaponsPlayer()}</ol>
        </div>
        <div class="monster">
            <h2>Monster</h2>
            <ol>${this._setWeaponsMonster()}</ol>
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
    let data = "";
    console.log(this._state);
    this._state.context.players[0].weapons.forEach((w, i) => {
      data += `<li><button data-index="${i}">Drop</button> ${w.name} (${w.damageMin}-${w.damageMax})</li>`;
    });
    return data;
  }
  _setWeaponsMonster() {
    let data = "";
    console.log(this._state);
    const disabled =
      this._state.context.players[0].attributes.str >
      this._state.context.players[0].weapons.length
        ? ""
        : "disabled";
    this._state.context.players[1].weapons.forEach((w, i) => {
      data += `<li><button ${disabled} data-index="${i}">Take</button> ${w.name} (${w.damageMin}-${w.damageMax})</li>`;
    });
    return data;
  }
  _toggleButtons() {
    this.querySelectorAll(".player button").forEach((btn) => {
      btn.addEventListener("click", (evt) => {
        const index = evt.target.dataset.index;
        console.log(index);
        this._send({
          type: "DROP_WEAPON",
          index: index,
        });
        this.remove();
      });
    });
    this.querySelectorAll(".monster button").forEach((btn) => {
      btn.addEventListener("click", (evt) => {
        const index = evt.target.dataset.index;
        console.log(index);
        this._send({
          type: "PICKUP_WEAPON",
          index: index,
        });
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
