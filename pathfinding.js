const canvas = document.getElementById("drawing-board");
const ctx = canvas.getContext("2d");
let grid;

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

const drawSquare = (square) => {
    const x = square.size * square.col + square.size * 0.5;
    const y = square.size * square.row + square.size * 0.5;

    drawSquareOnCanvas(square);

    // Draw center dot
    ctx.beginPath();
    const radius = squareSize * 0.1;
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "yellow";
    ctx.fill();

    // Draw coordinate
    const xyString = `${square.col}, ${square.row}`;
    const textSize = ctx.measureText(xyString);
    ctx.font = `${squareSize * 0.3}px sans-serif`;
    ctx.fillStyle = "black";
    ctx.fillText(xyString, x - textSize.width / 2, y + 3);
};

const getSquareByIndices = (colIndex, rowIndex) => {
    // ?? Any reason for this function, when we can just get it directly from grid[colIndex][rowIndex]?
    return grid[colIndex][rowIndex];
};

const getNeighborSquares = (square) => {
    // 0 - 7 clockwise, starting above
    const x = square.col;
    const y = square.row;
    const neighbors = [];
    const add = (col, row) => {
        if (
            col < 0 ||
            col >= grid.length ||
            row < 0 ||
            row >= grid["numRows"]
        ) {
            neighbors.push(null);
        } else {
            neighbors.push(grid[col][row]);
        }
    };
    // Above (0)
    add(x, y - 1);
    // Top Right (1)
    add(x + 1, y - 1);
    // Right (2)
    add(x + 1, y);
    // Bottom Right (3)
    add(x + 1, y + 1);
    // Bottom (4)
    add(x, y + 1);
    // Bottom Left (5)
    add(x - 1, y + 1);
    // Left (6)
    add(x - 1, y);
    // Top Left(7)
    add(x - 1, y - 1);
    return neighbors;
};

const buildGrid = (numColumns, numRows, size) => {
    // console.log("buildGrid()");
    const grid = [];
    grid["numRows"] = numRows;
    grid["numColumns"] = numColumns;
    const diagonal = Math.sqrt(size * size + size * size);
    for (let col = 0; col < numColumns; col++) {
        grid.push([]);
        for (let row = 0; row < numRows; row++) {
            // Create Squares
            const square = {
                size,
                diagonal,
                col,
                row,
                neighbors: [],
                occupied: false,
            };
            grid[col].push(square);
            drawSquare(square);
        }
    }
    return grid;
};

const setNeighbors = (grid) => {
    // Set Neighbors for each Square
    // Grid must be built befoe we can call this
    for (const col of grid) {
        for (const square of col) {
            // Get Neighbors
            square.neighbors = getNeighborSquares(square);
        }
    }
};

function drawSquareOnCanvas(square) {
    const half = square.size * 0.5;
    const x = square.col * square.size + half;
    const y = square.row * square.size + half;
    ctx.beginPath();
    ctx.moveTo(x - half, y - half);
    ctx.lineTo(x + half, y - half);
    ctx.lineTo(x + half, y + half);
    ctx.lineTo(x - half, y + half);
    ctx.lineTo(x - half, y - half);

    ctx.closePath();
    ctx.strokeStyle = "rgba(50,50,50,0.5)";
    ctx.lineWidth = Math.min(squareSize * 0.1, "0.5");
    ctx.stroke();
}

function drawGrid(cols, rows) {
    for (let col = 0; col < cols - 1; col++) {
        for (let row = 0; row < rows - 1; row++) {
            drawSquareOnCanvas(grid[col][row]);
        }
    }
}

/* PATHFINDING */

