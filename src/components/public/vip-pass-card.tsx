"use client";

import { SparklesIcon } from "lucide-react";
import { TiltCard } from "@/components/magic/tilt-card";

export function VipPassCard({
  benefitsCount,
  sponsorsCount,
}: {
  benefitsCount: number;
  sponsorsCount: number;
}) {
  return (
    <TiltCard tone="gold" className="mx-auto w-full max-w-md">
      <article className="carbon-fiber relative aspect-[1.62/1] overflow-hidden rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-5 shadow-[inset_0_1px_0_rgba(253,230,138,0.18)] backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -left-8 h-32 w-32 rounded-full bg-[#D4AF37]/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0 h-24 w-40 rounded-full bg-[#BA0C2F]/20 blur-3xl"
        />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-[#D4AF37] uppercase">
                Liga U Pass
              </p>
              <p className="mt-1 text-lg font-semibold tracking-wide text-zinc-100">
                Athletic VIP
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-md border border-amber-500/40 bg-[#BA0C2F] text-xs font-black text-white">
              U
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] tracking-[0.22em] text-zinc-400 uppercase">
                Titular
              </p>
              <p className="mt-0.5 text-sm font-medium text-zinc-100">
                Comunidad universitaria
              </p>
              <p className="mt-2 font-mono text-[11px] tracking-[0.18em] text-[#F59E0B]">
                LIGAU • CARNETX
              </p>
            </div>
            <div className="text-right">
              <SparklesIcon className="ml-auto size-4 text-[#D4AF37]" />
              <p className="mt-1 text-[10px] text-zinc-400">
                {sponsorsCount} aliados
              </p>
              <p className="text-[10px] text-[#D4AF37]">
                {benefitsCount} beneficios
              </p>
            </div>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
