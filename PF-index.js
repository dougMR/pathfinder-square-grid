// Store Entrance // Checkout
let entranceTile, checkoutTile;
// let startWP = getTileByIndices(42, 43);

// let endWP = getTileByIndices(25, 35);

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
    // canvas (#drawing-board) is set to 100% width and height
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
    // Generates and displays grid JSON data
    // gridOutput(JSON.stringify(grid));
    let colIndex = 0;
    let rowIndex = 0;
    let gridOutput = "";
    gridOutput += `gridData = {tileSize:${tileSize}, numRows: ${numRows}, numColumns: ${numColumns}, grid:[`;
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
let startTile, endTile;
let setObstaclesOn = false;
let marqueeOn = false;
const obstacleButtons = [];
// obstacleButtons just means tileButtons RENAME
let dragging = false;
let addingObstacles = true;
let tileButtonsOn = false;
let outputOpen = false;
let settingWaypoints = false;
const waypoints = [];
const paths = [];

// END HTML BUTTON FUNCTIONS
// let granularity = 50;
const startNumColumns = 80;
let tileSize = canvas.offsetWidth / startNumColumns;
let numRows, numColumns;
function init() {
    console.log("init()");

    setCanvasDimensions();
    numColumns = Math.floor(canvas.offsetWidth / tileSize);
    numRows = Math.floor(canvas.offsetHeight / tileSize);
    tileSize = Math.round(canvas.offsetWidth / numColumns);
    // grid = buildGrid(numColumns, numRows);
    // grid = buildGridFromData(gridData);
    grid = buildGridFromData(jamesStGridData);
    setNeighbors(grid);
    const diagonal = Math.sqrt(tileSize * tileSize + tileSize * tileSize);
    console.log("diagonal ratio: ", (diagonal - tileSize) / tileSize);
    // console.log(grid[17][5].neighbors[1] === null);
    console.log(
        "height calc: ",
        canvas.offsetHeight,
        tileSize,
        canvas.offsetHeight / tileSize
    );
    resizeGrid();
    makeCanvasHandlers();
    // createLookupForCurrentMap();
    console.log(
        `All to All: ${getLengthOfAllToAll(grid.length).toLocaleString(
            "en",
            "US"
        )} ways...`
    );
}

const makeCanvasHandlers = () => {
    const startTouchCanvas = (evt) => {
        // console.log('startTouchCanvas: ', evt);
        const mouseXY = getMouseXY(evt);
        const thisTile = getTileByCoordinates(mouseXY.x, mouseXY.y);
        // Setting Item location
        if (settingItemLocation) {
            if (itemInput.value != "") setItemLocation(thisTile);
            return;
        }
        // Setting Waypoint
        if (settingWaypoints && !thisTile.obstacle) {
            setWaypoint(thisTile);
            return;
        }
        // Start Drag
        dragging = true;
        startDragPos = mouseXY;

        startDragTile = thisTile;
        if (marqueeOn) {
            // Show marquee
            marqueeDiv.classList.add("on");
        } else if (setObstaclesOn) {
            console.log("startTouchCanvas, tile: ", thisTile);
            toggleObstacle(thisTile);
            addingObstacles = thisTile.obstacle;
        } else {
            // Draw Path if !setObstaclesOn && !marqueeOn
            maybeDrawPath(thisTile);
        }
    };
    const moveOverCanvas = (evt) => {
        // TODO: Move a lot into drag() function
        mousePos = getMouseXY(evt);
        const thisTile = getTileByCoordinates(mousePos.x, mousePos.y);
        if (dragging) {
            if (marqueeOn) {
                drawMarquee();

                currentDragTile = thisTile;
            } else if (setObstaclesOn) {
                setObstacle(thisTile, addingObstacles);
            }
        }
    };
    const endTouchCanvas = (evt) => {
        dragging = false;
        if (marqueeOn) {
            marqueeDiv.classList.remove("on");
            toggleMarqueedTiles();
        }
    };
    // Start touch
    canvas.addEventListener("pointerdown", startTouchCanvas);
    // canvas.addEventListener("mousedown", startTouchCanvas);
    // Move
    canvas.addEventListener("pointermove", moveOverCanvas);
    // canvas.addEventListener("mousemove",moveOverCanvas)
    // End touch
    canvas.addEventListener("pointerup", endTouchCanvas);
    // canvas.addEventListener("mouseup",endTouchCanvas);
};

window.addEventListener("load", (evt) => {
    // after everything on page is loaded and parsed
    console.log("document loaded");
    init();
});
const resizeGrid = () => {
    setCanvasDimensions();
    recalcTileSize();
    redrawGrid(true);
    if (tileButtonsOn) {
        removeTileButtons();
        createTileButtons();
    }
};
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
