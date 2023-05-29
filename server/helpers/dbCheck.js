const { dB } = require("../middleware/connectToDB"); // Importing the dB function from the connectToDB module

// Validating the database
async function validateDatabase() {
    const db = await dB();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((collection) => collection.name);
    const stationCollections = collectionNames.filter((collectionName) => collectionName.startsWith("stations")); // Filtering the station collections
    const journeyCollections = collectionNames.filter((collectionName) => collectionName.startsWith("journey"));
    const usersCollections = collectionNames.filter((collectionName) => collectionName.startsWith("users"));

    // Checking if there are no collections in the database
    if (stationCollections.length === 0 || journeyCollections.length === 0 || usersCollections.length === 0) {
        console.log("No collections found in the database.");
        return false;
    }

    // Validating the station collections
    const stationCollectionValidation = await Promise.all(stationCollections.map(async (collectionName) => {
        return await validateStations(collectionName);
    }));

    // Validating the journey collections
    const journeyCollectionValidation = await Promise.all(journeyCollections.map(async (collectionName) => {
        return await validateJourney(collectionName);
    }));

    // Validating the users collections (check if there is one and only admin user)
    const usersCollectionValidation = await Promise.all(usersCollections.map(async (collectionName) => {
        return await validateUsers(collectionName);
    }));


    // Checking if all station collections and journey collections are valid
    const stationValidation = stationCollectionValidation.every((validation) => validation === true);
    const journeyValidation = journeyCollectionValidation.every((validation) => validation === true);
    const usersValidation = usersCollectionValidation.every((validation) => validation === true);

    // Returning the overall validation result
    if (stationValidation && journeyValidation && usersValidation) {
        return true;
    } else {
        return false;
    }
}
// Validating the station collections
async function validateStations(collectionName) {
    const db = await dB();
    const collection = await db.collection(collectionName);
    const collectionData = await collection.aggregate([{ $sample: { size: 1 } }]).toArray(); // Getting a random document from the collection
    const stationObject = collectionData[0];

    // Checking if the station object has the expected properties and data types
    if (stationObject) {
        if (typeof stationObject.ID === "number" && typeof stationObject.Nimi === "string" && typeof stationObject.Osoite === "string" && typeof stationObject.longitude === "number" && typeof stationObject.latitude === "number" && typeof stationObject.capacity === "number") {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}
// Validating the journey collections
async function validateJourney(collectionName) {
    const db = await dB();
    const collection = await db.collection(collectionName);
    const collectionData = await collection.aggregate([{ $sample: { size: 1 } }]).toArray(); // Getting a random document from the collection
    const journeyObject = collectionData[0];

    // Checking if the journey object has the expected properties and data types, and if the timestamps are valid
    if (journeyObject) {
        if (typeof journeyObject.departure_station_id === "number" && typeof journeyObject.return_station_id === "number" && typeof journeyObject.coveredDistance === "number" && typeof journeyObject.duration === "number") {
            if (Date.parse(journeyObject.departure) && Date.parse(journeyObject.return)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
}

async function validateUsers(collectionName) {
    const db = await dB();
    const collection = await db.collection(collectionName);
    const collectionData = await collection.aggregate([{ $sample: { size: 1 } }]).toArray(); // Getting a random document from the collection
    const userObject = collectionData[0];

    // Checking if the user object has the expected properties and data types
    if (userObject) {
        if (userObject.username === "admin" && typeof userObject.password === "string") {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}


module.exports = { validateDatabase };