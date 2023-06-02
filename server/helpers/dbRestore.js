const { dB } = require("../middleware/connectToDB");

async function restoreDatabase() {
    const db = await dB();
    //Pull an array of collections from database and drop them
    const collections = await db.listCollections().toArray();
    await Promise.all(
        collections.map(async (collection) => {
            await db.dropCollection(collection.name);
        }
        )
    );
}

module.exports = { restoreDatabase };