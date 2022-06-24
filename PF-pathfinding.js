/* PATHFINDING */
// A path is an array of segments

const findPathFromAtoB = (A, B) => {
    // A and B are tile/tile objects
    // Find Path from tile A to tile B
    // Returns Array of segments, or null

    
    console.log(
        "findPathFromAtoB(",
        A.col,
        ",",
        A.row,
        ", ",
        B.col,
        ",",
        B.row,
        ")"
    );

    // start from A, get segs to all neighbors
    A.endSegment = makeSegment(A, A);
    
    // Keep track of all the segments we put down last iteration
    const lastSegs = [A.endSegment];

    // Handle case A === B
    if (A === B) {
        return(lastSegs);
    }

    let foundTarget = false;
    // let iterations = 0;
    let noNewSegs = false;
    do {
        // console.log('lastSegs: ',lastSegs.length);
        const newSegs = [];
        for (let segIndex = 0; segIndex < lastSegs.length; segIndex++) {
            // nextSeg from lastSegs
            const lastSeg = lastSegs[segIndex];
            // console.log("__________________________________");
            // console.log(
            //     "        tile: ",
            //     lastSeg.toTile.col,
            //     ", ",
            //     lastSeg.toTile.row
            // );
            // Branch out to Neighbors
            // Alternate clockwise/counter-clockwise,
            // because *maybe that makes for tighter zig-zags?
            const clockwise = segIndex % 2 === 0;
            // Look for Neighbors (n)
            // console.log(
            //     `   ==== neighbors for ${lastSeg.toTile.col}, ${lastSeg.toTile.row}`
            // );
            const increment = 1;
            for (
                let n = 0;
                n < lastSeg.toTile.neighbors.length;
                n += increment
            ) {
                const nextN = clockwise
                    ? n
                    : lastSeg.toTile.neighbors.length - n - increment;
                nextNeighbor = lastSeg.toTile.neighbors[nextN];
                // console.log(nextNeighbor);
                if (
                    nextNeighbor != null &&
                    !nextNeighbor.endSegment &&
                    !nextNeighbor.obstacle
                ) {
                    // console.log('nextNeighbor good so far...');
                    // Clear so far, but also check to
                    // console.log(
                    //     "   ===  next neighbor: ",
                    //     nextNeighbor.col,
                    //     ", ",
                    //     nextNeighbor.row
                    // );
                    // prevent paths from going between corners of 2 diagonally adjacent tiles
                    let notIllegalCorner = true;
                    let isCorner = false;
                    if (nextN % 2 === 1) {
                        isCorner = true;
                        // console.log(`neighbor ${nextN} checkIllegalCorner`);

                        // It's a corner neighbor, get the neighbors just before and after this neighbor
                        const neighbors = lastSeg.toTile.neighbors;
                        const preN =
                            (nextN + neighbors.length - 1) % neighbors.length;
                        const postN = (nextN + 1) % neighbors.length;
                        const preNeighbor = neighbors[preN];
                        const postNeighbor = neighbors[postN];
                        // Is this empty corner between two occupied adjacent tiles?
                        // If so, was either of them just occupied by segment from current tile?

                        // check that no segment crosses from preNeighbor to postNeighbor or vice versa
                        const notCrossedOver =
                            !preNeighbor.endSegment ||
                            !postNeighbor.endSegment ||
                            (preNeighbor.endSegment.fromTile !==
                                postNeighbor &&
                                postNeighbor.endSegment.fromTile !==
                                    preNeighbor);
                        // console.log(
                        //     "preNeighbor: ",
                        //     preNeighbor.col,
                        //     ", ",
                        //     preNeighbor.row
                        // );
                        // console.log(
                        //     "postNeighbor: ",
                        //     postNeighbor.col,
                        //     ", ",
                        //     postNeighbor.row
                        // );
                        // console.log("crossedOver: ", !notCrossedOver);
                        // console.log(
                        //     "preNeighbor.obstacle: ",
                        //     preNeighbor.obstacle
                        // );
                        // console.log(
                        //     "postNeighbor.obstacle: ",
                        //     postNeighbor.obstacle
                        // );
                        // console.log(
                        //     "preNeighbor.endSegment: ",
                        //     preNeighbor.endSegment
                        // );
                        // console.log(
                        //     "postNeighbor.endSegment: ",
                        //     postNeighbor.endSegment
                        // );
                        notIllegalCorner =
                            (notCrossedOver &&
                                (preNeighbor.endSegment ||
                                    postNeighbor.endSegment)) ||
                            !preNeighbor.obstacle ||
                            !postNeighbor.obstacle;
                    }
                    if (notIllegalCorner) {
                        // create a new segment from lastSeg's end tile to neighbor
                        const newSeg = makeSegment(
                            lastSeg.toTile,
                            nextNeighbor,
                            lastSeg,
                            isCorner
                        );
                        // console.log('nextNeighbor approved');
                        nextNeighbor.endSegment = newSeg;
                        // allSegments.push(newSeg);
                        drawSegment(newSeg, "rgba(0,0,0,.1)");
                        // is nextNeighbor tile B?
                        if (nextNeighbor === B) {
                            // console.log("Found Target!");

                            // Found Target!
                            foundTarget = true;
                            const fullPath = getFullPathFromEndSegment(newSeg);
                            // clearPaths();
                            // console.log('fullPath: ',fullPath.length);
                            // console.log("lastSegs: ", lastSegs);
                            clearSegsFromTiles();
                            return fullPath;
                        } else {
                            newSeg.draw("rgba(0,0,0,0.1");
                            // nextNeighbor.obstacle= true;

                            if (isCorner) {
                                newSegs.push(newSeg);
                            } else {
                                newSegs.unshift(newSeg);
                            }
                        }
                    }
                }
            }
        }
        // console.log(`newSegs.length: ${newSegs.length}`);
        if (newSegs.length === 0) {
            noNewSegs = true;
            console.log("No New Segs");
            break;
        } else {
            // console.log(">> lastSegs.length: ", lastSegs.length, " <<");

            lastSegs.length = 0;
            lastSegs.push(...newSegs);
        }
        // iterations++;
    // } while (!foundTarget && iterations < 2000 && !noNewSegs);
} while (!foundTarget && !noNewSegs);
    // console.log("iterations: ", iterations);
    return null;
};

