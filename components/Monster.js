import { getAttributeBonuses } from "../modules/utils";
import { observer } from "../modules/observer";
export default class Monster extends HTMLElement {
  constructor() {
    super();
    this._observer = observer;
    this._update = this._update.bind(this);
    this._observer.subscribe("MONSTER_CONTEXT", this._update);
    this._nodes;
    this._prevHitpoints = 0;
  }

  _update(ctx) {
    console.log(ctx);
    if (!this._nodes) {
      this._getNodes();
    }
    if (ctx.hitpoints > this._prevHitpoints) {
      this._newMonster(ctx);
    }
    this._prevHitpoints = ctx.hitpoints;
    this._updateParts(ctx);
  }
  connectedCallback() {
    this._initialRender();
  }
  _newMonster(ctx) {
    //TODO: i tvivl om det her er helt ok, skulle den bare køre hver gang?
    this._updateWeaponList(ctx.weapons);
    this._updateItemsList(ctx.items);
  }
  _updateParts(ctx) {
    this._nodes.h1.textContent = ctx.name;
    this._nodes.img.src = `https://avatars.dicebear.com/v2/bottts/${ctx.name}.svg`;
    this._nodes.hp.textContent = ctx.hitpoints;
    this._nodes.str.textContent = ctx.attributes.str;
    this._nodes.strBonus.textContent = 0;
    this._nodes.dex.textContent = ctx.attributes.dex;
    this._nodes.dexBonus.textContent = 0;
    this._nodes.con.textContent = ctx.attributes.con;
    this._nodes.conBonus.textContent = 0;
  }
  _getNodes() {
    this._nodes = {
      h1: this.querySelector("h1"),
      img: this.querySelector("img"),
      hp: this.querySelector(".hp"),
      str: this.querySelector(".str span"),
      strBonus: this.querySelector(".str span:last-child"),
      dex: this.querySelector(".dex span"),
      dexBonus: this.querySelector(".dex span:last-child"),
      con: this.querySelector(".con span"),
      conBonus: this.querySelector(".con span:last-child"),
      weapons: this.querySelector(".weapons ol"),
      items: this.querySelector(".items ol"),
    };
  }
  _initialRender() {
    this.innerHTML = `
      <header>
          <h1>TODO NAME</h1>
          <img src="https://avatars.dicebear.com/v2/bottts/TODO NAME.svg" />
          <div class="hp">TODO HP</div>
      </header>
      <div class="actions"></div>
      <div class="attributes">
          <dl>
              <dt>STR</dt>
              <dd class="str"><span>TODO STR</span> (+<span>TODO BONUS</span>)</dd>
              <dt>DEX</dt>
              <dd class="dex"><span>TODO DEX</span> (+<span>TODO BONUS</span>)</dd>
              <dt>CON</dt>
              <dd class="con"><span>TODO CON</span> (+<span>TODO BONUS</span>)</dd>
          </dl>
      </div>
      <div class="weapons">
          <ol></ol>  
      </div>
      <div class="items">
          <ol></ol>  
      </div>`;
  }
  _updateItemsList(items) {
    this._nodes.items.innerHTML = "";
    items.forEach((w, i) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = `${w.name}`;
      li.appendChild(span);
      this._nodes.items.appendChild(li);
    });
  }
  _updateWeaponList(weapons) {
    this._nodes.weapons.innerHTML = "";
    weapons.forEach((w, i) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = `${w.name} (${w.damageMin} - ${w.damageMax})`;
      li.appendChild(span);
      this._nodes.weapons.appendChild(li);
    });
  }
}
customElements.define("rpg-monster", Monster);
