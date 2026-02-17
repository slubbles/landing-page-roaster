/**
 * LANDING PAGE ROAST ENGINE
 * 
 * Scrapes a landing page, extracts key elements, and generates
 * an AI-powered conversion analysis ("roast").
 * 
 * Supports both local (full Puppeteer) and serverless (@sparticuz/chromium-min).
 */

import puppeteerCore from 'puppeteer-core';

// ────────────────────────────────────────────
// TIME BUDGET — must finish within Vercel 60s limit
// ────────────────────────────────────────────
const SCRAPE_BUDGET_MS = 20000;  // 20s max for scraping
const AI_BUDGET_MS    = 50000;   // 50s max for Claude (simple sites scrape in 2-5s)
const TOTAL_BUDGET_MS = 55000;   // 55s total (5s safety buffer before 60s limit)

/**
 * Get a browser instance — works locally AND on Vercel/Lambda
 */
async function getBrowser() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    // Serverless environment — use chromium-min (downloads binary at runtime)
    const chromium = (await import('@sparticuz/chromium-min')).default;
    
    const execPath = await chromium.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar'
    );
    
    return puppeteerCore.launch({
      args: [
        ...chromium.args,
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--disable-translate',
        '--metrics-recording-only',
        '--no-first-run',
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: execPath,
      headless: chromium.headless,
    });
  }

  // Local development — try system Chrome, fall back to full puppeteer
  try {
    const puppeteer = await import('puppeteer');
    return puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
      ],
    });
  } catch {
    // Fallback: puppeteer-core with common Chrome paths
    const paths = [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      process.env.CHROME_PATH,
    ].filter(Boolean);

    for (const p of paths) {
      try {
        return await puppeteerCore.launch({
          executablePath: p,
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });
      } catch { /* try next */ }
    }
    throw new Error('No Chrome/Chromium installation found');
  }
}

/**
 * Safe wrapper for page operations — catches target-closed / protocol errors
 */
async function safePageOp(label, fn, fallback = null) {
  try {
    return await fn();
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('Target closed') || msg.includes('Protocol error') || msg.includes('Session closed')) {
      throw new Error(`[blocked] Page crashed during ${label} — site may be blocking scrapers`);
    }
    console.warn(`[scrape] ${label} failed (non-fatal): ${msg.substring(0, 150)}`);
    return fallback;
  }
}

/**
 * Capture screenshot and extract page data
 * With browser diagnostics, crash protection, and time budgeting
 */