const drawPathAtoB = (Atile, Btile, drawThisPathOnly = false) => {
    // Find path AtoB and draw it
    
    const myPath = findPathFromAtoB(Atile, Btile);
    if (!myPath) {
        console.log("Can't get there from here");
    } else {
        if (drawThisPathOnly) clearPaths();
        paths.push(myPath);
        drawPath(myPath);
    }
    return myPath;
};
const drawPath = (pathAr) => {
    // Expects an array of segments
    for (const segment of pathAr) {
        segment.draw("yellow");
    }
};

const clearPaths = () => {
    // console.log('clearPaths()');
    paths.length = 0;
    redrawGrid();
};

const clearSegsFromTiles = () => {
    for (const col of grid) {
        for (const tile of col) {
            tile.endSegment = null;
        }
    }
};

/*
    PATH SEGMENT
*/

const drawSegment = (segment, color) => {
    // console.log("drawSegment()", segment);
    // Get tile center on canvas
    const h0coord = getTileCenterOnCanvas(segment.fromTile);
    const h1coord = getTileCenterOnCanvas(segment.toTile);
    ctx.beginPath();
    ctx.moveTo(h0coord.x, h0coord.y);
    ctx.lineTo(h1coord.x, h1coord.y);
    ctx.closePath();
    if (color) {
        ctx.lineWidth = 8;
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.stroke();
    }
    ctx.lineWidth = 4;
    ctx.strokeStyle = color ? color : pink;
    ctx.stroke();
};
const makeSegment = (tile1, tile2, parentSeg = null, diagonal = false) => {
    const segment = {
        fromTile: tile1,
        toTile: tile2,
        isDiagonal: diagonal,
        draw: function (color) {
            // console.log('this: ',this);
            drawSegment(this, color);
        },
        parentSeg,
    };
    return segment;
};
const getFullPathFromEndSegment = (endSeg) => {
    // Get chaing of parents until there is no parent
    const path = [endSeg];
    let parentSeg = endSeg.parentSeg;
    let tooMuch = 0;
    // console.log(endSeg);
    // console.log(`parentSeg: ${parentSeg}`);
    while (parentSeg != null && tooMuch < 1000) {
        path.unshift(parentSeg);
        parentSeg = parentSeg.parentSeg;

        // console.log("parentSeg", parentSeg);
        tooMuch++;
    }
    return path;
};

