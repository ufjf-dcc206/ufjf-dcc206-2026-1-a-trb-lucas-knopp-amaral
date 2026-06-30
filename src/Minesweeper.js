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

    setUpGame() {
        this.#isFirstClick = true;
        this.#cells = [];

        this.shadowRoot.innerHTML = "";

        const style = document.createElement('style');
        style.textContent = this.baseStyles();
        this.shadowRoot.appendChild(style);

        const hudDiv = document.createElement('div');
        hudDiv.classList.add('hud');

        const bombsInfo = document.createElement('div');
        bombsInfo.id = 'bombs-info';        
        bombsInfo.textContent = `Bombs: ${this.#bombs} | Marked: 0`;
        hudDiv.appendChild(bombsInfo);

        const gameStateInfo = document.createElement('div');
        gameStateInfo.id = 'game-state-info';
        hudDiv.appendChild(gameStateInfo);

        this.shadowRoot.appendChild(hudDiv);
        this.markedSquares = 0;

        const board = document.createElement('div');
        board.classList.add('board');
        this.shadowRoot.appendChild(board);

        for (let i = 0; i < this.#height * this.#width; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            const row = Math.floor(i / this.#width);
            const col = i % this.#width;
            cell.dataset.row = row;
            cell.dataset.col = col;

            const icon = document.createElement('span');
            icon.textContent = '';
            cell.appendChild(icon);

            this.#cells.push(cell);
            board.appendChild(cell);
        }

    }

    set markedSquares(value) {
        this.#markedSquares = value;
        const infoDiv = this.shadowRoot.querySelector('.hud #bombs-info');
        infoDiv.textContent = `Bombs: ${this.#bombs} | Marked: ${this.#markedSquares}`;
    }

    get markedSquares() {
        return this.#markedSquares;
    }

    set safeSquares(value) {
        this.#safeSquares = value;
        if (this.#safeSquares === 0) {
            this.finishGame(true);
        }
    }

    get safeSquares() {
        return this.#safeSquares;
    }

}

customElements.define('campo-minado', Minesweeper);