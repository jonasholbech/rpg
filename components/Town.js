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
      <h1>Town, <span>${this._state.context.players[0].gold}</span>gcs</h1>
      <nav><button data-event="VISIT_HEALER">Healer</button><button data-event="VISIT_BLACKSMITH">Blacksmith</button><button  data-event="LEAVE">Leave</button></nav>
      <div class="merchants">
        
      </div>
    </section>`;
    this.nodes = {
      gold: this.querySelector("h1 span"),
      merchants: this.querySelector(".merchants"),
    };
    this.querySelectorAll(`nav button[data-event]`).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this._send(e.target.dataset.event);
        this.remove();
      });
    });
    this._setMerchant();
  }
  _setMerchant() {
    this.nodes.merchants.innerHTML = "";
    if (this._state.matches("town.healer")) {
      const healer = document.createElement("rpg-healer");
      healer.state = this._state;
      healer.send = this._send;
      this.nodes.merchants.appendChild(healer);
    }
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
  /*_setWeaponsPlayer() {
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
  }*/
}
customElements.define("rpg-town", Town);

class Healer extends HTMLElement {
  constructor() {
    super();
    this.nodes;
  }
  set state(state) {
    this._state = state;
    if (this.nodes) {
      this._update();
    }
  }
  set send(val) {
    this._send = val;
  }
  connectedCallback() {
    this._initialRender();
    /*this.querySelector(`button[data-event="SELL_ITEM"]`).addEventListener(
      "click",
      (e) => {
        this.send("SELL_ITEM");
      }
    );
    this.querySelector(`button[data-event="LEAVE"]`).addEventListener(
      "click",
      (e) => {
        this.send("LEAVE");
      }
    );*/
  }
  _update() {
    console.log("update");
    this.nodes.healBtn.disabled = this._state.context.players[0].gold < 5;
  }
  _initialRender() {
    this.innerHTML = `
        <h2>Healer</h2>
        <button data-event="HEAL">Heal (5gc)</button>
        <div class="grid2">
            <section>
                <h3>Sell</h3>
                <ol class="sellItems"></ol>
            </section>
            <section>
                <h3>Buy</h3>
                <ol class="buyItems"></ol>
            </section>
        </div>
        <button data-event="SELL_ITEM">Sell</button>
    `;
    this.nodes = {
      healBtn: this.querySelector(`button[data-event="HEAL"]`),
      buyList: this.querySelector(".buyItems"),
      sellList: this.querySelector(".sellItems"),
    };
    this._setPlayerSelling("items");
    this._setMerchantSelling("items");
    this._update();
    this.nodes.healBtn.addEventListener("click", (e) => {
      this._send({
        type: "HEAL",
        price: 5,
      });
    });
  }
  _setPlayerSelling(type) {}
  _setMerchantSelling(type) {}
}
customElements.define("rpg-healer", Healer);
