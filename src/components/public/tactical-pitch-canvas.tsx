"use client";

import { motion, useReducedMotion } from "motion/react";

const DRAW = {
  duration: 1.2,
  ease: "easeOut" as const,
};

/**
 * Fixed "Tactical Pitch Canvas": vector chalk lines of a multi-sport field
 * (center circle, halfway, penalty arcs, oblique guides, tartan curves)
 * drawn once on load over platinum white. Pure decoration — no pointer events.
 */
export function TacticalPitchCanvas() {
  const reduce = useReducedMotion();

  const draw = (delay = 0) =>
    reduce
      ? undefined
      : {
          initial: { pathLength: 0, opacity: 0.35 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { ...DRAW, delay },
        };

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#F8FAFC]"
    >
      {/* Monumental ice-grey watermark behind the chalk */}
      <span className="font-jersey absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18vw] leading-none font-black tracking-tighter text-zinc-200/40 italic select-none">
        LIGA U
      </span>

      {/* Soft Liga U crimson spotlight — top-right Hero warmth */}
      <div className="absolute -top-24 -right-16 h-[28rem] w-[28rem] rounded-full bg-[#C8102E]/10 blur-3xl sm:h-[36rem] sm:w-[36rem]" />

      <svg
        className="absolute inset-0 h-full w-full text-zinc-300/70"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* Outer pitch rectangle */}
        <motion.rect
          x="120"
          y="80"
          width="1200"
          height="740"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0)}
        />

        {/* Halfway line */}
        <motion.line
          x1="720"
          y1="80"
          x2="720"
          y2="820"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.08)}
        />

        {/* Center circle */}
        <motion.circle
          cx="720"
          cy="450"
          r="110"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.12)}
        />
        {/* Center spot */}
        <motion.circle
          cx="720"
          cy="450"
          r="4"
          fill="currentColor"
          stroke="none"
          initial={reduce ? undefined : { scale: 0, opacity: 0 }}
          animate={reduce ? undefined : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.9, ease: "easeOut" }}
        />

        {/* Left penalty area */}
        <motion.rect
          x="120"
          y="270"
          width="200"
          height="360"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.18)}
        />
        {/* Left goal box */}
        <motion.rect
          x="120"
          y="345"
          width="80"
          height="210"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.22)}
        />
        {/* Left penalty arc */}
        <motion.path
          d="M320 360 A95 95 0 0 1 320 540"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.28)}
        />

        {/* Right penalty area */}
        <motion.rect
          x="1120"
          y="270"
          width="200"
          height="360"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.18)}
        />
        {/* Right goal box */}
        <motion.rect
          x="1240"
          y="345"
          width="80"
          height="210"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.22)}
        />
        {/* Right penalty arc */}
        <motion.path
          d="M1120 360 A95 95 0 0 0 1120 540"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.28)}
        />

        {/* Oblique tactical guides (sideline cuts) */}
        <motion.line
          x1="40"
          y1="200"
          x2="280"
          y2="40"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.35)}
        />
        <motion.line
          x1="1160"
          y1="40"
          x2="1400"
          y2="200"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.35)}
        />
        <motion.line
          x1="40"
          y1="700"
          x2="280"
          y2="860"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.4)}
        />
        <motion.line
          x1="1160"
          y1="860"
          x2="1400"
          y2="700"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.4)}
        />

        {/* Tartan track curves — concentric corner arcs */}
        <motion.path
          d="M80 80 Q80 40 120 40"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.45)}
        />
        <motion.path
          d="M60 100 Q60 20 140 20"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.5)}
        />
        <motion.path
          d="M1320 40 Q1360 40 1360 80"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.45)}
        />
        <motion.path
          d="M1300 20 Q1380 20 1380 100"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.5)}
        />
        <motion.path
          d="M120 860 Q80 860 80 820"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.45)}
        />
        <motion.path
          d="M140 880 Q60 880 60 800"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.5)}
        />
        <motion.path
          d="M1360 820 Q1360 860 1320 860"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.45)}
        />
        <motion.path
          d="M1380 800 Q1380 880 1300 880"
          stroke="currentColor"
          strokeWidth="1.5"
          {...draw(0.5)}
        />

        {/* Outer tartan oval — athletics track silhouette */}
        <motion.ellipse
          cx="720"
          cy="450"
          rx="680"
          ry="420"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="12 10"
          {...draw(0.55)}
        />
      </svg>
    </div>
  );
}
