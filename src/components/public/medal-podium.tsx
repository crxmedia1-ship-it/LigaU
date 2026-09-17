"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { GlassCard, PageKicker } from "@/components/public/brand";
import { UniversityCrest } from "@/components/public/university-crest";
import { cn } from "@/lib/utils";
import type { MedalTally, UniversityCard } from "@/lib/public/types";

type PodiumSlot = {
  place: 1 | 2 | 3;
  label: string;
  href?: string;
  color: string;
  logoUrl: string | null;
  meta: string;
};

const HEIGHTS = { 2: 96, 1: 140, 3: 80 } as const;
const METAL = { 1: "#F59E0B", 2: "#E2E8F0", 3: "#B45309" } as const;

const PLACE_BLOCK = {
  1: "border-amber-400/55 bg-gradient-to-b from-amber-500/20 to-transparent shadow-[0_0_36px_rgba(245,158,11,0.28)]",
  2: "border-zinc-300/40 bg-gradient-to-b from-zinc-400/20 to-transparent shadow-[0_0_24px_rgba(226,232,240,0.16)]",
  3: "border-amber-800/55 bg-gradient-to-b from-amber-800/20 to-transparent shadow-[0_0_24px_rgba(180,83,9,0.22)]",
} as const;

function buildSlots(
  tallies: MedalTally[],
  universities: UniversityCard[],
): PodiumSlot[] {
  const ranked = tallies.slice(0, 3);
  const logoFor = (id?: string, fallback?: string | null) =>
    universities.find((item) => item.id === id)?.logoUrl ?? fallback ?? null;

  const fromRank = (row: MedalTally | undefined, place: 1 | 2 | 3): PodiumSlot =>
    row
      ? {
          place,
          label: row.universityShort,
          href: `/universidades/${row.universityId}`,
          color: row.colors.primary,
          logoUrl: logoFor(row.universityId, row.logoUrl),
          meta: row.total > 0 ? `${row.gold}O ${row.silver}P ${row.bronze}B` : "En disputa",
        }
      : {
          place,
          label: "Liga U",
          color: place === 1 ? "#BA0C2F" : "#27272a",
          logoUrl: null,
          meta: "Por definirse",
        };

  return [fromRank(ranked[1], 2), fromRank(ranked[0], 1), fromRank(ranked[2], 3)];
}

function SlotBody({
  slot,
  index,
  reduce,
}: {
  slot: PodiumSlot;
  index: number;
  reduce: boolean | null;
}) {
  return (
    <>
      <motion.div
        className="relative z-10 mb-3 overflow-visible will-change-transform"
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          delay: index * 0.18,
          ease: "easeInOut",
        }}
      >
        <UniversityCrest
          url={slot.logoUrl}
          label={slot.label}
          size={slot.place === 1 ? "champion" : "podium"}
          glow={slot.place === 1 ? "gold" : "natural"}
        />
      </motion.div>
      <motion.div
        className={cn(
          "podium-glass relative w-full origin-bottom overflow-visible rounded-t-md border will-change-transform",
          PLACE_BLOCK[slot.place],
        )}
        style={{ height: HEIGHTS[slot.place] }}
        initial={reduce ? false : { scaleY: 0, y: 48, opacity: 0 }}
        animate={{ scaleY: 1, y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 160,
          damping: 18,
          delay: 0.08 * index,
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ background: METAL[slot.place], boxShadow: `0 0 16px ${METAL[slot.place]}` }}
        />
        <div
          className="absolute inset-x-3 top-4 bottom-3 rounded-sm opacity-35"
          style={{
            background: `linear-gradient(180deg, ${METAL[slot.place]}55, ${slot.color}22)`,
          }}
        />
        <span
          className="font-jersey absolute inset-x-0 bottom-3 text-center text-3xl leading-none"
          style={{ color: METAL[slot.place] }}
        >
          {slot.place}
        </span>
      </motion.div>
      <span className="mt-2 text-sm font-semibold tracking-wide">{slot.label}</span>
      <p className="mt-1 text-xs text-[#D4AF37]">{slot.meta}</p>
    </>
  );
}

export function LivePodium({
  tallies,
  universities,
}: {
  tallies: MedalTally[];
  universities: UniversityCard[];
}) {
  const reduce = useReducedMotion();
  const slots = buildSlots(tallies, universities);
  const ranked = [...slots].sort((a, b) => a.place - b.place);

  return (
    <GlassCard className="glass-card-uncut overflow-visible rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4 md:p-6">
      <PageKicker>Medallero institucional</PageKicker>
      <h2 className="mt-2 text-2xl font-semibold">Podio general en vivo</h2>

      <div className="mt-4 flex flex-col gap-3 md:hidden">
        {ranked.map((slot) => {
          const className = cn(
            "flex min-h-11 items-center gap-3 overflow-visible rounded-2xl border bg-zinc-950/80 p-4",
            PLACE_BLOCK[slot.place],
          );
          const body = (
            <>
              <span
                className="font-jersey w-7 shrink-0 text-2xl leading-none"
                style={{ color: METAL[slot.place] }}
              >
                {slot.place}
              </span>
              <UniversityCrest
                url={slot.logoUrl}
                label={slot.label}
                size="md"
                glow={slot.place === 1 ? "gold" : "natural"}
              />
              <div className="min-w-0">
                <p className="font-semibold tracking-wide">{slot.label}</p>
                <p className="text-xs text-zinc-400">{slot.meta}</p>
              </div>
            </>
          );
          return slot.href ? (
            <Link key={`${slot.place}-${slot.label}`} href={slot.href} className={className}>
              {body}
            </Link>
          ) : (
            <div key={`${slot.place}-${slot.label}`} className={className}>
              {body}
            </div>
          );
        })}
      </div>

      <div className="relative mt-14 hidden grid-cols-3 items-end gap-2 overflow-visible sm:gap-4 md:grid">
        <div className="pointer-events-none absolute inset-x-6 bottom-10 h-24 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.4),transparent_70%)] blur-xl" />
        {slots.map((slot, index) => {
          const className = "relative flex flex-col items-center overflow-visible";
          return slot.href ? (
            <Link key={`${slot.place}-${slot.label}`} href={slot.href} className={className}>
              <SlotBody slot={slot} index={index} reduce={reduce} />
            </Link>
          ) : (
            <div key={`${slot.place}-${slot.label}`} className={className}>
              <SlotBody slot={slot} index={index} reduce={reduce} />
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

export const MedalPodium = LivePodium;
