const { default: axios } = require("axios");
const jwt = "";

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomNumber(first, last) {
    return Math.floor(Math.random() * (last - first + 1)) + first;
}

async function wakeUpServer(url) {
    axios.get(url)
        .then((response) => {
            if (response.status === 200) {
                return true;
            }
        })
        .catch((error) => {
            console.log(error.message)
        });
}

async function webTester(browser, url) {
    let amount = 0;
    let page = await browser.newPage();
    try {
        await page.goto(url);
        // Wait for main page to load
        await page.waitForSelector(".stations")
        await page.waitForSelector(".journeys")
        // Navigate to stations page
        await page.click("#root > div.containerObject > div > div.stations > div.content-wrapper > a")
        // Grab the amount of stations per page
        amount = await page.$eval("#root > div.containerObject > div > div.pagination-container > div:nth-child(4) > div > button", el => el.textContent);
        amount = amount.slice(0, amount.indexOf("/"));
        amount = parseInt(amount);
        await page.waitForSelector(`#root > div.containerObject > div > div.pagination-container > div.pagination-container-station-list-container > div:nth-child(${getRandomNumber(2, amount + 1)})`)
        await sleep(400);
        // Click on a random station
        await page.click(`#root > div.containerObject > div > div.pagination-container > div.pagination-container-station-list-container > div:nth-child(${getRandomNumber(2, amount + 1)})`)
        // Wait for statistics to load
        await page.waitForSelector(".popup-avg-data-container")
        // Navigate to different station page
        await page.click(`#root > div.containerObject > div > div.pagination-container > div.pagination-container-buttons > div.pagination-container-page-numbers > button:nth-child(${getRandomNumber(2, 3)})`)
        await page.waitForSelector(`#root > div.containerObject > div > div.pagination-container > div.pagination-container-station-list-container > div:nth-child(${getRandomNumber(2, amount + 1)})`)
        await sleep(400);
        // Click on a random station
        await page.click(`#root > div.containerObject > div > div.pagination-container > div.pagination-container-station-list-container > div:nth-child(${getRandomNumber(2, amount + 1)})`)
        await page.waitForSelector(".popup-avg-data-container")
        // Navigate to journeys page
        await page.click("#root > nav > div > div.navbar-selector > div:nth-child(2) > a")
        // Grab the amount of journeys per page
        amount = await page.$eval("#root > div.containerObject > div > div.pagination-container > div.limit > div > button", el => el.textContent);
        amount = amount.slice(0, amount.indexOf("/"));
        amount = parseInt(amount);
        await page.waitForSelector(`#root > div.containerObject > div > div.pagination-container > div.pagination-container-journey-list-container > div:nth-child(${getRandomNumber(2, amount + 1)})`)
        await sleep(400);
        // Click on a random journey
        await page.click(`#root > div.containerObject > div > div.pagination-container > div.pagination-container-journey-list-container > div:nth-child(${getRandomNumber(2, amount + 1)})`)
        // Wait for station popup to load
        await page.waitForSelector("div > div.leaflet-popup-content-wrapper")
        // Navigate to different journey page
        await page.click(`#root > div.containerObject > div > div.pagination-container > div.pagination-container-buttons > div.pagination-container-page-numbers > button:nth-child(${getRandomNumber(2, 3)})`)
        await page.waitForSelector(`#root > div.containerObject > div > div.pagination-container > div.pagination-container-journey-list-container > div:nth-child(${getRandomNumber(2, amount + 1)})`)
        await sleep(800);
        // Click on a random journey
        await page.click(`#root > div.containerObject > div > div.pagination-container > div.pagination-container-journey-list-container > div:nth-child(${getRandomNumber(2, amount + 1)})`)
        await page.waitForSelector("div > div.leaflet-popup-content-wrapper")
        await browser.close();
        return true;
    } catch (error) {
        console.log(error.message);
        await browser.close();
        return false;
    }
}

