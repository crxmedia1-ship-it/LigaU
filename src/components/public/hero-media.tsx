"use client";

import { motion, useReducedMotion } from "motion/react";

export function HeroMediaComponent() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto flex h-[220px] w-full max-w-md items-center justify-center overflow-hidden sm:h-[400px]">
      <div className="absolute inset-x-16 bottom-6 h-16 rounded-full bg-[#BA0C2F]/20 blur-3xl" />
      <motion.div
        className="relative flex h-40 w-40 max-w-[200px] items-center justify-center will-change-transform sm:h-48 sm:w-48"
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=480&q=60"
          alt=""
          className="h-40 w-40 max-w-[200px] object-cover object-top opacity-25 mix-blend-luminosity sm:h-48 sm:w-48"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 58%, transparent 96%), linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 58%, transparent 96%), linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        />
        <svg
          aria-hidden
          viewBox="0 0 220 360"
          className="pointer-events-none absolute h-40 w-40 max-w-[200px] opacity-20 mix-blend-luminosity sm:h-48 sm:w-48"
        >
          <ellipse cx="110" cy="42" rx="22" ry="24" fill="#94a3b8" />
          <path
            fill="#64748b"
            d="M96 68c-6 28-4 52 2 78 8 34 6 62-8 92l18 8c10-28 16-58 12-88 18 14 38 18 58 10l-8-16c-16 6-30 2-42-12 6-22 8-48 4-72z"
          />
          <path
            fill="#94a3b8"
            d="M88 150c-22 8-40 4-58-10l8-14c16 10 30 10 44 2zm92 8c18 16 40 22 62 12l-6-16c-18 8-36 4-50-8zM78 250c-8 28-22 48-42 62l14 12c22-16 38-40 46-70zm48 18c6 32 2 58-12 86h18c16-30 20-58 12-88z"
          />
        </svg>
      </motion.div>
    </div>
  );
}
