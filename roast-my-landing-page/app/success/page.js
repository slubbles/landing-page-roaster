import { Polar } from '@polar-sh/sdk';
import { redirect } from 'next/navigation';
import { Flame, CheckCircle2, ArrowRight } from 'lucide-react';

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

  // If it's a roast-specific purchase, redirect to results
  if (isPaid && metadata.roastId) {
    redirect(`/results/${metadata.roastId}`);
  }

  // For subscription purchases, redirect to dashboard
  if (isPaid) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Flame className="w-8 h-8 text-orange-500" />
        </div>
        <h1 className="text-3xl font-black mb-3">Processing payment...</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          Hang tight — we&apos;re confirming your payment. This usually takes just a few seconds.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 font-bold text-sm hover:from-orange-400 hover:to-red-400 transition-all">
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </a>
          <a href="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
            ← Home
          </a>
        </div>
      </div>
    </main>
  );
}
