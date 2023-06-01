const express = require('express');
const router = express.Router()
const passport = require('../middleware/auth');
const { dB } = require('../middleware/connectToDB');
const { findJourneyCollections, calculateAverageDistanceFrom, calculateAverageDistanceTo, findTopReturnStations, findTopDepartureStations } = require('../helpers/stationInfoCollector');
const { ObjectId } = require('mongodb');

//use no auth for this file
router.get('/stations', async (req, res) => {
    const db = await dB();
    const stationCollection = db.collection("stations");

    // Check if pagination parameters are provided
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const isPaginationEnabled = !isNaN(page) && !isNaN(limit);

    // Check if search query is provided
    const searchQuery = req.query.search;
    try {
        let stations;
        let stationsCount;
        let response = {};
        if (isPaginationEnabled) {
            // Pagination parameters
            let startIndex = (page - 1) * limit;
            let endIndex = page * limit;

            let query = {};

            if (searchQuery) {
                // Add search query conditions for station name or address
                query.$or = [
                    { Nimi: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive regex search for station name
                    { Osoite: { $regex: searchQuery, $options: 'i' } } // Case-insensitive regex search for address
                ];
            }

            stationsCount = await stationCollection.countDocuments(query);
            stations = await stationCollection.find(query).skip(startIndex).limit(limit).toArray();

            response = {
                totalStations: stationsCount,
                currentPage: page,
                totalPages: Math.ceil(stationsCount / limit),
                hasNextPage: endIndex < stationsCount,
                hasPreviousPage: startIndex > 0,
                stations: stations
            };
            res.status(200).json(response);
        } else {
            stations = await stationCollection.find().toArray();
            res.status(200).json({ stations: stations });
        }

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/getStation', async (req, res) => {
    const db = await dB();
    const stationCollection = db.collection("stations");
    const stationID = req.body.ID;

    try {
        const station = await stationCollection.findOne({ ID: stationID });

        if (station) {
            const journeyCollections = await findJourneyCollections();
            const avgDistanceFrom = await calculateAverageDistanceFrom(station.ID, journeyCollections);
            const avgDistanceTo = await calculateAverageDistanceTo(station.ID, journeyCollections);
            const topReturnStations = await findTopReturnStations(station.ID, journeyCollections, 5);
            const topDepartureStations = await findTopDepartureStations(station.ID, journeyCollections, 5);

            const response = {
                station,
                avgDistanceFrom,
                avgDistanceTo,
                topReturnStations,
                topDepartureStations
            };

            res.status(200).json(response);
        } else {
            res.status(404).json({ message: "Station not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/journeys', async (req, res) => {
    try {
        const db = await dB();
        const options = req.body.options || {};

        const page = parseInt(options.page);
        const limit = parseInt(options.limit);
        const isPaginationEnabled = !isNaN(page) && !isNaN(limit);

        const filter = options.filter || {};
        const sort = options.sort || {};
        const sortOrder = options.sort.departure || options.sort.returnDate || {};

        const aggregationPipeline = [];

        // Filtering
        if (Object.keys(filter).length > 0) {
            aggregationPipeline.push({ $match: filter });
        }

        // Sorting
        if (Object.keys(sort).length > 0) {
            aggregationPipeline.push({ $sort: sort });
        }

        const journeyCollections = await findJourneyCollections(sortOrder);

        let totalJourneys = 0;
        let paginatedJourneys = [];

        for (const collection of journeyCollections) {
            const countPipeline = [...aggregationPipeline, { $count: "totalJourneys" }];
            const [journeyCount] = await db.collection(collection).aggregate(countPipeline).toArray();
            const collectionJourneyCount = journeyCount ? journeyCount.totalJourneys : 0;

            totalJourneys += collectionJourneyCount;

            if (isPaginationEnabled) {
                const startIndex = (page - 1) * limit;
                const endIndex = page * limit;
                const collectionStartIndex = Math.max(startIndex - totalJourneys + collectionJourneyCount, 0);
                const collectionEndIndex = Math.min(endIndex - totalJourneys + collectionJourneyCount, collectionJourneyCount);

                if (collectionStartIndex < collectionEndIndex) {
                    const pipeline = [...aggregationPipeline, { $skip: collectionStartIndex }, { $limit: collectionEndIndex - collectionStartIndex }];
                    const journeys = await db.collection(collection).aggregate(pipeline).toArray();
                    paginatedJourneys = [...paginatedJourneys, ...journeys]; // Append the journeys to the existing paginatedJourneys array
                }
            } else {
                const pipeline = [...aggregationPipeline];
                const journeys = await db.collection(collection).aggregate(pipeline).toArray();
                paginatedJourneys = [...paginatedJourneys, ...journeys]; // Append the journeys to the existing paginatedJourneys array
            }
        }

        let response = {};

        if (isPaginationEnabled) {
            response = {
                totalJourneys: totalJourneys,
                currentPage: page,
                totalPages: Math.ceil(totalJourneys / limit),
                hasNextPage: (page * limit) < totalJourneys,
                hasPreviousPage: page > 1,
                journeys: paginatedJourneys
            };
        } else {
            response = {
                totalJourneys: totalJourneys,
                journeys: paginatedJourneys
            };
        }

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

router.post('/journey', passport.authenticate('jwt', { session: false }), async (req, res) => {
    //get user _id from jwt
    const userID = req.user._id;
    // validate journey object
    const journey = req.body.journey;
    if (typeof journey.departure === "string" && typeof journey.returnDate === "string" && typeof journey.departure_station_id === "number" && typeof journey.return_station_name === "string" && typeof journey.return_station_id === "number" && typeof journey.departure_station_name === "string" && typeof journey.coveredDistance === "number" && typeof journey.duration === "number") {

        const db = await dB();
        // check departure date and then check if there is a collection for that year+month (journey-YYYY-MM)
        const departureDate = new Date(req.body.journey.departure);
        const returnDate = new Date(req.body.journey.returnDate);
        // add 0 to month if it is less than 10 (do it with ``)
        const collectionName = `journey-${departureDate.getFullYear()}-${departureDate.getMonth() < 10 ? `0${departureDate.getMonth() + 1}` : departureDate.getMonth()}`;
        const journeyCollection = db.collection(collectionName);

        let journeyData = {
            departure: departureDate,
            returnDate: returnDate,
            departure_station_id: req.body.journey.departure_station_id,
            return_station_id: req.body.journey.return_station_id,
            departure_station_name: req.body.journey.departure_station_name,
            return_station_name: req.body.journey.return_station_name,
            coveredDistance: req.body.journey.coveredDistance,
            duration: req.body.journey.duration,
            owner: userID
        };

        try {
            const journeyCollections = await findJourneyCollections();
            let journeyExists = false;

            for (const collection of journeyCollections) {
                const existingJourney = await db.collection(collection).findOne({
                    duration: journeyData.duration,
                    coveredDistance: journeyData.coveredDistance,
                    departure_station_id: journeyData.departure_station_id,
                    return_station_id: journeyData.return_station_id,
                    departure: { "$gte": journeyData.departure },
                    returnDate: { "$gte": journeyData.returnDate }
                });

                if (existingJourney) {
                    journeyExists = true;
                    break;
                }
            }

            if (journeyExists) {
                res.status(409).json({ message: "Journey already exists" });
            } else {
                await journeyCollection.insertOne(journeyData);
                res.status(201).json({ message: "Journey created" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    } else {
        res.status(400).json({ message: "Invalid journey object" });
    }
});


router.post('/station', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const db = await dB();
    const stationCollection = db.collection("stations");
    const station = req.body.station;

    // Get the last inserted document from the collection
    const lastDocument = await stationCollection.findOne({}, { sort: { ID: -1 } });

    // Extract the last ID and increment it by one
    const lastID = lastDocument ? lastDocument.ID : 0;
    const newID = lastID + 1;

    // Assign the new ID to the station object
    station.ID = newID;

    // Check if the station object has all required fields
    if (typeof station.Nimi === "string" && typeof station.Osoite === "string" && typeof station.latitude === "number" && typeof station.longitude === "number" && typeof station.capacity === "number") {
        // Find if a station with the same ID already exists
        try {
            // Insert the new station document
            await stationCollection.insertOne(station);
            res.status(201).json({ message: "Station created" });
        } catch (error) {
            res.status(500).json({ message: "Failed to create station" });
        }
    } else {
        res.status(400).json({ message: "Invalid station data" });
    }
});

module.exports = router;