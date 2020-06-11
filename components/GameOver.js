export default class GameOver extends HTMLElement {
  set state(val) {
    this._state = val;
  }
  set send(val) {
    this._send = val;
  }
  connectedCallback() {
    this.innerHTML = `<section>
            <h1>Game Over Man! Game Over</h1>
            <button>Play Again</button>
        </section>`;
    this.querySelector("button").addEventListener("click", (e) => {
      this._send("PLAY_AGAIN");
      this.remove();
    });
  }
}

customElements.define("rpg-gameover", GameOver);
