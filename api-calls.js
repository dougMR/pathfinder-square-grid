const APIUrl = "http://localhost:3001";

const logIn = async () => {
    try {
        const response = await fetch(`${APIUrl}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "Doug R",
                password: "secretpassword",
            }),
            credentials: "include",
        });
        const data = await response.json();
        console.log("login data: ", data);
    } catch (error) {
        console.log("LOGIN ERROR: ", error);
    }
};
logIn();

// Add random items from inventory to list_items
const addRandomItemsToShoppingList = async () => {
    const storeID = 1;
    const userID = 1;
    // get inventory for userID/storeID
    const response = await fetch(
        `http://localhost:3001/store/inventory/${storeID}`
    );
    const data = await response.json();
    const inventory = data.inventory;
    console.log("data.inventory.length: ", data.inventory.length);
    for (const item of inventory) {
        if (Math.random() < 0.5) {
            const response2 = await fetch(`${APIUrl}/list-item`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inventoryID: item.id,
                }),
                credentials: "include",
            });
            console.log("response2: ", response2);
            const data2 = await response2.json();
            console.log("shopping list length: ", data2.length);
        }
    }
};

// Add Tile to tiles table
const addTileToDB = async (storeID, col, row, obstacle) => {
    const response = await fetch("http://localhost:3001/tile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            storeID,
            col,
            row,
            obstacle,
        }),
    });
    const data = response.json();
    // console.log('data: ',data);

    // How to do try / catch without chaining?
};

// Add Multiple Tiles to table
const addTilesToDB = async (tiles) => {
    const response = await fetch("http://localhost:3001/tiles", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            tiles,
        }),
    });
    const data = await response.json();
    console.log("data: ", data);
};

// Add Multiple Inventory Items to inventory_items, items, tags
const addInventoryToDB = async (storeID, items) => {
    console.log("addInventoryToDB ", items.length);
    // for (const item of items) {
    //     console.log('requesting add ',item.name);
    //     const tags = item.tags ? item.tags : [];
    //     const response = await fetch(`http://localhost:3001/item`, {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //             storeID,
    //             name: item.name,
    //             col: item.loc.x,
    //             row: item.loc.y,
    //             tags,
    //         })
    //     });
    //     const data = await response.json();
    //     console.log('returned: ',data);
    // }
    const response = await fetch(`http://localhost:3001/items`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            storeID,
            items,
        }),
    });
    const data = await response.json();
    console.log("returned: ", data);
};

//
// Get tiles grid for store id
//
const getGridByStoreID = async (storeID) => {
    const response = await fetch("http://localhost:3001/grid/:storeID");
    const data = await response.json();
    const grid = [];
    // go through list of tiles, if grid[tile.column_index] isn't and array, put one there
    // put tile at grid[tile.column_index][tile.row_index]
    for (const tile of data.tiles) {
        const col = tile.column_index;
        const row = tile.row_index;
        if (!Array.isArray(grid[col])) {
            grid[col] = [];
        }
        grid[col][row] = {
            col,
            row,
            obstacle: tile.obstacle,
        };
    }
    return grid;
};

//
// Get store
//
const getStoreById = async (storeID) => {
    const response = await fetch("http://localhost:3001/store");
};

//
// Just for example of error catching
const errorCatchingExample = async (storeID, col, row, obstacle) => {
    try {
        const response = await fetch("http://localhost:3001/posts", {
            // body: JSON.stringify({
            // 	postName: "blarg",
            // }),
        });
        if (response.status === 500) {
            throw "Server 500";
        } else {
            const data = await response.json();
            if (data.error) {
                alert("Server was a 200 but has error in the data");
            }
            setPosts(data.posts);
        }
    } catch (error) {
        console.log("Something went wrong with the server");
    }
};

// 
// Manually set the tiles and obstacles in this function before calling
// 
const addTileObstaclesToDB = async () => {
    // Custom settings
    // const startCol = 58;
    // const endCol = 95;
    // const col = 58;
    // const row = 86;
    const tiles = [];
    for (let row = 82; row <= 85; row++) {
        tiles.push({
            col: 95,
            row: row,
            obstacle: true,
        });
    }
    // Call the API
    const response = await fetch(`${APIUrl}/tiles/obstacle`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            tiles,
        }),
    });
    const data = await response.json();
    console.log("SET TILES OBSCACLES data: ", data);
};
