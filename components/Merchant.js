import { getRndItems } from "../modules/entities/items";
import { getRndWeapons } from "../modules/entities/weapons";
//TODO: merchant udvalg resetter ved klik frem og tilbage mellem healer=>blacksmith
//TODO: salg af items er gal igen, sikkert noget med id'et sælges et sværd, sælges alle
class Merchant extends HTMLElement {
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
  set type(val) {
    this._type = val;
  }
  get type() {
    return this._type;
  }
  set merchantTitle(val) {
    this._merchantTitle = val;
  }
  set send(val) {
    this._send = val;
  }
  connectedCallback() {
    this._initialRender();
  }
  _update() {
    this.nodes.healBtn.disabled =
      this._state.context.players[0].gold < 5 ||
      this._state.context.players[0].hitpoints >=
        this._state.context.players[0].attributes.con * 2;
    this.nodes.healBtn.style.display =
      this._merchantTitle === "Healer" ? "default" : "none";

    this._setPlayerSelling("items");
  }
  _initialRender() {
    this.innerHTML = `
          <h2>${this._merchantTitle}</h2>
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
    this._setPlayerSelling();
    this._setMerchantSelling();
    this._update();
    this.nodes.healBtn.addEventListener("click", (e) => {
      this._send({
        type: "HEAL",
        price: 5,
      });
    });
  }
  _setPlayerSelling() {
    const player = this._state.context.players[0];
    const fragment = document.createDocumentFragment();
    this.nodes.sellList.innerHTML = "";
    player[this._type].forEach((thing) => {
      if (!thing.hasOwnProperty("usable") || thing.usable === true) {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.textContent = `Sell`;
        button.dataset.itemId = thing.id;
        button.addEventListener("click", (e) => {
          this._send({
            type: "SELL_ITEM",
            id: thing.id,
            entityType: this._type,
            price: Math.floor(thing.price / 2) || 1,
          });
          button.parentElement.remove();
        });
        li.append(
          thing.name + ` ${Math.floor(thing.price / 2) || 1}gcs `,
          button
        ); //TODO: sell price modifier in settings module
        fragment.appendChild(li);
      }
    });
    this.nodes.sellList.appendChild(fragment);
  }
  _setMerchantSelling() {
    if (!this.itemsForSale) {
      if (this._type === "items") {
        this.itemsForSale = getRndItems(2, 5);
      } else if (this._type === "weapons") {
        this.itemsForSale = getRndWeapons(2, 5);
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
            entityType: this._type,
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
customElements.define("rpg-merchant", Merchant);
