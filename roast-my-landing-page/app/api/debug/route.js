export const maxDuration = 30;

export async function GET() {
  const results = {};
  
  // Test 1: Can we import chromium?
  try {
    const { createRequire } = await import('module');
    const _require = createRequire(import.meta.url);
    const chromium = _require('@sparticuz/chromium');
    results.chromiumLoaded = true;
    results.chromiumType = typeof chromium;
    results.chromiumKeys = Object.keys(chromium);
    results.chromiumArgs = chromium.args;
    results.chromiumHeadless = chromium.headless;
  } catch (err) {
    results.chromiumLoaded = false;
    results.chromiumError = err.message;
    results.chromiumStack = err.stack?.substring(0, 500);
  }

  // Test 2: Can we get executablePath?
  try {
    const { createRequire } = await import('module');
    const _require = createRequire(import.meta.url);
    const chromium = _require('@sparticuz/chromium');
    const execPath = await chromium.executablePath();
    results.executablePath = execPath;
    
    // Check if the file exists
    const fs = _require('fs');
    results.executableExists = fs.existsSync(execPath);
  } catch (err) {
    results.execPathError = err.message;
    results.execPathStack = err.stack?.substring(0, 500);
  }

  // Test 3: Can we import puppeteer-core?
  try {
    const puppeteerCore = (await import('puppeteer-core')).default;
    results.puppeteerLoaded = true;
    results.puppeteerType = typeof puppeteerCore;
  } catch (err) {
    results.puppeteerLoaded = false;
    results.puppeteerError = err.message;
  }

  // Test 4: Can we launch Chrome?
  try {
    const { createRequire } = await import('module');
    const _require = createRequire(import.meta.url);
    const chromium = _require('@sparticuz/chromium');
    const puppeteerCore = (await import('puppeteer-core')).default;
    
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
    results.browserError = err.message;
    results.browserStack = err.stack?.substring(0, 500);
  }

  // Environment info
  results.env = {
    VERCEL: process.env.VERCEL || 'not set',
    NODE_VERSION: process.version,
    PLATFORM: process.platform,
    ARCH: process.arch,
  };

  return Response.json(results, { status: 200 });
}
