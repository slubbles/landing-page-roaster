'use client';

import { useState } from 'react';
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
  Terminal,
  Wifi,
  WifiOff,
  Eye,
  Lock,
  Bug,
  ChevronDown,
  ChevronUp,
  Activity,
  Gauge,
  Copy,
  Wand2,
  Crown,
  Sparkles,
  FileText,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';

// Magic UI Components
import { MagicCard } from '../../../components/magicui/magic-card';
import { BlurFade } from '../../../components/magicui/blur-fade';
import { BorderBeam } from '../../../components/magicui/border-beam';
import { ShimmerButton } from '../../../components/magicui/shimmer-button';
import { ShineBorder } from '../../../components/magicui/shine-border';
import { NumberTicker } from '../../../components/magicui/number-ticker';
import { AnimatedCircularProgressBar } from '../../../components/magicui/animated-circular-progress';
import { Meteors } from '../../../components/magicui/meteors';
import { DotPattern } from '../../../components/magicui/dot-pattern';
import { cn } from '../../../lib/utils';

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

/* ── Upgrade CTA (used in multiple places) ───────────── */

function UpgradeCTA({ roastId, compact = false, label }) {
  const handleUpgrade = () => {
    // Send to login/dashboard — subscription is account-based
    window.location.href = '/login';
  };

  if (compact) {
    return (
      <ShimmerButton
        shimmerColor="#ff6b35"
        background="linear-gradient(135deg, #ea580c, #dc2626)"
        borderRadius="10px"
        className="px-5 py-2.5 text-sm font-bold"
        onClick={handleUpgrade}
      >
        <Crown className="w-4 h-4 mr-1.5" />
        {label || 'Subscribe for $5/mo'}
      </ShimmerButton>
    );
  }

  return (
    <ShimmerButton
      shimmerColor="#ff6b35"
      background="linear-gradient(135deg, #ea580c, #dc2626)"
      borderRadius="12px"
      className="px-7 py-3.5 font-bold"
      onClick={handleUpgrade}
    >
      <Crown className="w-5 h-5 mr-2" />
      {label || 'Subscribe for $5/mo — Unlimited PRO Roasts'} <ArrowRight className="w-4 h-4 ml-2" />
    </ShimmerButton>
  );
}

/* ── Locked Content Overlay ──────────────────────────── */

