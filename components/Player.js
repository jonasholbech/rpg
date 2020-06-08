import { getAttributeBonuses } from "../modules/utils";
//TODO: mimick Monster component, meget lækrere, skal nok også modtage mere state (currentState)
export default class Player extends HTMLElement {
  constructor() {
    super();
    this._renderCount = 0;
    this._state = {};
  }
  static get observedAttributes() {
    return ["str", "dex", "con", "hitpoints", "active", "xp", "level"];
  }
  attributeChangedCallback(name, oldVal, newVal) {
    this._render();
  }
  set str(val) {
    this.setAttribute("str", val);
  }
  set level(val) {
    this.setAttribute("level", val);
  }
  set xp(val) {
    this.setAttribute("xp", val);
  }
  set active(val) {
    this.setAttribute("active", val);
  }
  get active() {
    return this.getAttribute("active") === "true" ? true : false;
  }
  set nextEvents(val) {
    this._nextEvents = val;
  }
  set service(val) {
    this._service = val;
  }
  set dex(val) {
    this.setAttribute("dex", val);
  }
  set con(val) {
    this.setAttribute("con", val);
  }
  set hitpoints(val) {
    this.setAttribute("hitpoints", val);
  }
  set weapons(weapons) {
    this._weapons = weapons;
    this._updateWeaponList();
  }
  set items(items) {
    this._items = items;
    this._updateItemsList();
  }
  set state(ctx) {
    this._state = ctx;
    this._render();
  }
  connectedCallback() {
    this._render();
  }
  _render() {
    this._renderCount++;
    this.innerHTML = `
      <header>
          <h1>${this._state.name} ${this._renderCount}</h1>
          <img src="https://avatars.dicebear.com/v2/bottts/${this.getAttribute(
            "name"
          )}.svg" />
          <div class="xp" style="transform:scaleX(${
            (this.getAttribute("xp") /
              (Number(this.getAttribute("level")) * 1000)) *
            100
          }%)"></div>
          <div class="hp">${this.getAttribute("hitpoints")}</div>
      </header>
      <div class="actions"></div>
      <div class="attributes">
          <dl>
              <dt>STR</dt>
              <dd class="str">${this.getAttribute("str")} (+${
      this._state.bonuses ? getAttributeBonuses(this._state, "str") : 0
    })</dd>
              <dt>DEX</dt>
              <dd class="dex">${this.getAttribute("dex")} (+${
      this._state.bonuses ? getAttributeBonuses(this._state, "dex") : 0
    })</dd>
              <dt>CON</dt>
              <dd class="con">${this.getAttribute("con")} (+${
      this._state.bonuses ? getAttributeBonuses(this._state, "con") : 0
    })</dd>
          </dl>
      </div>
      <div class="weapons">
          <ol></ol>  
      </div>
      <div class="items">
          <ol></ol>  
      </div>
  `;
    this._updateWeaponList();
    this._updateItemsList();
    this._setActions();
  }
  _setActions() {
    if (!this.active) {
      this.querySelector(".actions").innerHTML = "";
    } else if (this._nextEvents && this.active) {
      //this.querySelector(".actions").innerHTML = ;
      this._nextEvents.forEach((ev) => {
        if (["ATTACK", "PARRY"].includes(ev)) {
          const b = document.createElement("button");
          b.textContent = ev;
          b.dataset.event = ev;
          b.onclick = () => {
            this._service.send(ev);
          };
          this.querySelector(".actions").appendChild(b);
        }
      });
    }
  }
  _updateItemsList() {
    if (this._items) {
      const list = this.querySelector(".items ol");
      list.innerHTML = "";
      this._items.forEach((w, i) => {
        const li = document.createElement("li");
        const span = document.createElement("span");
        let b;
        if (w.usable) {
          b = document.createElement("button");
          b.textContent = "Use";
          b.addEventListener("click", (e) => {
            this._use_item(i);
          });
        }
        span.textContent = `${w.name}`;

        if (b) {
          li.appendChild(b);
        }

        li.appendChild(span);
        list.appendChild(li);
      });
    }
  }
  _updateWeaponList() {
    if (this._weapons) {
      const list = this.querySelector(".weapons ol");
      list.innerHTML = "";
      this._weapons.forEach((w, i) => {
        const li = document.createElement("li");
        const span = document.createElement("span");

        const b = document.createElement("button");
        b.textContent = "Activate";
        span.textContent = `${w.name} (${w.damageMin}-${w.damageMax})`;
        b.addEventListener("click", (e) => {
          this._switch(i);
        });
        b.disabled = true;
        if (
          this.active &&
          this._nextEvents &&
          this._nextEvents.includes("SWITCH_WEAPON")
        ) {
          b.disabled = false;
        }
        li.appendChild(b);
        li.appendChild(span);
        list.appendChild(li);

        /*weaponList.push(
          `<li><button onclick="this._switch(${i})">Activate</button>${w.name} (${w.damageMin}-${w.damageMax})</li>`
        );*/
      });
      //list.innerHTML = weaponList.join("\n");
    }
  }
  _switch(index) {
    this._service.send({
      type: "SWITCH_WEAPON",
      index: index,
    });
  }
  _use_item(index) {
    this._service.send({
      type: "USE_ITEM",
      index: index,
    });
  }
}
customElements.define("rpg-player", Player);
