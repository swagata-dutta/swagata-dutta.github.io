// Captures the hero section of index.html as the link-preview image shown when the site is shared
// (og:image / twitter:image): 1200×630 in the light theme, rendered at 2× and saved as a JPEG to stay small.
// Uses the locally installed Chrome; set CHROME_PATH if it lives elsewhere.
// Usage (from the repository root):
//   npm install --no-save puppeteer-core@23.11.1 && node tools/capture-preview.js
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer-core');

const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const page = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
const out = path.join(__dirname, '..', 'assets', 'images', 'og-preview.jpg');

(async () => {
    const browser = await puppeteer.launch({ executablePath: chrome });
    const tab = await browser.newPage();
    await tab.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await tab.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
    await tab.goto(page, { waitUntil: 'networkidle0' });
    await tab.evaluate(() => document.fonts.ready);
    // Let the hero fade in and the background graph settle
    await new Promise(r => setTimeout(r, 2500));
    await tab.screenshot({ path: out, type: 'jpeg', quality: 88, captureBeyondViewport: false });
    await browser.close();
    console.log('Saved ' + path.relative(process.cwd(), out));
})();
