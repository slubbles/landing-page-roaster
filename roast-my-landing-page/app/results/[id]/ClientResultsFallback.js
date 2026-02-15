'use client';

import { useState, useEffect } from 'react';
import RoastResults from './RoastResults';

export default function ClientResultsFallback({ id }) {
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(`roast_${id}`);
      if (cached) {
        setResult(JSON.parse(cached));
        return;
      }
    } catch { /* no sessionStorage */ }
    
    // No cached data found
    setNotFound(true);
  }, [id]);

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center p-10">
          <h1 className="text-3xl font-bold mb-4">Roast Not Found</h1>
          <p className="text-zinc-500 mb-4">This roast doesn&apos;t exist or has expired.</p>
          <a href="/" className="text-orange-500 hover:text-orange-400 transition-colors">
            ← Get a new roast
          </a>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center p-10">
          <div className="animate-pulse text-zinc-500">Loading results...</div>
        </div>
      </main>
    );
  }

  return <RoastResults result={result} />;
}
