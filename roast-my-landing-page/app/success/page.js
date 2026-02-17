import { Polar } from '@polar-sh/sdk';
import { redirect } from 'next/navigation';
import { Flame, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

export default async function SuccessPage({ searchParams }) {
  const { checkout_id } = await searchParams;

  let status = 'unknown';
  let metadata = {};

  if (checkout_id && process.env.POLAR_ACCESS_TOKEN) {
    try {
      const polar = new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN });
      const checkout = await polar.checkouts.get({ id: checkout_id });
      status = checkout.status;
      metadata = checkout.metadata || {};
    } catch (err) {
      console.error('[Success] Failed to verify checkout:', err.message);
    }
  }

  const isPaid = status === 'succeeded' || status === 'confirmed';

  // If payment confirmed and we have a roastId, redirect right to results
  if (isPaid && metadata.roastId) {
    redirect(`/results/${metadata.roastId}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {isPaid ? (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-black mb-3">Payment Confirmed!</h1>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Your Full Autopsy is being generated. This takes about 30 seconds.
              Refresh this page or go back to your results.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-3xl font-black mb-3">Processing payment...</h1>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Hang tight — we&apos;re confirming your payment. This usually takes just a few seconds.
            </p>
          </>
        )}
        <a href="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          ← Back to PageRoast
        </a>
      </div>
    </main>
  );
}
