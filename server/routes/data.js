const express = require('express');
const router = express.Router()
const passport = require('../middleware/auth');
const { createToken } = require('../middleware/auth');
const { dB } = require('../middleware/connectToDB');
const { findJourneyCollections, calculateAverageDistanceFrom, calculateAverageDistanceTo, findTopReturnStations, findTopDepartureStations } = require('../helpers/stationInfoCollector');

//use no auth for this file
router.get('/stations', async (req, res) => {
    const stationCollection = (await dB()).collection("stations")
    try {
        const stations = await stationCollection.find().toArray()
        res.status(200).json({ stations: stations })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
});

router.post('/getStation', async (req, res) => {
    const stationCollection = (await dB()).collection("stations");
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

module.exports = router;