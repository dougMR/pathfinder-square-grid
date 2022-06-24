/* GRID INTERACTION */

const drawTile = (tile) => {
    // const x = tileSize * tile.col + tileSize * 0.5;
    // const y = tileSize * tile.row + tileSize * 0.5;
    let x, y;
    ({ x, y } = getTileCenterOnCanvas(tile));

    drawTileOnCanvas(tile);

    // // Draw center dot
    // ctx.beginPath();
    // const radius = tileSize * 0.1;
    // ctx.arc(x, y, radius, 0, 2 * Math.PI);
    // ctx.fillStyle = "yellow";
    // ctx.fill();

    // Draw coordinate
    const xyString = `${tile.col}, ${tile.row}`;
    const textSize = ctx.measureText(xyString);
    ctx.font = `${tileSize * 0.3}px sans-serif`;
    ctx.fillStyle = tile.obstacle ? "white" : "black";
    ctx.fillText(xyString, x - textSize.width / 2, y + 3);
};

const getTileByIndices = (colIndex, rowIndex) => {
    // ?? Any reason for this function, when we can just get it directly from grid[colIndex][rowIndex]?
    return grid[colIndex][rowIndex];
};

const getTileByCoordinates = (x, y) => {
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);
    return getTileByIndices(col, row);
};

const getNeighborTiles = (tile) => {
    // 0 - 7 clockwise, starting above
    const x = tile.col;
    const y = tile.row;
    const neighbors = [];
    const add = (col, row) => {
        if (col < 0 || col >= grid.length || row < 0 || row >= numRows) {
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
            // Create Tiles
            const tile = {
                // size,
                // diagonal,
                col,
                row,
                neighbors: [],
                obstacle: false,
                endSegment: null,
            };
            grid[col].push(tile);
            drawTile(tile);
        }
    }
    return grid;
};

const recalcTileSize = () => {
    tileSize = canvas.offsetWidth / numColumns;
};

const getTileCenterOnCanvas = (tile) => {
    const x = tileSize * tile.col + tileSize * 0.5;
    const y = tileSize * tile.row + tileSize * 0.5;
    return { x, y };
};

const buildGridFromData = (gridData) => {
    const grid = [];
    // const tileSize = gridData.tileSize;
    numColumns = gridData.numColumns;
    numRows = gridData.numRows;
    // tileSize = canvas.offsetWidth / numCols;
    recalcTileSize();
    // console.log('tileSize: ',tileSize);
    // console.log("data.grid.length: ",gridData.grid.length);
    for (let col = 0; col < gridData.grid.length; col++) {
        grid.push([]);
        // console.log("col.length: ",gridData.grid[col].length);
        // console.log('col: ',col);
        for (let row = 0; row < gridData.grid[col].length; row++) {
            // Create Tiles
            const tile = {
                size: tileSize,
                // diagonal,
                col,
                row,
                neighbors: [], // data has neighbors array, but let's recalculate that for now
                obstacle: gridData.grid[col][row].obstacle,
                endSegment: null,
            };

            grid[col].push(tile);
            drawTile(tile);
            // console.log('row: ',row);
            // console.log('grid['+col+']: ',grid[col]);
        }
    }
    return grid;
};

const setNeighbors = (grid) => {
    // Set Neighbors for each Tile
    // Grid must be built befoe we can call this
    for (const col of grid) {
        for (const tile of col) {
            // Get Neighbors
            tile.neighbors = getNeighborTiles(tile);
        }
    }
};

function drawTileOnCanvas(tile) {
    const half = tileSize * 0.5;
    let x = tile.col * tileSize + half;
    let y = tile.row * tileSize + half;
    ctx.beginPath();
    ctx.moveTo(x - half, y - half);
    ctx.lineTo(x + half, y - half);
    ctx.lineTo(x + half, y + half);
    ctx.lineTo(x - half, y + half);
    ctx.lineTo(x - half, y - half);

    ctx.closePath();
    // Draw Obstacle
    if (tile.obstacle) {
        // Draw Fill
        ctx.fillStyle = "#555";
        ctx.fill();
    }
    // Draw Stroke
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.lineWidth = Math.min(tileSize * 0.1, "0.25");
    ctx.stroke();

    if (!tile.obstacle) {
        // Draw same stroke, offset in contrasting color
        ctx.beginPath();
        x += ctx.lineWidth;
        y += ctx.lineWidth;
        ctx.moveTo(x - half, y - half);
        ctx.lineTo(x + half, y - half);
        ctx.lineTo(x + half, y + half);
        ctx.lineTo(x - half, y + half);
        ctx.lineTo(x - half, y - half);
        ctx.closePath();
        ctx.strokeStyle = "white";
        ctx.stroke();
    }
}

function redrawGrid(keepPaths = false) {
    // Re-draws grid
    console.log("redrawGrid(" + keepPaths + ")");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const col of grid) {
        for (const tile of col) {
            drawTile(tile);
            if (keepPaths && tile.endSegment) {
                console.log(tile.endSegment);
                drawSegment(
                    tile.endSegment.fromTile,
                    tile.endSegment.toTile
                );
            } else {
                tile.endSegment = null;
            }
        }
    }
    if (keepPaths) {
        console.log("paths.length", paths.length);
        for (const path of paths) {
            drawPath(path);
        }
    }
    // for (let col = 0; col < numColumns - 1; col++) {
    //     for (let row = 0; row < numRows - 1; row++) {
    //         drawTileOnCanvas(grid[col][row]);
    //     }
    // }
}

/* END GRID FUNCTIONS */
