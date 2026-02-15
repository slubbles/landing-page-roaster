import { createRequire } from 'module';

export const maxDuration = 30;

export async function GET() {
  const _require = createRequire(import.meta.url);
  const results = {};
  
  // Test 1: Can we require chromium?
  try {
    const chromium = _require('@sparticuz/chromium');
    results.chromiumLoaded = true;
    results.chromiumType = typeof chromium;
    results.chromiumKeys = Object.keys(chromium).slice(0, 10);
    results.chromiumArgs = chromium.args?.slice(0, 3);
  } catch (err) {
    results.chromiumLoaded = false;
    results.chromiumError = err.message;
  }

  // Test 2: Can we get executablePath?
  try {
    const chromium = _require('@sparticuz/chromium');
    const execPath = await chromium.executablePath();
    results.executablePath = execPath;
    const fs = _require('fs');
    results.executableExists = fs.existsSync(execPath);
  } catch (err) {
    results.execPathError = err.message;
  }

  // Test 3: Can we require puppeteer-core?
  try {
    const puppeteerCore = _require('puppeteer-core');
    results.puppeteerLoaded = true;
    results.puppeteerType = typeof puppeteerCore?.launch;
  } catch (err) {
    results.puppeteerLoaded = false;
    results.puppeteerError = err.message;
  }

  // Test 4: Launch + navigate
  try {
    const chromium = _require('@sparticuz/chromium');
    const puppeteerCore = _require('puppeteer-core');
    
    const browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    
    const page = await browser.newPage();
    await page.goto('https://example.com', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const title = await page.title();
    await browser.close();
    
    results.browserLaunched = true;
    results.pageTitle = title;
  } catch (err) {
    results.browserLaunched = false;
    results.browserError = err.message?.substring(0, 300);
  }

  results.env = {
    VERCEL: process.env.VERCEL || 'not set',
    NODE_VERSION: process.version,
  };

  return Response.json(results, { status: 200 });
}