function LockedOverlay({ roastId, title, description }) {
  return (
    <div className="relative">
      {/* Blurred placeholder content */}
      <div className="blur-sm opacity-30 pointer-events-none select-none" aria-hidden="true">
        <div className="space-y-3">
          <div className="h-4 bg-zinc-800 rounded w-3/4" />
          <div className="h-4 bg-zinc-800 rounded w-1/2" />
          <div className="h-4 bg-zinc-800 rounded w-2/3" />
          <div className="h-4 bg-zinc-800 rounded w-5/6" />
          <div className="h-4 bg-zinc-800 rounded w-1/3" />
        </div>
      </div>
      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <Lock className="w-8 h-8 text-orange-500/60 mb-3" />
        <h4 className="font-bold text-sm text-zinc-300 mb-1">{title}</h4>
        <p className="text-zinc-500 text-xs mb-4 max-w-xs">{description}</p>
        <UpgradeCTA roastId={roastId} compact />
      </div>
    </div>
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

function CategoryCard({ id, title, data, index, isPro, roastId }) {
  if (!data) return null;
  const Icon = CATEGORY_ICONS[id] || Target;

  return (
    <BlurFade delay={0.08 * index}>
      <MagicCard className="overflow-hidden" gradientColor="#ff6b3510">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/40">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-base">{title}</h3>
          </div>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-sm font-extrabold border',
              scoreBg(data.score, 10),
              scoreColor(data.score, 10)
            )}
          >
            {data.score}/10
          </span>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Roast — always visible */}
          <p className="text-zinc-300 italic leading-relaxed text-sm">
            <Flame className="w-4 h-4 text-orange-500 inline mr-1.5 -mt-0.5" />
            &ldquo;{data.roast}&rdquo;
          </p>

          {/* Issues — show top 1 free, all for pro */}
          {data.issues?.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Issues Found
              </h4>
              <ul className="space-y-1.5">
                {/* Always show first issue */}
                <li className="px-3 py-2 bg-red-500/5 border-l-2 border-red-500 rounded-r-lg text-red-300 text-sm">
                  {data.issues[0]}
                </li>
                {/* Remaining issues: show for pro, lock for free */}
                {data.issues.length > 1 && (
                  isPro ? (
                    data.issues.slice(1).map((issue, i) => (
                      <li
                        key={i}
                        className="px-3 py-2 bg-red-500/5 border-l-2 border-red-500 rounded-r-lg text-red-300 text-sm"
                      >
                        {issue}
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 bg-zinc-800/50 border-l-2 border-zinc-700 rounded-r-lg text-zinc-500 text-sm flex items-center gap-2">
                      <Lock className="w-3 h-3" />
                      +{data.issues.length - 1} more issue{data.issues.length - 1 > 1 ? 's' : ''} in Full Autopsy
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* Fixes — pro only */}
          {data.fixes?.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> How to Fix
              </h4>
              {isPro ? (
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
              ) : (
                <div className="px-3 py-3 bg-zinc-800/30 border-l-2 border-zinc-700 rounded-r-lg text-zinc-500 text-sm flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  {data.fixes.length} fix{data.fixes.length > 1 ? 'es' : ''} available in Full Autopsy
                </div>
              )}
            </div>
          )}

          {/* Suggestions — pro only */}
          {(data.suggestedHeadline || data.suggestedCTA) && (
            isPro ? (
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
            ) : (
              <div className="px-4 py-3 bg-zinc-800/30 border-l-2 border-zinc-700 rounded-r-lg text-zinc-500 text-sm flex items-center gap-2">
                <Lightbulb className="w-3 h-3" />
                <Lock className="w-3 h-3" />
                Ready-to-paste rewrites available in Full Autopsy
              </div>
            )
          )}
        </div>
      </MagicCard>
    </BlurFade>
  );
}

/* ── DiagnosticsPanel ─────────────────────────────────── */

function DiagnosticStatBadge({ label, value, color = 'zinc' }) {
  const colors = {
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    zinc: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  };
  return (
    <div className={cn('px-3 py-2 rounded-lg border text-center', colors[color])}>
      <p className="text-lg font-black">{value}</p>
      <p className="text-[10px] uppercase tracking-wider opacity-75">{label}</p>
    </div>
  );
}

function DiagnosticsPanel({ diagnostics, performance, roast }) {
  const [expandConsole, setExpandConsole] = useState(false);
  const [expandNetwork, setExpandNetwork] = useState(false);

  if (!diagnostics) return null;

  const consoleErrorCount = diagnostics.consoleErrors?.length || 0;
  const jsErrorCount = diagnostics.jsErrors?.length || 0;
  const networkFailCount = diagnostics.networkErrors?.length || 0;
  const a11yCount = diagnostics.accessibility?.length || 0;
  const securityCount = diagnostics.security?.length || 0;
  const totalIssues = consoleErrorCount + jsErrorCount + networkFailCount + a11yCount + securityCount;

  return (
    <BlurFade delay={0.15}>
      <div className="mb-12">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold text-center justify-center mb-2">
          <Terminal className="w-6 h-6 text-orange-500" /> Crime Scene Evidence
        </h2>
        <p className="text-zinc-600 text-sm text-center mb-6">
          What our browser found lurking under the hood
        </p>

        {roast?.diagnosticsRoast?.overallHealthVerdict && (
          <MagicCard className="mb-6 p-5" gradientColor="#ff6b3510">
            <p className="text-zinc-300 italic text-sm leading-relaxed">
              <Bug className="w-4 h-4 text-orange-500 inline mr-1.5 -mt-0.5" />
              &ldquo;{roast.diagnosticsRoast.overallHealthVerdict}&rdquo;
            </p>
          </MagicCard>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <DiagnosticStatBadge label="Console Errors" value={consoleErrorCount + jsErrorCount} color={consoleErrorCount + jsErrorCount === 0 ? 'green' : 'red'} />
          <DiagnosticStatBadge label="Failed Requests" value={networkFailCount} color={networkFailCount === 0 ? 'green' : networkFailCount < 3 ? 'yellow' : 'red'} />
          <DiagnosticStatBadge label="A11y Issues" value={a11yCount} color={a11yCount === 0 ? 'green' : a11yCount < 3 ? 'yellow' : 'orange'} />
          <DiagnosticStatBadge label="Security" value={securityCount === 0 ? '✓' : securityCount} color={securityCount === 0 ? 'green' : 'red'} />
        </div>

        {performance && (
          <MagicCard className="mb-4 p-5" gradientColor="#ff6b3508">
            <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-300 mb-3">
              <Gauge className="w-4 h-4 text-orange-500" /> Performance Metrics
            </h3>
            {roast?.diagnosticsRoast?.consoleErrors && (
              <p className="text-zinc-500 italic text-xs mb-3">{roast.diagnosticsRoast.consoleErrors}</p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {performance.loadTime && (
                <div className="text-center">
                  <p className={cn('text-lg font-bold', performance.loadTime < 3000 ? 'text-green-400' : performance.loadTime < 5000 ? 'text-yellow-400' : 'text-red-400')}>
                    {(performance.loadTime / 1000).toFixed(1)}s
                  </p>
                  <p className="text-[10px] text-zinc-600 uppercase">Page Load</p>
                </div>
              )}
              {performance.firstContentfulPaint && (
                <div className="text-center">
                  <p className={cn('text-lg font-bold', performance.firstContentfulPaint < 1800 ? 'text-green-400' : performance.firstContentfulPaint < 3000 ? 'text-yellow-400' : 'text-red-400')}>
                    {(performance.firstContentfulPaint / 1000).toFixed(1)}s
                  </p>
                  <p className="text-[10px] text-zinc-600 uppercase">FCP</p>
                </div>
              )}
              {performance.largestContentfulPaint && (
                <div className="text-center">
                  <p className={cn('text-lg font-bold', performance.largestContentfulPaint < 2500 ? 'text-green-400' : performance.largestContentfulPaint < 4000 ? 'text-yellow-400' : 'text-red-400')}>
                    {(performance.largestContentfulPaint / 1000).toFixed(1)}s
                  </p>
                  <p className="text-[10px] text-zinc-600 uppercase">LCP</p>
                </div>
              )}
              {performance.cumulativeLayoutShift !== undefined && (
                <div className="text-center">
                  <p className={cn('text-lg font-bold', performance.cumulativeLayoutShift < 0.1 ? 'text-green-400' : performance.cumulativeLayoutShift < 0.25 ? 'text-yellow-400' : 'text-red-400')}>
                    {performance.cumulativeLayoutShift.toFixed(3)}
                  </p>
                  <p className="text-[10px] text-zinc-600 uppercase">CLS</p>
                </div>
              )}
            </div>
            {performance.totalResources && (
              <p className="text-xs text-zinc-600 mt-3 text-center">{performance.totalResources} resources loaded</p>
            )}
          </MagicCard>
        )}

        {(consoleErrorCount > 0 || jsErrorCount > 0) && (
          <MagicCard className="mb-4 p-5" gradientColor="#ef444410">
            <button onClick={() => setExpandConsole(!expandConsole)} className="flex items-center justify-between w-full text-left cursor-pointer">
              <h3 className="flex items-center gap-2 text-sm font-bold text-red-400">
                <Terminal className="w-4 h-4" /> Console Errors ({consoleErrorCount + jsErrorCount})
              </h3>
              {expandConsole ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </button>
            {expandConsole && (
              <div className="mt-3 space-y-2">
                {diagnostics.jsErrors?.map((err, i) => (
                  <div key={`js-${i}`} className="px-3 py-2 bg-red-500/5 border-l-2 border-red-500 rounded-r-lg text-xs font-mono text-red-300 overflow-x-auto">
                    <span className="text-red-500 font-bold">💥 Exception:</span> {err.message}
                  </div>
                ))}
                {diagnostics.consoleErrors?.map((err, i) => (
                  <div key={`con-${i}`} className="px-3 py-2 bg-red-500/5 border-l-2 border-red-500 rounded-r-lg text-xs font-mono text-red-300 overflow-x-auto">
                    <span className="text-red-500 font-bold">❌</span> {err.text}
                  </div>
                ))}
              </div>
            )}
          </MagicCard>
        )}

        {networkFailCount > 0 && (
          <MagicCard className="mb-4 p-5" gradientColor="#f9731610">
            <button onClick={() => setExpandNetwork(!expandNetwork)} className="flex items-center justify-between w-full text-left cursor-pointer">
              <h3 className="flex items-center gap-2 text-sm font-bold text-orange-400">
                <WifiOff className="w-4 h-4" /> Failed Network Requests ({networkFailCount})
              </h3>
              {expandNetwork ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </button>
            {roast?.diagnosticsRoast?.networkIssues && (
              <p className="text-zinc-500 italic text-xs mt-2">{roast.diagnosticsRoast.networkIssues}</p>
            )}
            {expandNetwork && (
              <div className="mt-3 space-y-2">
                {diagnostics.networkErrors?.map((err, i) => (
                  <div key={i} className="px-3 py-2 bg-orange-500/5 border-l-2 border-orange-500 rounded-r-lg text-xs font-mono text-orange-300 overflow-x-auto">
                    <span className="text-orange-500 font-bold">⛔ {err.method}</span>{' '}
                    <span className="text-zinc-400">{err.url}</span>{' '}
                    <span className="text-red-400">→ {err.reason}</span>{' '}
                    <span className="text-zinc-600">({err.resourceType})</span>
                  </div>
                ))}
              </div>
            )}
          </MagicCard>
        )}

        {a11yCount > 0 && (
          <MagicCard className="mb-4 p-5" gradientColor="#eab30810">
            <h3 className="flex items-center gap-2 text-sm font-bold text-yellow-400 mb-3">
              <Eye className="w-4 h-4" /> Accessibility Issues ({a11yCount})
            </h3>
            {roast?.diagnosticsRoast?.accessibility && (
              <p className="text-zinc-500 italic text-xs mb-3">{roast.diagnosticsRoast.accessibility}</p>
            )}
            <div className="space-y-2">
              {diagnostics.accessibility?.map((issue, i) => (
                <div key={i} className={cn('px-3 py-2 border-l-2 rounded-r-lg text-sm', issue.severity === 'error' ? 'bg-red-500/5 border-red-500 text-red-300' : 'bg-yellow-500/5 border-yellow-500 text-yellow-300')}>
                  {issue.severity === 'error' ? '🚨' : '⚠️'} {issue.detail}
                </div>
              ))}
            </div>
          </MagicCard>
        )}

        {securityCount > 0 && (
          <MagicCard className="mb-4 p-5" gradientColor="#ef444410">
            <h3 className="flex items-center gap-2 text-sm font-bold text-red-400 mb-3">
              <Lock className="w-4 h-4" /> Security Issues ({securityCount})
            </h3>
            {roast?.diagnosticsRoast?.security && (
              <p className="text-zinc-500 italic text-xs mb-3">{roast.diagnosticsRoast.security}</p>
            )}
            <div className="space-y-2">
              {diagnostics.security?.map((issue, i) => (
                <div key={i} className="px-3 py-2 bg-red-500/5 border-l-2 border-red-500 rounded-r-lg text-red-300 text-sm">
                  🔒 {issue.detail}
                </div>
              ))}
            </div>
          </MagicCard>
        )}

        {diagnostics.networkSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <DiagnosticStatBadge label="Total Requests" value={diagnostics.networkSummary.totalRequests} color="zinc" />
            <DiagnosticStatBadge label="2xx OK" value={diagnostics.networkSummary.byStatus?.['2xx'] || 0} color="green" />
            <DiagnosticStatBadge label="3xx Redirect" value={diagnostics.networkSummary.byStatus?.['3xx'] || 0} color="yellow" />
            <DiagnosticStatBadge label="4xx/5xx Errors" value={(diagnostics.networkSummary.byStatus?.['4xx'] || 0) + (diagnostics.networkSummary.byStatus?.['5xx'] || 0)} color={(diagnostics.networkSummary.byStatus?.['4xx'] || 0) + (diagnostics.networkSummary.byStatus?.['5xx'] || 0) === 0 ? 'green' : 'red'} />
          </div>
        )}

        {totalIssues === 0 && (
          <MagicCard className="p-5 text-center" gradientColor="#22c55e10">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-green-400 font-bold">Clean Bill of Health</p>
            <p className="text-zinc-500 text-sm">No console errors, no failed requests, no accessibility or security issues. Impressive.</p>
          </MagicCard>
        )}
      </div>
    </BlurFade>
  );
}

/* ── AI Fix Prompt Generator ─────────────────────────── */

function generateFixPrompt(result) {
  const { roast, url, diagnostics } = result;
  
  let prompt = `I just ran an automated audit on my website (${url}) and it found the following issues. Please fix ALL of them. Here's the complete report:\n\n`;
  prompt += `## Overall Score: ${roast.overallScore}/100\n`;
  prompt += `Verdict: ${roast.verdict}\n\n`;
  
  if (roast.topPriorities?.length) {
    prompt += `## CRITICAL — Fix These First:\n`;
    roast.topPriorities.forEach((p, i) => { prompt += `${i + 1}. ${p}\n`; });
    prompt += '\n';
  }
  
  if (roast.quickWins?.length) {
    prompt += `## Quick Wins (5-min fixes):\n`;
    roast.quickWins.forEach((w, i) => { prompt += `${i + 1}. ${w}\n`; });
    prompt += '\n';
  }
  
  const categories = [
    { key: 'heroSection', name: 'Hero Section' },
    { key: 'headline', name: 'Headline' },
    { key: 'cta', name: 'Call-to-Action' },
    { key: 'socialProof', name: 'Social Proof' },
    { key: 'copywriting', name: 'Copywriting' },
    { key: 'design', name: 'Design & UX' },
    { key: 'mobile', name: 'Mobile Experience' },
    { key: 'performance', name: 'Performance' },
    { key: 'trustAndCredibility', name: 'Trust & Credibility' },
  ];
  
  prompt += `## Detailed Category Breakdown:\n\n`;
  categories.forEach(cat => {
    const data = roast[cat.key];
    if (!data) return;
    prompt += `### ${cat.name} — Score: ${data.score}/10\n`;
    if (data.issues?.length) {
      prompt += `Issues:\n`;
      data.issues.forEach(issue => prompt += `- ${issue}\n`);
    }
    if (data.fixes?.length) {
      prompt += `Suggested Fixes:\n`;
      data.fixes.forEach(fix => prompt += `- ${fix}\n`);
    }
    prompt += '\n';
  });
  
  if (diagnostics) {
    prompt += `## Browser Diagnostics:\n\n`;
    if (diagnostics.consoleErrors?.length) {
      prompt += `### Console Errors (${diagnostics.consoleErrors.length}):\n`;
      diagnostics.consoleErrors.forEach(e => prompt += `- ${e.text}\n`);
      prompt += '\n';
    }
    if (diagnostics.jsErrors?.length) {
      prompt += `### JavaScript Exceptions (${diagnostics.jsErrors.length}):\n`;
      diagnostics.jsErrors.forEach(e => prompt += `- ${e.message}\n`);
      prompt += '\n';
    }
    if (diagnostics.networkErrors?.length) {
      prompt += `### Failed Network Requests (${diagnostics.networkErrors.length}):\n`;
      diagnostics.networkErrors.forEach(e => prompt += `- ${e.method} ${e.url} → ${e.reason}\n`);
      prompt += '\n';
    }
    if (diagnostics.accessibility?.length) {
      prompt += `### Accessibility Issues (${diagnostics.accessibility.length}):\n`;
      diagnostics.accessibility.forEach(a => prompt += `- [${a.severity}] ${a.detail}\n`);
      prompt += '\n';
    }
    if (diagnostics.security?.length) {
      prompt += `### Security Issues (${diagnostics.security.length}):\n`;
      diagnostics.security.forEach(s => prompt += `- ${s.detail}\n`);
      prompt += '\n';
    }
  }

  if (result.proAnalysis) {
    const pro = result.proAnalysis;
    prompt += `\n## PRO Headline Rewrites:\n`;
    pro.headlineRewrites?.forEach((h, i) => { prompt += `${i + 1}. "${h.text}" — ${h.reasoning}\n`; });
    prompt += `\n## PRO CTA Rewrites:\n`;
    pro.ctaRewrites?.forEach((c, i) => { prompt += `${i + 1}. "${c.text}" — ${c.reasoning}\n`; });
    if (pro.aboveTheFoldRewrite) {
      prompt += `\n## PRO Above-the-Fold Rewrite:\n${pro.aboveTheFoldRewrite}\n`;
    }
    if (pro.technicalFixes?.length) {
      prompt += `\n## PRO Technical Fixes:\n`;
      pro.technicalFixes.forEach(t => { prompt += `- ${t.issue}: ${t.fix}\n`; });
    }
  }
  
  prompt += `\n---\nPlease provide the exact code changes needed to fix every issue listed above. Prioritize the CRITICAL items first, then Quick Wins, then work through each category. Show me the specific files and code blocks to change.`;
  return prompt;
}

function AIFixPromptSection({ result, isPro, roastId }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const prompt = generateFixPrompt(result);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <BlurFade delay={0.15}>
      <div className="mt-10 mb-10">
        <MagicCard className="p-6" gradientColor="#a855f715">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Wand2 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-purple-300 flex items-center gap-2">
                Fix Everything with AI
                {!isPro && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-bold">PRO</span>}
              </h3>
              <p className="text-zinc-500 text-sm mt-1">
                {isPro
                  ? 'Every issue, bug, and roast compiled into one prompt. Copy it, paste it into ChatGPT/Claude/Cursor, and let AI fix your site.'
                  : 'We compiled every issue into one AI-ready prompt. Unlock it with the Full Autopsy to fix everything in minutes.'}
              </p>
            </div>
          </div>
          
          {isPro ? (
            <>
              <div className="relative">
                <div className={cn("bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-400 leading-relaxed overflow-hidden transition-all duration-300", expanded ? "max-h-[500px] overflow-y-auto" : "max-h-32")}>
                  <pre className="whitespace-pre-wrap">{prompt}</pre>
                </div>
                {!expanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent rounded-b-xl" />
                )}
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleCopy}
                  className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer", copied ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20")}
                >
                  {copied ? <><CheckCircle2 className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy AI Fix Prompt</>}
                </button>
                <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                  {expanded ? <><ChevronUp className="w-3 h-3" /> Collapse</> : <><ChevronDown className="w-3 h-3" /> Preview full prompt</>}
                </button>
              </div>
            </>
          ) : (
            <LockedOverlay roastId={roastId} title="AI Fix Prompt" description="One prompt to fix everything — paste it into ChatGPT, Claude, or Cursor." />
          )}
        </MagicCard>
      </div>
    </BlurFade>
  );
}

/* ── PRO Analysis Sections ───────────────────────────── */

function ProAnalysisSection({ proAnalysis, roast }) {
  if (!proAnalysis) return null;

  return (
    <BlurFade delay={0.2}>
      <div className="mt-10 mb-10 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-full mb-4">
            <Crown className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold text-orange-300">Full Autopsy Results</span>
          </div>
          <h2 className="text-2xl font-extrabold">Ready-to-Paste Rewrites</h2>
          <p className="text-zinc-500 text-sm mt-1">Copy these directly into your site. No thinking required.</p>
        </div>

        {proAnalysis.headlineRewrites?.length > 0 && (
          <ShineBorder borderRadius={16} borderWidth={2} duration={12} color={["#ff6b35", "#e63946", "#ff9f43"]} className="p-6 bg-zinc-900/50">
            <div className="w-full">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-orange-400 mb-4">
                <PenTool className="w-5 h-5" /> 3 Better Headlines
              </h3>
              <div className="space-y-4">
                {proAnalysis.headlineRewrites.map((h, i) => (
                  <CopyableRewrite key={i} index={i + 1} text={h.text} reasoning={h.reasoning} />
                ))}
              </div>
            </div>
          </ShineBorder>
        )}

        {proAnalysis.ctaRewrites?.length > 0 && (
          <ShineBorder borderRadius={16} borderWidth={2} duration={12} color={["#22c55e", "#16a34a", "#22c55e"]} className="p-6 bg-zinc-900/50">
            <div className="w-full">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-green-400 mb-4">
                <MousePointer className="w-5 h-5" /> 3 Better CTAs
              </h3>
              <div className="space-y-4">
                {proAnalysis.ctaRewrites.map((c, i) => (
                  <CopyableRewrite key={i} index={i + 1} text={c.text} reasoning={c.reasoning} color="green" />
                ))}
              </div>
            </div>
          </ShineBorder>
        )}

        {proAnalysis.aboveTheFoldRewrite && (
          <MagicCard className="p-6" gradientColor="#a855f715">
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-purple-400 mb-4">
              <FileText className="w-5 h-5" /> Complete Hero Rewrite
            </h3>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
              <pre className="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed font-sans">{proAnalysis.aboveTheFoldRewrite}</pre>
            </div>
            <CopyButton text={proAnalysis.aboveTheFoldRewrite} className="mt-3" />
          </MagicCard>
        )}

        {proAnalysis.socialProofTemplates?.length > 0 && (
          <MagicCard className="p-6" gradientColor="#eab30815">
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-yellow-400 mb-4">
              <Star className="w-5 h-5" /> Testimonial Templates
            </h3>
            <p className="text-zinc-500 text-xs mb-4">Fill in the blanks with real customer details — these templates are tailored to your product.</p>
            <div className="space-y-3">
              {proAnalysis.socialProofTemplates.map((t, i) => (
                <div key={i} className="px-4 py-3 bg-yellow-500/5 border-l-2 border-yellow-500 rounded-r-lg">
                  <p className="text-yellow-200 text-sm italic">&ldquo;{t}&rdquo;</p>
                  <CopyButton text={t} className="mt-2" />
                </div>
              ))}
            </div>
          </MagicCard>
        )}

        {proAnalysis.prioritizedFixPlan?.length > 0 && (
          <MagicCard className="p-6" gradientColor="#3b82f615">
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-blue-400 mb-2">
              <BarChart3 className="w-5 h-5" /> Fix Plan (in order)
            </h3>
            {proAnalysis.predictedScoreAfterFixes && (
              <p className="text-zinc-500 text-sm mb-4">
                Current: <span className={scoreColor(roast.overallScore)}>{roast.overallScore}/100</span>
                {' → '}
                Predicted: <span className="text-green-400 font-bold">{proAnalysis.predictedScoreAfterFixes}/100</span>
              </p>
            )}
            <div className="space-y-3">
              {proAnalysis.prioritizedFixPlan.map((step, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">
                    {step.priority || i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-zinc-200 text-sm font-medium">{step.task}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span>⏱ {step.timeEstimate}</span>
                      <span className={cn('px-1.5 py-0.5 rounded', step.impact === 'high' ? 'bg-red-500/10 text-red-400' : step.impact === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-zinc-800 text-zinc-400')}>
                        {step.impact} impact
                      </span>
                      {step.predictedScoreGain > 0 && <span className="text-green-400">+{step.predictedScoreGain} pts</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </MagicCard>
        )}

        {proAnalysis.copywritingDeepDive && (
          <MagicCard className="p-6" gradientColor="#f9731615">
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-orange-400 mb-4">
              <PenTool className="w-5 h-5" /> Copy Deep Dive
            </h3>
            <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{proAnalysis.copywritingDeepDive}</div>
          </MagicCard>
        )}

        {proAnalysis.technicalFixes?.length > 0 && (
          <MagicCard className="p-6" gradientColor="#ef444415">
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-red-400 mb-4">
              <Bug className="w-5 h-5" /> Technical Fixes (code-level)
            </h3>
            <div className="space-y-3">
              {proAnalysis.technicalFixes.map((t, i) => (
                <div key={i} className="border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-red-500/5 border-b border-zinc-800">
                    <p className="text-red-300 text-sm font-medium">{t.issue}</p>
                  </div>
                  <div className="px-4 py-3 bg-zinc-950">
                    <pre className="text-xs font-mono text-green-300 whitespace-pre-wrap">{t.fix}</pre>
                    <CopyButton text={t.fix} className="mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </MagicCard>
        )}
      </div>
    </BlurFade>
  );
}

/* ── Copyable Rewrite Item ───────────────────────────── */

function CopyableRewrite({ index, text, reasoning, color = 'orange' }) {
  const [copied, setCopied] = useState(false);
  const colors = { orange: 'border-orange-500 bg-orange-500/5', green: 'border-green-500 bg-green-500/5' };
  const textColors = { orange: 'text-orange-200', green: 'text-green-200' };

  return (
    <div className={cn('px-4 py-3 border-l-2 rounded-r-lg', colors[color])}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <span className="text-xs font-bold text-zinc-500">Option {index}</span>
          <p className={cn('text-sm font-semibold mt-1', textColors[color])}>&ldquo;{text}&rdquo;</p>
          {reasoning && <p className="text-xs text-zinc-500 mt-1 italic">{reasoning}</p>}
        </div>
        <button
          onClick={async () => {
            try { await navigator.clipboard.writeText(text); } catch { /* fallback */ }
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Copy"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-zinc-600" />}
        </button>
      </div>
    </div>
  );
}

/* ── Copy Button ─────────────────────────────────────── */

function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); } catch { /* fallback */ }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer', copied ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700', className)}
    >
      {copied ? <><CheckCircle2 className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
    </button>
  );
}

/* ── Main ────────────────────────────────────────────── */

export default function RoastResults({ result }) {
  const { roast, url, screenshots, createdAt, id } = result;
  const isPro = !!result.proAnalysis;
  const roastId = id || '';

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
        <div className="flex items-center gap-3">
          {isPro && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full text-xs font-bold text-orange-400">
              <Crown className="w-3 h-3" /> PRO
            </span>
          )}
          <ShimmerButton shimmerColor="#ff6b35" background="linear-gradient(135deg, #ea580c, #dc2626)" borderRadius="8px" className="px-4 py-2 text-sm font-semibold" onClick={() => window.location.href = '/'}>
            <Flame className="w-3.5 h-3.5 mr-1.5" /> Roast Another
          </ShimmerButton>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-5 py-12">
        {/* ── Overall Score ─────────────────── */}
        <BlurFade delay={0.1}>
          <section className="relative text-center mb-14 overflow-hidden rounded-2xl py-10">
            <Meteors number={15} />
            <p className="text-zinc-600 text-sm mb-2">
              {isPro ? '🔥 Full Autopsy for ' : 'Roast for '}<span className="text-zinc-400">{url}</span>
            </p>
            <div className="flex justify-center mb-6">
              <AnimatedCircularProgressBar value={roast.overallScore} gaugeColor={rawHex(roast.overallScore)} gaugeBgColor="#27272a" className="w-36 h-36" />
            </div>
            <BlurFade delay={0.4}>
              <h1 className="text-xl sm:text-2xl font-extrabold max-w-xl mx-auto leading-snug mb-3">{roast.verdict}</h1>
            </BlurFade>
            <p className="text-zinc-600 text-xs">
              Analyzed{' '}
              {new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            {roast.roasterComment && (
              <BlurFade delay={0.5}>
                <MagicCard className="mt-6 p-5 max-w-lg mx-auto text-left" gradientColor="#ff6b3515">
                  <p className="text-zinc-300 text-sm leading-relaxed italic">
                    <Flame className="w-4 h-4 text-orange-500 inline mr-1.5 -mt-0.5" />
                    &ldquo;{roast.roasterComment}&rdquo;
                  </p>
                  <p className="text-zinc-600 text-xs mt-2 text-right">— The PageRoast AI</p>
                </MagicCard>
              </BlurFade>
            )}
          </section>
        </BlurFade>

        {/* ── Screenshots ───────────────────── */}
        <BlurFade delay={0.2}>
          <section className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4 mb-14">
            <div>
              <p className="text-xs text-zinc-600 mb-2">Desktop</p>
              <div className="relative rounded-xl border border-zinc-800 overflow-hidden">
                <BorderBeam size={200} duration={15} />
                {screenshots?.hero ? (
                  <img src={`data:image/png;base64,${screenshots.hero}`} alt="Desktop screenshot" className="w-full" />
                ) : (
                  <div className="w-full h-48 bg-zinc-900 flex items-center justify-center text-zinc-600 text-sm">Screenshot unavailable</div>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-600 mb-2">Mobile</p>
              <div className="relative rounded-xl border border-zinc-800 overflow-hidden">
                <BorderBeam size={150} duration={15} delay={5} />
                {screenshots?.mobile ? (
                  <img src={`data:image/png;base64,${screenshots.mobile}`} alt="Mobile screenshot" className="w-full" />
                ) : (
                  <div className="w-full h-48 bg-zinc-900 flex items-center justify-center text-zinc-600 text-sm">Screenshot unavailable</div>
                )}
              </div>
            </div>
          </section>
        </BlurFade>

        {/* ── Top Priorities ─────────────────── */}
        {roast.topPriorities && (
          <BlurFade delay={0.3}>
            <ShineBorder borderRadius={16} borderWidth={2} duration={12} color={["#ef4444", "#dc2626", "#ef4444"]} className="bg-red-500/5 p-6 mb-8">
              <div className="w-full">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-red-400 mb-4">
                  <AlertTriangle className="w-5 h-5" /> Fix These FIRST
                </h2>
                <ol className="list-decimal list-inside space-y-2">
                  {roast.topPriorities.map((p, i) => (
                    <li key={i} className="text-red-200 text-sm leading-relaxed">{p}</li>
                  ))}
                </ol>
              </div>
            </ShineBorder>
          </BlurFade>
        )}

        {/* ── Quick Wins ─────────────────────── */}
        {roast.quickWins && (
          <BlurFade delay={0.35}>
            <ShineBorder borderRadius={16} borderWidth={2} duration={12} color={["#22c55e", "#16a34a", "#22c55e"]} className="bg-green-500/5 p-6 mb-12">
              <div className="w-full">
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
              </div>
            </ShineBorder>
          </BlurFade>
        )}

        {/* ── Crime Scene Evidence (Diagnostics) ─ */}
        <DiagnosticsPanel diagnostics={result.diagnostics} performance={result.performance} roast={roast} />

        {/* ── Category Breakdowns ────────────── */}
        <div className="relative">
          <DotPattern className="absolute inset-0 -z-10 opacity-15 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]" width={20} height={20} cr={0.8} cx={1} cy={1} />
          <BlurFade delay={0.1}>
            <h2 className="text-2xl font-extrabold text-center mb-8">Detailed Breakdown</h2>
          </BlurFade>
          <div className="space-y-4">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} {...cat} index={i} isPro={isPro} roastId={roastId} />
            ))}
          </div>
        </div>

        {/* ── Estimated Lift ──────────────────── */}
        {roast.estimatedConversionLift && (
          <BlurFade delay={0.2}>
            <div className="relative text-center p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 mt-10 overflow-hidden">
              <BorderBeam size={250} duration={20} colorFrom="#22c55e" colorTo="#16a34a" />
              <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm mb-1">Estimated Conversion Lift</p>
              <p className="text-4xl font-black text-green-400">{roast.estimatedConversionLift}</p>
            </div>
          </BlurFade>
        )}

        {/* ── PRO Analysis (if unlocked) ────── */}
        {isPro && <ProAnalysisSection proAnalysis={result.proAnalysis} roast={roast} />}

        {/* ── AI Fix Prompt (gated) ──────────── */}
        <AIFixPromptSection result={result} isPro={isPro} roastId={roastId} />

        {/* ── CTA / Share ─────────────────────── */}
        <section className="text-center py-14">
          <BlurFade delay={0.1}>
            {isPro ? (
              <>
                <h2 className="text-2xl font-extrabold mb-3">You survived the Full Autopsy</h2>
                <p className="text-zinc-500 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                  Now fix everything, re-roast for free, and see your score climb. Share the results to flex on your competitors.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-extrabold mb-3">Want ready-to-paste fixes?</h2>
                <p className="text-zinc-500 max-w-md mx-auto mb-4 text-sm leading-relaxed">
                  Subscribe for $5/mo and every roast includes headline rewrites, CTA rewrites, testimonial templates, a prioritized fix plan, and the AI prompt that fixes everything.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-md mx-auto">
                  {['Unlimited PRO roasts', '3 headline rewrites', '3 CTA rewrites', 'Fix plan', 'AI fix prompt', 'Dashboard & history'].map((item) => (
                    <span key={item} className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300 font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </>
            )}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {!isPro && <UpgradeCTA roastId={roastId} />}
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
          </BlurFade>
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
