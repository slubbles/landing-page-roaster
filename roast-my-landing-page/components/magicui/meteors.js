"use client";

import { useMemo } from "react";
import { cn } from "../../lib/utils";

// Seeded pseudo-random for deterministic SSR-safe values
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function Meteors({ number = 20, className }) {
  const meteors = useMemo(() =>
    Array.from({ length: number }, (_, i) => ({
      left: `${Math.floor(seededRandom(i + 1) * 400) - 100}px`,
      animationDelay: `${(seededRandom(i + 100) * 0.6 + 0.2).toFixed(2)}s`,
      animationDuration: `${Math.floor(seededRandom(i + 200) * 8 + 2)}s`,
    })),
    [number]
  );

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {meteors.map((style, idx) => (
        <span
          key={idx}
          className="absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-orange-400 shadow-[0_0_0_1px_#ffffff10]"
          style={{ top: 0, ...style }}
        >
          <div className="absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2 bg-gradient-to-r from-orange-400 to-transparent" />
        </span>
      ))}
    </div>
  );
}
