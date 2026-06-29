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

    getBaseStyles() {
        return `
            .board {
                display: grid;
                grid-template-columns: repeat(${this.#width}, 1fr);
                grid-template-rows: repeat(${this.#height}, 1fr);
                aspect-ratio: ${this.#width} / ${this.#height};
            }

            .hud {
                display: flex;
                flex-direction: row;
                gap: 12px;
            }

            .cell {
                user-select: none;
                background-color: #ccc;
                border: ${Math.max(Math.floor(this.#cellSize * 0.1), 1)}px outset #dbdbdb;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: ${this.#cellSize}px;
                min-width: ${this.#cellSize}px;
                min-height: ${this.#cellSize}px;
            }
            
            .cell span {
                pointer-events: none;
            }

            .cell:hover {
                background-color: #aaa;
            }

            .cell.revealed {
                background-color: #fff;
                border: ${Math.max(Math.floor(this.#cellSize * 0.025), 1)}px solid #131313;
            }
            
            .cell.revealed:hover {
                background-color: #f0f0f0;
            }

            .cell.revealed.bomb {
                background-color: red;
            }

            .cell.flagged, .cell.revealed.bomb {
                font-size: ${this.#cellSize * 0.625}px;
            }
        `;
    }

}

customElements.define('campo-minado', Minesweeper);