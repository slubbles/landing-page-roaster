'use client';

import { motion } from 'framer-motion';
import {
  Flame,
  Target,
  MousePointer,
  Star,
  PenTool,
  Palette,
  Smartphone,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Share2,
  ArrowRight,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';

/* ── helpers ─────────────────────────────────────────── */

function scoreColor(score, max = 100) {
  const pct = max === 10 ? score * 10 : score;
  if (pct >= 80) return 'text-green-400';
  if (pct >= 60) return 'text-yellow-400';
  if (pct >= 40) return 'text-orange-400';
  return 'text-red-400';
}

function scoreBg(score, max = 100) {
  const pct = max === 10 ? score * 10 : score;
  if (pct >= 80) return 'bg-green-500/10 border-green-500/20';
  if (pct >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
  if (pct >= 40) return 'bg-orange-500/10 border-orange-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

function rawHex(score, max = 100) {
  const pct = max === 10 ? score * 10 : score;
  if (pct >= 80) return '#22c55e';
  if (pct >= 60) return '#eab308';
  if (pct >= 40) return '#f97316';
  return '#ef4444';
}

/* ── ScoreRing ───────────────────────────────────────── */

function ScoreRing({ score, size = 140 }) {
  const hex = rawHex(score);
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, delay: 0.3 }}
      className="relative"
      style={{ width: size, height: size }}
    >
      <div
        className="rounded-full flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${hex} ${score * 3.6}deg, #27272a 0deg)`,
        }}
      >
        <div
          className="rounded-full bg-zinc-950 flex flex-col items-center justify-center"
          style={{ width: size - 14, height: size - 14 }}
        >
          <span className="font-black leading-none" style={{ fontSize: size / 3, color: hex }}>
            {score}
          </span>
          <span className="text-zinc-600" style={{ fontSize: size / 8 }}>
            /100
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── CategoryCard ────────────────────────────────────── */

const CATEGORY_ICONS = {
  heroSection: Target,
  headline: PenTool,
  cta: MousePointer,
  socialProof: Star,
  copywriting: PenTool,
  design: Palette,
  mobile: Smartphone,
  performance: Zap,
  trustAndCredibility: Shield,
};

