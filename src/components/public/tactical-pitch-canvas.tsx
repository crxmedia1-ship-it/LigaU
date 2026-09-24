"use client";

import { motion, useReducedMotion } from "motion/react";

const DRAW = {
  duration: 1.2,
  ease: "easeOut" as const,
};

const STROKE = 1;

/**
 * Ambient tactical chalk: soft field geometry as texture behind the Home
 * content — never loud enough to compete with hero type. Parent owns
 * opacity-40; strokes stay zinc-300 technical chalk.
 */
export function TacticalPitchCanvas() {
  const reduce = useReducedMotion();

  const draw = (delay = 0) =>
    reduce
      ? undefined
      : {
          initial: { pathLength: 0, opacity: 0.4 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { ...DRAW, delay },
        };

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Monumental ice watermark — kept soft so it never fights headlines */}
      <span className="font-jersey absolute top-[58%] left-[55%] -translate-x-1/2 -translate-y-1/2 text-[16vw] leading-none font-black tracking-tighter text-zinc-200/35 italic select-none lg:top-[62%] lg:left-[62%]">
        LIGA U
      </span>

      {/* Soft Liga U crimson spotlight — top-right Hero warmth */}
      <div className="absolute -top-20 -right-12 hidden h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(200,16,46,0.14),transparent_68%)] md:block md:h-[30rem] md:w-[30rem]" />

      {/* Chalk field: dimmed + shifted right/down so arcs sit as ambient
          texture under the athlete / grid, not across the hero copy. */}
      <svg
        className="absolute inset-0 hidden h-full w-full origin-bottom-right translate-x-[10%] translate-y-[14%] scale-[1.25] text-zinc-300 opacity-40 md:block"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <motion.rect
          x="120"
          y="80"
          width="1200"
          height="740"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0)}
        />
        <motion.line
          x1="720"
          y1="80"
          x2="720"
          y2="820"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.08)}
        />
        <motion.circle
          cx="720"
          cy="450"
          r="110"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.12)}
        />
        <motion.circle
          cx="720"
          cy="450"
          r="3"
          fill="currentColor"
          stroke="none"
          initial={reduce ? undefined : { scale: 0, opacity: 0 }}
          animate={reduce ? undefined : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.9, ease: "easeOut" }}
        />

        <motion.rect
          x="120"
          y="270"
          width="200"
          height="360"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.18)}
        />
        <motion.rect
          x="120"
          y="345"
          width="80"
          height="210"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.22)}
        />
        <motion.path
          d="M320 360 A95 95 0 0 1 320 540"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.28)}
        />

        <motion.rect
          x="1120"
          y="270"
          width="200"
          height="360"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.18)}
        />
        <motion.rect
          x="1240"
          y="345"
          width="80"
          height="210"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.22)}
        />
        <motion.path
          d="M1120 360 A95 95 0 0 0 1120 540"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.28)}
        />

        <motion.line
          x1="40"
          y1="200"
          x2="280"
          y2="40"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.35)}
        />
        <motion.line
          x1="1160"
          y1="40"
          x2="1400"
          y2="200"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.35)}
        />
        <motion.line
          x1="40"
          y1="700"
          x2="280"
          y2="860"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.4)}
        />
        <motion.line
          x1="1160"
          y1="860"
          x2="1400"
          y2="700"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.4)}
        />

        <motion.path
          d="M80 80 Q80 40 120 40"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.45)}
        />
        <motion.path
          d="M60 100 Q60 20 140 20"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.5)}
        />
        <motion.path
          d="M1320 40 Q1360 40 1360 80"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.45)}
        />
        <motion.path
          d="M1300 20 Q1380 20 1380 100"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.5)}
        />
        <motion.path
          d="M120 860 Q80 860 80 820"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.45)}
        />
        <motion.path
          d="M140 880 Q60 880 60 800"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.5)}
        />
        <motion.path
          d="M1360 820 Q1360 860 1320 860"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.45)}
        />
        <motion.path
          d="M1380 800 Q1380 880 1300 880"
          stroke="currentColor"
          strokeWidth={STROKE}
          {...draw(0.5)}
        />

        <motion.ellipse
          cx="720"
          cy="450"
          rx="680"
          ry="420"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeDasharray="10 12"
          {...draw(0.55)}
        />
      </svg>
    </div>
  );
}