/*
    END PATH SEGMENT
*/

/* WAYPOINTS */
const orderWaypointsByClosest = (waypoints) => {
    console.log('orderWaypointsByClosest()',waypoints);
    const orderedWPs = [];
    const unorderedWPs = [...waypoints];
    // pull out first WP as startWP, put it in orderedWPs
    let startWP = unorderedWPs.splice(0, 1)[0];
    orderedWPs.push(startWP);
    let tooMuch = 0;
    while (unorderedWPs.length > 1 && tooMuch < 100) {
        // find closest WP of unorderedWPs to startWP
        const closestWP = getClosestWaypoint(startWP, unorderedWPs);
        // console.log(`closestWP: ${closestWP.col}, ${closestWP.row}`);
        // make that startWP, pull it from unorderedWPs, push it to orderedWPs
        startWP = closestWP;
        unorderedWPs.splice(unorderedWPs.indexOf(startWP), 1);
        orderedWPs.push(startWP);
        // repeat until unorderedWPs has only 1 left, then push that to orderedWPs
        tooMuch++;
    }
    // add the last one
    orderedWPs.push(...unorderedWPs);

    // returned ordered list
    return orderedWPs;
};

const getClosestWaypoint = (Awp, Barray) => {
    console.log('getClosestWaypoint()');
    console.log(Awp);
    console.log(Barray);
    // params: button, button array
    if (Barray < 1) {
        return null;
    }
    const distances = [];
    for (let b = 0; b < Barray.length; b++) {
        const path = findPathFromAtoB(Awp, Barray[b]);
        console.log('path: ',path);
        // console.log('path.length: ',path.length);
        let dist = path.length;
        for (const segment of path) {
            if (segment.isDiagonal) {
                dist += 0.4; // difference of hypotenuse and side length
            }
        }
        distances.push(dist);
    }
    const min = Math.min(...distances);
    const index = distances.indexOf(min);
    return Barray[index];
};

const getShortestRoute = (tiles) => {
    // tiles is an array of points
    // returns an array of tiles in optimized order
    // first and last tiles remain first and last

    let shortestDistance = Infinity;
    // compare all permutations
    // as each leg is added, compare total dist to shortest dist.
    // if it's longer, stop measuring that pattern.


}

/* END WAYPOINTS */

// const orderWaypointsByClosest = (buttons) => {
//     console.log('orderWaypointsByClosest(',buttons,')');
//     if(buttons.length <= 1)return null;
//     const unorderedWPs = [...buttons];
//     const orderedWPs = [];
//     let startWP = unorderedWPs[0];
//     // unorderedWPs.splice(0,1);
//     // orderedWPs.push(startWP);
//     const distances = [];
//     console.log('unorderedWPs.length: ',unorderedWPs.length);
//     for(let s = 0; s < unorderedWPs.length; s++){
//         console.log('index: ',s);
//         const A = startWP.myTile;
//         const B = unorderedWPs[s].myTile;
//         console.log('A: ',A.col,', ',A.row);
//         console.log('B: ',B.col,', ',B.row);
//         const dist = findPathFromAtoB(A,B).length;
//         distances.push(dist);
//     }
//     while(unorderedWPs.length > 0){
//         const min = Math.min(...distances);
//         const index = distances.indexOf(min);
//         orderedWPs.push(...unorderedWPs.splice(index,1));
//         distances.splice(index,1);
//     }
//     console.log('orderedWPs: ',orderedWPs);
//     return orderedWPs;
// }

/* END PATHFINDING */
