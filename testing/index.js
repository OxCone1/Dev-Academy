const browserObject = require('./browser');
const scraper = require('./tester');

async function test() {
    const startTime = Date.now();
    const start = Date.now();
    
    let browser = await browserObject.startBrowser();
    await scraper.tester(browser, "https://google.com/");
    await browser.close();

    const end = Date.now();
    const time = (end - start) / 1000;
    console.log(`Performance: ${time} seconds/page`);
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    console.log(`Activation total time: ${totalTime} seconds\n~${Math.floor(totalTime / 60)} minutes`);
}
test();