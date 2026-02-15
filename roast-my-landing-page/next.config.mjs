/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['puppeteer', 'puppeteer-core'],
  outputFileTracingIncludes: {
    '/api/roast': ['./node_modules/@sparticuz/chromium/**/*'],
  },
};

export default nextConfig;
