const { dB } = require("../middleware/connectToDB"); // Importing the dB function from the connectToDB module

// Function to find all journey collections
async function findJourneyCollections(sort) {
    const db = await dB();
    const collectionNames = await db.listCollections().toArray();
    const journeyCollections = collectionNames.filter(collection => collection.name.startsWith("journey"));

    // Sort the journeyCollections based on a specific order
    journeyCollections.sort((a, b) => {
        if (sort === -1) {
            return b.name.localeCompare(a.name);
        } 
        return a.name.localeCompare(b.name);
    });

    return journeyCollections.map(collection => collection.name);
}

// Function to find average distance from a station
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

// Function to find average distance to a station
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

// Function to find top "n" stations with most journeys to a station, where "n" is the limit
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

// Function to find top "n" stations with most journeys from a station, where "n" is the limit
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