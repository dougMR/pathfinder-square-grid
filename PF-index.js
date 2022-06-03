console.log("hello from pathfinding.js");
const canvas = document.getElementById("drawing-board");
const ctx = canvas.getContext("2d");
let grid;
let scale = 1;
console.log('canvas.offsetHeight: ', canvas.offsetHeight);

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
    gridOutput += `gridData = {squareSize:${squareSize}, numRows: ${grid["numRows"]}, numColumns: ${grid["numColumns"]}, grid:[`;
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
const obstacleButtons = [];
const makeObstaclesButton = document.querySelector("#make-obstacles");
let startSquare, endSquare;
let makeObstaclesOn = false;
let dragging = false;
let addingObstacles = true;
let squareButtonsOn = false;
let outputOpen = false;
let settingWaypoints = false;
const waypoints = [];
const paths = [];

const rebuildBoard = (evt) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    removeTileButtons();
    const cols = Math.floor(canvas.offsetWidth / squareSize);
    const rows = Math.floor(canvas.offsetHeight / squareSize);
    grid = buildGrid(cols, rows, squareSize);
    setNeighbors(grid);
}
const startSetWaypoints = (evt) => {
    // called by button in HTML
    // Doubles as Draw Paths button
    settingWaypoints = !settingWaypoints;
    evt.target.innerHTML = settingWaypoints ? "DRAW PATH" : "SET WAYPOINTS";
    if (settingWaypoints) {
        // Set Waypoints mode
        // Start setting waypoints
        paths.length = 0;
        waypoints.length = 0;
        if (makeObstaclesOn && settingWaypoints) {
            // Turn off makeObstacles
            toggleMakeObstacles();
        }
    } else {
        // Draw Path mode
        // Draw Path between waypoints
        if (waypoints.length > 1) {
            console.log("waypoints: ", waypoints);
            // order waypoints from first to closest to closest to closest...
            const orderedWPs = orderByClosest(waypoints);
            // Need at least 2 waypoints to draw path
            console.log("orderedWaypoints: ", orderedWPs);
            for (let wp = 0; wp < orderedWPs.length - 1; wp++) {
                console.log("wp index: ", wp);
                console.log(
                    "orderedWPs[wp].mySquare: ",
                    orderedWPs[wp].mySquare
                );
                console.log(
                    "orderedWPs[wp + 1].mySquare: ",
                    orderedWPs[wp + 1].mySquare
                );
                const path = drawPathAtoB(
                    orderedWPs[wp].mySquare,
                    orderedWPs[wp + 1].mySquare
                );
                if (path) {
                    paths.push(path);
                    // clearPaths();
                }
                orderedWPs[wp].innerHTML = wp;
                if(wp === orderedWPs.length-2){
                    orderedWPs[wp+1].innerHTML = wp+1;
                }
            }
            console.log("orderedWPs.length: ", orderedWPs.length);
            // Draw all the paths between waypoints
            for (const path of paths) {
                drawPath(path);
            }
            // Hide Waypoints
            // for(const wp of waypoints){
            //     wp.classList.remove('waypoint');
            // }
        }
    }
};
const setWaypoint = (tileButton) => {
    // Set Tilebutton color
    tileButton.classList.add("waypoint");
    waypoints.push(tileButton);
};
const toggleOutput = (evt) => {
    outputOpen = !outputOpen;
    const outputHolder = document.querySelector("#output-container");
    outputHolder.classList.toggle("open");
    document.querySelector("#copy-output-button").classList.toggle("open");
    evt.target.innerText = outputOpen ? "CLOSE OUTPUT" : "OPEN OUTPUT";
    if (outputOpen) {
        generateGridOutput();
    } else {
        output("");
    }
};
const copyOutput = (evt) => {
    /* Copy the text inside the text field */
    navigator.clipboard.writeText(outputDiv.innerText);
};
const toggleMakeObstacles = () => {
    makeObstaclesOn = !makeObstaclesOn;
    makeObstaclesButton.classList.toggle("make-obstacles-on");
    if (makeObstaclesOn && !squareButtonsOn) {
        createTileButtons();
    }
};
const maybeDrawPath = (square) => {
    if (!startSquare) {
        // first square clicked
        startSquare = square;
    } else if (!endSquare) {
        endSquare = square;
        drawPathAtoB(startSquare, square);
        startSquare = endSquare = null;
    }
};
const makeTileButton = (square) => {
    const newButton = document.createElement("button");
    newButton.classList.add("square-button");
    newButton.style.height = newButton.style.width = `${square.size}px`;
    newButton.style.marginTop = newButton.style.marginLeft = `${
        0 - square.size * 0.5
    }px`;
    const center = getSquareCenterOnCanvas(square);
    newButton.style.left = center.x + "px";
    newButton.style.top = center.y + "px";
    newButton.mySquare = square;
    if (square.obstacle) {
        newButton.classList.add("obstacle");
    }
    document.getElementById("canvas-holder").appendChild(newButton);

    newButton.addEventListener("mousedown", (evt) => {
        console.log('MY SQUARE: ',evt.target.mySquare.col,', ',evt.target.mySquare.row);
        console.log("OCCUPIED: ",evt.target.mySquare.obstacle);
        if (settingWaypoints && !evt.target.mySquare.obstacle) {
            setWaypoint(evt.target);
            return;
        }
        dragging = makeObstaclesOn;
        if (makeObstaclesOn) {
            toggleObstacle(evt.target);
        } else {
            // Draw Path if !makeObstaclesOn
            maybeDrawPath(evt.target.mySquare);
        }
    });
    newButton.addEventListener("mousemove", (evt) => {
        if (dragging) {
            // console.log('dragTarget: ',evt.target);
            if (makeObstaclesOn) {
                // console.log('move target: ',evt.target);
                setObstacle(evt.target.mySquare, addingObstacles);
                if (addingObstacles) {
                    evt.target.classList.add("obstacle");
                } else {
                    evt.target.classList.remove("obstacle");
                }
            }
        }
    });
    newButton.addEventListener("mouseup", (evt) => {
        dragging = false;
        addingObstacles = true;
    });
    obstacleButtons.push(newButton);
};
const toggleTileButtons = (onOrOff) => {
    if (obstacleButtons.length > 0) {
        removeTileButtons();
        return;
    }
    createTileButtons();
};
const removeTileButtons = () => {
    for (const button of obstacleButtons) {
        button.remove();
    }
    obstacleButtons.length = 0;
    squareButtonsOn = true;
    if (makeObstaclesOn) {
        toggleMakeObstacles();
    }
};
const createTileButtons = () => {
    // first make sure they don't already exist
    if (obstacleButtons.length === 0) {
        for (const col of grid) {
            for (const square of col) {
                makeTileButton(square);
            }
        }
    }
    squareButtonsOn = true;
};
const toggleObstacle = (tileButton) => {
    console.log("toggleObstacle()");
    const square = tileButton.mySquare;
    square.obstacle = !square.obstacle;
    if (square.obstacle) {
        tileButton.classList.add("obstacle");
        addingObstacles = true;
    } else {
        tileButton.classList.remove("obstacle");
        addingObstacles = false;
    }
    // toggle square's obstacle property
    setObstacle(square, !square.obstacle);
};
const setObstacle = (square, isOn = true) => {
    square.obstacle = isOn;
};
const buttonFindPath = () => {
    alert("click two squarees");
    // clearPaths();
    createTileButtons();
};

