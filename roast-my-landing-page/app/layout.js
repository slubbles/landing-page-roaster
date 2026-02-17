import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import SessionWrapper from '../components/auth/SessionWrapper';

export const metadata = {
  title: 'PageRoast — AI-Powered Landing Page Roast',
  description: 'Get a brutally honest, AI-powered analysis of your landing page. Find conversion killers, get actionable fixes, and boost your conversion rate. Instant results.',
  keywords: 'landing page, conversion rate optimization, CRO, A/B testing, roast, analysis, review',
  icons: {
    icon: '/favicon.svg',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')),
  openGraph: {
    title: 'PageRoast — Your Landing Page is Leaking Conversions 🔥',
    description: 'Paste a URL. Get a brutally honest AI teardown — hero, CTAs, copy, social proof, mobile, speed — scored in 30 seconds.',
    type: 'website',
    images: ['/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PageRoast — Your Landing Page is Leaking Conversions 🔥',
    description: 'Paste a URL. Get a brutally honest AI teardown — hero, CTAs, copy, social proof, mobile, speed — scored in 30 seconds.',
    images: ['/api/og'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          {children}
        </SessionWrapper>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
