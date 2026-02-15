'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Zap,
  Target,
  MousePointer,
  Smartphone,
  Shield,
  Palette,
  Star,
  PenTool,
  BarChart3,
  ArrowRight,
  Check,
  Sparkles,
} from 'lucide-react';

const FEATURES = [
  { icon: Target, title: 'Hero Section', desc: 'Is your above-the-fold actually stopping the scroll?' },
  { icon: MousePointer, title: 'CTAs & Buttons', desc: 'Button copy, placement, color, urgency — all scored.' },
  { icon: PenTool, title: 'Copywriting', desc: 'Clarity, benefit-focus, power words, reading level.' },
  { icon: Star, title: 'Social Proof', desc: 'Testimonials, logos, numbers — all the trust signals.' },
  { icon: Smartphone, title: 'Mobile UX', desc: '60% of traffic is mobile. Is your page ready?' },
  { icon: Zap, title: 'Page Speed', desc: 'Load time, DOM readiness, first paint metrics.' },
  { icon: Shield, title: 'Trust Signals', desc: 'Guarantees, badges, privacy — all credibility checks.' },
  { icon: Palette, title: 'Design & Layout', desc: 'Visual hierarchy, whitespace, color psychology.' },
  { icon: BarChart3, title: 'Conversion Score', desc: '0-100 score with prioritized fixes and lift estimate.' },
];

const STEPS = [
  { num: '01', title: 'Paste your URL', desc: 'Drop any landing page URL into the box' },
  { num: '02', title: 'AI analyzes everything', desc: 'Screenshots, DOM analysis, mobile test, performance audit' },
  { num: '03', title: 'Get your roast', desc: 'Brutal scores, specific issues, and exact fixes to implement' },
];

export default function Home() {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const router = useRouter();

  const loadingSteps = [
    'Taking screenshots...',
    'Analyzing hero section...',
    'Checking CTAs...',
    'Testing mobile experience...',
    'Measuring performance...',
    'Scanning social proof...',
    'Generating your roast...',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
    
    try { new URL(cleanUrl); } catch {
      setError('Enter a valid URL — like https://yoursite.com');
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    // Cycle through loading steps
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingSteps.length);
    }, 3000);

    // Abort if it takes too long (90s)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl, email: email.trim() || undefined }),
        signal: controller.signal,
      });

      const data = await res.json();
      clearInterval(interval);
      clearTimeout(timeout);

      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      router.push(`/results/${data.id}`);
    } catch (err) {
      clearInterval(interval);
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        setError('That page is taking too long to analyze. Try a simpler page, or try again later.');
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Ambient gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-red-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          <span className="font-bold text-lg tracking-tight">PageRoast</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="/examples" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Examples
          </a>
          <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Pricing
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400 mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          Free AI-powered conversion analysis
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6"
        >
          Your landing page is
          <br />
          <span className="gradient-text">leaking conversions</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Paste your URL and get a brutally honest AI teardown — hero,
          CTAs, copy, social proof, mobile, speed — scored and roasted in 30 seconds.
        </motion.p>

        {/* Input */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-xl mx-auto"
        >
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm p-1.5 space-y-1.5">
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-landing-page.com"
                required
                disabled={loading}
                className="flex-1 px-4 py-3.5 bg-transparent text-white placeholder-zinc-600 outline-none text-base rounded-xl disabled:opacity-50"
              />
              <button
              type="submit"
              disabled={loading}
              className={`
                px-6 py-3.5 rounded-xl font-semibold text-white text-base whitespace-nowrap
                transition-all duration-200
                ${loading
                  ? 'bg-zinc-700 cursor-wait'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 animate-pulse-fire cursor-pointer'
                }
              `}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Roasting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Roast it
                </span>
              )}
            </button>
            </div>

            {/* Optional email */}
            <div className="flex items-center gap-2 px-3 pb-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com (optional — get results emailed)"
                disabled={loading}
                className="flex-1 px-2 py-2 bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-sm mt-3"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-6 mt-6 text-xs text-zinc-600"
        >
          <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-600" /> Free instant roast</span>
          <span className="hidden sm:flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-600" /> 30 second results</span>
          <span className="flex items-center gap-1"><Target className="w-3 h-3 text-blue-600" /> Actionable fixes</span>
        </motion.div>

        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-10 p-8 rounded-2xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-sm max-w-md mx-auto"
            >
              <div className="text-4xl mb-4">🔥</div>
              <p className="font-semibold text-lg mb-1">Roasting your page...</p>
              <motion.p
                key={loadingStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-zinc-400 text-sm mb-6"
              >
                {loadingSteps[loadingStep]}
              </motion.p>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-progress" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 py-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16 tracking-tight">
          Three steps. Thirty seconds.
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="text-5xl font-black gradient-text mb-4">{step.num}</div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What we analyze */}
      <section className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4 tracking-tight">
          9 categories. Zero mercy.
        </h2>
        <p className="text-zinc-500 text-center mb-16 max-w-lg mx-auto">
          Every element that affects your conversion rate gets scored, roasted, and given specific fixes.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:border-orange-500/20 hover:bg-zinc-900/60 transition-all duration-300"
            >
              <feature.icon className="w-5 h-5 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 px-6 py-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4 tracking-tight">
          Simple pricing
        </h2>
        <p className="text-zinc-500 text-center mb-16">
          Start free. Upgrade when you need deeper analysis.
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30">
            <div className="text-sm font-medium text-zinc-500 mb-2">Free Roast</div>
            <div className="text-4xl font-black mb-1">$0</div>
            <p className="text-zinc-500 text-sm mb-8">Per page analysis</p>
            <ul className="space-y-3 mb-8 text-sm">
              {['Overall conversion score', 'Hero section analysis', 'CTA review', 'Top 3 priority fixes', 'Desktop & mobile screenshots'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-zinc-300">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full py-3 rounded-xl border border-zinc-700 text-sm font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Get Free Roast
            </button>
          </div>

          {/* Pro */}
          <div className="p-8 rounded-2xl border-2 border-orange-500/30 bg-zinc-900/50 relative glow">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs font-bold">
              MOST POPULAR
            </div>
            <div className="text-sm font-medium text-orange-400 mb-2">Pro Roast</div>
            <div className="text-4xl font-black mb-1">$29</div>
            <p className="text-zinc-500 text-sm mb-8">Per deep-dive report</p>
            <ul className="space-y-3 mb-8 text-sm">
              {[
                'Everything in Free',
                'Full 9-category breakdown',
                'Competitor comparison (3 sites)',
                'A/B test suggestions',
                'Copywriting rewrites',
                'Conversion lift estimate',
                'Shareable report link',
                'Priority email support',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-zinc-300">
                  <Check className="w-4 h-4 text-orange-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={`/api/checkout?products=${process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID || ''}`}
              className="block w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-center text-sm font-bold hover:from-orange-400 hover:to-red-400 transition-all"
            >
              Get Pro Roast
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl font-black mb-4 tracking-tight">
            Stop guessing. Start converting.
          </h2>
          <p className="text-zinc-400 text-lg mb-8">
            Every hour your landing page stays unoptimized, you're leaving money on the table.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 font-bold text-lg hover:from-orange-400 hover:to-red-400 transition-all cursor-pointer animate-pulse-fire"
          >
            Roast my page <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-orange-500/50" />
            <span>PageRoast</span>
          </div>
          <span>Built by an AI that never sleeps</span>
        </div>
      </footer>
    </div>
  );
}
