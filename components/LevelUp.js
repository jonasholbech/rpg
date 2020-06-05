export default class LevelUp extends HTMLElement {
  static get observedAttributes() {
    return ["str", "dex", "con"];
  }
  constructor() {
    super();
    this._increased = {
      str: 0,
      dex: 0,
      con: 0,
    };
  }
  attributeChangedCallback(name, oldVal, newVal) {
    this._render();
  }
  set str(val) {
    this.setAttribute("str", val);
  }
  set dex(val) {
    this.setAttribute("dex", val);
  }
  set con(val) {
    this.setAttribute("con", val);
  }
  set completeCallback(val) {
    this._completeCallback = val;
  }
  connectedCallback() {
    this._render();
  }
  _render() {
    this.innerHTML = `
    <section><h1>You gained a new level</h1>
            <table>
                <tr data-attribute="str">
                    <td>STR</td>
                    <td><button disabled class="subtract">-</button></td>
                    <td>${this.getAttribute("str")}</td>
                    <td><button class="add">+</button>
                </tr>
                <tr data-attribute="dex">
                    <td>DEX</td>
                    <td><button disabled class="subtract">-</button></td>
                    <td>${this.getAttribute("dex")}</td>
                    <td><button class="add">+</button>
                </tr>
                <tr data-attribute="con">
                    <td>CON</td>
                    <td><button disabled class="subtract">-</button></td>
                    <td>${this.getAttribute("con")}</td>
                    <td><button class="add">+</button>
                </tr>
            </table>
            <button class="complete">Complete</button>
            </section>
        `;

    this._toggleButtons();
    this.querySelector(".complete").addEventListener("click", (e) => {
      this._completeCallback({
        type: "NEW_STATS",
        stats: {
          str: Number(this.getAttribute("str")),
          dex: Number(this.getAttribute("dex")),
          con: Number(this.getAttribute("con")),
        },
      });
      this.remove();
    });
    this.querySelectorAll(".add").forEach((btn) => {
      btn.addEventListener("click", (evt) => {
        const attr = evt.target.parentNode.parentNode.dataset.attribute;
        this[attr] = Number(this.getAttribute(attr)) + 1;
        this._increased[attr]++;
        this._toggleButtons();
      });
    });
    this.querySelectorAll(".subtract").forEach((btn) => {
      btn.addEventListener("click", (evt) => {
        const attr = evt.target.parentNode.parentNode.dataset.attribute;
        this[attr] = Number(this.getAttribute(attr)) - 1;
        this._increased[attr]--;
        this._toggleButtons();
      });
    });
  }
  _toggleButtons() {
    const sum = this._increased.str + this._increased.dex + this._increased.con;
    console.log(sum, this._increased);
    this.querySelectorAll("button").forEach((b) => (b.disabled = true));

    if (this._increased.str) {
      this.querySelector('[data-attribute="str"] .subtract').disabled = false;
    }
    if (this._increased.dex) {
      this.querySelector('[data-attribute="dex"] .subtract').disabled = false;
    }
    if (this._increased.con) {
      this.querySelector('[data-attribute="con"] .subtract').disabled = false;
    }
    if (sum < 2) {
      this.querySelector('[data-attribute="str"] .add').disabled = false;
      this.querySelector('[data-attribute="dex"] .add').disabled = false;
      this.querySelector('[data-attribute="con"] .add').disabled = false;
    }
    if (sum === 2) {
      this.querySelector(".complete").disabled = false;
    }
    /*
    if (sum === 2) {
      //only subtract
      if (this._increased.str) {
        this.querySelector('[data-attribute="str"] .subtract').disabled = false;
      }
      if (this._increased.dex) {
        this.querySelector('[data-attribute="dex"] .subtract').disabled = false;
      }
      if (this._increased.con) {
        this.querySelector('[data-attribute="con"] .subtract').disabled = false;
      }
    }*/
  }
}
customElements.define("rpg-levelup", LevelUp);