export async function scrapeLandingPage(url) {
  const scrapeStart = Date.now();
  let step = 'getBrowser';
  const browser = await getBrowser();

  try {
    step = 'newPage';
    const page = await browser.newPage();

    // Block heavy resources to speed up page load
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      // Block media, fonts, and large assets (we only need DOM + images for analysis)
      if (['media', 'font', 'websocket'].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // ────────────────────────────────────────────
    // BROWSER DIAGNOSTICS: Capture everything
    // ────────────────────────────────────────────
    const consoleMessages = [];
    const networkErrors = [];
    const networkRequests = [];
    const jsErrors = [];

    page.on('console', (msg) => {
      try {
        const type = msg.type();
        if (['error', 'warning', 'assert'].includes(type)) {
          consoleMessages.push({
            type,
            text: msg.text().substring(0, 300),
            location: msg.location()?.url || '',
          });
        }
      } catch { /* ignore */ }
    });

    page.on('pageerror', (error) => {
      try {
        jsErrors.push({
          message: error.message?.substring(0, 300) || String(error).substring(0, 300),
          stack: error.stack?.substring(0, 200) || '',
        });
      } catch { /* ignore */ }
    });

    page.on('requestfailed', (req) => {
      try {
        networkErrors.push({
          url: req.url().substring(0, 200),
          method: req.method(),
          reason: req.failure()?.errorText || 'Unknown',
          resourceType: req.resourceType(),
        });
      } catch { /* ignore */ }
    });

    page.on('response', (res) => {
      try {
        const status = res.status();
        const resUrl = res.url();
        if (status >= 400) {
          networkErrors.push({
            url: resUrl.substring(0, 200),
            method: res.request().method(),
            reason: `HTTP ${status}`,
            resourceType: res.request().resourceType(),
          });
        }
        networkRequests.push({
          url: resUrl.substring(0, 150),
          status,
          resourceType: res.request().resourceType(),
          size: parseInt(res.headers()['content-length'] || '0', 10),
        });
      } catch { /* ignore */ }
    });
    
    step = 'setViewport';
    await page.setViewport({ width: 1440, height: 900 });
    
    step = 'setUserAgent';
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );

    step = 'goto';
    // Navigate — use 'load' instead of 'networkidle2' to avoid waiting for long-polling
    await page.goto(url, { 
      waitUntil: 'load', 
      timeout: 15000 
    });

    // Brief settle (reduced from 2s)
    await new Promise(r => setTimeout(r, 800));

    // ── Helper: check time budget ──
    const timeLeft = () => SCRAPE_BUDGET_MS - (Date.now() - scrapeStart);

    step = 'screenshotHero';
    // Hero screenshot first (most important, least likely to crash)
    const heroScreenshot = await safePageOp('heroScreenshot', () =>
      page.screenshot({
        type: 'jpeg',
        quality: 70,
        encoding: 'base64',
        clip: { x: 0, y: 0, width: 1440, height: 900 }
      })
    );

    // Full-page screenshot (risky — can crash on huge/blocked pages)
    step = 'screenshotFull';
    let screenshotBuffer = null;
    if (timeLeft() > 3000) {
      screenshotBuffer = await safePageOp('fullScreenshot', () =>
        page.screenshot({ 
          fullPage: true,
          type: 'jpeg',
          quality: 60,
          encoding: 'base64'
        })
      );
    }

    step = 'evaluatePageData';
    const pageData = await safePageOp('pageData', () => page.evaluate(() => {
      const getData = () => {
        // Title
        const title = document.title || '';
        
        // Meta description
        const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
        
        // Headings
        const headings = [];
        document.querySelectorAll('h1, h2, h3').forEach(h => {
          headings.push({ tag: h.tagName, text: h.textContent.trim().substring(0, 200) });
        });
        
        // CTA buttons
        const buttons = [];
        document.querySelectorAll('button, a[href], [role="button"], input[type="submit"]').forEach(el => {
          const text = (el.textContent || el.value || '').trim();
          if (text && text.length < 100) {
            const rect = el.getBoundingClientRect();
            const styles = window.getComputedStyle(el);
            buttons.push({
              text,
              tag: el.tagName,
              href: el.href || '',
              isAboveFold: rect.top < window.innerHeight,
              bgColor: styles.backgroundColor,
              color: styles.color,
              fontSize: styles.fontSize,
              width: rect.width,
              height: rect.height,
            });
          }
        });
        
        // Images
        const images = [];
        document.querySelectorAll('img').forEach(img => {
          images.push({
            src: img.src,
            alt: img.alt || '',
            width: img.naturalWidth,
            height: img.naturalHeight,
            hasAlt: !!img.alt,
          });
        });
        
        // Forms
        const forms = [];
        document.querySelectorAll('form').forEach(form => {
          const fields = [];
          form.querySelectorAll('input, textarea, select').forEach(field => {
            fields.push({
              type: field.type || field.tagName.toLowerCase(),
              name: field.name || '',
              placeholder: field.placeholder || '',
              required: field.required,
            });
          });
          forms.push({ action: form.action, method: form.method, fields });
        });
        
        // Social proof
        const bodyText = document.body.innerText || '';
        const socialProof = {
          hasTestimonials: /testimonial|review|said|quot/i.test(bodyText),
          hasNumbers: /\d+[,.]?\d*\s*(\+|customers|users|clients|companies|teams|downloads)/i.test(bodyText),
          hasLogos: document.querySelectorAll('img[alt*="logo"], img[class*="logo"], img[src*="logo"]').length > 0,
          hasTrustBadges: /trust|secure|ssl|guarantee|money.back|verified|certified/i.test(bodyText),
          hasStars: /★|⭐|star|rating/i.test(bodyText) || document.querySelectorAll('[class*="star"], [class*="rating"]').length > 0,
        };
        
        // Pricing
        const pricing = {
          hasPricing: /\$\d|€\d|£\d|pricing|price|plan|subscription|\/mo|\/month|\/year/i.test(bodyText),
          hasFreeOption: /free|trial|demo|freemium|no.credit.card/i.test(bodyText),
        };
        
        // Navigation
        const navLinks = [];
        document.querySelectorAll('nav a, header a').forEach(a => {
          navLinks.push(a.textContent.trim());
        });
        
        // Page metrics
        const allText = bodyText.replace(/\s+/g, ' ').trim();
        const wordCount = allText.split(/\s+/).length;
        
        // Colors (dominant)
        const bodyStyles = window.getComputedStyle(document.body);
        
        // Footer
        const footer = document.querySelector('footer');
        const footerLinks = [];
        if (footer) {
          footer.querySelectorAll('a').forEach(a => {
            footerLinks.push(a.textContent.trim());
          });
        }
        
        // Videos
        const hasVideo = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="wistia"]').length > 0;
        
        // Chat widgets
        const hasChatWidget = document.querySelectorAll('[class*="chat"], [id*="chat"], [class*="intercom"], [class*="drift"], [class*="crisp"], [class*="zendesk"]').length > 0;
        
        return {
          title,
          metaDesc,
          headings,
          buttons: buttons.slice(0, 30), // Limit
          images: images.slice(0, 30),
          forms,
          socialProof,
          pricing,
          navLinks: navLinks.slice(0, 20),
          wordCount,
          footerLinks: footerLinks.slice(0, 20),
          hasVideo,
          hasChatWidget,
          bgColor: bodyStyles.backgroundColor,
          fontFamily: bodyStyles.fontFamily,
          url: window.location.href,
        };
      };
      
      return getData();
    }), /* fallback pageData */ {
      title: '', metaDesc: '', headings: [], buttons: [], images: [], forms: [],
      socialProof: { hasTestimonials: false, hasNumbers: false, hasLogos: false, hasTrustBadges: false, hasStars: false },
      pricing: { hasPricing: false, hasFreeOption: false },
      navLinks: [], wordCount: 0, footerLinks: [], hasVideo: false, hasChatWidget: false,
      bgColor: '', fontFamily: '', url,
    });

    // If pageData came back empty, we couldn't read the page at all
    if (!pageData || !pageData.title) {
      // Check if we at least got a URL — if the evaluate worked but page was empty/blocked
      const actualUrl = pageData?.url || url;
      if (pageData) pageData.url = actualUrl;
    }

    step = 'evaluatePerformance';
    const perfMetrics = await safePageOp('performance', () => page.evaluate(() => {
      const perf = window.performance;
      const timing = perf.timing;
      const paintEntries = perf.getEntriesByType('paint') || [];
      const navEntries = perf.getEntriesByType('navigation') || [];
      const resourceEntries = perf.getEntriesByType('resource') || [];

      const lcpEntries = perf.getEntriesByType('largest-contentful-paint') || [];
      const lcp = lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : null;

      const layoutShiftEntries = perf.getEntriesByType('layout-shift') || [];
      const cls = layoutShiftEntries.reduce((sum, e) => sum + (e.hadRecentInput ? 0 : e.value), 0);

      const resourceBreakdown = {};
      resourceEntries.forEach(r => {
        const type = r.initiatorType || 'other';
        if (!resourceBreakdown[type]) resourceBreakdown[type] = { count: 0, totalSize: 0, totalDuration: 0 };
        resourceBreakdown[type].count++;
        resourceBreakdown[type].totalSize += r.transferSize || 0;
        resourceBreakdown[type].totalDuration += r.duration || 0;
      });

      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: paintEntries.find(p => p.name === 'first-paint')?.startTime || null,
        firstContentfulPaint: paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime || null,
        largestContentfulPaint: lcp,
        cumulativeLayoutShift: parseFloat(cls.toFixed(4)),
        totalResources: resourceEntries.length,
        resourceBreakdown,
        transferSize: navEntries[0]?.transferSize || 0,
      };
    }), /* fallback */ {
      loadTime: 0, domReady: 0, firstPaint: null, firstContentfulPaint: null,
      largestContentfulPaint: null, cumulativeLayoutShift: 0, totalResources: 0,
      resourceBreakdown: {}, transferSize: 0,
    });

    step = 'evaluateAccessibility';
    const accessibility = timeLeft() > 2000 ? await safePageOp('accessibility', () => page.evaluate(() => {
      const issues = [];

      // Images without alt text
      const imgsNoAlt = document.querySelectorAll('img:not([alt]), img[alt=""]');
      if (imgsNoAlt.length > 0) {
        issues.push({
          type: 'missing-alt',
          severity: 'error',
          count: imgsNoAlt.length,
          detail: `${imgsNoAlt.length} image(s) missing alt text`,
        });
      }

      // Buttons/links without accessible names
      const emptyButtons = [];
      document.querySelectorAll('button, [role="button"]').forEach(btn => {
        const text = (btn.textContent || '').trim();
        const ariaLabel = btn.getAttribute('aria-label') || '';
        if (!text && !ariaLabel) emptyButtons.push(btn.outerHTML.substring(0, 100));
      });
      if (emptyButtons.length > 0) {
        issues.push({
          type: 'empty-button',
          severity: 'error',
          count: emptyButtons.length,
          detail: `${emptyButtons.length} button(s) with no accessible name`,
        });
      }

      // Missing lang attribute
      if (!document.documentElement.lang) {
        issues.push({ type: 'missing-lang', severity: 'warning', count: 1, detail: 'No lang attribute on <html>' });
      }

      // Heading hierarchy
      const headingLevels = [];
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
        headingLevels.push(parseInt(h.tagName[1]));
      });
      const h1Count = headingLevels.filter(l => l === 1).length;
      if (h1Count === 0) {
        issues.push({ type: 'no-h1', severity: 'error', count: 1, detail: 'No H1 heading found' });
      } else if (h1Count > 1) {
        issues.push({ type: 'multiple-h1', severity: 'warning', count: h1Count, detail: `${h1Count} H1 headings found (should be 1)` });
      }
      // Check for skipped heading levels
      for (let i = 1; i < headingLevels.length; i++) {
        if (headingLevels[i] > headingLevels[i - 1] + 1) {
          issues.push({
            type: 'skipped-heading',
            severity: 'warning',
            count: 1,
            detail: `Heading level skipped: H${headingLevels[i - 1]} → H${headingLevels[i]}`,
          });
          break;
        }
      }

      // Color contrast (basic check for very light text)
      let lowContrastCount = 0;
      document.querySelectorAll('p, span, a, li, h1, h2, h3, h4, button').forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const opacity = parseFloat(style.opacity);
        if (opacity < 0.4 && el.textContent.trim().length > 3) lowContrastCount++;
      });
      if (lowContrastCount > 0) {
        issues.push({ type: 'low-contrast', severity: 'warning', count: lowContrastCount, detail: `${lowContrastCount} element(s) with very low opacity text` });
      }

      // Missing form labels
      let unlabeledInputs = 0;
      document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select').forEach(input => {
        const id = input.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
        const parentLabel = input.closest('label');
        if (!hasLabel && !hasAriaLabel && !parentLabel) unlabeledInputs++;
      });
      if (unlabeledInputs > 0) {
        issues.push({ type: 'unlabeled-input', severity: 'error', count: unlabeledInputs, detail: `${unlabeledInputs} form input(s) without labels` });
      }

      // Links that open in new tab without rel
      let unsafeLinks = 0;
      document.querySelectorAll('a[target="_blank"]').forEach(link => {
        const rel = link.getAttribute('rel') || '';
        if (!rel.includes('noopener') && !rel.includes('noreferrer')) unsafeLinks++;
      });
      if (unsafeLinks > 0) {
        issues.push({ type: 'unsafe-target-blank', severity: 'warning', count: unsafeLinks, detail: `${unsafeLinks} link(s) open new tab without rel="noopener"` });
      }

      return issues;
    }), []) : [];

    step = 'evaluateSecurity';
    const security = timeLeft() > 1500 ? await safePageOp('security', () => page.evaluate(() => {
      const issues = [];
      const url = window.location.href;

      // HTTPS check
      if (!url.startsWith('https://')) {
        issues.push({ type: 'no-https', severity: 'critical', detail: 'Site not using HTTPS' });
      }

      // Mixed content (http resources on https page)
      if (url.startsWith('https://')) {
        const httpResources = [];
        document.querySelectorAll('img[src^="http:"], script[src^="http:"], link[href^="http:"], iframe[src^="http:"]').forEach(el => {
          httpResources.push((el.src || el.href || '').substring(0, 100));
        });
        if (httpResources.length > 0) {
          issues.push({ type: 'mixed-content', severity: 'error', count: httpResources.length, detail: `${httpResources.length} mixed content resource(s)` });
        }
      }

      // Check meta tags
      const viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        issues.push({ type: 'no-viewport', severity: 'warning', detail: 'Missing viewport meta tag' });
      }

      const charset = document.querySelector('meta[charset]') || document.querySelector('meta[http-equiv="Content-Type"]');
      if (!charset) {
        issues.push({ type: 'no-charset', severity: 'warning', detail: 'Missing charset declaration' });
      }

      return issues;
    }), []) : [];

    // ── Mobile analysis (only if time allows) ──
    step = 'mobileViewport';
    let mobileScreenshot = null;
    let mobileData = { hasHorizontalScroll: false, tooSmallText: [], smallTouchTargets: 0 };

    if (timeLeft() > 3000) {
      await safePageOp('mobileViewport', async () => {
        await page.setViewport({ width: 375, height: 812 });
        await new Promise(r => setTimeout(r, 500));
      });
      
      step = 'mobileScreenshot';
      mobileScreenshot = await safePageOp('mobileScreenshot', () =>
        page.screenshot({
          type: 'jpeg',
          quality: 70,
          encoding: 'base64',
          clip: { x: 0, y: 0, width: 375, height: 812 }
        })
      );

      step = 'evaluateMobileData';
      mobileData = await safePageOp('mobileData', () => page.evaluate(() => {
      const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;
      const tooSmallText = [];
      document.querySelectorAll('p, span, a, li').forEach(el => {
        const size = parseFloat(window.getComputedStyle(el).fontSize);
        if (size < 14 && el.textContent.trim().length > 5) {
          tooSmallText.push({ text: el.textContent.trim().substring(0, 50), size });
        }
      });

      // Check touch targets
      let smallTouchTargets = 0;
      document.querySelectorAll('a, button, [role="button"], input, select, textarea').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
          smallTouchTargets++;
        }
      });

      return {
        hasHorizontalScroll,
        tooSmallText: tooSmallText.slice(0, 10),
        smallTouchTargets,
      };
    }), mobileData) || mobileData;
    } // end if (timeLeft() > 3000)

    step = 'compileDiagnostics';
    // ────────────────────────────────────────────
    // COMPILE DIAGNOSTICS
    // ────────────────────────────────────────────
    const diagnostics = {
      consoleErrors: consoleMessages.filter(m => m.type === 'error').slice(0, 20),
      consoleWarnings: consoleMessages.filter(m => m.type === 'warning').slice(0, 10),
      jsErrors: jsErrors.slice(0, 10),
      networkErrors: networkErrors.slice(0, 20),
      networkSummary: {
        totalRequests: networkRequests.length,
        failedRequests: networkErrors.length,
        byType: Object.fromEntries(
          Object.entries(
            networkRequests.reduce((acc, r) => {
              acc[r.resourceType] = (acc[r.resourceType] || 0) + 1;
              return acc;
            }, {})
          )
        ),
        byStatus: Object.fromEntries(
          Object.entries(
            networkRequests.reduce((acc, r) => {
              const bucket = r.status < 300 ? '2xx' : r.status < 400 ? '3xx' : r.status < 500 ? '4xx' : '5xx';
              acc[bucket] = (acc[bucket] || 0) + 1;
              return acc;
            }, {})
          )
        ),
      },
      accessibility,
      security,
    };

    return {
      screenshots: {
        full: screenshotBuffer,
        hero: heroScreenshot,
        mobile: mobileScreenshot,
      },
      pageData,
      performance: perfMetrics,
      mobileData,
      diagnostics,
      scrapedAt: new Date().toISOString(),
    };

  } catch (err) {
    err.message = `[step:${step}] ${err.message}`;
    throw err;
  } finally {
    await browser.close();
  }
}

