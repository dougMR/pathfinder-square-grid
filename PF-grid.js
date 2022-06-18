/* GRID INTERACTION */

const drawSquare = (square) => {
    // const x = squareSize * square.col + squareSize * 0.5;
    // const y = squareSize * square.row + squareSize * 0.5;
    let x,y;
    ({x,y} = getSquareCenterOnCanvas(square));

    drawSquareOnCanvas(square);

    // // Draw center dot
    // ctx.beginPath();
    // const radius = squareSize * 0.1;
    // ctx.arc(x, y, radius, 0, 2 * Math.PI);
    // ctx.fillStyle = "yellow";
    // ctx.fill();

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

const getSquareByCoordinates = (x,y) => {
    const col = Math.floor(x / squareSize);
    const row = Math.floor(y / squareSize);
    return getSquareByIndices(col,row);
}

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
            row >= numRows
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

const buildGrid = (numColumns, numRows) => {
    // console.log("buildGrid()");
    const grid = [];
    numRows = numRows;
    numColumns = numColumns;
    // const diagonal = Math.sqrt(size * size + size * size);
    for (let col = 0; col < numColumns; col++) {
        grid.push([]);
        for (let row = 0; row < numRows; row++) {
            // Create Squares
            const square = {
                // size,
                // diagonal,
                col,
                row,
                neighbors: [],
                obstacle: false,
                endSegment: null,
            };
            grid[col].push(square);
            drawSquare(square);
        }
    }
    return grid;
};

const recalcSquareSize = () => {
    squareSize = canvas.offsetWidth / numColumns;
}

const getSquareCenterOnCanvas = (square) => {
    const x = squareSize * square.col + squareSize * 0.5;
    const y = squareSize * square.row + squareSize * 0.5;
    return { x, y };
};

const buildGridFromData = (gridData) => {
    const grid = [];
    // const squareSize = gridData.squareSize;
    numColumns = gridData.numColumns;
    numRows = gridData.numRows;
    // squareSize = canvas.offsetWidth / numCols;
    recalcSquareSize();
    // console.log('squareSize: ',squareSize);
    // console.log("data.grid.length: ",gridData.grid.length);
    for (let col = 0; col < gridData.grid.length; col++) {
        grid.push([]);
        // console.log("col.length: ",gridData.grid[col].length);
        // console.log('col: ',col);
        for (let row = 0; row < gridData.grid[col].length; row++) {
            // Create Squares
            const square = {
                size: squareSize,
                // diagonal,
                col,
                row,
                neighbors: [], // data has neighbors array, but let's recalculate that for now
                obstacle: gridData.grid[col][row].obstacle,
                endSegment: null,
            };
            
            grid[col].push(square);
            drawSquare(square);
            // console.log('row: ',row);
            // console.log('grid['+col+']: ',grid[col]);
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
    const half = squareSize * 0.5;
    let x = square.col * squareSize + half;
    let y = square.row * squareSize + half;
    ctx.beginPath();
    ctx.moveTo(x - half, y - half);
    ctx.lineTo(x + half, y - half);
    ctx.lineTo(x + half, y + half);
    ctx.lineTo(x - half, y + half);
    ctx.lineTo(x - half, y - half);

    ctx.closePath();
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.lineWidth = Math.min(squareSize * 0.1, "0.25");
    ctx.stroke();

    // Draw same, offset in contrasting color
    ctx.beginPath();
    x+=ctx.lineWidth;
    y+=ctx.lineWidth;
    ctx.moveTo(x - half, y - half);
    ctx.lineTo(x + half, y - half);
    ctx.lineTo(x + half, y + half);
    ctx.lineTo(x - half, y + half);
    ctx.lineTo(x - half, y - half);
    ctx.closePath();
    ctx.strokeStyle = "white";
    ctx.stroke();
}

function redrawGrid(keepPaths = false) {
    // Re-draws grid
    console.log('redrawGrid('+keepPaths+')');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const col of grid) {
        for (const square of col) {
            drawSquare(square);
            if(keepPaths && square.endSegment){
                console.log(square.endSegment);
                drawSegment(square.endSegment.fromSquare, square.endSegment.toSquare);
            }else{
                square.endSegment = null;
            }
        }
    }
    if(keepPaths){
        console.log('paths.length',paths.length);
        for (const path of paths) {
            drawPath(path);
        }
    }
    // for (let col = 0; col < numColumns - 1; col++) {
    //     for (let row = 0; row < numRows - 1; row++) {
    //         drawSquareOnCanvas(grid[col][row]);
    //     }
    // }
}

/* END GRID FUNCTIONS */
