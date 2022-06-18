// obstacleButtons just means tileButtons RENAME
// TODO: Set / remove obstacle should handle both tile and tileButton
// const rebuildBoard = (evt) => {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     removeTileButtons();
//     const cols = Math.floor(canvas.offsetWidth / squareSize);
//     const rows = Math.floor(canvas.offsetHeight / squareSize);
//     grid = buildGrid(cols, rows, squareSize);
//     setNeighbors(grid);
// };
const itemInput = document.getElementById("item-input");
console.log(itemInput);
let settingItemLocation = false;
const setItemLocationButton = document.getElementById("add-item");
const addItemToInventory = (name,x,y) => {
    items.push({name,loc:{x,y}});
}
const setItemLocation = (evt) => {
    console.log('setItemLocation: ',evt);
    console.log('settingItemLocation: ',settingItemLocation);
    // Can be called from UI button or Tile button
    if (settingItemLocation) {
        console.log(evt.target.mySquare);
        if (evt.target.mySquare != null) {
            // Set item at location
            addItemToInventory(itemInput.value,evt.target.mySquare.col,evt.target.mySquare.row);
            itemInput.value = '';
            setItemLocationButton.classList.remove("waiting");
            settingItemLocation = false;
            console.log('items: ',items);
        } else {
            // location is null
            // pick location first

        }
    } else {
        if(itemInput.value != ''){
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
   document.getElementById("set-path-button").innerHTML = settingWaypoints ? "DRAW PATH" : "SET WAYPOINTS";
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
const setWaypointsFromItems = (event) => {
    if(!squareButtonsOn)createTileButtons();
    if(!settingWaypoints)startSetWaypoints();
    for(const item of items){
        console.log('item: ',item);
        const tileButton = document.querySelector(`[data-col="${item.loc.x}"][data-row="${item.loc.y}"]`);
        setWaypoint(tileButton);
    }
}
const toggleOutput = (evt) => {
    outputOpen = !outputOpen;
    
    const outputHolder = document.querySelector("#output-container");
    outputHolder.classList.toggle("open");
    document.querySelector("#copy-output-button").classList.toggle("open");
    evt.target.innerText = outputOpen ? "CLOSE OUTPUT" : "OPEN OUTPUT";
    if (outputOpen) {
        const id = evt.target.getAttribute("id");
        if( id === "board-data-button"){
            generateGridOutput();
        }else if(id==="inventory-data-button"){
            const itemsJson = '<pre>'+JSON.stringify(items,null,4)+'</pre>';
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
    if (setObstaclesOn && !squareButtonsOn) {
        createTileButtons();
    }
};

const maybeDrawPath = (square) => {
    if (!startSquare) {
        // first square clicked
        startSquare = square;
    } else if (!endSquare) {
        endSquare = square;
        drawPathAtoB(startSquare, square, true);
        startSquare = endSquare = null;
    }
};
const makeTileButton = (square) => {
    const newButton = document.createElement("button");
    newButton.classList.add("square-button");
    newButton.setAttribute("data-col", square.col);
    newButton.setAttribute("data-row", square.row);
    newButton.style.height = newButton.style.width = `${squareSize}px`;
    newButton.style.marginTop = newButton.style.marginLeft = `${
        0 - squareSize * 0.5
    }px`;
    const center = getSquareCenterOnCanvas(square);
    newButton.style.left = center.x + "px";
    newButton.style.top = center.y + "px";
    newButton.mySquare = square;
    if (square.obstacle) {
        newButton.classList.add("obstacle");
    }
    gridHolderDiv.appendChild(newButton);

    newButton.addEventListener("mousedown", (evt) => {
        // console.log(
        //     "MY SQUARE: ",
        //     evt.target.mySquare.col,
        //     ", ",
        //     evt.target.mySquare.row
        // );
        // console.log("OCCUPIED: ", evt.target.mySquare.obstacle);
        // console.log("evt: ", evt);
        // console.log("evt.clientY: ", evt.clientY);
        if(settingItemLocation){
            if(itemInput.value != '') setItemLocation(evt);
            return;
        }

        if (settingWaypoints && !evt.target.mySquare.obstacle) {
            setWaypoint(evt.target);
            return;
        }
        // TODO: Move a lot into startDrag() function
        // Start Drag
        dragging = true;
        startDragPos = getMouseXY(evt);
        startDragTile = evt.target.mySquare;
        if (marqueeOn) {
            // Show marquee
            marqueeDiv.classList.add("on");
        } else if (setObstaclesOn) {
            toggleObstacle(evt.target);
            addingObstacles = evt.target.mySquare.obstacle;
        } else {
            // Draw Path if !setObstaclesOn && !marqueeOn
            maybeDrawPath(evt.target.mySquare);
        }
    });
    newButton.addEventListener("mousemove", (evt) => {
        // TODO: Move a lot into drag() function
        mousePos = getMouseXY(evt);
        if (dragging) {
            if (marqueeOn) {
                drawMarquee();
                currentDragTile = evt.target.mySquare;
            } else if (setObstaclesOn) {
                setObstacle(evt.target.mySquare, addingObstacles);
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
    squareButtonsOn = false;
    if (setObstaclesOn) {
        toggleMakeObstacles();
    }
};
const createTileButtons = () => {
    console.log("createTileButtons()");
    // first make sure they don't already exist
    if (obstacleButtons.length === 0) {
        recalcSquareSize();
        for (const col of grid) {
            for (const square of col) {
                makeTileButton(square);
            }
        }
    }
    squareButtonsOn = true;
};
const getTileButtonByIndices = (x, y) => {
    return document.querySelector(`[data-col="${x}"][data-row="${y}"]`);
};
const toggleObstacle = (tileButton) => {
    const square = tileButton.mySquare;
    console.log(`toggleObstacle(${square.col}, ${square.row})`);
    console.log(`square.obstacle from: ${square.obstacle}`);
    // toggle square's obstacle property
    setObstacle(square, !square.obstacle);
    console.log(`square.obstacle to: ${square.obstacle}`);
};
const setObstacle = (square, isOn = true) => {
    square.obstacle = isOn;
    const btn = document.querySelector(
        `[data-col="${square.col}"][data-row="${square.row}"]`
    );
    if (isOn) {
        btn.classList.add("obstacle");
    } else {
        btn.classList.remove("obstacle");
    }
};
const buttonFindPath = () => {
    alert("click two squarees");
    // clearPaths();
    createTileButtons();
};

const getMouseXY = (evt) => {
    var rect = gridHolderDiv.getBoundingClientRect();
    var x = evt.clientX - rect.left; //x position within the element.
    var y = evt.clientY - rect.top; //y position within the element.
    return { x, y };
};
