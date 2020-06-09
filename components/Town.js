import { getRndItems } from "../modules/entities/items";
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
      if (!document.querySelector("rpg-healer")) {
        this.nodes.merchantContainer.innerHTML = "";
        const healer = document.createElement("rpg-healer");
        healer.state = this._state;
        healer.send = this._send;
        this.nodes.merchantContainer.appendChild(healer);
        this.nodes.merchant = this.querySelector(".merchants>*:first-child");
        console.log(this.nodes.merchant);
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

class Healer extends HTMLElement {
  //TODO: laves om til rpg-merchant, typen er underordnet
  constructor() {
    super();
    this.nodes;
    this.itemsForSale;
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
  }
  _update() {
    console.log("update");
    this.nodes.healBtn.disabled = this._state.context.players[0].gold < 5;
    this._setPlayerSelling("items");
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
  _setPlayerSelling(type) {
    const player = this._state.context.players[0];
    const fragment = document.createDocumentFragment();
    this.nodes.sellList.innerHTML = "";
    player[type].forEach((thing) => {
      if (!thing.hasOwnProperty("usable") || thing.usable === true) {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.textContent = `Sell`;
        button.dataset.itemId = thing.id;
        button.addEventListener("click", (e) => {
          this._send({
            type: "SELL_ITEM",
            id: thing.id,
            entityType: type,
            price: Math.floor(thing.price / 2),
          });
          button.parentElement.remove();
        });
        li.append(thing.name + ` ${Math.floor(thing.price / 2)}gcs `, button); //TODO: sell price modifier in settings module
        fragment.appendChild(li);
      }
    });
    this.nodes.sellList.appendChild(fragment);
  }
  _setMerchantSelling(type) {
    if (!this.itemsForSale) {
      if (type === "items") {
        this.itemsForSale = getRndItems(2, 5);
      }
    }

    const fragment = document.createDocumentFragment();
    this.itemsForSale.forEach((thing) => {
      if (!thing.hasOwnProperty("usable") || thing.usable === true) {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.textContent = `Buy`;
        button.dataset.itemId = thing.id;
        button.disabled = this._state.context.players[0].gold < thing.price;
        button.addEventListener("click", (e) => {
          this._send({
            type: "BUY_ITEM",
            id: thing.id,
            entityType: type,
            item: thing,
          });
          button.parentElement.remove();
        });
        li.append(thing.name + ` ${thing.price}gcs `, button);
        fragment.appendChild(li);
      }
    });
    this.nodes.buyList.appendChild(fragment);
  }
}
customElements.define("rpg-healer", Healer);
