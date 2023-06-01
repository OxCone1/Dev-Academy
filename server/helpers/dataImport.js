const { dB } = require("../middleware/connectToDB");
const { importStations, importJourney } = require("./importFunctionality");
const bcrypt = require("bcryptjs");
const fs = require('fs');
const path = require('path');
const dataDirectory = '../server/csvData';

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

    // Get a list of CSV files in the data directory
    const dataDirectory = '../server/csvData';
    const csvFiles = fs.readdirSync(dataDirectory).filter((file) => {
        const fileName = path.basename(file, '.csv');
        const [year, month] = fileName.split('-');
        const validFormat = /^\d{4}-\d{2}$/.test(fileName); // Check if the file name matches the YYYY-MM format
        const validYear = parseInt(year, 10) >= 2000 && parseInt(year, 10) <= 9999; // Validate the year range if necessary
        const validMonth = parseInt(month, 10) >= 1 && parseInt(month, 10) <= 12; // Validate the month range if necessary
        return validFormat && validYear && validMonth;
    });

    // Import missing journey collections
    await Promise.all(
        csvFiles.map(async (csvFile) => {
            const fileName = path.basename(csvFile, '.csv');
            const [year, month] = fileName.split('-');
            const collectionName = `journey-${year}-${month}`;

            if (!collections.some((c) => c.name === collectionName)) {
                await db.createCollection(collectionName);
                const csvFilePath = path.join(dataDirectory, csvFile);
                await importJourney(csvFilePath, db, collectionName); // Import journey data from the CSV file
            }
        })
    );
}

module.exports = { findAndPopulateCollections };
