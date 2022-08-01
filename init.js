console.log("hello from init.js");

function init() {
    console.log("init()");
    // numColumns = Math.floor(mapCanvas.offsetWidth / tileSize);
    // numRows = Math.floor(mapCanvas.offsetHeight / tileSize);
    // tileSize = Math.round(mapCanvas.offsetWidth / numColumns);
    // grid = buildGrid(numColumns, numRows);
    // grid = buildGridFromData(gridData);

    buildGridFromData(currentStore);
    grid = currentStore.grid;
    // grid = buildGridFromData(currentStore);
    setNeighbors(grid);
    const diagonal = Math.sqrt(tileSize * tileSize + tileSize * tileSize);
    console.log("diagonal ratio: ", (diagonal - tileSize) / tileSize);
    // console.log(grid[17][5].neighbors[1] === null);
    initMap();
    console.log('mapW vs imgW: ',mapCanvas.offsetWidth,mapImg.offsetWidth);
    
    tileSize = mapCanvas.offsetWidth / grid.length;
    console.log('numColumns: ',grid.length, ' vs ',mapImg.offsetWidth / tileSize);
    console.log(
        "height calc: ",
        mapCanvas.offsetHeight,
        tileSize,
        `rows: ${mapCanvas.offsetHeight / tileSize}`
    );
    console.log('numRows: ',grid[0].length);
    makeMapCanvasHandlers();
    // createLookupForCurrentMap();
    console.log(
        `All to All: ${getLengthOfAllToAll(grid.length * grid[0].length).toLocaleString(
            "en",
            "US"
        )} ways...`
    );
}

window.addEventListener("load", (evt) => {
    // after everything on page is loaded and parsed
    console.log("document loaded");
    init();
});


window.addEventListener("resize", (evt) => {
    // set map-holder height equal to its width
    mapHolder.style.height = `${mapHolder.offsetWidth}px`;
    resizeMap();
});