export default class Town extends HTMLElement {
  constructor() {
    super();
    this.nodes = null;
    this.lastState = null;
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
      merchantContainer: this.querySelector(".merchants"),
      merchant: null,
    };
    this.querySelectorAll(`nav button[data-event]`).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this._send(e.target.dataset.event);
        if (e.target.dataset.event === "LEAVE") {
          this.remove();
        }
      });
    });
    this._setMerchant();
  }
  _setMerchant() {
    console.log(
      "set merchant",
      this._state.matches("town.healer"),
      this._state.value
    );

    if (this._state.matches("town.healer")) {
      if (
        !document.querySelector("rpg-merchant") ||
        document.querySelector("rpg-merchant").type !== "items"
      ) {
        this.nodes.merchantContainer.innerHTML = "";
        const merc = document.createElement("rpg-merchant");
        merc.state = this._state;
        merc.send = this._send;
        merc.type = "items";

        merc.merchantTitle = "Healer";
        this.nodes.merchantContainer.appendChild(merc);
        this.nodes.merchant = this.querySelector(".merchants>*:first-child");
        console.log(document.querySelector("rpg-merchant").type);
      } //TODO: switch between merchants
    } else if (this._state.matches("town.blacksmith")) {
      if (
        !document.querySelector("rpg-merchant") ||
        document.querySelector("rpg-merchant").type !== "weapons"
      ) {
        this.nodes.merchantContainer.innerHTML = "";
        const merc = document.createElement("rpg-merchant");
        merc.state = this._state;
        merc.send = this._send;
        merc.type = "weapons";
        merc.merchantTitle = "Blacksmith";
        this.nodes.merchantContainer.appendChild(merc);
        this.nodes.merchant = this.querySelector(".merchants>*:first-child");
      }
    }
  }
  _update() {
    this._setMerchant();
    console.log("update");
    if (this.nodes.merchant) {
      this.nodes.gold.textContent = this._state.context.players[0].gold;
      this.nodes.merchant.state = this._state;
    }
  }
}
customElements.define("rpg-town", Town);
