console.log("hello from data-calls.js");
// Store Entrance // Checkout
let entranceTile, checkoutTile;
const stores = [
    { id: 1, index: 0, name: "Fresh Mart" },
    { id: 2, index: 1, name: "James St Wegmans" },
];

const getStores = () => {
    return stores;
};
const getInventory = (storeID) => {
    const inventory = dummy_inventories.find((el) => el.storeID === storeID);
    return inventory.inventory;
};
const getMap = (storeID) => {
    const store = dummy_stores.find((el) => el.storeID === storeID);
    return store.grid;
};
const getDummyStore = (storeID) => {
    const store = dummy_stores.find((el) => el.storeID === storeID);
    return store;
};

// build out store objects
for (const store of stores) {
    const dummyStore = getDummyStore(store.id);
    store.inventory = getInventory(store.id);
    store.grid = getMap(store.id);
    store.tileSize = dummyStore.tileSize;
    store.numRows = dummyStore.numRows;
    store.numColumns = dummyStore.numColumns;
    store.floorPlanImage = dummyStore.floorPlanImage;
    store.entranceTile = dummyStore.entranceTile;
    store.checkoutTile = dummyStore.checkoutTile;
}
console.log("stores[0].tileSize: ", stores[0].tileSize);

const getStore = (id) => {
    console.log('getStore('+id+')');
    const store = stores.find((el) => el.id === id);
    const storeImg = document.querySelector("#canvas-holder img");
    storeImg.src = `./images/${store.floorPlanImage}`;
    store.entranceTile = entranceTile = store.grid[store.entranceTile.col][store.entranceTile.row];
    store.checkoutTile = checkoutTile = store.grid[store.checkoutTile.col][store.checkoutTile.row];
    return store;
};

let currentStore = getStore(2);

const numTiles = currentStore.grid.length * currentStore.grid[0].length;
console.log("# grid tiles: ",numTiles);

console.log('entranceTile: ',entranceTile);