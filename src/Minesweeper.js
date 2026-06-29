class Minesweeper extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

}

customElements.define('campo-minado', Minesweeper);