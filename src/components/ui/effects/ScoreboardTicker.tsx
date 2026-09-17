"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

function RollingDigit({ digit }: { digit: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.65em] overflow-hidden align-bottom">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col will-change-transform"
        animate={{ y: `${-digit}em` }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
      >
        {Array.from({ length: 10 }, (_, value) => (
          <span key={value} className="block h-[1em] leading-[1em]">
            {value}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function ScoreboardTicker({
  value,
  className,
  digits = 2,
}: {
  value: number;
  className?: string;
  digits?: number;
}) {
  const safe = Math.max(0, Math.floor(value));
  const padded = String(safe).padStart(digits, "0").slice(-Math.max(digits, String(safe).length));

  return (
    <span className={cn("inline-flex font-mono tabular-nums", className)}>
      {padded.split("").map((char, index) => (
        <RollingDigit key={`${index}-${padded.length}`} digit={Number(char)} />
      ))}
    </span>
  );
}

export function ScorePair({
  home,
  away,
  className,
}: {
  home: number;
  away: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono", className)}>
      <ScoreboardTicker value={home} />
      <span className="opacity-60">-</span>
      <ScoreboardTicker value={away} />
    </span>
  );
}
