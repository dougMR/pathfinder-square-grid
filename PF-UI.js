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
let mousePos = { x: 0, y: 0 };
const setStartTileButton = document.getElementById("set-start-tile");
const setEndTileButton = document.getElementById("set-end-tile");
const itemInput = document.getElementById("item-input");
// console.log(itemInput);
let settingItemLocation = false;
const setItemLocationButton = document.getElementById("add-item");
const clearItems = (evt) => {
    const clearItems = window.confirm(
        "are you sure you want to clear all inventory items?"
    );
    if (clearItems) currentStore.inventory.length = 0;
};
const addItemToInventory = (names, x, y) => {
    names = names.split(",");
    const name = names.splice(0, 1)[0];
    const tags = [...names];
    currentStore.inventory.push({ name, loc: { x, y }, tags });
};
const setItemLocation = (tile) => {
    console.log("setItemLocation: ", tile);
    console.log("settingItemLocation: ", settingItemLocation);
    // Can be called from UI button or Tile button
    if (settingItemLocation) {
        if (tile != null) {
            // Make sure tile has no other item in it
            const inventoryInTile = currentStore.inventory.find((el) => {
                el.col === tile.col && el.row === tile.row;
            });
            if (inventoryInTile) {
                window.alert("Tile already has inventory item.");
                return;
            } else if (tile.obstacle) {
                window.alert("Tile is obstructed.");
                return;
            }
            console.log('currentStore: ',currentStore.name);
            console.log('currentStore.inventory: ',currentStore.inventory);
            const itemAlreadyInInventory = currentStore.inventory.find((el) => {
                return el.name === itemInput.value;
            });
            console.log('currentStore.inventory.contains ',itemInput.value,':',currentStore.inventory.find(el=>el.name===itemInput.value));
            
            if (itemAlreadyInInventory) {
                window.alert(
                    `${itemInput.name} is already in ${currentStore.name} inventory.`
                );
            } else {
                
                // Set item at location
                console.log("ADD TO INVENTORY");
                addItemToInventory(itemInput.value, tile.col, tile.row);
                itemInput.value = "";
                setItemLocationButton.classList.remove("waiting");
                settingItemLocation = false;
            }

            // console.log("currentStore.inventory: ", currentStore.inventory);
        } else {
            // location is null
            // pick location first
        }
    } else {
        if (itemInput.value != "") {
            // start Setting location
            setItemLocationButton.classList.add("waiting");
            settingItemLocation = true;
            // waiting to click a tile
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
            // const orderedWPs = getShortestRouteByClosest(waypoints);
            // const orderedWPs = orderWaypointsByClosest(waypoints);
            // const orderedWPs = getShortestRouteByClosestBothEnds(waypoints);
            const orderedWPs = tspShortestByMutation(waypoints);
            // Need at least 2 waypoints to draw path
            console.log("orderedWaypoints: ", orderedWPs);
            for (let wp = 0; wp < orderedWPs.length - 1; wp++) {
                // console.log("wp index: ", wp);
                // console.log(
                //     "orderedWPs[wp]: ",
                //     orderedWPs[wp]
                // );
                // console.log(
                //     "orderedWPs[wp + 1]: ",
                //     orderedWPs[wp + 1]
                // );
                const path = drawPathAtoB(orderedWPs[wp], orderedWPs[wp + 1]);
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
    console.log("waypoint TILE: ", tile);
    //
    // !! INSETAD OF using tile buttons, we should have
    // waypoints set in a separate WP object/array, and
    // draw them onto canvas.
    // Each WP needs to know its tile.
    //
    // Meanwhile, this requires ToggleTileDivs to be Active, or it will break
    //
    // Set Tilebutton color
    const tileButton = getTileButtonByIndices(tile.col, tile.row);
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
    for (const item of currentStore.inventory) {
        // console.log("item: ", item);
        const tile = getTileByIndices(item.loc.x, item.loc.y);
        setWaypoint(tile);
    }
    // // Store Entrance
    // const startTile = getTileByIndices(42,43);
    // setWaypoint(startTile,true);
    // // Checkout
    // const endTile = getTileByIndices(25,35);
    // setWaypoint(endTile);
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
                "<pre>" +
                JSON.stringify(currentStore.inventory, null, 4) +
                "</pre>";
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
    if (tile.obstacle) return;
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
    gridButtonsHolderDiv.appendChild(newButton);

    // newButton.addEventListener("pointerdown", (evt) => {
    //     // console.log(
    //     //     "MY SQUARE: ",
    //     //     evt.target.myTile.col,
    //     //     ", ",
    //     //     evt.target.myTile.row
    //     // );
    //     // console.log("OCCUPIED: ", evt.target.myTile.obstacle);
    //     // console.log("evt: ", evt);
    //     // console.log("evt.clientY: ", evt.clientY);
    //     if (settingItemLocation) {
    //         if (itemInput.value != "") setItemLocation(evt.target.myTile);
    //         return;
    //     }

    //     if (settingWaypoints && !evt.target.myTile.obstacle) {
    //         setWaypoint(evt.target.myTile);
    //         return;
    //     }
    //     // TODO: Move a lot into startDrag() function
    //     // Start Drag
    //     dragging = true;
    //     startDragPos = getMouseXY(evt);
    //     startDragTile = evt.target.myTile;
    //     if (marqueeOn) {
    //         // Show marquee
    //         marqueeDiv.classList.add("on");
    //     } else if (setObstaclesOn) {
    //         console.log("touching tile, in PF-UI");
    //         toggleObstacle(evt.target.myTile);
    //         addingObstacles = evt.target.myTile.obstacle;
    //     } else {
    //         // Draw Path if !setObstaclesOn && !marqueeOn
    //         maybeDrawPath(evt.target.myTile);
    //     }
    // });
    // newButton.addEventListener("pointermove", (evt) => {
    //     // TODO: Move a lot into drag() function
    //     mousePos = getMouseXY(evt);
    //     if (dragging) {
    //         if (marqueeOn) {
    //             drawMarquee();
    //             currentDragTile = evt.target.myTile;
    //         } else if (setObstaclesOn) {
    //             setObstacle(evt.target.myTile, addingObstacles);
    //         }
    //     }
    // });
    // newButton.addEventListener("pointerup", (evt) => {
    //     console.log("MOUSE UP");
    //     // TODO: Move a lot into stopDrag() function
    //     dragging = false;
    //     // addingObstacles = true;
    //     if (marqueeOn) {
    //         marqueeDiv.classList.remove("on");
    //         toggleMarqueedTiles();
    //     }
    // });

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
    // Relative to map, if map is evt target?
    // var rect = gridButtonsHolderDiv.getBoundingClientRect();
    var rect = mapImg.getBoundingClientRect();
    var x = evt.clientX - rect.left; //x position within the element.
    var y = evt.clientY - rect.top; //y position within the element.
    return { x, y };
};

const getTileButtonByIndices = (col, row) => {
    // console.log("getTileButtonByIndices: ", col, row);
    // console.log(
    //     document.querySelector(`[data-col="${col}"][data-row="${row}"]`)
    // );
    return document.querySelector(`[data-col="${col}"][data-row="${row}"]`);
};

const makeMapCanvasHandlers = () => {
    // Variables in here are available to nested functions
    const dragMap = (x, y) => {
        const xDist = x - startDragPos.x;
        const yDist = y - startDragPos.y;
        moveMap(xDist, yDist);
    };
    const startTouchCanvas = (evt) => {
        // console.log('startTouchCanvas: ', evt);

        const mouseXY = getMouseXY(evt);
        const thisTile = getTileByCoordinates(mouseXY.x, mouseXY.y);
        // Setting Item location
        if (settingItemLocation) {
            if (itemInput.value != "") setItemLocation(thisTile);
            return;
        }
        // Setting Waypoint
        if (settingWaypoints && !thisTile.obstacle) {
            setWaypoint(thisTile);
            return;
        }
        // Start Drag
        dragging = true;
        startDragPos = mouseXY;
        console.log("startTouchCanvas, tile: ", thisTile);
        startDragTile = thisTile;
        if (marqueeOn) {
            // Show marquee
            marqueeDiv.classList.add("on");
        } else if (setObstaclesOn) {
            // Toggle obstacle
            toggleObstacle(thisTile);
            addingObstacles = thisTile.obstacle;
        } else {
            // Draw Path if !setObstaclesOn && !marqueeOn
            maybeDrawPath(thisTile);
        }
    };
    const moveOverCanvas = (evt) => {
        // TODO: Move a lot into drag() function
        mousePos = getMouseXY(evt);
        const thisTile = getTileByCoordinates(mousePos.x, mousePos.y);
        if (dragging) {
            if (marqueeOn) {
                drawMarquee();

                currentDragTile = thisTile;
            } else if (setObstaclesOn) {
                setObstacle(thisTile, addingObstacles);
            } else {
                // Drag Map
                dragMap(mousePos.x, mousePos.y);
            }
        }
    };
    const endTouchCanvas = (evt) => {
        console.log("endTouchCanvas");
        dragging = false;
        if (marqueeOn) {
            marqueeDiv.classList.remove("on");
            toggleMarqueedTiles();
        }
    };
    // const moveOutOfCanvas = (evt) => {
    //     console.log("pointer moved out of map");
    //     pointerInCanvas = false;
    // }
    // const moveIntoCanvas = (evt) => {
    //     console.log("pointer moved into map");
    //     pointerInCanvas = true;
    // }
    // Start touch
    mapCanvas.addEventListener("pointerdown", startTouchCanvas);
    // mapCanvas.addEventListener("mousedown", startTouchCanvas);
    // Move
    mapCanvas.addEventListener("pointermove", moveOverCanvas);
    // mapCanvas.addEventListener("mousemove",moveOverCanvas)
    // End touch
    mapCanvas.addEventListener("pointerup", endTouchCanvas);
    // mapCanvas.addEventListener("mouseup",endTouchCanvas);
    // mapCanvas.addEventListener("pointerleave", moveOutOfCanvas);
    // mapCanvas.addEventListener("pointerenter", moveIntoCanvas);
    window.addEventListener("pointerup", (evt) => {
        console.log("window.pointerup");
        // console.log('window.pointerup, pointerInCanvas: ',pointerInCanvas);
        // if (!pointerInCanvas){
        dragging = false;
        // }
    });
    window.addEventListener("pointermove", (evt) => {
        if (dragging) {
            mousePos = getMouseXY(evt);
            dragMap(mousePos.x, mousePos.y);
        }
    });
};

const output = (txt, add = false) => {
    const prevText = add ? outputDiv.innerHTML + "<br />" : "";
    outputDiv.innerHTML = prevText + txt;
};
const generateGridOutput = () => {
    // Generates and displays grid JSON data
    // gridOutput(JSON.stringify(grid));
    let colIndex = 0;
    let rowIndex = 0;
    let gridOutput = "";
    gridOutput += `gridData = {tileSize:${tileSize}, numRows: ${numRows}, numColumns: ${numColumns}, grid:[`;
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