function CategoryCard({ id, title, data, index }) {
  if (!data) return null;
  const Icon = CATEGORY_ICONS[id] || Target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/40">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold text-base">{title}</h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-extrabold border ${scoreBg(
            data.score,
            10
          )} ${scoreColor(data.score, 10)}`}
        >
          {data.score}/10
        </span>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Roast */}
        <p className="text-zinc-300 italic leading-relaxed text-sm">
          <Flame className="w-4 h-4 text-orange-500 inline mr-1.5 -mt-0.5" />
          &ldquo;{data.roast}&rdquo;
        </p>

        {/* Issues */}
        {data.issues?.length > 0 && (
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Issues Found
            </h4>
            <ul className="space-y-1.5">
              {data.issues.map((issue, i) => (
                <li
                  key={i}
                  className="px-3 py-2 bg-red-500/5 border-l-2 border-red-500 rounded-r-lg text-red-300 text-sm"
                >
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Fixes */}
        {data.fixes?.length > 0 && (
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> How to Fix
            </h4>
            <ul className="space-y-1.5">
              {data.fixes.map((fix, i) => (
                <li
                  key={i}
                  className="px-3 py-2 bg-green-500/5 border-l-2 border-green-500 rounded-r-lg text-green-300 text-sm"
                >
                  {fix}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {(data.suggestedHeadline || data.suggestedCTA) && (
          <div className="space-y-2">
            {data.suggestedHeadline && (
              <div className="px-4 py-3 bg-orange-500/5 border-l-2 border-orange-500 rounded-r-lg">
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1 mb-1">
                  <Lightbulb className="w-3 h-3" /> SUGGESTED HEADLINE
                </span>
                <p className="text-orange-200 text-sm">&ldquo;{data.suggestedHeadline}&rdquo;</p>
              </div>
            )}
            {data.suggestedCTA && (
              <div className="px-4 py-3 bg-orange-500/5 border-l-2 border-orange-500 rounded-r-lg">
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1 mb-1">
                  <Lightbulb className="w-3 h-3" /> SUGGESTED CTA
                </span>
                <p className="text-orange-200 text-sm">&ldquo;{data.suggestedCTA}&rdquo;</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main ────────────────────────────────────────────── */

export default function RoastResults({ result }) {
  const { roast, url, screenshots, createdAt } = result;

  const categories = [
    { id: 'heroSection', title: 'Hero Section', data: roast.heroSection },
    { id: 'headline', title: 'Headline', data: roast.headline },
    { id: 'cta', title: 'Call-to-Action', data: roast.cta },
    { id: 'socialProof', title: 'Social Proof', data: roast.socialProof },
    { id: 'copywriting', title: 'Copywriting', data: roast.copywriting },
    { id: 'design', title: 'Design & UX', data: roast.design },
    { id: 'mobile', title: 'Mobile Experience', data: roast.mobile },
    { id: 'performance', title: 'Performance', data: roast.performance },
    { id: 'trustAndCredibility', title: 'Trust & Credibility', data: roast.trustAndCredibility },
  ];

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 max-w-5xl mx-auto">
        <a href="/" className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-bold tracking-tight">PageRoast</span>
        </a>
        <a
          href="/"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-sm font-semibold hover:from-orange-400 hover:to-red-400 transition-all"
        >
          <Flame className="w-3.5 h-3.5" /> Roast Another
        </a>
      </nav>

      <div className="max-w-4xl mx-auto px-5 py-12">
        {/* ── Overall Score ─────────────────── */}
        <section className="text-center mb-14">
          <p className="text-zinc-600 text-sm mb-2">
            Roast for <span className="text-zinc-400">{url}</span>
          </p>
          <div className="flex justify-center mb-6">
            <ScoreRing score={roast.overallScore} />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl sm:text-2xl font-extrabold max-w-xl mx-auto leading-snug mb-3"
          >
            {roast.verdict}
          </motion.h1>
          <p className="text-zinc-600 text-xs">
            Analyzed{' '}
            {new Date(createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </section>

        {/* ── Screenshots ───────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4 mb-14">
          <div>
            <p className="text-xs text-zinc-600 mb-2">Desktop</p>
            <img
              src={`data:image/png;base64,${screenshots.hero}`}
              alt="Desktop screenshot"
              className="w-full rounded-xl border border-zinc-800"
            />
          </div>
          <div>
            <p className="text-xs text-zinc-600 mb-2">Mobile</p>
            <img
              src={`data:image/png;base64,${screenshots.mobile}`}
              alt="Mobile screenshot"
              className="w-full rounded-xl border border-zinc-800"
            />
          </div>
        </section>

        {/* ── Top Priorities ─────────────────── */}
        {roast.topPriorities && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl border-2 border-red-500/30 bg-red-500/5 p-6 mb-8"
          >
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-red-400 mb-4">
              <AlertTriangle className="w-5 h-5" /> Fix These FIRST
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              {roast.topPriorities.map((p, i) => (
                <li key={i} className="text-red-200 text-sm leading-relaxed">
                  {p}
                </li>
              ))}
            </ol>
          </motion.section>
        )}

        {/* ── Quick Wins ─────────────────────── */}
        {roast.quickWins && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-2xl border-2 border-green-500/30 bg-green-500/5 p-6 mb-12"
          >
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-green-400 mb-4">
              <Zap className="w-5 h-5" /> Quick Wins (5 min fixes)
            </h2>
            <ul className="space-y-2">
              {roast.quickWins.map((win, i) => (
                <li key={i} className="flex items-start gap-2 text-green-200 text-sm leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  {win}
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* ── Category Breakdowns ────────────── */}
        <h2 className="text-2xl font-extrabold text-center mb-8">Detailed Breakdown</h2>
        <div className="space-y-4">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} {...cat} index={i} />
          ))}
        </div>

        {/* ── Estimated Lift ──────────────────── */}
        {roast.estimatedConversionLift && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 mt-10"
          >
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm mb-1">Estimated Conversion Lift</p>
            <p className="text-4xl font-black text-green-400">{roast.estimatedConversionLift}</p>
          </motion.section>
        )}

        {/* ── CTA / Share ─────────────────────── */}
        <section className="text-center py-14">
          <h2 className="text-2xl font-extrabold mb-3">Want an Even Deeper Analysis?</h2>
          <p className="text-zinc-500 max-w-md mx-auto mb-8 text-sm leading-relaxed">
            Get a PRO roast with competitor comparisons, A/B test suggestions, and a full conversion audit report.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href={`/api/checkout?products=${process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID || ''}`}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 font-bold hover:from-orange-400 hover:to-red-400 transition-all"
            >
              Get PRO Roast — $29 <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => {
                const text = `My landing page just got roasted 🔥 Score: ${roast.overallScore}/100\n\n${url}\n\nGet yours roasted:`;
                if (navigator.share) {
                  navigator.share({ title: 'My Landing Page Roast', text, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(`${text} ${window.location.href}`);
                  alert('Link copied!');
                }
              }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors font-semibold cursor-pointer"
            >
              <Share2 className="w-4 h-4" /> Share Results
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-5 border-t border-zinc-900 text-xs text-zinc-600">
          <a href="/" className="inline-flex items-center gap-1.5 hover:text-zinc-400 transition-colors">
            <Flame className="w-3 h-3 text-orange-500/50" /> PageRoast
          </a>
          <span className="mx-2">·</span>
          <span>Built by an AI that never sleeps</span>
        </footer>
      </div>
    </main>
  );
}
