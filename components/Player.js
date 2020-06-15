import { getAttributeBonuses } from "../modules/utils";
import { bonuses } from "../modules/entities/items";
export default class Player extends HTMLElement {
  constructor() {
    super();
    this._nodex;
    this._state;
  }

  set active(val) {
    this._active = val;
  }
  set send(val) {
    this._send = val;
  }
  set nextEvents(val) {
    this._nextEvents = val;
  }
  set state(ctx) {
    this._state = ctx;
    if (this.nodes) {
      this._update();
    }
  }

  connectedCallback() {
    this._render();
  }
  _render() {
    this._renderCount++;
    this.innerHTML = `
      <header>
          <h1>${this._state.name}</h1>
          <img src="https://avatars.dicebear.com/v2/bottts/${this._state.name}.svg" />
          <div class="level"></div>
          <div class="xp"></div>
          <div class="hp">${this._state.hitpoints}</div>
      </header>
      <div class="actions"></div>
      <div class="attributes">
          <dl>
              <dt>STR</dt>
              <dd class="str"></dd>
              <dt>DEX</dt>
              <dd class="dex"></dd>
              <dt>CON</dt>
              <dd class="con"></dd>
          </dl>
      </div>
      <div class="weapons">
          <ol></ol>  
      </div>
      <div class="items">
          <ol></ol>  
      </div>
  `;
    this.nodes = {
      hp: this.querySelector(".hp"),
      xp: this.querySelector(".xp"),
      level: this.querySelector(".level"),
      str: this.querySelector(".str"),
      dex: this.querySelector(".dex"),
      con: this.querySelector(".con"),
      actions: this.querySelector(".actions"),
      items: this.querySelector(".items ol"),
      weapons: this.querySelector(".weapons ol"),
    };
    /* this._setActions();
    this._updateItemsList();
    this._updateWeaponList(); */
    this._update();
  }
  _update() {
    this.nodes.hp.textContent = this._state.hitpoints;
    this._setAttribute("str");
    this._setAttribute("dex");
    this._setAttribute("con");
    this._setXP();
    this._setLevel();
    this._setActions();
    this._updateItemsList();
    this._updateWeaponList();
  }
  _setLevel() {
    this.nodes.level.textContent = this._state.level;
  }
  _setXP() {
    this.nodes.xp.style.transform = `scaleX(${
      (this._state.xp / (Number(this._state.level) * 1000)) * 1
    })`;
  }

  _setAttribute(attr) {
    this.nodes[attr].textContent = `${this._state.attributes[attr]} (+${
      this._state.bonuses ? getAttributeBonuses(this._state, attr) : 0
    })`;
  }
  _setActions() {
    if (!this._active) {
      this.nodes.actions.innerHTML = "";
    } else if (this._nextEvents && this._active) {
      this.nodes.actions.innerHTML = "";
      this._nextEvents.forEach((ev) => {
        if (["ATTACK", "PARRY"].includes(ev)) {
          const b = document.createElement("button");
          b.textContent = ev;
          b.dataset.event = ev;
          b.onclick = () => {
            if (ev === "ATTACK") {
              this._send(ev);
            } else {
              this._send({
                type: "PARRY",
                bonuses: [
                  { ...bonuses.parryBonus, playerIndex: 0 },
                  { ...bonuses.parryCurse, playerIndex: 1 },
                ],
              });
            }
          };
          this.nodes.actions.appendChild(b);
        }
      });
    }
  }
  _updateItemsList() {
    this.nodes.items.innerHTML = "";
    this._state.items.forEach((w, i) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      let b;
      if (w.usable) {
        b = document.createElement("button");
        b.textContent = "Use";
        b.addEventListener("click", (e) => {
          this._use_item(w.id);
        });
      }
      if (b) {
        li.appendChild(b);
      }
      span.textContent = `${w.name}`;
      li.appendChild(span);
      this.nodes.items.appendChild(li);
    });
  }
  _updateWeaponList() {
    this.nodes.weapons.innerHTML = "";
    this._state.weapons.forEach((w, i) => {
      const li = document.createElement("li");
      const span = document.createElement("span");

      const b = document.createElement("button");
      b.textContent = "Use";
      span.textContent = `${w.name} (${w.damageMin}-${w.damageMax})`;
      b.addEventListener("click", (e) => {
        this._switch(i);
      });
      b.disabled = true;
      if (
        this._active &&
        this._nextEvents &&
        this._nextEvents.includes("SWITCH_WEAPON") &&
        i !== 0
      ) {
        b.disabled = false;
      }
      li.appendChild(b);
      li.appendChild(span);
      this.nodes.weapons.appendChild(li);
    });
  }
  _switch(index) {
    this._send({
      type: "SWITCH_WEAPON",
      index: index,
    });
  }
  _use_item(id) {
    this._send({
      type: "USE_ITEM",
      id: id,
    });
  }
}
customElements.define("rpg-player", Player);
