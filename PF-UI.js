// obstacleButtons just means tileButtons RENAME
// TODO: Set / remove obstacle should handle both tile and tileButton
// const rebuildBoard = (evt) => {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     removeTileButtons();
//     const cols = Math.floor(canvas.offsetWidth / tileSize);
//     const rows = Math.floor(canvas.offsetHeight / tileSize);
//     grid = buildGrid(cols, rows, tileSize);
//     setNeighbors(grid);
// };
const itemInput = document.getElementById("item-input");
console.log(itemInput);
let settingItemLocation = false;
const setItemLocationButton = document.getElementById("add-item");
const addItemToInventory = (name, x, y) => {
    items.push({ name, loc: { x, y } });
};
const setItemLocation = (tile) => {
    console.log("setItemLocation: ", tile);
    console.log("settingItemLocation: ", settingItemLocation);
    // Can be called from UI button or Tile button
    if (settingItemLocation) {
        if (tile != null) {
            // Set item at location
            addItemToInventory(
                itemInput.value,
                tile.col,
                tile.row
            );
            itemInput.value = "";
            setItemLocationButton.classList.remove("waiting");
            settingItemLocation = false;
            console.log("items: ", items);
        } else {
            // location is null
            // pick location first
        }
    } else {
        if (itemInput.value != "") {
            // start Setting location
            setItemLocationButton.classList.add("waiting");
            settingItemLocation = true;
        }
    }
};
const startSetWaypoints = (evt) => {
    // called by button in HTML
    // ==== Doubles as Draw Paths button
    settingWaypoints = !settingWaypoints;
    document.getElementById("set-path-button").innerHTML = settingWaypoints
        ? "DRAW PATH"
        : "SET WAYPOINTS";
    if (settingWaypoints) {
        // Set Waypoints mode
        // Start setting waypoints
        paths.length = 0;
        waypoints.length = 0;
        if (setObstaclesOn && settingWaypoints) {
            // Turn off makeObstacles
            toggleMakeObstacles();
        }
    } else {
        // ==== Draw Path mode
        // Draw Path between waypoints
        if (waypoints.length > 1) {
            console.log("waypoints: ", waypoints);
            // order waypoints from first to closest to closest to closest...
            /*

            v Put all this in Traveling-Salesman function
              Start at first tile, end at last tile,
              sort the in-between tiles to shrotest path from start to end

            */
            const orderedWPs = orderByClosest(waypoints);
            // Need at least 2 waypoints to draw path
            console.log("orderedWaypoints: ", orderedWPs);
            for (let wp = 0; wp < orderedWPs.length - 1; wp++) {
                console.log("wp index: ", wp);
                console.log(
                    "orderedWPs[wp]: ",
                    orderedWPs[wp]
                );
                console.log(
                    "orderedWPs[wp + 1]: ",
                    orderedWPs[wp + 1]
                );
                const path = drawPathAtoB(
                    orderedWPs[wp],
                    orderedWPs[wp + 1]
                );
                if (path) {
                    paths.push(path);
                    // clearPaths();
                }
                orderedWPs[wp].innerHTML = wp;
                if (wp === orderedWPs.length - 2) {
                    orderedWPs[wp + 1].innerHTML = wp + 1;
                }
            }
            console.log("orderedWPs.length: ", orderedWPs.length);
            // Draw all the paths between waypoints
            redrawGrid();
            for (const path of paths) {
                drawPath(path);
            }
            /* 

            End Traveling Salesman

            */
            // Hide Waypoints
            // for(const wp of waypoints){
            //     wp.classList.remove('waypoint');
            // }
        }
    }
};
const setWaypoint = (tile, isStartPoint = false) => {
    // Set Tilebutton color
    const tileButton = getTileButtonByIndices(tile.col,tile.row);
    // console.log(`tileButton ${tile.col} ${tile.row}: ${tileButton}`);

    tileButton.classList.add("waypoint");
    if (isStartPoint) {
        waypoints.unshift(tile);
    } else {
        waypoints.push(tile);
    }
};
const setWaypointsFromItems = (event) => {
    if (!tileButtonsOn) createTileButtons();
    if (!settingWaypoints) startSetWaypoints();
    for (const item of items) {
        // console.log("item: ", item);
        const tile = getTileByIndices(item.loc.x,item.loc.y);
        setWaypoint(tile);
    }
    // Store Entrance
    const startTile = getTileByIndices(42,43);
    setWaypoint(startTile,true);
    // Checkout
    const endTile = getTileByIndices(25,35);
    setWaypoint(endTile);
};
const toggleOutput = (evt) => {
    outputOpen = !outputOpen;

    const outputHolder = document.querySelector("#output-container");
    outputHolder.classList.toggle("open");
    document.querySelector("#copy-output-button").classList.toggle("open");
    evt.target.innerText = outputOpen ? "CLOSE OUTPUT" : "OPEN OUTPUT";
    if (outputOpen) {
        const id = evt.target.getAttribute("id");
        if (id === "board-data-button") {
            generateGridOutput();
        } else if (id === "inventory-data-button") {
            const itemsJson =
                "<pre>" + JSON.stringify(items, null, 4) + "</pre>";
            output(itemsJson);
        }
    } else {
        output("");
    }
};
const copyOutput = (evt) => {
    /* Copy the text inside the text field */
    navigator.clipboard.writeText(outputDiv.innerText);
};
const toggleMakeObstacles = () => {
    setObstaclesOn = !setObstaclesOn;
    makeObstaclesButton.classList.toggle("make-obstacles-on");
    if (setObstaclesOn && !tileButtonsOn) {
        createTileButtons();
    }
};

