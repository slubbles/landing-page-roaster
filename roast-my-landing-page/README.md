# 🔥 PageRoast — AI-Powered Landing Page Auditor

Paste any landing page URL and get a brutally honest AI teardown — hero section, CTAs, copywriting, social proof, mobile UX, page speed, trust signals, and design — scored and roasted in 30 seconds.

## Features

- **9-Category Analysis** — Hero, Headline, CTA, Social Proof, Copywriting, Design, Mobile, Performance, Trust
- **0-100 Conversion Score** — Weighted composite with per-category 0-10 breakdown
- **Specific Issues + Fixes** — Not generic advice — exact problems and how to solve them
- **Desktop & Mobile Screenshots** — Visual comparison captured by Puppeteer
- **Suggested Rewrites** — AI-generated headline and CTA alternatives
- **Top Priorities & Quick Wins** — Ranked fixes by impact
- **Estimated Conversion Lift** — What you'd gain by implementing the fixes
- **Shareable Reports** — Unique URL for every roast
- **PRO Tier ($29)** — Competitor comparison, A/B test suggestions, deeper analysis

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (Turbopack) |
| Frontend | React 19, Tailwind CSS v4, Framer Motion, Lucide React |
| Scraping | puppeteer-core + @sparticuz/chromium (serverless) |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| Storage | Vercel Blob (production) / filesystem (local dev) |
| Payments | Polar.sh |
| Hosting | Vercel |
| Rate Limiting | In-memory sliding window (5 reqs/hr/IP) |

## Quick Start

```bash
# Clone and install
git clone https://github.com/slubbles/dump.git
cd dump/roast-my-landing-page
npm install

# Set up environment
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local

# Run locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste any URL.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ | Anthropic API key for Claude |
| `BLOB_READ_WRITE_TOKEN` | Production | Vercel Blob storage token (auto-injected on Vercel) |
| `POLAR_ACCESS_TOKEN` | For payments | Polar.sh API access token |
| `POLAR_WEBHOOK_SECRET` | For payments | Polar.sh webhook verification secret |
| `POLAR_ENVIRONMENT` | For payments | `sandbox` or `production` |
| `NEXT_PUBLIC_POLAR_PRODUCT_ID` | For payments | Polar.sh product ID for Pro tier |
| `NEXT_PUBLIC_APP_URL` | Production | Your deployed URL |

## Project Structure

```
app/
  page.js                    # Homepage with URL input form
  examples/page.js           # Gallery of sample roasts (social proof)
  results/[id]/
    page.js                  # Server component (loads roast from storage)
    RoastResults.js          # Client component (full report UI)
  success/page.js            # Post-payment confirmation
  api/
    roast/route.js           # POST — scrape + analyze + store
    checkout/route.js        # Polar.sh checkout session
    webhook/polar/route.js   # Payment webhook handler
    og/route.js              # Dynamic OG image (edge runtime)
  layout.js                  # Root layout + SEO metadata
  globals.css                # Tailwind v4 + custom utilities
lib/
  roast-engine.js            # Puppeteer scraper + Claude AI analysis
  storage.js                 # Vercel Blob / filesystem adapter
  rate-limit.js              # Sliding window rate limiter
public/
  favicon.svg                # Fire emoji favicon
  robots.txt                 # SEO config
```

## How It Works

1. **User submits URL** → validated, rate-limited, sanitized
2. **Puppeteer scrapes** → desktop screenshot, mobile screenshot, DOM analysis (headings, CTAs, images, forms, social proof, pricing), performance metrics
3. **Claude analyzes** → receives screenshots + structured data → returns JSON with 9 category scores, roasts, issues, fixes, suggestions
4. **Result stored** → Vercel Blob (production) or filesystem (dev) with unique ID
5. **Report rendered** → score ring, category cards, priority fixes, shareable link

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add ANTHROPIC_API_KEY
# Vercel Blob: add the Blob store in dashboard → token auto-injected
```

The `vercel.json` is pre-configured with:
- 60s function timeout for the roast API
- 1024MB memory for Puppeteer
- Security headers on API routes

## License

MIT
