const { dB } = require("../middleware/connectToDB");
const { importStations, importJourney } = require("./importFunctionality");
const bcrypt = require("bcryptjs");

async function findAndPopulateCollections() {
    const db = await dB();
    const collections = await db.listCollections().toArray();

    // Check if the collection "stations" exists in the database and create it if there is none - create the collection and import the data
    if (!collections.some((collection) => collection.name === "stations")) {
        await db.createCollection("stations"); 
        await importStations("../server/csvData/stations.csv", db); // Import stations from the CSV file
    }
    
    //Check if the collection "Users" exists in the database and create it if there is none, also inserting default admin user
    if (!collections.some((collection) => collection.name === "users")) {
        await db.createCollection("users");
        const users = db.collection("users");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin", salt);
        const adminUser = {
            username: "admin",
            password: hashedPassword,
        };
        await users.insertOne(adminUser);
        console.log("Users collection created and admin user inserted");
    }

    // Find missing journey collections
    const missingCollections = ["journey-05", "journey-06", "journey-07"].filter(
        (collection) => !collections.some((c) => c.name === collection)
    );

    // Import missing journey collections
    await Promise.all(
        missingCollections.map(async (collectionName, index) => {
            await db.createCollection(collectionName);
            const csvFilePath = `../server/csvData/2021-0${index + 5}.csv`;
            await importJourney(csvFilePath, db, collectionName); // Import journey data from the CSV file for each missing collection
        })
    );
}

module.exports = { findAndPopulateCollections };
