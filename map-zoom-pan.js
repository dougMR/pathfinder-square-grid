//
// REQUIREMENT: mapImg and mapCanvas will need to be same ratio for all this to work
//

const zoomSlider = document.getElementById("zoom-range");
const mapHolder = document.getElementById("canvas-holder");
const mapImg = document.getElementById("map-img");
let zoom = 1;
let startMapWidth, startMayHeight;

const initMap = () => {
    // set map-holder height equal to its width
    mapHolder.style.height = `${mapHolder.offsetWidth}px`;
    // is map taller than wide?
    if (mapImg.offsetHeight > mapImg.offsetWidth) {
        // css starts mapImg width at 100% of mapHolder width,
        // so make adjustements from there
        const resizeRatio = mapHolder.offsetHeight / mapImg.offsetHeight;
        mapImg.style.width = `${resizeRatio * 100}%`;
    }
    startMapWidth = mapImg.offsetWidth;
    startMapHeight = mapImg.offsetHeight;

    // size mapImg and mapCanvas
    resizeMap();
};

const resizeMap = () => {
    // zoom is 1 = 100%
    const oldZoom = zoom;
    zoom = zoomSlider.value;
    // console.log('resizeMap() ',zoom);

    const zoomChange = zoom / oldZoom;
    // console.log("startWH: ",startMapWidth,startMapHeight);

    // Calculate Map dimensions
    const zoomW = startMapWidth * zoom;
    const zoomH = startMapHeight * zoom;

    // Resize Map Canvas
    mapCanvas.setAttribute("width", zoomW);
    mapCanvas.setAttribute("height", zoomH);
    // Resize Map Image
    mapImg.style.width = `${zoomW}px`;

    recenterOnResize(zoomChange);
    // console.log('numColumns: ',numColumns);
    recalcTileSize();
    redrawGrid(true);
    if (tileButtonsOn) {
        removeTileButtons();
        createTileButtons();
    }
};

zoomSlider.addEventListener("input", resizeMap);

const dragMap = (x, y) => {
    this.constrainMapXY(mapCanvas.offsetLeft + x, mapCanvas.offsetTop + y);
};

const recenterOnResize = (zoomRatio) => {
    // Zoom in/out from center of visible image
    const halfW = mapHolder.offsetWidth * 0.5;
    const halfH = mapHolder.offsetHeight * 0.5;

    const mapX = mapCanvas.offsetLeft;
    const mapY = mapCanvas.offsetTop;
    const midX = halfW - mapX;
    const midY = halfH - mapY;

    const newMidX = halfW - midX * zoomRatio;
    const newMidY = halfH - midY * zoomRatio;
    constrainMapXY(newMidX, newMidY);
};

const constrainMapXY = (x, y) => {
    // console.log('constrainMapXY: ',x,y);
    // Keep map inside mapHolder
    if (x === undefined || y === undefined) {
        x = mapImg.offsetLeft;
        y = mapImg.offsetTop;
    }
    // Constrain x / y to never have gap between map and holder
    const minX = (mapHolder.clientWidth - mapImg.clientWidth);
    const minY = (mapHolder.clientHeight - mapImg.clientHeight);
    // console.log("minXY: ",minX,minY);

    const newX = Math.max(minX, Math.min(0, x));
    const newY = Math.max(minY, Math.min(0, y));
    // console.log('newXY: ',newX,newY);

    // Position mapCanvas and mapImg
    // resize buttons holder div
    gridButtonsHolderDiv.style.left =
        mapImg.style.left =
        mapCanvas.style.left =
            `${newX}px`;
    gridButtonsHolderDiv.style.top =
        mapImg.style.top =
        mapCanvas.style.top =
            `${newY}px`;
};

const getMapXY = () => {
    return { x: mapImg.offsetLeft, y: mapImg.offsetTop };
};

const moveMap = (xDist, yDist) => {
    let { x, y } = getMapXY();
    x += xDist;
    y += yDist;
    constrainMapXY(x, y);
};

