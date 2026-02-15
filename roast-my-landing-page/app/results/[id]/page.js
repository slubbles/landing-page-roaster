import { loadRoast } from '../../../lib/storage.js';
import RoastResults from './RoastResults';
import ClientResultsFallback from './ClientResultsFallback';

export default async function ResultsPage({ params }) {
  const { id } = await params;
  
  const result = await loadRoast(id);

  // If server storage has the result, render it directly
  if (result) {
    return <RoastResults result={result} />;
  }

  // Otherwise, render client fallback that reads from sessionStorage
  return <ClientResultsFallback id={id} />;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const result = await loadRoast(id);

  if (!result) return { title: 'Roast Not Found' };
  
  const ogParams = new URLSearchParams({
    score: String(result.roast.overallScore),
    url: result.url,
    verdict: result.roast.verdict,
  });

  return {
    title: `Score: ${result.roast.overallScore}/100 — ${result.url} | PageRoast`,
    description: result.roast.verdict,
    openGraph: {
      title: `🔥 ${result.roast.overallScore}/100 — Landing Page Roast`,
      description: result.roast.verdict,
      type: 'article',
      images: [`/api/og?${ogParams.toString()}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `🔥 ${result.roast.overallScore}/100 — Landing Page Roast`,
      description: result.roast.verdict,
      images: [`/api/og?${ogParams.toString()}`],
    },
  };
}
