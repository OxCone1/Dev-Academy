const puppeteer = require('puppeteer');

async function startBrowser(){
	let browser;
	try {
	    console.log("Opening the browser......");
	    browser = await puppeteer.launch({
			executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
	        headless: false,
	        args: ["--disable-setuid-sandbox", "--no-sandbox", "--incognito"],
	        'ignoreHTTPSErrors': true
	    });
	} catch (err) {
	    console.log("Could not create a browser instance => : ", err);
	}
	return browser;
}

module.exports = {
	startBrowser
};