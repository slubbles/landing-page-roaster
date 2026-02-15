import { scrapeLandingPage, generateRoast } from '../../../lib/roast-engine.js';
import { saveRoast } from '../../../lib/storage.js';
import { checkRateLimit, getClientIp } from '../../../lib/rate-limit.js';
import crypto from 'crypto';

export const maxDuration = 60; // Vercel Pro allows up to 300s, free = 60s

export async function POST(request) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const limit = checkRateLimit(ip);
    if (!limit.allowed) {
      return Response.json(
        { error: `Slow down — you can roast again in ${limit.resetIn} seconds. (5 free roasts/hour)` },
        { status: 429, headers: { 'Retry-After': String(limit.resetIn) } }
      );
    }

    const { url, email } = await request.json();

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let cleanUrl;
    try {
      cleanUrl = new URL(url).href;
    } catch {
      return Response.json({ error: 'Invalid URL — try something like https://example.com' }, { status: 400 });
    }

    // Block obviously bad URLs
    const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '192.168.', '10.', '[::1]'];
    if (blocked.some(b => cleanUrl.includes(b))) {
      return Response.json({ error: 'Cannot roast local/private URLs' }, { status: 400 });
    }

    // Generate unique ID for this roast
    const id = crypto.randomBytes(8).toString('hex');

    // Step 1: Scrape the landing page
    console.log(`[ROAST ${id}] Scraping ${cleanUrl}...`);
    let scrapedData;
    try {
      scrapedData = await scrapeLandingPage(cleanUrl);
    } catch (err) {
      console.error(`[ROAST ${id}] Scrape failed:`, err.message, err.stack);
      return Response.json(
        { error: `Couldn't access that page — it may be blocking scrapers, behind a login, or taking too long to load.` },
        { status: 422 }
      );
    }

    // Step 2: Generate the roast
    console.log(`[ROAST ${id}] Generating roast...`);
    let roast;
    try {
      roast = await generateRoast(scrapedData);
    } catch (err) {
      console.error(`[ROAST ${id}] AI analysis failed:`, err.message);
      return Response.json(
        { error: 'AI analysis failed — please try again in a moment.' },
        { status: 502 }
      );
    }

    // Step 3: Build result object
    const result = {
      id,
      url: cleanUrl,
      email: email || null,
      roast,
      screenshots: {
        hero: scrapedData.screenshots.hero,
        mobile: scrapedData.screenshots.mobile,
      },
      pageData: scrapedData.pageData,
      performance: scrapedData.performance,
      mobileData: scrapedData.mobileData,
      diagnostics: scrapedData.diagnostics,
      createdAt: new Date().toISOString(),
    };

    // Step 4: Persist
    await saveRoast(id, result);

    console.log(`[ROAST ${id}] Complete! Score: ${roast.overallScore}/100`);

    return Response.json({ 
      id, 
      score: roast.overallScore,
      verdict: roast.verdict,
      result, // Full data for client-side caching (sessionStorage)
    });

  } catch (error) {
    console.error('Roast error:', error);
    return Response.json(
      { error: error.message || 'Failed to roast this page. Try again.' },
      { status: 500 }
    );
  }
}
