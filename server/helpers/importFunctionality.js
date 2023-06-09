// Importing data from csv files to MongoDB
async function importStations(file, db) {
    return new Promise((resolve, reject) => {
        const fs = require("fs");
        const csv = require("fast-csv");
        const filteredData = [];

        fs.createReadStream(file)
            .pipe(csv.parse({ headers: true }))
            .on("data", (row) => {
                    const filteredRow = {
                        ID: parseFloat(row.ID),
                        Nimi: row.Nimi,
                        Osoite: row.Osoite,
                        longitude: parseFloat(row.x),
                        latitude: parseFloat(row.y),
                        capacity: parseFloat(row.Kapasiteet)
                    };
                    filteredData.push(filteredRow);
            })
            .on("end", async () => {
                await db.collection("stations").insertMany(filteredData);
                console.log(`Data import completed for stations`);
                resolve();
            })
            .on("error", (error) => {
                reject(error);
            });
    });
}

// Importing journey data from csv files to MongoDB
async function importJourney(file, db, collectionName) {
    return new Promise((resolve, reject) => {
        const fs = require("fs");
        const csv = require("fast-csv");
        const batchSize = 2500;
        let batchDocuments = [];

        fs.createReadStream(file)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => {
                reject(error);
            })
            .on("data", (data) => {
                if (
                    data["Duration (sec.)"] < 10 ||
                    data["Covered distance (m)"] < 10 ||
                    isNaN(data["Duration (sec.)"]) ||
                    isNaN(data["Covered distance (m)"]) ||
                    (data["Departure"] && new Date(data["Departure"]) < new Date("2021-01-01"))
                    
                ) {
                    return;
                }

                const document = {
                    departure: new Date(data.Departure),
                    returnDate: new Date(data.Return),
                    departure_station_id: parseFloat(data["Departure station id"]),
                    departure_station_name: data["Departure station name"],
                    return_station_id: parseFloat(data["Return station id"]),
                    return_station_name: data["Return station name"],
                    coveredDistance: parseFloat(data["Covered distance (m)"]),
                    duration: parseFloat(data["Duration (sec.)"]),
                };

                batchDocuments.push(document);


                // Insert documents in batch when the batch size is reached
                if (batchDocuments.length === batchSize) {
                    insertDocuments(db, collectionName, batchDocuments);
                    batchDocuments = [];
                }
            })
            .on('end', function () {
                if (batchDocuments.length > 0) {
                    insertDocuments(db, collectionName, batchDocuments)
                        .then(() => {
                            console.log(`Data import completed for ${collectionName}`);
                            resolve();
                        })
                        .catch((error) => {
                            reject(error);
                        });
                } else {
                    resolve(); // Resolve the promise when import is finished
                }
            });
    });
}

// Function to insert an array of documents as a batch
async function insertDocuments(db, collectionName, documents) {
    try {
        await db.collection(collectionName).insertMany(documents);
    } catch (error) {
        console.error('Failed to insert documents:', error);
    }
}

module.exports = { importStations, importJourney };