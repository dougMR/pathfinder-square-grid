//
// This page is dedicated to the traveling salesperson problem (TSP)
//
const tspShortest = (waypoints) => {
    const waypointsDist = (waypoints) => {
        let dist = 0;
        for (let i = 0; i < waypoints.length - 1; i++) {
            const path = findPathFromAtoB(waypoints[i], waypoints[i + 1]);
            dist += getPathDistance(path);
        }
        return dist;
    };



    function shuffle(array1) {
        const array = [...array1];
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }



    const addStartAndEnd = (path) => {
        return [startWP, ...path, endWP];
    };

    // Store Entrance
    let startWP = getTileByIndices(numColumns-1, numRows-1);
    // Checkout
    let endWP = getTileByIndices(Math.round(numColumns/2), numRows-1);

    const tries = 300;
    let bestDist = waypointsDist(addStartAndEnd(waypoints));
    let shortestPath = waypoints;
    console.log("bestDist: ", bestDist);

    let loopCount = 0;
    while (loopCount < tries) {
        // How to skip combinations we've already tried?
        // const newPath = randomSwapPoints(waypoints);
        const newPath = shuffle(waypoints);
        const dist = waypointsDist(addStartAndEnd(newPath));
        if (dist < bestDist) {
            bestDist = dist;
            shortestPath = addStartAndEnd(newPath);
            console.log("loops: ", loopCount);
            console.log("shortestDist: ", bestDist);
        }
        loopCount++;
    }
    return shortestPath;
};

