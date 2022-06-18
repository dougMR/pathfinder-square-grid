console.log("hello from pathfinding.js");
const canvas = document.getElementById("drawing-board");
const ctx = canvas.getContext("2d");
let grid;
let scale = 1;
console.log("canvas.offsetHeight: ", canvas.offsetHeight);

const marqueeDiv = document.querySelector("#marquee");

let mousePos = { x: 0, y: 0 };

const degToRad = (degree) => {
    return (Math.PI / 180) * degree;
};

const angleRad = degToRad(60);

const setCanvasDimensions = () => {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.setAttribute("width", w);
    canvas.setAttribute("height", h);
};

const getDiagonalSize = (size) => {
    return Math.sqrt(size * size + size * size);
};

const output = (txt, add = false) => {
    const prevText = add ? outputDiv.innerHTML + "<br />" : "";
    outputDiv.innerHTML = prevText + txt;
};
const generateGridOutput = () => {
    // gridOutput(JSON.stringify(grid));
    let colIndex = 0;
    let rowIndex = 0;
    let gridOutput = "";
    gridOutput += `gridData = {squareSize:${squareSize}, numRows: ${numRows}, numColumns: ${numColumns}, grid:[`;
    for (const col of grid) {
        rowIndex = 0;
        gridOutput += `[<br />`;
        for (const tile of col) {
            gridOutput += `{
                col: ${colIndex},<br />
                row: ${rowIndex},<br />
                size: ${tile.size},<br />
                diagonal: ${tile.diagonal},<br />
                obstacle: ${tile.obstacle},<br />

                endSegment: ${tile.endSegment},<br />
                neighbors: [`;
            for (const neighbor of tile.neighbors) {
                if (neighbor == null) {
                    gridOutput += "null,";
                } else {
                    gridOutput += `{row: ${neighbor.row}, col: ${neighbor.col}},`;
                }
                // End Neighbors
            }
            gridOutput += `]<br />},<br />`;
            // End of Tile
            rowIndex++;
            gridOutput += "<br />";
        }
        gridOutput += `],<br />`;
        // End of Column
        colIndex++;
    }
    gridOutput += `]}`;
    // End of grid
    output(gridOutput);
};

/* BUTTON FUNCTIONS */

// HTML BUTTON FUNCTIONS
const outputDiv = document.querySelector("#output");

const makeObstaclesButton = document.querySelector("#make-obstacles");
const marqueeButton = document.querySelector("#marquee-button");
const gridHolderDiv = document.querySelector("#tile-buttons-holder");
let startSquare, endSquare;
let setObstaclesOn = false;
let marqueeOn = false;
const obstacleButtons = [];
// obstacleButtons just means tileButtons RENAME
let dragging = false;
let addingObstacles = true;
let squareButtonsOn = false;
let outputOpen = false;
let settingWaypoints = false;
const waypoints = [];
const paths = [];

// END HTML BUTTON FUNCTIONS

let squareSize = 20;
let numRows, numColumns;
function init() {
    console.log("init()");

    setCanvasDimensions();
    numColumns = Math.floor(canvas.offsetWidth / squareSize);
    numRows = Math.floor(canvas.offsetHeight / squareSize);
    // squareSize = Math.round(canvas.offsetWidth / numColumns);
    // grid = buildGrid(numColumns, numRows);
    grid = buildGridFromData(gridData);
    setNeighbors(grid);
    const diagonal = Math.sqrt(
        squareSize * squareSize + squareSize * squareSize
    );
    console.log("diagonal ratio: ", (diagonal - squareSize) / squareSize);
    // console.log(grid[17][5].neighbors[1] === null);
    console.log(
        "height calc: ",
        canvas.offsetHeight,
        squareSize,
        canvas.offsetHeight / squareSize
    );
    resizeGrid();
}

window.addEventListener("load", (evt) => {
    // after everything on page is loaded and parsed
    console.log("document loaded");
    init();
});
const resizeGrid = () => {
    setCanvasDimensions();
    recalcSquareSize();
    redrawGrid(true);
    if (squareButtonsOn) {
        removeTileButtons();
        createTileButtons();
    }
}
window.addEventListener("resize", (evt) => {
    // console.log("Resize(*)");
    resizeGrid();
});

// const setScale = () => {
//     console.log("setScale()");
//     const targetSize = 1000;
//     const currentSize = Math.min(
//         document.body.offsetWidth,
//         document.body.offsetHeight
//     );
//     console.log("currentSize: ", currentSize);
//     scale = currentSize / targetSize;
//     console.log("scale: ", scale);
// };
