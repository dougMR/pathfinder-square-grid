const calculateDistanceTableButton = document.getElementById('create-distance-lookup');
calculateDistanceTableButton.addEventListener('pointerdown',evt=>{
    createLookupForCurrentMap();
});

const getLengthOfAllToAll = (numItems) => {
    numItems = numItems * numItems;
    let total = 0;
    for (let i = 0; i < numItems-1; i++) {
        for (let j = i + 1; j < numItems; j++) {
            total++;
        }
    }
    console.log('all-to-all for '+numItems+' items is '+total.toLocaleString("en","US"));
    return total;
}
getLengthOfAllToAll(12);


const tileDistTable = [];
const tilesList = [];
const createLookupForCurrentMap = () => {
    console.log('createLookupDistTable()');
    console.log(`All to All: ${getLengthOfAllToAll(grid.length)} ways...`);
    // grid, numColunms, numRows are all root-level vars
    // grid is grid[col][row]
    // probably possible with nested array,
    // but easier for me with shallow array,
    // so make a 'tiles' array from grid

    for (let c = 0; c < grid.length; c++) {
        for (let r = 0; r < grid[0].length; r++) {
            tilesList.push(grid[c][r]);
        }
    }
    // get dist from every tile to every other tile
    for (let tA = 0; tA < tilesList.length - 1; tA++) {
        tileDistTable[tA] = [];
        for (let tB = tA + 1; tB < tilesList.length; tB++) {
            if (tilesList[tA].obstacle || tilesList[tB].obstacle) {
                // No Path
                tileDistTable[tA][tB] = null;
            } else {
                const path = findPathFromAtoB(tilesList[tA], tilesList[tB]);
                // const path = null;
                // console.log("path: ", path);
                dist = path === null ? null : getPathDistance(path);
                tileDistTable[tA][tB] = dist;
            }
            // console.log('tileDistTable ',tA,tB,':',tileDistTable[tA][tB]);
        }
    }
    console.log('distTable: ',tileDistTable);
};
const sortTilesByPositionInDistTable = (A, B) => {
    if (A.col > B.col) {
        // put A after B
        return 1;
    } else if (A.col < B.col) {
        // keep A before B
        return -1;
    } else {
        // same col
        if (A.row > B.row) {
            // put A after B
            return 1;
        } else {
            // keep A before B
            return -1;
        }
    }
};
const lookupDistance = (tileA, tileB) => {
    // lookup from earlier tile to later tile
    // console.log('lookupDistance()');
    // console.log('tielA: ',tileA);
    // console.log('tileB: ',tileB);
    // console.log('indexes A B: ',tilesList.indexOf(tileA),tilesList.indexOf(tileB));
    const tiles = [tileA, tileB];
    tiles.sort(sortTilesByPositionInDistTable);
    const indexA = tilesList.indexOf(tiles[0]);
    const indexB = tilesList.indexOf(tiles[1]);
    // console.log('index A B: ',indexA, indexB);
    // console.log('tileDistTable.length: ',tileDistTable.length);
    // console.log('tileDistTable['+indexA+']: ', tileDistTable[indexA]);
    return tileDistTable[indexA][indexB];
};
