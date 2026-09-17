"use client";

import { motion, useReducedMotion } from "motion/react";
import { TiltCard } from "@/components/magic/tilt-card";

export function MysteryCard3D() {
  const reduce = useReducedMotion();

  return (
    <TiltCard className="h-full">
      <div
        className="titanium-plate relative min-h-[22rem] overflow-hidden border border-zinc-300 p-6 shadow-lg shadow-zinc-200/50 dark:border-zinc-500/35 dark:shadow-[0_20px_80px_rgba(139,0,0,0.4)]"
        style={{
          clipPath:
            "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
          transform: "translateZ(24px)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[conic-gradient(from_120deg_at_50%_40%,transparent_0%,#e2e8f033_16%,transparent_32%,#c8102e44_58%,transparent_74%)] opacity-40" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
          MVP de la semana
        </p>
        <div className="relative mt-6 grid min-h-56 place-items-center overflow-hidden">
          <svg
            aria-hidden
            viewBox="0 0 180 260"
            className="absolute h-48 w-48 max-w-[200px] opacity-20"
          >
            <ellipse cx="90" cy="36" rx="18" ry="20" fill="#111113" />
            <path
              fill="#0c0c0f"
              stroke="#27272a"
              d="M78 56c-4 24-2 46 4 68 6 28 2 52-10 78l16 6c8-24 14-50 10-76 14 12 32 16 50 8l-6-14c-14 6-26 2-36-10 4-18 6-40 2-60z"
            />
          </svg>
          <motion.span
            aria-hidden
            className="relative inline-flex h-48 w-48 max-w-[200px] items-center justify-center"
            animate={
              reduce
                ? undefined
                : {
                    filter: [
                      "drop-shadow(0 0 12px rgba(200,16,46,0.4))",
                      "drop-shadow(0 0 28px rgba(200,16,46,0.85))",
                      "drop-shadow(0 0 12px rgba(200,16,46,0.4))",
                    ],
                  }
            }
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={
              reduce
                ? { filter: "drop-shadow(0 0 18px rgba(200,16,46,0.55))" }
                : undefined
            }
          >
            <span className="font-jersey bg-clip-text text-8xl leading-none text-transparent opacity-30 [background-image:linear-gradient(180deg,#F59E0B,#BA0C2F)] [-webkit-background-clip:text] [-webkit-text-stroke:2px_rgba(212,175,55,0.35)]">
              ?
            </span>
          </motion.span>
        </div>
        <p className="relative mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Identidad oculta. Se revela al cerrar la jornada con MVP oficial.
        </p>
      </div>
    </TiltCard>
  );
}
