const browserObject = require('./browser');
const testers = require('./testers')
const localBackend = "http://localhost:3002"
const liveBackend = "https://academy-server-2023.herokuapp.com"
const liveFrontend = "https://academy-frontend-2023.herokuapp.com/"
const localFrontend = "http://localhost:3000"


async function testWeb(url, expected) {
    //detect if url is local or live
    let testing = ""

    if (url.includes("localhost")) {
        testing = "Local"
    } else {
        testing = "Live"
        //wake up servers
        await testers.wakeUpServer(url);
        await testers.wakeUpServer(liveBackend);
    }
    //start measuring performance
    let startTime = Date.now();

    let browser = await browserObject.startBrowser();
    await testers.webTester(browser, url)
        .then((res) => {
            if (res) {
                console.log(`\x1b[32m${testing} frontend passed checks and is functional\x1b[0m`)
            } else {
                console.log(`\x1b[31m${testing} frontend failed tests and is currently broken\x1b[0m`)
            }
        })

    let endTime = Date.now();
    let totalTime = (endTime - startTime) / 1000;
    let minutes = Math.floor(totalTime / 60);
    let seconds = totalTime - (minutes * 60);

    let percentageDifference = (((totalTime - expected) / expected) * 100).toFixed(2);
    let sign = percentageDifference > 0 ? "+" : "";
    let differenceColor = '\x1b[0m'; // Reset color to default

    if (percentageDifference >= 25) {
        differenceColor = '\x1b[31m'; // Set color to red for a difference of 25% or more
    } else if (percentageDifference > -25 && percentageDifference < 25) {
        differenceColor = '\x1b[33m'; // Set color to yellow for a difference between -25% and 25%
    } else {
        differenceColor = '\x1b[32m'; // Set color to green for a difference of -25% or less
    }

    console.log(`Activation total time: ${minutes} m : ${seconds} s for ${testing} frontend`);
    console.log(`Percentage difference: ${differenceColor}${sign}${percentageDifference}%\x1b[0m  from  expected time of\x1b[36m ${expected}\x1b[0m seconds`);
}

async function testApi(url, expected) {
    //Detect if url is local or live
    let testing = []

    if (url.includes("localhost")) {
        testing = "Local"
    } else {
        testing = "Live"
        await testers.wakeUpServer(url);
    }
    let startTime = Date.now();

    let isFirstLine = true;
    await testers.apiTester(url)
        .then((res) => {
            Object.entries(res).forEach(([testName, testData]) => {
                const { status, passed } = testData;
                let outputColor = '\x1b[0m'; // Reset color to default

                if (isFirstLine) {
                    console.log(`\x1b[36m${testName}: ${JSON.stringify(testData)}\x1b[0m\n`); // Set color to cyan for the first line
                    isFirstLine = false;
                    return;
                }

                if (status === 200 && passed) {
                    outputColor = '\x1b[32m'; // Set color to green for passed test
                } else if (status === 201 && passed) {
                    outputColor = '\x1b[32m'; // Set color to green for passed test
                } else {
                    outputColor = '\x1b[31m'; // Set color to red for failed test
                }

                console.log(`${outputColor}${testName}: ${JSON.stringify(testData)}\x1b[0m\n`);
            });
        })
        .catch((error) => {
            console.error(error);
        });

    let endTime = Date.now();
    let totalTime = (endTime - startTime) / 1000;
    let minutes = Math.floor(totalTime / 60);
    let seconds = totalTime - minutes * 60;

    let percentageDifference = (((totalTime - expected) / expected) * 100).toFixed(2);
    let sign = percentageDifference > 0 ? "+" : "";
    let differenceColor = '\x1b[0m'; // Reset color to default

    if (percentageDifference >= 25) {
        differenceColor = '\x1b[31m'; // Set color to red for a difference of 25% or more
    } else if (percentageDifference > -25 && percentageDifference < 25) {
        differenceColor = '\x1b[33m'; // Set color to yellow for a difference between -25% and 25%
    } else {
        differenceColor = '\x1b[32m'; // Set color to green for a difference of -25% or less
    }

    console.log(`Activation total time: ${minutes} m : ${seconds} s for ${testing} backend`);
    console.log(`Percentage difference: ${differenceColor}${sign}${percentageDifference}%\x1b[0m  from  expected time of\x1b[36m ${expected}\x1b[0m seconds`);
}

async function runAllTests() {
    let startTime = Date.now();
    await testWeb(liveFrontend, 30);
    await testWeb(localFrontend, 20);
    await testApi(liveBackend, 25)
    await testApi(localBackend, 17);
    let endTime = Date.now();
    let totalTime = (endTime - startTime) / 1000;
    let minutes = Math.floor(totalTime / 60);
    let seconds = (totalTime - (minutes * 60)).toFixed(2);
    console.log(`Total time: ${minutes} : ${seconds} seconds`);
    process.exit(1);
}

async function runLiveTests() {
    let startTime = Date.now();
    await testWeb(liveFrontend, 30);
    await testApi(liveBackend, 25)
    let endTime = Date.now();
    let totalTime = (endTime - startTime) / 1000;
    let minutes = Math.floor(totalTime / 60);
    let seconds = (totalTime - (minutes * 60)).toFixed(2);
    console.log(`Total time: ${minutes} : ${seconds} seconds`);
    process.exit(1);
}

async function runLocalTests() {
    let startTime = Date.now();
    await testWeb(localFrontend, 20);
    await testApi(localBackend, 17);
    let endTime = Date.now();
    let totalTime = (endTime - startTime) / 1000;
    let minutes = Math.floor(totalTime / 60);
    let seconds = (totalTime - (minutes * 60)).toFixed(2);
    console.log(`Total time: ${minutes} : ${seconds} seconds`);
    process.exit(1);
}

switch (process.argv[2]) {
    case "-all":
        runAllTests();
        break;
    case "-live":
        runLiveTests();
        break;
    case "-local":
        runLocalTests();
        break;
    default:
        runAllTests();
        break;
}