/**
 * Generate the roast analysis using Claude API
 * Uses claude-sonnet-4-20250514 with streaming disabled for speed
 */
export async function generateRoast(scrapedData, tier = 'basic') {
  const { pageData, performance: perfMetrics, mobileData, diagnostics } = scrapedData;
  
  const prompt = `You are "The Roast Master" — a savage, sarcastic AI that reviews landing pages like Gordon Ramsay reviews food. You're a stand-up comedian AND a world-class CRO expert.

Rules: Be SPECIFIC (reference actual page content), funny, and actionable. Use emojis: 🔥 💀 🚨 🗑️ 😤 🤦 👀

ANALYZE THIS LANDING PAGE AND ROAST IT:

URL: ${pageData.url}
Title: "${pageData.title}"
Meta Description: "${pageData.metaDesc}"

HEADINGS:
${pageData.headings.map(h => `${h.tag}: "${h.text}"`).join('\n')}

CTA BUTTONS (${pageData.buttons.length} found):
${pageData.buttons.slice(0, 15).map(b => `- "${b.text}" (${b.tag}, above fold: ${b.isAboveFold}, size: ${Math.round(b.width)}x${Math.round(b.height)})`).join('\n')}

IMAGES: ${pageData.images.length} total, ${pageData.images.filter(i => !i.hasAlt).length} missing alt text

FORMS: ${pageData.forms.length} forms, ${pageData.forms.reduce((sum, f) => sum + f.fields.length, 0)} total fields

SOCIAL PROOF:
- Testimonials: ${pageData.socialProof.hasTestimonials ? 'YES' : 'NO'}
- Numbers/Stats: ${pageData.socialProof.hasNumbers ? 'YES' : 'NO'}
- Company Logos: ${pageData.socialProof.hasLogos ? 'YES' : 'NO'}
- Trust Badges: ${pageData.socialProof.hasTrustBadges ? 'YES' : 'NO'}
- Star Ratings: ${pageData.socialProof.hasStars ? 'YES' : 'NO'}

PRICING: ${pageData.pricing.hasPricing ? 'Visible' : 'Not visible'}, Free option: ${pageData.pricing.hasFreeOption ? 'YES' : 'NO'}

WORD COUNT: ${pageData.wordCount}
VIDEO: ${pageData.hasVideo ? 'YES' : 'NO'}
CHAT WIDGET: ${pageData.hasChatWidget ? 'YES' : 'NO'}
NAV LINKS: ${pageData.navLinks.join(', ')}

====== BROWSER DIAGNOSTICS (THE CRIME SCENE EVIDENCE) ======

PERFORMANCE METRICS:
- Page Load: ${perfMetrics.loadTime}ms
- DOM Ready: ${perfMetrics.domReady}ms
- First Paint: ${perfMetrics.firstPaint ? Math.round(perfMetrics.firstPaint) + 'ms' : 'N/A'}
- First Contentful Paint: ${perfMetrics.firstContentfulPaint ? Math.round(perfMetrics.firstContentfulPaint) + 'ms' : 'N/A'}
- Largest Contentful Paint: ${perfMetrics.largestContentfulPaint ? Math.round(perfMetrics.largestContentfulPaint) + 'ms' : 'N/A'}
- Cumulative Layout Shift: ${perfMetrics.cumulativeLayoutShift}
- Total Resources: ${perfMetrics.totalResources}
${perfMetrics.resourceBreakdown ? `- Resource Breakdown: ${JSON.stringify(perfMetrics.resourceBreakdown)}` : ''}

CONSOLE ERRORS (${diagnostics?.consoleErrors?.length || 0}):
${(diagnostics?.consoleErrors || []).slice(0, 10).map(e => `  ❌ ${e.text}`).join('\n') || '  None detected'}

JAVASCRIPT EXCEPTIONS (${diagnostics?.jsErrors?.length || 0}):
${(diagnostics?.jsErrors || []).slice(0, 5).map(e => `  💥 ${e.message}`).join('\n') || '  None detected'}

FAILED NETWORK REQUESTS (${diagnostics?.networkErrors?.length || 0}):
${(diagnostics?.networkErrors || []).slice(0, 10).map(e => `  ⛔ ${e.method} ${e.url} → ${e.reason} (${e.resourceType})`).join('\n') || '  None detected'}

NETWORK SUMMARY:
- Total Requests: ${diagnostics?.networkSummary?.totalRequests || 0}
- Failed: ${diagnostics?.networkSummary?.failedRequests || 0}
- By Status: ${JSON.stringify(diagnostics?.networkSummary?.byStatus || {})}
- By Type: ${JSON.stringify(diagnostics?.networkSummary?.byType || {})}

ACCESSIBILITY ISSUES (${diagnostics?.accessibility?.length || 0}):
${(diagnostics?.accessibility || []).map(a => `  ${a.severity === 'error' ? '🚨' : '⚠️'} [${a.type}] ${a.detail}`).join('\n') || '  None detected'}

SECURITY ISSUES (${diagnostics?.security?.length || 0}):
${(diagnostics?.security || []).map(s => `  🔒 [${s.severity}] ${s.detail}`).join('\n') || '  None detected'}

MOBILE:
- Horizontal Scroll Issues: ${mobileData.hasHorizontalScroll ? 'YES ❌' : 'NO ✅'}
- Small Text Elements: ${mobileData.tooSmallText.length}
- Small Touch Targets: ${mobileData.smallTouchTargets || 0}

====== END DIAGNOSTICS ======

Respond with ONLY valid JSON (no markdown fences). Be BRUTALLY SARCASTIC. Reference ACTUAL page content. Each roast should be 1-2 sentences.

{
  "overallScore": <1-100>,
  "verdict": "<one SAVAGE sentence>",
  "roasterComment": "<2-3 sentence personal commentary to the page owner>",
  "heroSection": { "score": <1-10>, "roast": "<1-2 sentences>", "issues": ["..."], "fixes": ["..."] },
  "headline": { "score": <1-10>, "roast": "<1-2 sentences>", "issues": ["..."], "fixes": ["..."], "suggestedHeadline": "<better headline>" },
  "cta": { "score": <1-10>, "roast": "<1-2 sentences>", "issues": ["..."], "fixes": ["..."], "suggestedCTA": "<better CTA>" },
  "socialProof": { "score": <1-10>, "roast": "<1-2 sentences>", "issues": ["..."], "fixes": ["..."] },
  "copywriting": { "score": <1-10>, "roast": "<1-2 sentences>", "issues": ["..."], "fixes": ["..."] },
  "design": { "score": <1-10>, "roast": "<1-2 sentences>", "issues": ["..."], "fixes": ["..."] },
  "mobile": { "score": <1-10>, "roast": "<1-2 sentences>", "issues": ["..."], "fixes": ["..."] },
  "performance": { "score": <1-10>, "roast": "<1-2 sentences with ACTUAL metrics>", "issues": ["..."], "fixes": ["..."] },
  "trustAndCredibility": { "score": <1-10>, "roast": "<1-2 sentences>", "issues": ["..."], "fixes": ["..."] },
  "diagnosticsRoast": { "consoleErrors": "<1 sentence>", "networkIssues": "<1 sentence>", "accessibility": "<1 sentence>", "security": "<1 sentence>", "overallHealthVerdict": "<1 sentence>" },
  "topPriorities": ["<#1 fix>", "<#2 fix>", "<#3 fix>"],
  "quickWins": ["<5-min fix>", "<5-min fix>", "<5-min fix>"],
  "estimatedConversionLift": "<X-Y%>"
}`;

  // Call Claude API with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_BUDGET_MS);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Claude API error: ${response.status} — ${err}`);
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse roast analysis from AI response');
    }

    return JSON.parse(jsonMatch[0]);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Generate PRO-tier deep analysis: rewrites, competitor-aware fixes, prioritized action plan.
 * Called AFTER a free roast exists — takes the same scraped data + the free roast results.
 */