const findPathFromAtoB = (A, B) => {
    // Find Path from square A to square B
    // returns array of segments
    const allSegments = [];
    // Keep track of all the segments we put down last iteration
    const lastSegs = [getSegment(A, A)];
    // start from A, get segs to all neighbors
    A.occupied = true;
    let foundTarget = false;
    let iterations = 0;
    let noNewSegs = false;
    do {
        const newSegs = [];
        for (let segIndex = 0; segIndex < lastSegs.length; segIndex++) {
            // nextSeg from lastSegs
            const lastSeg = lastSegs[segIndex];
            console.log(
                "tile: ",
                lastSeg.toSquare.col,
                ", ",
                lastSeg.toSquare.row
            );
            // Branch out to Neighbors
            // Alternate clockwise/counter-clockwise,
            // because *maybe that makes for tighter zig-zags?
            const clockwise = segIndex % 2 === 0;
            // Look for Neighbors (n)
            for (let n = 0; n < lastSeg.toSquare.neighbors.length; n++) {
                const nextN = clockwise
                    ? n
                    : lastSeg.toSquare.neighbors.length - n - 1;
                nextNeighbor = lastSeg.toSquare.neighbors[nextN];
                if (
                    nextNeighbor != null &&
                    !nextNeighbor.occupied &&
                    !nextNeighbor.obstacle
                ) {
                    // Clear so far, but also check to
                    // prevent paths from going between corners of 2 diagonally adjacent squares
                    let notIllegalCorner = true;
                    let isCorner = false;
                    if (nextN % 2 === 1) {
                        isCorner = true;
                        console.log(`neighbor ${nextN} checkIllegalCorner`);
                        // It's a corner neighbor, get the neighbors just before ane after this neighbor

                        const neighbors = lastSeg.toSquare.neighbors;
                        const preN =
                            (nextN + neighbors.length - 1) % neighbors.length;
                        const postN = (nextN + 1) % neighbors.length;
                        const preNeighbor = neighbors[preN];
                        const postNeighbor = neighbors[postN];
                        // Is this empty corner between two occupied adjacent squares?
                        // If so, was either of them just occupied by segment from current tile?

                        // check that no segment crosses from preNeighbor to postNeighbor or vice versa
                        const preNeighborEndSeg = allSegments.find(
                            (segment) => segment.toSquare === preNeighbor
                        );
                        const postNeighborEndSeg = allSegments.find(
                            (segment) => segment.toSquare === postNeighbor
                        );
                        const notCrossedOver =
                            !preNeighborEndSeg ||
                            !postNeighborEndSeg ||
                            (preNeighborEndSeg.fromSquare !== postNeighbor &&
                                postNeighborEndSeg.fromSquare !== preNeighbor);
                        console.log(
                            "preNeighbor: ",
                            preNeighbor.col,
                            ", ",
                            preNeighbor.row
                        );
                        console.log(
                            "postNeighbor: ",
                            postNeighbor.col,
                            ", ",
                            postNeighbor.row
                        );
                        console.log("crossedOver: ", !notCrossedOver);
                        console.log(
                            "preNeighbor.occupied: ",
                            preNeighbor.occupied
                        );
                        console.log(
                            "postNeighbor.occupied: ",
                            postNeighbor.occupied
                        );

                        const preNoccupiedBySeg =
                            allSegments.find(
                                (segment) => segment.toSquare === preNeighbor
                            ) != undefined;
                        const postNoccupiedBySeg =
                            allSegments.find(
                                (segment) => segment.toSquare === postNeighbor
                            ) != undefined;
                        console.log("preNoccupiedBySeg: ", preNoccupiedBySeg);
                        console.log("postNoccupiedBySeg: ", postNoccupiedBySeg);
                        notIllegalCorner =
                            (notCrossedOver &&
                                (preNoccupiedBySeg || postNoccupiedBySeg)) ||
                            !preNeighbor.occupied ||
                            !postNeighbor.occupied;
                    }
                    if (notIllegalCorner) {
                        // create a new segment from lastSeg's end square to neighbor
                        const newSeg = getSegment(
                            lastSeg.toSquare,
                            nextNeighbor,
                            lastSeg
                        );
                        allSegments.push(newSeg);

                        // is nextNeighbor square B?
                        if (nextNeighbor === B) {
                            // Found Target!
                            foundTarget = true;
                            const fullPath = getFullPathFromEndSegment(newSeg);
                            return fullPath;
                        } else {
                            newSeg.draw("rgba(0,0,0,0.5");
                            nextNeighbor.occupied = true;

                            if (isCorner) {
                                newSegs.push(newSeg);
                            } else {
                                newSegs.unshift(newSeg);
                            }
                        }
                    }
                }
            }
            console.log(
                `   ==== neighbors for ${lastSeg.toSquare.col}, ${lastSeg.toSquare.row}`
            );
        }
        if (newSegs.length === 0) {
            noNewSegs = true;
            break;
        } else {
            console.log(">> lastSegs.length: ", lastSegs.length, " <<");

            lastSegs.length = 0;
            lastSegs.push(...newSegs);
        }
        iterations++;
    } while (!foundTarget && iterations < 2000 && !noNewSegs);
    // console.log("iterations: ", iterations);
};

const drawPathAtoB = (Atile, Btile) => {
    const myPath = findPathFromAtoB(Atile, Btile);
    if (!myPath) {
        console.log("Can't get there from here");
    } else {
        console.log("myPath: ", myPath.length);
        // clearPaths();
        drawPath(myPath);
    }
    return myPath;
};
const drawPath = (pathAr) => {
    for (const segment of pathAr) {
        segment.draw();
    }
};

const clearPaths = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const col of grid) {
        for (const square of col) {
            drawSquare(square);
            square.occupied = false;
        }
    }
};

