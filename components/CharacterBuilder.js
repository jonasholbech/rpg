export default class CharacterBuilder extends HTMLElement {
  constructor() {
    super();
    this.nodes = null;
  }
  set state(val) {
    this._state = val;
    this._player = this._state.context.players[0];
    if (this.nodes) {
      this._update();
    }
  }
  set send(val) {
    this._send = val;
  }
  connectedCallback() {
    this.innerHTML = `<section>
        <h1>Character Builder</h1>
        <form>
            <label>
                Name:
                <input type="text" name="name" />
            </label>
            <h2>Points left to distribute: <span></span></h2>  
            <label data-attr="str">
                Strength
                <div class="buttongroup">
                    <button data-action="dec">-</button>
                    <input type="number" name="str" />
                    <button data-action="inc">+</button>
                </div>
            </label>
            <label data-attr="dex">
                Dexterity
                <div class="buttongroup">
                    <button data-action="dec">-</button>
                    <input type="number" name="dex" />
                    <button data-action="inc">+</button>
                </div>
            </label>
            <label data-attr="con">
                Constitution
                <div class="buttongroup">
                    <button data-action="dec">-</button>
                    <input type="number" name="con" />
                    <button data-action="inc">+</button>
                </div>
            </label>
            <input disabled type="submit" value="Start Adventure" />
        </form>
    </section>`;
    this.nodes = {
      inputStr: this.querySelector('input[name="str"]'),
      inputDex: this.querySelector('input[name="dex"]'),
      inputCon: this.querySelector('input[name="con"]'),
      inputSubmit: this.querySelector('input[type="submit"]'),
      form: this.querySelector("form"),
      inputName: this.querySelector('input[name="name"]'),
      pointsLeft: this.querySelector("h2 span"),
    };
    this._setupEventListeners();
  }
  _setupEventListeners() {
    this.querySelectorAll('button[data-action="inc"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const attr = btn.parentElement.parentElement.dataset.attr;
        btn.previousElementSibling.value =
          Number(btn.previousElementSibling.value) + 1;
        this._updateForm();
      });
    });
    this.querySelectorAll('button[data-action="dec"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const attr = btn.parentElement.parentElement.dataset.attr;
        if (btn.nextElementSibling.value > 1) {
          btn.nextElementSibling.value =
            Number(btn.nextElementSibling.value) - 1;
        }
        this._updateForm();
      });
    });
    this.nodes.inputName.addEventListener("input", (e) => this._updateForm());
    this.querySelectorAll(".buttongroup input").forEach((inp) => {
      inp.addEventListener("click", (e) => {
        inp.focus();
        inp.select();
      });
      inp.addEventListener("input", (e) => {
        this._updateForm();
      });
    });
    this.nodes.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this._send({
        type: "ASSIGN_ATTR",
        stats: {
          str: Number(this.nodes.inputStr.value),
          dex: Number(this.nodes.inputDex.value),
          con: Number(this.nodes.inputCon.value),
        },
        name: this.nodes.inputName.value,
      });
      this.remove();
    });
  }
  _updateForm() {
    const sum =
      this._player.pointsToDistribute -
      (Number(this.nodes.inputStr.value) +
        Number(this.nodes.inputDex.value) +
        Number(this.nodes.inputCon.value));
    this.nodes.pointsLeft.textContent = sum;
    this.nodes.inputSubmit.disabled = true;
    if (
      this.nodes.inputStr.value > 0 &&
      this.nodes.inputDex.value > 0 &&
      this.nodes.inputCon.value > 0 &&
      this.nodes.inputName.value.length > 0
    ) {
      this.nodes.inputSubmit.disabled = false;
    }
  }
  _update() {
    this.nodes.inputName.value = this._player.name;
    this.nodes.inputStr.value = this._player.attributes.str;
    this.nodes.inputDex.value = this._player.attributes.dex;
    this.nodes.inputCon.value = this._player.attributes.con;
    this._updateForm();
    //this.nodes.pointsLeft.textContent = this._player.pointsToDistribute;
  }
}
customElements.define("rpg-character-builder", CharacterBuilder);
