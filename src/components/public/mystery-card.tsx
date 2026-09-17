"use client";

import { motion, useReducedMotion } from "motion/react";
import { TiltCard } from "@/components/magic/tilt-card";

const CLIP =
  "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)";

export function MysteryCard3D() {
  const reduce = useReducedMotion();

  return (
    <TiltCard className="h-full" tone="gold">
      <div className="relative h-full min-h-[22rem]" style={{ transform: "translateZ(24px)" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            clipPath: CLIP,
            background:
              "conic-gradient(from 130deg, #D4AF37, #BA0C2F, #F59E0B, #9E1B28, #D4AF37)",
          }}
        />
        <div
          className="carbon-fiber relative m-px flex h-[calc(100%-2px)] min-h-[21.8rem] flex-col overflow-hidden p-6 shadow-[0_20px_80px_rgba(139,0,0,0.45)]"
          style={{ clipPath: CLIP }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(212,175,55,0.22),transparent_42%),radial-gradient(circle_at_80%_90%,rgba(186,12,47,0.28),transparent_46%)]" />
          <p className="relative text-xs font-semibold tracking-[0.22em] text-[#D4AF37] uppercase">
            MVP de la semana
          </p>
          <div className="relative mt-6 grid min-h-56 flex-1 place-items-center overflow-hidden">
            <div
              aria-hidden
              className="absolute h-40 w-40 rounded-full bg-[#BA0C2F]/35 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute h-24 w-24 rounded-full bg-amber-400/25 blur-2xl"
            />
            <motion.span
              aria-hidden
              className="relative inline-flex items-center justify-center"
              animate={
                reduce
                  ? undefined
                  : {
                      filter: [
                        "drop-shadow(0 0 18px rgba(212,175,55,0.45))",
                        "drop-shadow(0 0 42px rgba(186,12,47,0.8))",
                        "drop-shadow(0 0 18px rgba(212,175,55,0.45))",
                      ],
                    }
              }
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={
                reduce
                  ? { filter: "drop-shadow(0 0 22px rgba(186,12,47,0.6))" }
                  : undefined
              }
            >
              <span className="font-jersey text-8xl leading-none text-transparent opacity-80 [background-image:linear-gradient(180deg,#F59E0B,#BA0C2F)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-stroke:2px_rgba(212,175,55,0.4)]">
                ?
              </span>
            </motion.span>
          </div>
          <p className="relative mt-2 text-center text-sm text-zinc-400">
            Identidad oculta. Se revela al cerrar la jornada con MVP oficial.
          </p>
        </div>
      </div>
    </TiltCard>
  );
}
