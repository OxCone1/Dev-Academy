const { removeDuplicates } = require("./dbCleanUp");
const { findAndPopulateCollections } = require("./dataImport");
const { restoreDatabase } = require("./dbRestore");
const startUpStatus = require("../serverMemoryData.json");
const { validateDatabase } = require("./dbCheck");
const spinner = require("cli-spinner").Spinner;

async function startUpInit(argument) {
    // Check if startup is initiated without launch argument
    if (startUpStatus.startUp === true && argument === undefined) {
        console.log("Startup initiated (no launch argument on startup).\nPlease wait a few minutes...");

        // Create and start the spinner for startup
        const startupSpinner = new spinner();
        startupSpinner.setSpinnerString("|/-\\");
        startupSpinner.start();
        startupSpinner.setSpinnerTitle("Startup in progress... DO NOT INTERRUPT THE PROCESS! %s");

        // Perform necessary operations
        await findAndPopulateCollections();
        await removeDuplicates();
        startUpStatus.startUp = false;
        const fs = require("fs");
        fs.writeFile("./serverMemoryData.json", JSON.stringify(startUpStatus), (err) => {
            if (err) {
                console.log(err);
            }
        });

        // Stop the spinner and log the completion
        startupSpinner.stop();
        console.log("Startup completed");
    }
    // Check if startup is initiated with a launch argument
    else if (startUpStatus.startUp === true && argument !== undefined) {
        throw new Error(`Please perform a clean startup (no launch argument)`);
    }
    // Check if startup is already completed and a launch argument is provided
    else if (startUpStatus.startUp === false && argument !== undefined) {
        switch (argument) {
            case "-clean":
                // Handle the -clean parameter
                console.log("Cleaning...");

                // Create and start the spinner for cleaning
                const cleanSpinner = new spinner("Cleaning in progress... %s");
                cleanSpinner.setSpinnerString("|/-\\");
                cleanSpinner.start();

                // Perform the cleaning operation
                await removeDuplicates();
                process.exit();
            case "-restore":
                // Handle the -restore parameter
                console.log("Restoring...");

                // Create and start the spinner for restoring
                const restoreSpinner = new spinner("Restoring in progress... %s");
                restoreSpinner.setSpinnerString("|/-\\");
                restoreSpinner.start();

                // Perform necessary operations
                await restoreDatabase();
                await findAndPopulateCollections();
                await removeDuplicates();
                process.exit();
            case "-kill":
                // Handle the -kill parameter
                console.log("Killing...");

                // Create and start the spinner for killing
                const killSpinner = new spinner("Killing in progress... %s");
                killSpinner.setSpinnerString("|/-\\");
                killSpinner.start();

                // Update startup status and perform necessary operations
                startUpStatus.startUp = true;
                const fs = require("fs");
                fs.writeFile("./serverMemoryData.json", JSON.stringify(startUpStatus), (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                await restoreDatabase();
                killSpinner.stop();
                process.exit();
            default:
                // Handle unknown parameter
                throw new Error(`Received unknown parameter: ${argument}`);
        }
    }
    // Check if startup is already completed and no launch argument is provided
    else if (startUpStatus.startUp === false && argument === undefined) {
        // Create and start the spinner for database validation
        const validationSpinner = new spinner("Validating database... %s");
        validationSpinner.setSpinnerString("|/-\\");
        validationSpinner.start();

        // Perform database validation
        await validateDatabase().then((result) => {
            if (result === true) {
                validationSpinner.stop();
                console.log("Database is valid");
            } else {
                validationSpinner.stop();
                throw new Error(`Database is not valid`);
            }
        });
    }
}

module.exports = { startUpInit };
