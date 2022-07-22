console.log("hello from index.js");

// 
// Each map needs its own startWP and endWP
// 
// let startWP = getTileByIndices(42, 43);

// let endWP = getTileByIndices(25, 35);


const mapCanvas = document.getElementById("drawing-board");
const ctx = mapCanvas.getContext("2d");
let grid;
let scale = 1;
console.log("mapCanvas.offsetHeight: ", mapCanvas.offsetHeight);

const marqueeDiv = document.querySelector("#marquee");



const degToRad = (degree) => {
    return (Math.PI / 180) * degree;
};




// const setCanvasDimensions = () => {
//     // mapCanvas (#drawing-board) is set to 100% width and height
//     const w = mapCanvas.offsetWidth;
//     const h = mapCanvas.offsetHeight;
//     mapCanvas.setAttribute("width", w);
//     mapCanvas.setAttribute("height", h);
// };

const getDiagonalSize = (size) => {
    return Math.sqrt(size * size + size * size);
};



/* BUTTON FUNCTIONS */

// HTML BUTTON FUNCTIONS
const outputDiv = document.querySelector("#output");

const makeObstaclesButton = document.querySelector("#make-obstacles");
const marqueeButton = document.querySelector("#marquee-button");
const gridButtonsHolderDiv = document.querySelector("#tile-buttons-holder");
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
let tileSize = mapCanvas.offsetWidth / startNumColumns;
let numRows, numColumns;


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
