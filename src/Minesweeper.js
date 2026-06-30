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
    #colors = {
        1: 'blue',
        2: 'green',
        3: 'red',
        4: 'darkblue',
        5: 'brown',
        6: 'cyan',
        7: 'black',
        8: 'gray'
    };

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.setUpGame();
    }

    static get observedAttributes() {
        return ['width', 'height', 'bombs'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        this[name] = parseInt(newValue);
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
        style.textContent = this.getBaseStyles();
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

            cell.addEventListener('click', this.onCellLeftClicked);
            cell.addEventListener('contextmenu', this.onCellRightClicked);
            cell.addEventListener('mousedown', this.onCellMouseDown);
            cell.addEventListener('mouseover', this.onCellMouseOver);
        }

    }

    setCellContent(cell, content) {
        const icon = cell.querySelector('span');
        if (icon) {
            icon.textContent = content;
        }
    }

    placeBombs(firstClickedCell) {
        let bombsPlaced = 0;

        while (bombsPlaced < this.#bombs) {
            const row = Math.floor(Math.random() * this.#height);
            const col = Math.floor(Math.random() * this.#width);
            const index = row * this.#width + col;

            const firstRow = parseInt(firstClickedCell.dataset.row);
            const firstCol = parseInt(firstClickedCell.dataset.col);

            if (Math.abs(row - firstRow) > 1 || Math.abs(col - firstCol) > 1) {
                if (!this.#cells[index].classList.contains('bomb')) {
                    this.#cells[index].classList.add('bomb');
                    bombsPlaced++;
                }
            }
        }

        this.#safeSquares = this.#width * this.#height - this.#bombs;
    }

    countAdjacentBombs(row, col) {
        let count = 0;
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < this.#height && c >= 0 && c < this.#width) {
                    const index = r * this.#width + c;
                    if (this.#cells[index].classList.contains('bomb')) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    countFlaggedAdjacentCells(row, col) {
        let count = 0;
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < this.#height && c >= 0 && c < this.#width) {
                    const index = r * this.#width + c;
                    if (this.#cells[index].classList.contains('flagged')) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    onCellMouseOver = (event) => {
        this.#hoveringCell = event.target;
    }

    onCellMouseDown = (event) => {
        if (event.button !== 0) return;

        this.#consumeLeftClick = false;
        const cell = event.target;
        this.#holdTimeoutId = window.setTimeout(() => {
            this.onHoldTimeout(cell);
        }, this.#timeToHold);
    }

    onHoldTimeout(cell) {
        if (cell === this.#hoveringCell) {
            this.#consumeLeftClick = true;
            this.onCellRightClicked({ target: cell, preventDefault() { } });
        }
    }

    onCellLeftClicked = (event) => {
        window.clearTimeout(this.#holdTimeoutId);

        if (this.#consumeLeftClick) {
            this.#consumeLeftClick = false;
            return;
        }

        const cell = event.target;
        if (this.#isFirstClick) {
            this.placeBombs(cell);
            this.#isFirstClick = false;
        }
        else {
            this.onRevealedCellClicked(event);
        }
        this.revealCell(cell);
    }

    onCellRightClicked = (event) => {
        event.preventDefault();
        const cell = event.target;
        if (!cell.classList.contains('revealed')) {
            if (!cell.classList.contains('flagged')) {
                this.flagCell(cell);
            } else {
                this.unflagCell(cell);
            }
        }
    }

    onRevealedCellClicked(event) {
        const cell = event.target;
        if (!cell.classList.contains('revealed')) return;

        const adjacentBombs = parseInt(cell.textContent) || 0;
        if (adjacentBombs === 0) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const flaggedAdjacent = this.countFlaggedAdjacentCells(row, col);

        if (adjacentBombs == flaggedAdjacent) {
            this.revealAdjacentCells(row, col, true);
        }

    }

    revealCell(cell) {
        if (cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;

        if (cell.classList.contains('bomb')) {
            this.finishGame(false);
            return;
        }

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const adjacentBombs = this.countAdjacentBombs(row, col);

        this.safeSquares--;
        cell.classList.add('revealed');
        if (adjacentBombs > 0) {
            this.setCellContent(cell, adjacentBombs);
            cell.style.color = this.getColorForNumber(adjacentBombs);
        }
        else {
            this.revealAdjacentCells(row, col);
        }

    }

    revealAdjacentCells(row, col, revealBombs = false) {
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < this.#height && c >= 0 && c < this.#width) {
                    const index = r * this.#width + c;
                    const cell = this.#cells[index];
                    if (!cell.classList.contains('revealed') && (revealBombs || !cell.classList.contains('bomb'))) {
                        this.revealCell(cell);
                    }
                }
            }
        }
    }

    flagCell(cell) {
        cell.classList.add('flagged');
        this.setCellContent(cell, '🚩');
        this.markedSquares++;
    }

    unflagCell(cell) {
        cell.classList.remove('flagged');
        this.setCellContent(cell, '');
        this.markedSquares--;
    }

    getColorForNumber(number) {
        return this.#colors[number] || 'black';
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

    set width(value) {
        this.#width = Math.max(1, value);
        this.setUpGame();
    }

    get width() {
        return this.#width;
    }

    set height(value) {
        this.#height = Math.max(1, value);
        this.setUpGame();
    }

    get height() {
        return this.#height;
    }

    set bombs(value) {
        // No máximo o número de células menos 9
        this.#bombs = Math.min(this.#width * this.#height - 9, Math.max(1, value));
        this.setUpGame();
    }

    get bombs() {
        return this.#bombs;
    }

}

customElements.define('campo-minado', Minesweeper);