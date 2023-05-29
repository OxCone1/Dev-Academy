const { dB } = require("../middleware/connectToDB"); // Importing the dB function from the connectToDB module

async function findJourneyCollections() {
    const db = await dB();
    const collectionNames = await db.listCollections().toArray();
    const journeyCollections = collectionNames.filter(collection => collection.name.startsWith("journey"));

    return journeyCollections.map(collection => collection.name);
}

async function calculateAverageDistanceFrom(stationID, journeyCollections) {
    let totalDistance = 0;
    let totalCount = 0;

    for (const collection of journeyCollections) {
        const journeyCollection = (await dB()).collection(collection);

        const result = await journeyCollection.aggregate([
            { $match: { departure_station_id: stationID } },
            { $group: { _id: null, avgDistance: { $avg: "$coveredDistance" } } }
        ]).toArray();

        if (result.length > 0) {
            totalDistance += result[0].avgDistance;
            totalCount++;
        }
    }

    return totalCount > 0 ? totalDistance / totalCount : 0;
}

async function calculateAverageDistanceTo(stationID, journeyCollections) {
    let totalDistance = 0;
    let totalCount = 0;

    for (const collection of journeyCollections) {
        const journeyCollection = (await dB()).collection(collection);

        const result = await journeyCollection.aggregate([
            { $match: { return_station_id: stationID } },
            { $group: { _id: null, avgDistance: { $avg: "$coveredDistance" } } }
        ]).toArray();

        if (result.length > 0) {
            totalDistance += result[0].avgDistance;
            totalCount++;
        }
    }

    return totalCount > 0 ? totalDistance / totalCount : 0;
}

async function findTopReturnStations(stationID, journeyCollections, limit) {
    const topStations = {};

    for (const collection of journeyCollections) {
        const journeyCollection = (await dB()).collection(collection);

        const result = await journeyCollection.aggregate([
            { $match: { departure_station_id: stationID } },
            { $group: { _id: "$return_station_id", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $lookup: { from: "stations", localField: "_id", foreignField: "ID", as: "station" } },
            { $unwind: "$station" },
            { $project: { _id: 0, station: 1, count: 1 } }
        ]).toArray();

        result.forEach(station => {
            if (!topStations[station.station.ID]) {
                topStations[station.station.ID] = { station: station.station, count: 0 };
            }
            topStations[station.station.ID].count += station.count;
        });
    }

    return Object.values(topStations).sort((a, b) => b.count - a.count).slice(0, limit);
    
}

async function findTopDepartureStations(stationID, journeyCollections, limit) {
    const topStations = {};

    for (const collection of journeyCollections) {
        const journeyCollection = (await dB()).collection(collection);

        const result = await journeyCollection.aggregate([
            { $match: { return_station_id: stationID } },
            { $group: { _id: "$departure_station_id", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $lookup: { from: "stations", localField: "_id", foreignField: "ID", as: "station" } },
            { $unwind: "$station" },
            { $project: { _id: 0, station: 1, count: 1 } }
        ]).toArray();

        result.forEach(station => {
            if (!topStations[station.station.ID]) {
                topStations[station.station.ID] = { station: station.station, count: 0 };
            }
            topStations[station.station.ID].count += station.count;
        });
    }

    return Object.values(topStations).sort((a, b) => b.count - a.count).slice(0, limit);
}

module.exports = { findJourneyCollections, calculateAverageDistanceFrom, calculateAverageDistanceTo, findTopReturnStations, findTopDepartureStations };