async function tester(browser, url) {
    let page = await browser.newPage();
    console.log(`Navigating to ${url}...`);
    await page.goto(url);
}

module.exports = { tester };