const maybeDrawPath = (tile) => {
    if(tile.obstacle)return;
    if (!startTile) {
        // first tile clicked
        startTile = tile;
    } else if (!endTile) {
        endTile = tile;
        drawPathAtoB(startTile, tile, true);
        startTile = endTile = null;
    }
};
const makeTileButton = (tile) => {
    const newButton = document.createElement("button");
    newButton.classList.add("tile-button");
    newButton.setAttribute("data-col", tile.col);
    newButton.setAttribute("data-row", tile.row);
    newButton.style.height = newButton.style.width = `${tileSize}px`;
    newButton.style.marginTop = newButton.style.marginLeft = `${
        0 - tileSize * 0.5
    }px`;
    const center = getTileCenterOnCanvas(tile);
    newButton.style.left = center.x + "px";
    newButton.style.top = center.y + "px";
    newButton.myTile = tile;
    if (tile.obstacle) {
        newButton.classList.add("obstacle");
    }
    gridHolderDiv.appendChild(newButton);

    newButton.addEventListener("mousedown", (evt) => {
        // console.log(
        //     "MY SQUARE: ",
        //     evt.target.myTile.col,
        //     ", ",
        //     evt.target.myTile.row
        // );
        // console.log("OCCUPIED: ", evt.target.myTile.obstacle);
        // console.log("evt: ", evt);
        // console.log("evt.clientY: ", evt.clientY);
        if (settingItemLocation) {
            if (itemInput.value != "") setItemLocation(evt.target.myTile);
            return;
        }

        if (settingWaypoints && !evt.target.myTile.obstacle) {
            setWaypoint(evt.target.myTile);
            return;
        }
        // TODO: Move a lot into startDrag() function
        // Start Drag
        dragging = true;
        startDragPos = getMouseXY(evt);
        startDragTile = evt.target.myTile;
        if (marqueeOn) {
            // Show marquee
            marqueeDiv.classList.add("on");
        } else if (setObstaclesOn) {
            toggleObstacle(evt.target.myTile);
            addingObstacles = evt.target.myTile.obstacle;
        } else {
            // Draw Path if !setObstaclesOn && !marqueeOn
            maybeDrawPath(evt.target.myTile);
        }
    });
    newButton.addEventListener("mousemove", (evt) => {
        // TODO: Move a lot into drag() function
        mousePos = getMouseXY(evt);
        if (dragging) {
            if (marqueeOn) {
                drawMarquee();
                currentDragTile = evt.target.myTile;
            } else if (setObstaclesOn) {
                setObstacle(evt.target.myTile, addingObstacles);
            }
        }
    });
    newButton.addEventListener("mouseup", (evt) => {
        console.log("MOUSE UP");
        // TODO: Move a lot into stopDrag() function
        dragging = false;
        // addingObstacles = true;
        if (marqueeOn) {
            marqueeDiv.classList.remove("on");
            toggleMarqueedTiles();
        }
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
    tileButtonsOn = false;
    if (setObstaclesOn) {
        toggleMakeObstacles();
    }
};
const createTileButtons = () => {
    console.log("createTileButtons()");
    // first make sure they don't already exist
    if (obstacleButtons.length === 0) {
        recalcTileSize();
        for (const col of grid) {
            for (const tile of col) {
                makeTileButton(tile);
            }
        }
    }
    tileButtonsOn = true;
};
const toggleObstacle = (tile) => {
    console.log(`toggleObstacle(${tile.col}, ${tile.row})`);
    console.log(`tile.obstacle from: ${tile.obstacle}`);
    // toggle tile's obstacle property
    setObstacle(tile, !tile.obstacle);
    console.log(`tile.obstacle to: ${tile.obstacle}`);
};
const setObstacle = (tile, isOn = true) => {
    tile.obstacle = isOn;
    const btn = document.querySelector(
        `[data-col="${tile.col}"][data-row="${tile.row}"]`
    );
    if (isOn) {
        btn.classList.add("obstacle");
    } else {
        btn.classList.remove("obstacle");
    }
};
const buttonFindPath = () => {
    alert("click two tilees");
    // clearPaths();
    createTileButtons();
};

const getMouseXY = (evt) => {
    var rect = gridHolderDiv.getBoundingClientRect();
    var x = evt.clientX - rect.left; //x position within the element.
    var y = evt.clientY - rect.top; //y position within the element.
    return { x, y };
};
const getTileButtonByIndices = (col,row) => {
    return document.querySelector(
        `[data-col="${col}"][data-row="${row}"]`
    );
}