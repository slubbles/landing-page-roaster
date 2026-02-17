'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  Flame,
  Crown,
  ArrowRight,
  ExternalLink,
  Zap,
  BarChart3,
  TrendingUp,
  LogOut,
  Sparkles,
  Globe,
} from 'lucide-react';
import { MagicCard } from '../../components/magicui/magic-card';
import { BlurFade } from '../../components/magicui/blur-fade';
import { ShimmerButton } from '../../components/magicui/shimmer-button';
import { ShineBorder } from '../../components/magicui/shine-border';
import { BorderBeam } from '../../components/magicui/border-beam';
import { Meteors } from '../../components/magicui/meteors';
import { Particles } from '../../components/magicui/particles';
import { DotPattern } from '../../components/magicui/dot-pattern';
import { NumberTicker } from '../../components/magicui/number-ticker';
import { AnimatedGradientText } from '../../components/magicui/animated-gradient-text';
import { cn } from '../../lib/utils';

const SUBSCRIBE_URL = process.env.NEXT_PUBLIC_POLAR_SUBSCRIBE_URL || '#';

function scoreColor(score) {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export default function DashboardClient({ user, session, roasts }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSubscribed = user?.subscriptionStatus === 'active';

  const handleRoast = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Roast failed');

      window.location.href = `/results/${data.id}`;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative">
      <Particles className="absolute inset-0 z-0" quantity={30} color="#ff6b35" size={0.3} />
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 max-w-6xl mx-auto">
        <a href="/" className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-bold tracking-tight">PageRoast</span>
        </a>
        <div className="flex items-center gap-4">
          {isSubscribed && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full text-xs font-bold text-orange-400">
              <Crown className="w-3 h-3" /> PRO
            </span>
          )}
          <div className="flex items-center gap-2">
            {session.user?.image && (
              <img src={session.user.image} alt="" className="w-7 h-7 rounded-full border border-zinc-700" />
            )}
            <span className="text-sm text-zinc-400">{session.user?.name || session.user?.email}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 relative z-10">
        {/* Greeting */}
        <BlurFade delay={0.05}>
          <h1 className="text-3xl font-black mb-1">
            {session.user?.name ? `Hey, ${session.user.name.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p className="text-zinc-500 text-sm mb-8">
            {isSubscribed
              ? 'Every roast you run includes the full PRO analysis — unlimited.'
              : 'Subscribe to unlock unlimited PRO roasts with ready-to-paste fixes.'}
          </p>
        </BlurFade>

        {/* Subscribe CTA (if not subscribed) */}
        {!isSubscribed && (
          <BlurFade delay={0.1}>
            <ShineBorder
              borderRadius={16}
              borderWidth={2}
              duration={10}
              color={["#ff6b35", "#e63946", "#ff9f43"]}
              className="p-6 bg-zinc-900/50 mb-8"
            >
              <div className="w-full flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                  <h2 className="font-extrabold text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" /> Unlock PRO — $5/mo
                  </h2>
                  <p className="text-zinc-400 text-sm mt-1">
                    Unlimited roasts. Every one includes headline rewrites, CTA rewrites, fix plans, AI fix prompt, and more.
                  </p>
                </div>
                <ShimmerButton
                  shimmerColor="#ff6b35"
                  background="linear-gradient(135deg, #ea580c, #dc2626)"
                  borderRadius="12px"
                  className="px-6 py-3 font-bold text-sm shrink-0"
                  onClick={() => {
                    const subUrl = new URL(SUBSCRIBE_URL);
                    subUrl.searchParams.set('metadata[userEmail]', session.user?.email || '');
                    window.location.href = subUrl.toString();
                  }}
                >
                  <Crown className="w-4 h-4 mr-2" /> Subscribe Now <ArrowRight className="w-4 h-4 ml-2" />
                </ShimmerButton>
              </div>
            </ShineBorder>
          </BlurFade>
        )}

        {/* Roast form */}
        <BlurFade delay={0.15}>
          <div className="relative">
            <BorderBeam size={200} duration={15} colorFrom="#ff6b35" colorTo="#e63946" />
            <MagicCard className="p-6 mb-10" gradientColor="#ff6b3510">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> Roast a Page
            </h2>
            <form onSubmit={handleRoast} className="flex gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-landing-page.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                  disabled={loading}
                  required
                />
              </div>
              <ShimmerButton
                shimmerColor="#ff6b35"
                background={loading ? '#333' : 'linear-gradient(135deg, #ea580c, #dc2626)'}
                borderRadius="12px"
                className="px-6 py-3 font-bold text-sm shrink-0"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Roasting...
                  </span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-1.5" /> Roast
                    {isSubscribed && <span className="ml-1.5 text-orange-200 text-xs">(PRO)</span>}
                  </>
                )}
              </ShimmerButton>
            </form>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
            </MagicCard>
          </div>
        </BlurFade>

        {/* Roast History */}
        <BlurFade delay={0.2}>
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" /> Your Roast History
          </h2>
          {roasts.length === 0 ? (
            <MagicCard className="p-10 text-center" gradientColor="#ffffff05">
              <p className="text-zinc-500 text-sm">
                No roasts yet. Paste a URL above to get your first roast.
              </p>
            </MagicCard>
          ) : (
            <div className="space-y-3">
              {roasts.map((roast, i) => (
                <BlurFade key={roast.id} delay={0.05 * i}>
                  <a href={`/results/${roast.id}`} className="block group">
                    <MagicCard className="p-4 transition-all hover:border-zinc-700" gradientColor="#ff6b3508">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className={cn('text-2xl font-black tabular-nums', scoreColor(roast.score))}>
                            {roast.score}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-200 truncate">{roast.url}</p>
                            <p className="text-xs text-zinc-600">
                              {new Date(roast.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                              {roast.isPro && (
                                <span className="ml-2 px-1.5 py-0.5 bg-orange-500/10 text-orange-400 rounded text-[10px] font-bold">
                                  PRO
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" />
                      </div>
                    </MagicCard>
                  </a>
                </BlurFade>
              ))}
            </div>
          )}
        </BlurFade>

        {/* Stats */}
        {roasts.length > 0 && (
          <BlurFade delay={0.3}>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <MagicCard className="p-4 text-center" gradientColor="#ff6b3508">
                <p className="text-2xl font-black text-orange-400"><NumberTicker value={roasts.length} /></p>
                <p className="text-xs text-zinc-600 uppercase">Total Roasts</p>
              </MagicCard>
              <MagicCard className="p-4 text-center" gradientColor="#22c55e08">
                <p className={cn('text-2xl font-black', scoreColor(Math.max(...roasts.map(r => r.score || 0))))}>
                  <NumberTicker value={Math.max(...roasts.map(r => r.score || 0))} />
                </p>
                <p className="text-xs text-zinc-600 uppercase">Best Score</p>
              </MagicCard>
              <MagicCard className="p-4 text-center" gradientColor="#3b82f608">
                <p className="text-2xl font-black text-blue-400">
                  <NumberTicker value={Math.round(roasts.reduce((sum, r) => sum + (r.score || 0), 0) / roasts.length)} />
                </p>
                <p className="text-xs text-zinc-600 uppercase">Avg Score</p>
              </MagicCard>
            </div>
          </BlurFade>
        )}
      </div>
    </main>
  );
}
