let startDragPos = { x: 0, y: 0 },
    endDragPos = { x: 0, y: 0 };
let startDragTile = null;
let currentDragTile = null;
let endDragTile = null;

// while dragging, update current tiles
const getMarqueedTiles = () => {
    console.log('getMarqueedTiles()');
    const minCol = Math.min(startDragTile.col, currentDragTile.col);
    const minRow = Math.min(startDragTile.row, currentDragTile.row);
    const maxCol = Math.max(startDragTile.col, currentDragTile.col);
    const maxRow = Math.max(startDragTile.row, currentDragTile.row);
    // console.log(`minCol, maxCol, minRow, maxRow: ${minCol}, ${maxCol}, ${minRow}, ${maxRow}`);

    const marqueedTiles = [];
    for (let col = minCol; col <= maxCol; col++) {
        for (let row = minRow; row <= maxRow; row++) {
            marqueedTiles.push(getSquareByIndices(col, row));
        }
    }
    console.log('getMarqueedTiles.length',marqueedTiles.length);
    return marqueedTiles;
};

const toggleMarqueedTiles = () => {
    console.log('toggleMarqueedTiles()');
    for(const tile of getMarqueedTiles()){
        console.log('tile: ',tile);
        const tileButton = getTileButtonByIndices(tile.col,tile.row);
        setObstacle(tile);
        if (addingObstacles) {
            tileButton.classList.add("obstacle");
        } else {
            tileButton.classList.remove("obstacle");
        }
    }
}

const drawMarquee = () => {
    const startX = Math.min(startDragPos.x, mousePos.x);
    const startY = Math.min(startDragPos.y, mousePos.y);
    const endX = Math.max(startDragPos.x, mousePos.x);
    const endY = Math.max(startDragPos.y, mousePos.y);
    marqueeDiv.style.left = startX + "px";
    marqueeDiv.style.top = startY + "px";
    marqueeDiv.style.width = `${endX - startX}px`;
    marqueeDiv.style.height = `${endY - startY}px`;
};

const toggleMarquee = (evt) => {
    marqueeOn = !marqueeOn;
    marqueeButton.classList.toggle("on");
    if (marqueeOn && !squareButtonsOn) {
        createTileButtons();
    }
};