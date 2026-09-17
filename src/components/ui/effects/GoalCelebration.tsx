"use client";

import { useEffect } from "react";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function GoalCelebration({
  colors,
  enabled,
  matchId,
}: {
  colors: string[];
  enabled: boolean;
  matchId: string;
}) {
  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return;
    const key = `ligau-confetti-${matchId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    let cancelled = false;
    void import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      const palette = colors.length > 0 ? colors : ["#C8102E", "#D4AF37"];
      confetti({
        particleCount: 80,
        spread: 68,
        origin: { y: 0.28 },
        colors: palette,
        disableForReducedMotion: true,
        ticks: 180,
        scalar: 0.85,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [colors, enabled, matchId]);

  return null;
}