// END HTML BUTTON FUNCTIONS

let squareSize = 20;
function init() {
    console.log("init()");
    
    setCanvasDimensions();
    const cols = Math.floor(canvas.offsetWidth / squareSize);
    const rows = Math.floor(canvas.offsetHeight / squareSize);
    // squareSize = Math.round(canvas.offsetWidth / cols);
    grid = buildGrid(cols, rows, squareSize);
    // grid = buildGridFromData(gridData);
    setNeighbors(grid);
    const diagonal = Math.sqrt(
        squareSize * squareSize + squareSize * squareSize
    );
    console.log("diagonal ratio: ", (diagonal - squareSize) / squareSize);
    // console.log(grid[17][5].neighbors[1] === null);
    console.log('height calc: ',
        canvas.offsetHeight,
        squareSize,
        canvas.offsetHeight / squareSize
    );
    // const mySeg = getSegment(grid[1][1], grid[1][2]);
    // mySeg.draw();
    // const myPath = findPathFromAtoB(
    //     grid[2][2],
    //     grid[Math.floor(cols / 2)][Math.floor(rows / 2)]
    // );
    // drawPath(myPath);
    // window.addEventListener('resize',(evt)=>{
    //     setScale();
    // });
    // setScale();
}

window.addEventListener('load',(evt)=>{
    // after everything on page is loaded and parsed
    console.log("document loaded");
    init();
});

const setScale = () => {
    console.log("setScale()");
    const targetSize = 1000;
    const currentSize = Math.min(document.body.offsetWidth,document.body.offsetHeight);
    console.log('currentSize: ',currentSize);
    scale = currentSize / targetSize;
    console.log('scale: ',scale);
    // document.querySelector("#canvas-holder").style.transform = `scale(${scale})`;
    // document.querySelector("#canvas-holder").style.borderColor = `yellow`;
    // transform: scale(1);
}