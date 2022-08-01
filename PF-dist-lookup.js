console.log("hello from PF-dist-lookup.js");
const calculateDistanceTableButton = document.getElementById(
    "create-distance-lookup"
);
// In Button For Testing, not yet part of app
calculateDistanceTableButton.addEventListener("pointerdown", (evt) => {
    createLookupForCurrentMap();
});

const getLengthOfAllToAll = (numItems) => {
    console.log("getLengthOfAllToAll(" + numItems + ")");
    // numItems = Math.min(numItems, 3000);
    // numItems = numItems * numItems;
    // const startMeasure = performance.now();
    let total = 0;
    for (let i = 0; i < numItems - 1; i++) {
        for (let j = i + 1; j < numItems; j++) {
            total++;
        }
    }
    console.log(
        "all-to-all for " +
            numItems +
            " items is " +
            total.toLocaleString("en", "US")
    );
    // console.log(`${numItems}! = ${factorialize(numItems)}`);
    // const endMeasure = performance.now();
    // console.log(`Calculating all-to-all took ${(endMeasure - startMeasure).toLocaleString("en","us")} milliseconds`);
    return total;
};
getLengthOfAllToAll(14);

const tileDistTable = [];
const tilesList = [];
const createLookupForCurrentMap = () => {
    const startCreateLookup = performance.now();
    const grid = currentStore.grid;
    console.log("createLookupDistTable()");
    console.log(
        `All to All: ${getLengthOfAllToAll(
            grid.length * grid[0].length
        ).toLocaleString("en", "US")} ways...`
    );

    // grid, numColunms, numRows are all root-level vars
    // grid is grid[col][row]
    // probably possible with nested array,
    // but easier for me with shallow array,
    // so make a 'tiles' array from grid
    
    for (let col = 0; col < grid.length; col++) {
        for (let row = 0; row < grid[0].length; row++) {
            tilesList.push(grid[col][row]);
        }
    }
    
    // console.log(`tileList built. ${tilesList.length} tiles.`);
    let counter = 0;
    let pathTime = 0;
    // get dist from every tile to every other tile
    for (let tA = 0; tA < tilesList.length - 1; tA++) {
        tileDistTable[tA] = [];
        // var startTime = performance.now();
        for (let tB = tA + 1; tB < tilesList.length; tB++) {
            if (tilesList[tA].obstacle || tilesList[tB].obstacle) {
                // No Path
                tileDistTable[tA][tB] = null;
            } else {
                const findPathStart = performance.now();
                const path = findPathFromAtoB(tilesList[tA], tilesList[tB]);
                dist = path === null ? null : getPathDistance(path);
                tileDistTable[tA][tB] = dist;
                pathTime += performance.now() - findPathStart;
                counter++;
            }
            
            // console.log('tileDistTable ',tA,tB,':',tileDistTable[tA][tB]);
        }
        var endTime = performance.now();
        // console.log(`Getting all distances for tile ${tA} took ${(endTime - startTime).toLocaleString("en","us")} milliseconds`);
        // if (counter > 500000) break;
        
    }
    
    
    // console.log("distTable: ", tileDistTable);
    console.log(`-- Building TileLookup took ${(performance.now() - startCreateLookup).toLocaleString("en","us")} milliseconds`);
    console.log('-- counter: ',counter.toLocaleString("en","us"), 'paths found');
    console.log(`-- avg path calculation time: ${(pathTime/counter).toLocaleString("en","us")} ms`);
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