async function apiTester(url) {
    let jwt = null;
    const successfulTests = {};
    successfulTests.url = url;
    let arrayForLimits = [10, 30, 50, 100]
    let stationIdArray = [745, 395, 355, 315, 305, 290, 264, 204, 118, 76, 68, 36, 16]
    let searchExamples = ["al", "e", "sa", "tu", "ja", "ma", "ju", "au", "se", "oc", "no", "de"]
    let sortingExamples = ["departure_station_name", "return_station_name", "coveredDistance", "duration"]
    let sortingOrderExamples = [1, -1]

    try {
        // Test the '/login' route
        const startLogin = new Date();
        await axios.post(`${url}/user/login`, { username: "admin", password: "admin" })
            .then((response) => {
                if (response.status === 200) {
                    jwt = response.data.token;
                    const endLogin = new Date();
                    const loginTime = (endLogin - startLogin) / 1000; // Calculate time in seconds
                    successfulTests.login = { status: response.status, time: loginTime, passed: true }
                }
            })
            .catch((error) => {
                successfulTests.login = { status: error.response.status, error: error.response.data, passed: false };
                console.log(error.message)
            })


        const config = {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        };

        // Test the '/verify' route
        const startVerify = new Date();
        await axios.get(`${url}/user/verify`, config)
            .then((response) => {
                const endVerify = new Date();
                const verifyTime = (endVerify - startVerify) / 1000; // Calculate time in seconds
                successfulTests.verify = { status: response.status, time: verifyTime, passed: true }
            })
            .catch((error) => {
                successfulTests.verify = { status: error.response.status, error: error.response.data, passed: false };
                console.log(error.message)
            })


        // Test the '/stations' route
        const startStations = new Date();
        await axios.get(`${url}/map/stations`)
            .then((response) => {
                const endStations = new Date();
                const stationsTime = (endStations - startStations) / 1000; // Calculate time in seconds
                successfulTests.stations = { status: response.status, time: stationsTime, passed: true }
            })
            .catch((error) => {
                successfulTests.stations = { status: error.response.status, error: error.response.data, passed: false };
                console.log(error.message)
            })

        // Test the '/stations' route with query parameters for pagination
        const startStationsQuery = new Date();
        await axios.get(`${url}/map/stations?page=${getRandomNumber(1, 5)}&limit=${arrayForLimits[getRandomNumber(1, 4)]}`)
            .then((response) => {
                const endStationsQuery = new Date();
                const stationsQueryTime = (endStationsQuery - startStationsQuery) / 1000; // Calculate time in seconds
                successfulTests.stationsQuery = { status: response.status, time: stationsQueryTime, passed: true }
            })
            .catch((error) => {
                successfulTests.stationsQuery = { status: error.response.status, error: error.response.data, passed: false };
                console.log(error.message)
            })

        // Test the '/stations' route with query parameters for pagination and search
        const startStationsQuerySearch = new Date();
        await axios.get(`${url}/map/stations?page=1&limit=${arrayForLimits[getRandomNumber(1, 4)]}&search=${searchExamples[getRandomNumber(1, searchExamples.length)]}`)
            .then((response) => {
                const endStationsQuerySearch = new Date();
                const stationsQuerySearchTime = (endStationsQuerySearch - startStationsQuerySearch) / 1000; // Calculate time in seconds
                successfulTests.stationsQuerySearch = { status: response.status, time: stationsQuerySearchTime, passed: true };
            })
            .catch((error) => {
                successfulTests.stationsQuerySearch = { status: error.response.status, error: error.response.data, passed: false };
                console.log(error.message)
            });

        // Test the '/getStation' route 
        const startGetStation = new Date();
        const stationID = stationIdArray[getRandomNumber(1, stationIdArray.length)]; // Provide a valid station ID
        await axios.post(`${url}/map/getStation`, { ID: stationID })
            .then((response) => {
                const endGetStation = new Date();
                const getStationTime = (endGetStation - startGetStation) / 1000; // Calculate time in seconds
                successfulTests.getStation = { status: response.status, time: getStationTime, passed: true };
            })
            .catch((error) => {
                successfulTests.getStation = { status: error.response.status, error: error.response.data, passed: false };
                console.log(error.message)
            });


        // Test the '/journeys' route with query parameters for pagination
        const startJourneysQuery = new Date();
        const journeysQueryOptions = {
            page: getRandomNumber(1, 100), // Provide a valid page number   
            limit: arrayForLimits[getRandomNumber(1, arrayForLimits.length)], // Provide a valid limit
            sort: {},
            filter: {}
        };
        await axios.post(`${url}/map/journeys`, { options: journeysQueryOptions })
            .then((response) => {
                const endJourneysQuery = new Date();
                const journeysQueryTime = (endJourneysQuery - startJourneysQuery) / 1000; // Calculate time in seconds
                successfulTests.journeysQuery = { status: response.status, time: journeysQueryTime, passed: true };
            })
            .catch((error) => {
                successfulTests.journeysQuery = { status: error.response.status, error: error.response.data, passed: false };
                console.log(error.message)
            });


        // Test the '/journeys' route with query parameters for pagination and sorting
        const startJourneys = new Date();
        const sorting = sortingExamples[getRandomNumber(1, sortingExamples.length)];
        const sortingOrder = sortingOrderExamples[getRandomNumber(1, sortingOrderExamples.length)];
        const journeysOptions = {
            page: getRandomNumber(1, 100), // Provide a valid page number
            limit: arrayForLimits[getRandomNumber(1, arrayForLimits.length)], // Provide a valid limit
            sort: {
                sorting: sortingOrder
            },
            filter: {}
        };
        await axios.post(`${url}/map/journeys`, { options: journeysOptions })
            .then((response) => {
                const endJourneys = new Date();
                const journeysTime = (endJourneys - startJourneys) / 1000; // Calculate time in seconds
                successfulTests.journeys = { status: response.status, time: journeysTime, passed: true };
            })
            .catch((error) => {
                successfulTests.journeys = { status: error.response.status, error: error.response.data, passed: false };
                console.log(error.message)
            });


        // Test the '/journey' route
        const startJourney = new Date();
        const journeyData = {
            departure: '2023-06-01',
            returnDate: '2023-06-03',
            departure_station_id: 1,
            return_station_id: 2,
            departure_station_name: 'Station A',
            return_station_name: 'Station B',
            coveredDistance: 100,
            duration: 120,
        };
        await axios.post(`${url}/map/journey`, { journey: journeyData }, config)
            .then((response) => {
                const endJourney = new Date();
                const journeyTime = (endJourney - startJourney) / 1000; // Calculate time in seconds
                successfulTests.journey = { status: response.status, time: journeyTime, passed: true };
            })
            .catch((error) => {
                successfulTests.journey = { status: error.response.status, error: error.response.data, passed: false };
                console.log(error.message)
            });

        // Test the '/station' route
        const startStation = new Date();
        const stationData = {
            Nimi: "Station C",
            Osoite: "Address XYZ",
            latitude: 123,
            longitude: 456,
            capacity: 50,
        };
        await axios.post(`${url}/map/station`, { station: stationData }, config)
            .then((response) => {
                const endStation = new Date();
                const stationTime = (endStation - startStation) / 1000; // Calculate time in seconds
                successfulTests.station = { status: response.status, time: stationTime, passed: true };
            })
            .catch((error) => {
                successfulTests.station = { status: error.response.status, error: error.response.data, passed: false };
                console.log(error.message)
            });

        return successfulTests;
    } catch (error) {
        console.error('Error:', error.message);
        return false;
    }
}

module.exports = { webTester, getRandomNumber, apiTester, wakeUpServer };