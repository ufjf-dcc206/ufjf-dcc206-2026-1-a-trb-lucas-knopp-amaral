class Minesweeper extends HTMLElement {
    #cellSize = 40;
    #width = 9;
    #height = 9;
    #bombs = 15;
    #cells = [];
    #isFirstClick = true;
    #hoveringCell = null;
    #consumeLeftClick = false;
    #markedSquares = 0;
    #safeSquares = 0;
    #holdTimeoutId = null;
    #timeToHold = 200;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

}

customElements.define('campo-minado', Minesweeper);