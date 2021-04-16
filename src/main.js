const Apify = require('apify');
const ApifyClient = require('apify-client');

const screenshotDOMElement = require('./screenshot');
const validateInput = require('./validate-input');

const { log, sleep } = Apify.utils;

function Date_toISOStringLocal(d) {
    function z(n){return (n<10?'0':'') + n}
    return d.getFullYear() + '-' + z(d.getMonth()+1) + '-' +
           z(d.getDate())
            
  }
  function Time_toISOStringLocal(d) {
    function z(n){return (n<10?'0':'') + n}
    return z(d.getHours()+2) + ':' +  
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
        proxy = {
            useApifyProxy: false
        },
        navigationTimeout = 30000,
    } = input;

    
    var today = new Date();
    
    // const client = await Apify.newClient();
    // const datasetClient = client.datasetClient('jrnKQ29nVrrWuz7KS');
    // const datasetClient = await Apify.client.dataset('jrnKQ29nVrrWuz7KS');
    const apifyClient = new ApifyClient({token: 'uAqFSRMzpGuFCkRb8fjX77tni'});
    log.info('user: ' + await apifyClient.user().get());
    const datasetClient = apifyClient.dataset('boeschricht/Kurser20210414');
    // const datasetClient = apifyClient.dataset('jrnKQ29nVrrWuz7KS');
    const datasetHTML = await datasetClient.downloadItems("html");
    log.info('datasetHTML: ' + datasetHTML)
    const datasetXLSX = await datasetClient.downloadItems("xlsx");
    await Apify.call('apify/send-mail', {
        to: 'boeschricht@gmail.com;boeschricht@gmail.com',
        subject: 'Kurser på obligationer',
        html: datasetHTML, 
        attachments: [{
            filename: 'Kurser '+ Date_toISOStringLocal(today) +' '+ Time_toISOStringLocal(today) + '.xlsx',
            data: datasetXLSX 
        }]
    });

    const proxyConfiguration = await Apify.createProxyConfiguration(proxy);

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
    
    // Get data for url 1
    log.info('Fetching data for url1...');
    let content1 = null;
    try {
        content1 = await page.$eval(contentSelector1, (el) => el.textContent);
    } catch (e) {
        throw new Error('Cannot get content (content selector is probably wrong)');
    }
    log.info(`url1 data: ${content1}`);

    // open URL2 in a browser
    log.info(`Opening URL2: ` + url2);
    await page.goto(url2, {
        waitUntil: 'networkidle2',
        timeout: navigationTimeout,
    });

    // wait 5 seconds (if there is some dynamic content)
    // TODO: this should wait for the selector to be available
    log.info('Sleeping 5s ...');
    await sleep(5000);

    // Get data for url 2
    log.info('Fetching data for url2...');
    let content2 = null;
    try {
        content2 = await page.$eval(contentSelector2, (el) => el.textContent);
    } catch (e) {
        throw new Error('Cannot get content (content selector is probably wrong)');
    }
    log.info(`url2 data: ${content2}`);

    // open URL3 in a browser
    log.info(`Opening URL3: ` + url3);
    await page.goto(url3, {
        waitUntil: 'networkidle2',
        timeout: navigationTimeout,
    });

    // wait 5 seconds (if there is some dynamic content)
    // TODO: this should wait for the selector to be available
    log.info('Sleeping 5s ...');
    await sleep(5000);
    
    // Get data for url 3
    log.info('Fetching data for url3...');
    let content3 = null;
    try {
        content3 = await page.$eval(contentSelector3, (el) => el.textContent);
    } catch (e) {
        throw new Error('Cannot get content (content selector is probably wrong)');
    }
    log.info(`url3 data: ${content3}`);
    
    const dataset = await Apify.openDataset('Kurser20210414');
    dataset.pushData({date: Date_toISOStringLocal(today), time: Time_toISOStringLocal(today), key1: "url1", val1: content1, key2: "url2", val2: content2, key3: "url3", val3: content3})
    log.info('Closing Puppeteer...');
    await browser.close();
    
    
    log.info('Done.');
});
