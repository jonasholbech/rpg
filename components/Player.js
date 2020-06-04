export default class Player extends HTMLElement {
  constructor() {
    super();
    this._renderCount = 0;
  }
  static get observedAttributes() {
    return ["str", "dex", "con", "hitpoints", "active", "xp"];
  }
  attributeChangedCallback(name, oldVal, newVal) {
    this._render();
  }
  set str(val) {
    this.setAttribute("str", val);
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
  connectedCallback() {
    this._render();
  }
  _render() {
    //console.log("render");
    this._renderCount++;
    this.innerHTML = `
      <header>
          <h1>${this.getAttribute("name")} ${this._renderCount}</h1>
          <img src="https://avatars.dicebear.com/v2/bottts/${this.getAttribute(
            "name"
          )}.svg" />
          <div class="xp" style="transform:scaleX(${
            (this.getAttribute("xp") / 1000) * 100
          }%)"></div>
          <div class="hp">${this.getAttribute("hitpoints")}</div>
      </header>
      <div class="actions"></div>
      <div class="attributes">
          <dl>
              <dt>STR</dt>
              <dd class="str">${this.getAttribute("str")}</dd>
              <dt>DEX</dt>
              <dd class="dex">${this.getAttribute("dex")}</dd>
              <dt>CON</dt>
              <dd class="con">${this.getAttribute("con")}</dd>
          </dl>
      </div>
      <div class="weapons">
          <ol></ol>  
      </div>
  `;
    this._updateWeaponList();
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
  _updateWeaponList() {
    if (this._weapons) {
      //TODO what about an empty array?
      //console.log(this._weapons);
      const list = this.querySelector(".weapons ol");
      list.innerHTML = "";
      //const weaponList = [];
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
}
customElements.define("rpg-player", Player);
