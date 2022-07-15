/* 
----------------------------------------------------
// With help from GENETIC ALGORITM TUTORIAL: https://www.youtube.com/watch?v=M3KTWnTrU_c
*/

//
// This script uses traveling salesperson problem (TSP) to look for shortest route
//

const tspShortestByMutation = (waypoints) => {
    console.log("tspShortestByMutation()");
    // Get total distance for a set of waypoints
    // waypoints does not include entrance, checkout

    const getWaypointsDistance = (tiles, order) => {
        console.log("getWaypointsDistance()");
        tiles = addStartAndEnd(tiles);
        order = addStartEndIndexes(order);
        let dist = 0;
        for (let o = 0; o < order.length - 1; o++) {
            const tileAIndex = order[o];
            const tileA = tiles[tileAIndex];
            const tileBIndex = order[o + 1];
            const tileB = tiles[tileBIndex];
            // console.log('findPathFromAtoB...');
            // const path = findPathFromAtoB(tileA, tileB);
            // dist += getPathDistance(path);
            dist += lookupDistance(tileA, tileB);
        }
        return dist;
    };

    const reorderWaypoints = (tiles, order) => {
        tiles = addStartAndEnd(tiles);
        order = addStartEndIndexes(order);
        const newPath = [];
        for (let o = 0; o < order.length; o++) {
            const nextIndex = order[o];
            newPath[o] = tiles[nextIndex];
        }
        return newPath;
    };

    const addStartAndEnd = (path) => {
        return [startWP, ...path, endWP];
    };

    const swap = (vals, i, j) => {
        const temp = vals[i];
        vals[i] = vals[j];
        vals[j] = temp;
    };

    const shuffle = (array, num) => {
        for (let n = 0; n < num; n++) {
            let indexA = Math.floor(Math.random() * array.length);
            let indexB;
            do {
                indexB = Math.floor(Math.random() * array.length);
            } while (indexB === indexA);
            swap(array, indexA, indexB);
        }
    };

    const checkSwapEvery2Points = (order) => {
        console.log("checkSwapEvery2Points()");
        // with every pair of points,
        // check if dist is shorter by swapping them
        let newOrder = [...order];
        let foundShorter = false;

        for (let i = 0; i < order.length; i++) {
            for (let j = i + 1; j < order.length; j++) {
                const swappedOrder = [...newOrder];
                swap(swappedOrder, i, j);

                const dist = getWaypointsDistance(waypoints, swappedOrder);
                if (dist < shortestDist) {
                    shortestDist = dist;
                    bestOrder = [...swappedOrder];
                    newOrder = [...swappedOrder];
                    foundShorter = true;
                }
            }
        }
        if (foundShorter) {
            // set order to newOrder
            console.log(" ------------ checkSwap found improvemnet");
            order.length = 0;
            order.push(...newOrder);
            return true;
        }
        return false;
    };

    const checkSwapEvery2PointsOfPopulation = () => {
        for (let p = 0; p < population.length; p++) {
            checkSwapEvery2Points(population[p]);
        }
    };

    const addStartEndIndexes = (thisOrder) => {
        return [startIndex, ...thisOrder, endIndex];
    };
    const stripStartEndIndexes = (thisOrder) => {
        const newOrder = [...thisOrder];
        newOrder.pop();
        newOrder.shift();
        return newOrder;
    };

    const calculateFitness = () => {
        console.log("calculateFitness()");
        for (let p = 0; p < population.length; p++) {
            // console.log('getWaypointsDistance...');
            const dist = getWaypointsDistance(waypoints, population[p]);
            // console.log('got it.');
            if (dist < shortestDist) {
                shortestDist = dist;
                console.log("------------- found shorter dist -------------");
                // only checkSwap when new shortestDist is found
                while (checkSwapEvery2Points(population[p])) {
                    // just keep doing that until it doesn't improve
                    // console.log('checkSwap found shorter path');
                }

                bestOrder = [...population[p]];
                numMutations = 1;
            } else {
                // no shortest dist found, increase mutations
                numMutations = Math.min(numMutations + 1, order.length);
            }
            fitness[p] = dist === 0 ? 0 : 1 / dist;
        }
    };

    const normalizeFitness = () => {
        //  for each value, set it to a fraction, which is its percentage of the total value
        let sum = 0;
        for (let f = 0; f < fitness.length; f++) {
            sum += fitness[f];
        }
        for (let f = 0; f < fitness.length; f++) {
            fitness[f] = fitness[f] / sum;
        }
    };

    const pickOneByFitness = () => {
        // returns random order from population, weighted by fitness
        let index = 0;
        let r = Math.random();

        while (r > 0) {
            r = r - fitness[index];
            // console.log('r: ',r);
            index++;
        }
        index--;
        return [...population[index]];
    };

    const nextGeneration = () => {
        // repopulate population via mutations
        const newPopulation = [];
        // ordersTried.length = 0;
        // foundRepeat = 0;
        // lookedForRepeat = 0;
        // let numChecks = 0;
        for (let p = 0; p < population.length; p++) {
            // const newOrder = [...bestOrder];
            const oldOrder = [...population[p]];
            const newOrder = pickOneByFitness();
            // const orderA = pickOneByFitness(population);
            // const orderB = pickOneByFitness(population);
            // const order = crossover(orderA, orderB);
            // shuffle(newOrder, numMutations);
            // newPopulation[p] = newOrder;

            // reset ordersTried.
            // it gets too long, but clearing it here we can check just that newPopulation doesn't repeat orders

            let loops = 0;
            do {
                // numChecks++;
                shuffle(newOrder, numMutations);
                loops++;
            } while (
                checkOrderAlreadyTried(newOrder) &&
                loops < maxCheckNewOrderLoops
            );
            // console.log('loops: ',loops, 'vs', maxCheckNewOrderLoops);
            if (loops + 2 < maxCheckNewOrderLoops) {
                newPopulation[p] = newOrder;
            } else {
                newPopulation[p] = oldOrder;
                // console.log("no new order for this population");
            }
        }
        // console.log('numChecks: ',numChecks);
        population.length = 0;
        population.push(...newPopulation);
        // console.log('population.length 2: ',population.length);
    };

    const foundUsedOrder = () => {
        foundRepeat++;
    };
    const checkOrderAlreadyTried = (order) => {
        for (const num of order) {
            if (typeof num !== "number") {
                console.log("illegal order");
            }
        }
        let nextNestedArray = ordersTried;
        for (let i = 0; i < order.length; i++) {
            const index = order[i];
            if (i < order.length - 1) {
                // not final index
                if (!Array.isArray(nextNestedArray[index])) {
                    // No array here yet
                    nextNestedArray[index] = [];
                }
                nextNestedArray = nextNestedArray[index];
            } else {
                // reached endpoint, check if this order has been used yet
                lookedForRepeat++;
                if (typeof nextNestedArray[index] != "number") {
                    // First time here
                    nextNestedArray[index] = 1;
                    uniqueOrdersTried++;
                    if (uniqueOrdersTried >= permutations) {
                        // Check before starting,
                        // if maxTries * population >= permutations,
                        // do permutations instead
                        evolveRunning = false;
                    }
                    return false;
                } else {
                    // Been here before
                    foundUsedOrder();
                    nextNestedArray[index]++;
                    return true;
                }
                console.log("nextNestedArray[index]", nextNestedArray[index]);
            }
        }
    };

    // Store Entrance
    let startWP = getTileByIndices(numColumns - 1, numRows - 1);
    // Checkout
    let endWP = getTileByIndices(Math.floor(numColumns / 2), numRows - 1);

    // For keeping track of orders already tried
    let lookedForRepeat = 0;
    let foundRepeat = 0;
    let uniqueOrdersTried = 0;
    const ordersTried = [];

    const maxTries = Math.pow(Math.ceil(waypoints.length), 2);
    const populationNum = maxTries;
    const maxCheckNewOrderLoops = Math.pow(waypoints.length, 2);

    console.log("maxTries, ", maxTries);
    console.log("populationNum: ", populationNum);

    // population of orders
    const population = [];
    // fitness rates each population order by dist (shorter better)
    const fitness = [];
    let tries = 0;
    let numMutations = 1;

    let order = [];
    for (let o = 0; o < waypoints.length + 2; o++) {
        order[o] = o;
    }

    const startIndex = 0;
    const endIndex = order.length - 1;
    order = stripStartEndIndexes([...order]);

    let shortestDist = getWaypointsDistance(waypoints, order);

    const permutations = factorialize(order.length - 2);

    let bestOrder = [...order];

    // set random populations
    for (let p = 0; p < populationNum; p++) {
        population[p] = [...order];
        shuffle(population[p], 10);
    }

    do {
        console.log("calcFitness...");
        calculateFitness();
        console.log("normalize...");
        normalizeFitness();
        console.log("nextGen...");
        nextGeneration();
        // console.log('checkSwapAllPopulation...');
        // checkSwapEvery2PointsOfPopulation();
        tries++;
        console.log("tries: ", tries);
    } while (tries < maxTries);

    return reorderWaypoints(waypoints, bestOrder);
};

