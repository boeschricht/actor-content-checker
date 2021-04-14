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
        url: url1,
        url: url2,
        url: url2,
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

    function getData(dataStore, sURL, sURLdescription, sURLContentSelector, sURL_Keyname_Prefix) {
        // open URL1 in a browser
        log.info(`Opening URL1: ${sURLdescription}`);
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto(sURL, {
            waitUntil: 'networkidle2',
            timeout: navigationTimeout,
        });
    
        // wait 5 seconds (if there is some dynamic content)
        // TODO: this should wait for the selector to be available
        log.info('Sleeping 5s ...');
        await sleep(5000);
    
        // Store data
        log.info('Saving data for ${sURLdescription}...');
        let content = null;
        try {
            content = await page.$eval(sContentSelector, (el) => el.textContent);
        } catch (e) {
            throw new Error('Cannot get content (content selector is probably wrong)');
        }
        
        log.info(`Storing data ...`);
        log.info(`${sURLdescription} data: ${content}`);
        log.info(`KeyName: ` + sURLContentSelector);
        await dataStore.setValue(sURL_Keyname_Prefix + dateTime, content);
    }
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
    
    getData(store, url1, "url1", sContentSelector1, keyname_prefix1)
    getData(store, url2, "url2", sContentSelector2, keyname_prefix2)
    getData(store, url3, "url3", sContentSelector3, keyname_prefix3)

    log.info('Closing Puppeteer...');
    await browser.close();

    log.info('Done.');
});
