const { dB } = require("../middleware/connectToDB");

// Find duplicates
async function checkAndRemoveDuplicates(db, collectionName) {
    const collection = await db.collection(collectionName);
    const duplicates = await collection.aggregate([
        {
            $group: {
                _id: {
                    departure_station_id: "$departure_station_id",
                    return_station_id: "$return_station_id",
                    coveredDistance: "$coveredDistance",
                    duration: "$duration",
                },
                uniqueIds: { $addToSet: "$_id" },
                count: { $sum: 1 },
            },
        },
        {
            $match: {
                count: { $gt: 1 },
            },
        },
    ]).toArray();

    // Remove duplicates
    if (duplicates.length > 0) {
        console.log("Removing duplicates from", collectionName);
        // Adjust the batch size as needed
        const batchSize = 8000;

        for (let i = 0; i < duplicates.length; i += batchSize) {
            const batch = duplicates.slice(i, i + batchSize);
            const idsToRemove = batch.flatMap((duplicate) =>
                duplicate.uniqueIds.slice(1)
            );

            await collection.deleteMany({ _id: { $in: idsToRemove } });
        }
    }
    const date = new Date("2021-01-01T00:00:00.000Z");
    const dateFilter = { departure: { $lt: date } };
    await collection.deleteMany(dateFilter);
    
}


async function removeDuplicates() {
    const db = await dB();
    const collections = await db.listCollections().toArray();

    // Check if the collections "journey-n" exist
    const journeyCollections = collections.filter((collection) =>
        collection.name.startsWith("journey-")
    );

    // Return a promise that resolves when all collections are processed
    return Promise.all(
        journeyCollections.map(async (collection) => {
            await checkAndRemoveDuplicates(db, collection.name);
        })
    ).then(() => {
        console.log("Cleanup complete");
    })
    .catch((err) => {
        throw new Error(`${err} - Cleanup failed`);
    });
}

module.exports = { removeDuplicates, checkAndRemoveDuplicates };