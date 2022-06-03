
/* PATHFINDING */

const findPathFromAtoB = (A, B) => {
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
    // Find Path from square A to square B
    // returns array of segments
    const allSegments = [];
    // start from A, get segs to all neighbors
    A.endSegment = getSegment(A, A);
    // Keep track of all the segments we put down last iteration
    const lastSegs = [A.endSegment];

    let foundTarget = false;
    let iterations = 0;
    let noNewSegs = false;
    do {
        const newSegs = [];
        for (let segIndex = 0; segIndex < lastSegs.length; segIndex++) {
            // nextSeg from lastSegs
            const lastSeg = lastSegs[segIndex];
            // console.log("__________________________________");
            // console.log(
            //     "        tile: ",
            //     lastSeg.toSquare.col,
            //     ", ",
            //     lastSeg.toSquare.row
            // );
            // Branch out to Neighbors
            // Alternate clockwise/counter-clockwise,
            // because *maybe that makes for tighter zig-zags?
            const clockwise = true; //segIndex % 2 === 0;
            // Look for Neighbors (n)
            // console.log(
            //     `   ==== neighbors for ${lastSeg.toSquare.col}, ${lastSeg.toSquare.row}`
            // );
            const increment = 1;
            for (
                let n = 0;
                n < lastSeg.toSquare.neighbors.length;
                n += increment
            ) {
                const nextN = clockwise
                    ? n
                    : lastSeg.toSquare.neighbors.length - n - increment;
                nextNeighbor = lastSeg.toSquare.neighbors[nextN];
                if (
                    nextNeighbor != null &&
                    !nextNeighbor.endSegment &&
                    !nextNeighbor.obstacle
                ) {
                    // Clear so far, but also check to
                    // console.log(
                    //     "   ===  next neighbor: ",
                    //     nextNeighbor.col,
                    //     ", ",
                    //     nextNeighbor.row
                    // );
                    // prevent paths from going between corners of 2 diagonally adjacent squares
                    let notIllegalCorner = true;
                    let isCorner = false;
                    if (nextN % 2 === 1) {
                        isCorner = true;
                        console.log(`neighbor ${nextN} checkIllegalCorner`);
                        // It's a corner neighbor, get the neighbors just before ane after this neighbor

                        const neighbors = lastSeg.toSquare.neighbors;
                        const preN =
                            (nextN + neighbors.length - 1) % neighbors.length;
                        const postN = (nextN + 1) % neighbors.length;
                        const preNeighbor = neighbors[preN];
                        const postNeighbor = neighbors[postN];
                        // Is this empty corner between two occupied adjacent squares?
                        // If so, was either of them just occupied by segment from current tile?

                        // check that no segment crosses from preNeighbor to postNeighbor or vice versa
                        const notCrossedOver =
                            !preNeighbor.endSegment ||
                            !postNeighbor.endSegment ||
                            (preNeighbor.endSegment.fromSquare !==
                                postNeighbor &&
                                postNeighbor.endSegment.fromSquare !==
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
                        // create a new segment from lastSeg's end square to neighbor
                        const newSeg = getSegment(
                            lastSeg.toSquare,
                            nextNeighbor,
                            lastSeg,
                            isCorner
                        );
                        nextNeighbor.endSegment = newSeg;
                        allSegments.push(newSeg);

                        // is nextNeighbor square B?
                        if (nextNeighbor === B) {
                            // console.log("Found Target!");
                            // Found Target!
                            foundTarget = true;
                            const fullPath = getFullPathFromEndSegment(newSeg);
                            clearPaths();
                            console.log("lastSegs: ", lastSegs);
                            return fullPath;
                        } else {
                            newSeg.draw("rgba(0,0,0,0.5");
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
        if (newSegs.length === 0) {
            noNewSegs = true;
            console.log("No New Segs");
            break;
        } else {
            console.log(">> lastSegs.length: ", lastSegs.length, " <<");

            lastSegs.length = 0;
            lastSegs.push(...newSegs);
        }
        iterations++;
    } while (!foundTarget && iterations < 2000 && !noNewSegs);
    // console.log("iterations: ", iterations);
};

const drawPathAtoB = (Atile, Btile) => {
    console.log(
        "drawPathAtoB(",
        Atile.col,
        " ",
        Atile.row,
        ", ",
        Btile.col,
        " ",
        Btile.row,
        ")"
    );
    const myPath = findPathFromAtoB(Atile, Btile);
    if (!myPath) {
        console.log("Can't get there from here");
    } else {
        console.log("myPath: ", myPath.length);
        // clearPaths();
        drawPath(myPath);
    }
    return myPath;
};
const drawPath = (pathAr) => {
    for (const segment of pathAr) {
        segment.draw();
    }
};

const clearPaths = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const col of grid) {
        for (const square of col) {
            drawSquare(square);
            square.endSegment = null;
        }
    }
};

/*
    PATH SEGMENT
*/
const getSquareCenterOnCanvas = (square) => {
    const x = square.size * square.col + square.size * 0.5;
    const y = square.size * square.row + square.size * 0.5;
    return { x, y };
};
const drawSegment = (square1, square2, color) => {
    console.log("drawSegment()");
    // Get square center on canvas
    const h0coord = getSquareCenterOnCanvas(square1);
    const h1coord = getSquareCenterOnCanvas(square2);
    ctx.beginPath();
    ctx.moveTo(h0coord.x, h0coord.y);
    ctx.lineTo(h1coord.x, h1coord.y);
    ctx.closePath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = color ? color : "yellow";
    ctx.stroke();
};
const getSegment = (square1, square2, parentSeg = null, diagonal = false) => {
    const segment = {
        fromSquare: square1,
        toSquare: square2,
        isDiagonal: diagonal,
        draw: (color) => {
            drawSegment(square1, square2, color);
        },
        parentSeg,
    };
    return segment;
};
const getFullPathFromEndSegment = (endSeg) => {
    // console.log("findPathFromAtoB/getFullPathFromEndSegment()");
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
const orderByClosest = (waypoints) => {
    const orderedWPs = [];
    const unorderedWPs = [...waypoints];
    // pull out first WP as startWP, put it in orderedWPs
    let startWP = unorderedWPs.splice(0, 1)[0];
    orderedWPs.push(startWP);
    let tooMuch = 0;
    while (unorderedWPs.length > 1 && tooMuch < 100) {
        // find closest WP of unorderedWPs to startWP
        const closestWP = getClosestWaypoint(startWP, unorderedWPs);
        // make that startWP, pull it from unorderedWPs, push it to orderedWPs
        startWP = closestWP;
        unorderedWPs.splice(unorderedWPs.indexOf(startWP), 1);
        orderedWPs.push(startWP);
        // repeat until unorderedWPs has only 1 left, then push that to orderedWPs
        tooMuch++;
    }
    orderedWPs.push(...unorderedWPs);

    // returned ordered list
    return orderedWPs;
};

const getClosestWaypoint = (Awp, Barray) => {
    // params: button, button array
    if (Barray < 1) {
        return null;
    }
    const distances = [];
    for (let b = 0; b < Barray.length; b++) {
        const path = findPathFromAtoB(Awp.mySquare, Barray[b].mySquare);
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

/* END WAYPOINTS */

// const orderByClosest = (buttons) => {
//     console.log('orderByClosest(',buttons,')');
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
//         const A = startWP.mySquare;
//         const B = unorderedWPs[s].mySquare;
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