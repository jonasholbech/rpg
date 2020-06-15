export default class BonusCounter extends HTMLElement {
  set state(val) {
    this._state = val;
    //TODO: så længe en bonus ikke har et id eller noget kan progress baren ikke tilpasses til oprindelig duration
  }
  connectedCallback() {
    this._render();
  }
  _render() {
    //TODO: max er lige nu bundet til den længste duration et item kan have
    const label = `${this._state.attr} (+${this._state.change}) ${Math.floor(
      (this._state.duration / 10) * 100
    )}%`;
    const value = Math.floor((this._state.duration / 10) * 10);
    this.innerHTML = `
        <li class="bonus-counter">
            <label>
                ${label}
                <progress max="10" value="${value}">${label}
                </progress>
            </label>
        </li>
        `;
  }
}
customElements.define("rpg-bonus-counter", BonusCounter);