export async function generateProAnalysis(scrapedData, freeRoast) {
  const { pageData } = scrapedData;

  const prompt = `You are a world-class CRO consultant and conversion copywriter. A client just received a landing page audit (score: ${freeRoast.overallScore}/100). Now they've paid for the FULL AUTOPSY — your job is to give them READY-TO-PASTE rewrites and an implementation plan so specific they can fix everything tonight.

PAGE CONTEXT:
URL: ${pageData.url}
Title: "${pageData.title}"
Current H1: "${pageData.headings.find(h => h.tag === 'H1')?.text || 'None'}"
Current CTAs: ${pageData.buttons.slice(0, 10).map(b => `"${b.text}"`).join(', ')}
Word count: ${pageData.wordCount}

FREE ROAST SUMMARY:
Score: ${freeRoast.overallScore}/100
Verdict: ${freeRoast.verdict}
Top Issues: ${(freeRoast.topPriorities || []).join(' | ')}
Headline Score: ${freeRoast.headline?.score}/10
CTA Score: ${freeRoast.cta?.score}/10
Copy Score: ${freeRoast.copywriting?.score}/10
Social Proof Score: ${freeRoast.socialProof?.score}/10

Respond with ONLY valid JSON (no markdown fences):

{
  "headlineRewrites": [
    { "text": "<rewritten headline>", "reasoning": "<why this works better>" },
    { "text": "<rewritten headline>", "reasoning": "<why this works better>" },
    { "text": "<rewritten headline>", "reasoning": "<why this works better>" }
  ],
  "subheadlineRewrite": "<rewritten subheadline>",
  "ctaRewrites": [
    { "text": "<rewritten CTA button text>", "reasoning": "<why this converts better>" },
    { "text": "<rewritten CTA button text>", "reasoning": "<why this converts better>" },
    { "text": "<rewritten CTA button text>", "reasoning": "<why this converts better>" }
  ],
  "socialProofTemplates": [
    "<testimonial template they can fill in, specific to their product/niche>",
    "<testimonial template they can fill in>",
    "<testimonial template they can fill in>"
  ],
  "aboveTheFoldRewrite": "<complete hero section copy: headline + subheadline + CTA, formatted as markdown>",
  "prioritizedFixPlan": [
    { "priority": 1, "task": "<specific task>", "timeEstimate": "<X min>", "impact": "<high/medium/low>", "predictedScoreGain": <points> },
    { "priority": 2, "task": "<specific task>", "timeEstimate": "<X min>", "impact": "<high/medium/low>", "predictedScoreGain": <points> },
    { "priority": 3, "task": "<specific task>", "timeEstimate": "<X min>", "impact": "<high/medium/low>", "predictedScoreGain": <points> },
    { "priority": 4, "task": "<specific task>", "timeEstimate": "<X min>", "impact": "<high/medium/low>", "predictedScoreGain": <points> },
    { "priority": 5, "task": "<specific task>", "timeEstimate": "<X min>", "impact": "<high/medium/low>", "predictedScoreGain": <points> }
  ],
  "predictedScoreAfterFixes": <number 1-100>,
  "copywritingDeepDive": "<2-3 paragraphs analyzing their copy voice, target audience assumptions, and specific language fixes>",
  "technicalFixes": [
    { "issue": "<specific technical issue from diagnostics>", "fix": "<exact code change or config>" },
    { "issue": "<specific technical issue>", "fix": "<exact code change or config>" },
    { "issue": "<specific technical issue>", "fix": "<exact code change or config>" }
  ]
}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_BUDGET_MS);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Claude API error: ${response.status} — ${err}`);
    }

    const data = await response.json();
    const text = data.content[0].text;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse PRO analysis from AI response');
    }

    return JSON.parse(jsonMatch[0]);
  } finally {
    clearTimeout(timeout);
  }
}
