import puppeteerCore from 'puppeteer-core';

export const maxDuration = 30;

export async function GET() {
  const results = {};
  
  try {
    const chromium = (await import('@sparticuz/chromium-min')).default;
    results.chromiumLoaded = true;
    
    const execPath = await chromium.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar'
    );
    results.executablePath = execPath;
    
    const browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: execPath,
      headless: chromium.headless,
    });
    
    const page = await browser.newPage();
    await page.goto('https://example.com', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const title = await page.title();
    await browser.close();
    
    results.browserLaunched = true;
    results.pageTitle = title;
  } catch (err) {
    results.error = err.message?.substring(0, 500);
  }

  results.env = {
    VERCEL: process.env.VERCEL || 'not set',
    NODE_VERSION: process.version,
  };

  return Response.json(results, { status: 200 });
}