const getShortestOrderByGeneticAlgorithmWithEndpoints = (waypoints) => {
    // Incoming waypoints are store coordinates

    const addEndpoints = (points) => {
        return [startPoint, ...points, endPoint];
    };
    const stripEndpoints = (points) => {
        const newPoints = [...points];
        newPoints.pop();
        newPoints.shift();
        return newPoints;
    };
};

const runTsp = (evt) => {
    console.clear();
    // console.log(evt);
    // tspRunning = true;

    if (!samePointsCheckbox.checked || numCities === 0) {
        numCities = document.getElementById("num-cities").value;
        cities = generateCities(numCities);
    }

    op.innerHTML = `<span style="font-family: sans-serif;">${cities.length} points - plus static end points`;
    // const numCities = document.getElementById("num-cities").value;
    // const cities = generateCities(numCities);
    // getShortestOrder(cities);
    const startPoint = { x: 275, y: 290 };
    const endPoint = { x: 25, y: 290 };
    if (bruteForceCheckbox.checked) {
        permuteRunning = true;
        getShortestOrderWithEndpoints([startPoint, ...cities, endPoint]);
    }

    if (mutateCheckbox.checked) {
        evolveRunning = true;
        getShortestOrderByGeneticAlgorithmWithEndpoints([
            startPoint,
            ...cities,
            endPoint,
        ]);
    }

    setButtonsStyles();
};
