"use client";

import { motion, useReducedMotion } from "motion/react";

const PLAYER_SRC =
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=720&h=1000&q=55";

const MASK = [
  "linear-gradient(to bottom, black 48%, transparent 92%)",
  "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
  "radial-gradient(ellipse 70% 78% at 50% 36%, black 38%, transparent 72%)",
].join(", ");

export function HeroPlayerHero() {
  const reduce = useReducedMotion();

  return (
    <div className="relative isolate mx-auto flex h-full min-h-[280px] w-full max-w-lg items-end justify-center lg:max-w-none">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center select-none font-jersey text-[7rem] leading-none font-black tracking-tighter text-zinc-800/80 sm:text-[11rem] lg:text-[14rem]"
      >
        LIGA U
      </span>

      <div
        aria-hidden
        className="pointer-events-none absolute top-[12%] left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#C8102E]/50 blur-3xl sm:h-80 sm:w-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[6%] left-1/2 h-24 w-72 -translate-x-1/2 rounded-full bg-[#BA0C2F]/40 blur-3xl"
      />

      <motion.div
        className="relative z-10 flex h-full w-full items-end justify-center will-change-transform"
        animate={reduce ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="relative flex h-full w-auto max-w-[min(100%,28rem)] items-end justify-center [filter:drop-shadow(0_0_50px_rgba(200,16,46,0.45))_drop-shadow(0_24px_80px_rgba(158,27,40,0.4))]"
          style={{
            maskImage: MASK,
            WebkitMaskImage: MASK,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        >
          <svg
            aria-hidden
            viewBox="0 0 220 360"
            className="absolute inset-x-0 bottom-0 mx-auto h-[88%] w-auto text-zinc-400"
          >
            <ellipse cx="110" cy="42" rx="22" ry="24" fill="currentColor" />
            <path
              fill="currentColor"
              d="M96 68c-6 28-4 52 2 78 8 34 6 62-8 92l18 8c10-28 16-58 12-88 18 14 38 18 58 10l-8-16c-16 6-30 2-42-12 6-22 8-48 4-72z"
            />
            <path
              fill="#71717a"
              d="M88 150c-22 8-40 4-58-10l8-14c16 10 30 10 44 2zm92 8c18 16 40 22 62 12l-6-16c-18 8-36 4-50-8zM78 250c-8 28-22 48-42 62l14 12c22-16 38-40 46-70zm48 18c6 32 2 58-12 86h18c16-30 20-58 12-88z"
            />
            <circle cx="168" cy="132" r="11" fill="#BA0C2F" />
          </svg>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PLAYER_SRC}
            alt=""
            width={720}
            height={1000}
            fetchPriority="high"
            decoding="async"
            className="relative h-full w-auto object-cover object-top mix-blend-luminosity brightness-150 contrast-125"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,transparent_28%,#09090B_76%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#09090B] to-transparent"
          />
        </div>
      </motion.div>
    </div>
  );
}

export const HeroMediaComponent = HeroPlayerHero;
