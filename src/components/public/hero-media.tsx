"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const PLAYER_SRC =
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=720&h=1000&q=55";

const MASK = [
  "linear-gradient(to bottom, black 70%, transparent 100%)",
  "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
  "radial-gradient(ellipse 70% 84% at 50% 40%, black 42%, transparent 78%)",
].join(", ");

export function HeroPlayerHero() {
  const reduce = useReducedMotion();
  const [float, setFloat] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setFloat(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [reduce]);

  return (
    <div className="relative isolate mx-auto flex h-full w-full max-w-lg items-end justify-center lg:min-h-[280px] lg:max-w-none">
      {/* Watermark behind player */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center select-none font-jersey text-[7rem] leading-none font-black tracking-tighter text-zinc-300/50 sm:text-[11rem] lg:text-[14rem]"
      >
        LIGA U
      </span>

      {/* Ambient crimson halo — softer on white canvas */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[12%] left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,16,46,0.2),transparent_68%)] sm:h-80 sm:w-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[6%] left-1/2 h-24 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,16,46,0.14),transparent_70%)]"
      />

      {/* Subtle crimson bleed down toward the grid edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent"
      />

      <motion.div
        className="relative z-10 flex h-full w-full items-end justify-center"
        animate={float ? { y: [0, -12, 0] } : undefined}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="relative flex h-full w-auto max-w-[min(100%,28rem)] items-end justify-center [filter:drop-shadow(0_20px_30px_rgba(0,0,0,0.12))_drop-shadow(0_0_40px_rgba(200,16,46,0.18))] lg:max-w-[30rem] xl:max-w-[34rem]"
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
            className="relative h-full w-auto object-contain object-bottom mix-blend-multiply brightness-105 contrast-110 saturate-105 lg:object-cover lg:object-top"
          />
          {/* Radial vignette fading the athlete edges into the light canvas */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,transparent_30%,rgba(248,250,252,0.85)_80%)]"
          />
          {/* Bottom fade into white */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#eef1f4] to-transparent"
          />
        </div>
      </motion.div>
    </div>
  );
}

export const HeroMediaComponent = HeroPlayerHero;
