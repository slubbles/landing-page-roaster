/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['puppeteer', 'puppeteer-core', '@sparticuz/chromium'],
  outputFileTracingIncludes: {
    '/api/roast': ['./node_modules/@sparticuz/chromium/**/*'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Force these packages to stay external (not bundled/minified)
      config.externals = config.externals || [];
      config.externals.push({
        '@sparticuz/chromium': 'commonjs @sparticuz/chromium',
        'puppeteer-core': 'commonjs puppeteer-core',
      });
    }
    return config;
  },
};

export default nextConfig;
