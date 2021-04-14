const Apify = require('apify');

const screenshotDOMElement = require('./screenshot');
const validateInput = require('./validate-input');

const { log, sleep } = Apify.utils;

function toISOStringLocal(d) {
    function z(n){return (n<10?'0':'') + n}
    return d.getFullYear() + '-' + z(d.getMonth()+1) + '-' +
           z(d.getDate()) + 'T' + z(d.getHours()) + 
           z(d.getMinutes())
            
  }

Apify.main(async () => {
    const input = await Apify.getInput();
    validateInput(input);

    const {
        url1: url1,
        url2: url2,
        url3: url3,
        contentSelector1,
        contentSelector2,
        contentSelector3,
        keyname_prefix1,
        keyname_prefix2,
        keyname_prefix3,
        proxy = {
            useApifyProxy: false
        },
        navigationTimeout = 30000,
    } = input;

    // use or create a named key-value store for historic data
    var today = new Date();
    var dateTime = toISOStringLocal(today)
   
    let storeName = !process.env.DATASET ? ('content-checker-store-'+dateTime) : process.env.DATASET;
    log.info('storeName: ' + storeName);

    const store = await Apify.openKeyValueStore(storeName);

    log.info('Launching Puppeteer...');
    const browser = await Apify.launchPuppeteer({
        proxyUrl: proxyConfiguration ? proxyConfiguration.newUrl() : undefined,
    });
    
    // open URL1 in a browser
    log.info(`Opening URL1: ` + url1);
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url1, {
        waitUntil: 'networkidle2',
        timeout: navigationTimeout,
    });

    // wait 5 seconds (if there is some dynamic content)
    // TODO: this should wait for the selector to be available
    log.info('Sleeping 5s ...');
    await sleep(5000);

    // Store data
    log.info('Saving data for url1...');
    let content = null;
    try {
        content = await page.$eval(contentSelector1, (el) => el.textContent);
    } catch (e) {
        throw new Error('Cannot get content (content selector is probably wrong)');
    }
    
    log.info(`Storing data ...`);
    log.info(`url1 data: ${content}`);
    log.info(`KeyName: ` + keyname_prefix1 + dateTime);
    await dataStore.setValue(keyname_prefix1 + dateTime, content);

    // open URL2 in a browser
    log.info(`Opening URL2: ` + url2);
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url2, {
        waitUntil: 'networkidle2',
        timeout: navigationTimeout,
    });

    // wait 5 seconds (if there is some dynamic content)
    // TODO: this should wait for the selector to be available
    log.info('Sleeping 5s ...');
    await sleep(5000);

    // Store data
    log.info('Saving data for url2...');
    let content = null;
    try {
        content = await page.$eval(contentSelector2, (el) => el.textContent);
    } catch (e) {
        throw new Error('Cannot get content (content selector is probably wrong)');
    }
    
    log.info(`Storing data ...`);
    log.info(`url2 data: ${content}`);
    log.info(`KeyName: ` + keyname_prefix2 + dateTime);
    await dataStore.setValue(keyname_prefix2 + dateTime, content);

    // open URL3 in a browser
    log.info(`Opening URL3: ` + url3);
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url3, {
        waitUntil: 'networkidle2',
        timeout: navigationTimeout,
    });

    // wait 5 seconds (if there is some dynamic content)
    // TODO: this should wait for the selector to be available
    log.info('Sleeping 5s ...');
    await sleep(5000);

    // Store data
    log.info('Saving data for url3...');
    let content = null;
    try {
        content = await page.$eval(contentSelector3, (el) => el.textContent);
    } catch (e) {
        throw new Error('Cannot get content (content selector is probably wrong)');
    }
    
    log.info(`Storing data ...`);
    log.info(`url3 data: ${content}`);
    log.info(`KeyName: ` + keyname_prefix3 + dateTime);
    await dataStore.setValue(keyname_prefix3 + dateTime, content);

    log.info('Closing Puppeteer...');
    await browser.close();

    log.info('Done.');
});