/*
    PATH SEGMENT
*/
const getSquareCenterOnCanvas = (square) => {
    const x = square.size * square.col + square.size * 0.5;
    const y = square.size * square.row + square.size * 0.5;
    return { x, y };
};
const drawSegment = (square1, square2, color) => {
    console.log("drawSegment()");
    // Get square center on canvas
    const h0coord = getSquareCenterOnCanvas(square1);
    const h1coord = getSquareCenterOnCanvas(square2);
    ctx.beginPath();
    ctx.moveTo(h0coord.x, h0coord.y);
    ctx.lineTo(h1coord.x, h1coord.y);
    ctx.closePath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = color ? color : "yellow";
    ctx.stroke();
};
const getSegment = (square1, square2, parentSeg = null) => {
    const segment = {
        fromSquare: square1,
        toSquare: square2,
        draw: (color) => {
            drawSegment(square1, square2, color);
        },
        parentSeg,
    };
    return segment;
};
const getFullPathFromEndSegment = (endSeg) => {
    // console.log("findPathFromAtoB/getFullPathFromEndSegment()");
    const path = [endSeg];
    let parentSeg = endSeg.parentSeg;
    let tooMuch = 0;
    // console.log(endSeg);
    // console.log(`parentSeg: ${parentSeg}`);
    while (parentSeg != null && tooMuch < 1000) {
        path.unshift(parentSeg);
        parentSeg = parentSeg.parentSeg;

        // console.log("parentSeg", parentSeg);
        tooMuch++;
    }
    return path;
};

/*
    END PATH SEGMENT
*/

/* END PATHFINDING */

const output = (txt, add = false) => {
    const prevText = add ? outputDiv.innerHTML + "<br />" : "";
    outputDiv.innerHTML = prevText + txt;
};
const generateGridOutput = () => {
    // gridOutput(JSON.stringify(grid));
    let colIndex = 0;
    let rowIndex = 0;
    let gridOutput = "";
    gridOutput += `{{squareSize:${squareSize}},[`;
    for (const col of grid) {
        rowIndex = 0;
        gridOutput += `[<br />`;
        for (const tile of col) {
            gridOutput += `{
                col: ${colIndex},<br />
                row: ${rowIndex},<br />
                size: ${tile.size},<br />
                diagonal: ${tile.diagonal},<br />
                occupied: ${tile.occupied},<br />
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
        gridOutput += `],`;
        // End of Column
        colIndex++;
        gridOutput += "<br />";
    }
    gridOutput += `]`;
    // End of grid
    output(gridOutput);
};

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

const startSetWaypoints = (evt) => {
    // called by button in HTML
    settingWaypoints = !settingWaypoints;
    evt.target.innerHTML = settingWaypoints ? "DRAW PATH" : "SET WAYPOINTS";
    if (settingWaypoints) {
        // Set Waypoints mode
        // Start setting waypoints
        waypoints.length = 0;
        if (makeObstaclesOn && settingWaypoints) {
            // Turn off makeObstacles
            toggleMakeObstacles();
        }
    } else {
        // Draw Path mode
        // Draw Path between waypoints
        if (waypoints.length > 1) {
            // Need at least 2 waypoints to draw path
            for (let wp = 0; wp < waypoints.length - 1; wp++) {
                const path = drawPathAtoB(
                    waypoints[wp].mySquare,
                    waypoints[wp + 1].mySquare
                );
                if (path) {
                }
            }
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
        createSquareButtons();
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
const makeSquareButton = (square) => {
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
const toggleSquareButtons = (onOrOff) => {
    if (obstacleButtons.length > 0) {
        removeSquareButtons();
        return;
    }
    createSquareButtons();
};
const removeSquareButtons = () => {
    for (const button of obstacleButtons) {
        button.remove();
    }
    obstacleButtons.length = 0;
    squareButtonsOn = true;
    if (makeObstaclesOn) {
        toggleMakeObstacles();
    }
};
const createSquareButtons = () => {
    // first make sure they don't already exist
    if (obstacleButtons.length === 0) {
        for (const col of grid) {
            for (const square of col) {
                makeSquareButton(square);
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
    clearPaths();
    createSquareButtons();
};

// END HTML BUTTON FUNCTIONS

let squareSize = 50;
function init() {
    setCanvasDimensions();
    const cols = Math.floor(canvas.offsetWidth / squareSize);
    const rows = Math.floor(canvas.offsetHeight / squareSize);
    // squareSize = Math.round(canvas.offsetWidth / cols);
    grid = buildGrid(cols, rows, squareSize);
    setNeighbors(grid);
    // console.log(grid[17][5].neighbors[1] === null);
    console.log(
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
}

init();
