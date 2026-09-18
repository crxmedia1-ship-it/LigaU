"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { GlassCard, PageKicker } from "@/components/public/brand";
import { UniversityCrest } from "@/components/public/university-crest";
import { cn } from "@/lib/utils";
import type { PodiumBoardKey, PodiumBoards } from "@/lib/public/medals";
import type { MedalTally, UniversityCard } from "@/lib/public/types";

type PodiumSlot = {
  place: 1 | 2 | 3;
  label: string;
  href?: string;
  color: string;
  logoUrl: string | null;
  universityId?: string;
  meta: string;
};

const HEIGHTS = { 2: 64, 1: 92, 3: 52 } as const;
const METAL = { 1: "#F59E0B", 2: "#E2E8F0", 3: "#B45309" } as const;
const PILLS: { key: PodiumBoardKey; label: string }[] = [
  { key: "institucional", label: "Institucional" },
  { key: "futbol", label: "Fútbol" },
  { key: "baloncesto", label: "Baloncesto" },
  { key: "voleibol", label: "Voleibol" },
];

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
          universityId: row.universityId,
          meta:
            row.total > 0
              ? `${row.gold}O ${row.silver}P ${row.bronze}B`
              : (row.points ?? 0) > 0
                ? `${row.points} pts`
                : "En disputa",
        }
      : {
          place,
          label: "—",
          color: "#27272a",
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
      {slot.universityId ? (
        <motion.div
          layoutId={`podium-crest-${slot.universityId}`}
          className="relative z-10 mb-2 overflow-visible"
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
        >
          <UniversityCrest
            url={slot.logoUrl}
            label={slot.label}
            size={slot.place === 1 ? "lg" : "md"}
            glow={slot.place === 1 ? "gold" : "natural"}
          />
        </motion.div>
      ) : (
        <div className="mb-2 h-12" />
      )}
      <motion.div
        layoutId={`podium-block-${slot.place}`}
        className={cn(
          "podium-glass relative w-full origin-bottom overflow-visible rounded-t-md border",
          PLACE_BLOCK[slot.place],
        )}
        style={{ height: HEIGHTS[slot.place] }}
        animate={reduce ? undefined : { y: [0, -4, 0] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          delay: index * 0.18,
          ease: "easeInOut",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ background: METAL[slot.place], boxShadow: `0 0 16px ${METAL[slot.place]}` }}
        />
        <span
          className="font-jersey absolute inset-x-0 bottom-2 text-center text-2xl leading-none"
          style={{ color: METAL[slot.place] }}
        >
          {slot.place}
        </span>
      </motion.div>
      {slot.universityId ? (
        <motion.span
          layoutId={`podium-label-${slot.universityId}`}
          className="mt-1.5 text-sm font-semibold tracking-wide"
        >
          {slot.label}
        </motion.span>
      ) : (
        <span className="mt-1.5 text-sm font-semibold tracking-wide text-zinc-600">—</span>
      )}
      <p className="text-[11px] text-[#D4AF37]">{slot.meta}</p>
    </>
  );
}

export function LivePodium({
  boards,
  universities,
}: {
  boards: PodiumBoards;
  universities: UniversityCard[];
}) {
  const reduce = useReducedMotion();
  const [board, setBoard] = useState<PodiumBoardKey>("institucional");
  const slots = buildSlots(boards[board], universities);
  const ranked = [...slots].sort((a, b) => a.place - b.place);
  const title =
    board === "institucional" ? "Podio general en vivo" : `Podio ${PILLS.find((item) => item.key === board)?.label}`;

  return (
    <LayoutGroup>
    <GlassCard className="glass-card-uncut flex h-full flex-col overflow-visible rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <PageKicker>Medallero</PageKicker>
          <h2 className="mt-1 text-xl font-semibold md:text-2xl">{title}</h2>
        </div>
      </div>

      <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PILLS.map((pill) => (
          <button
            key={pill.key}
            type="button"
            onClick={() => setBoard(pill.key)}
            className={cn(
              "min-h-11 shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase transition-colors",
              board === pill.key
                ? "bg-[#C8102E] text-white"
                : "bg-zinc-900 text-zinc-400 hover:text-white",
            )}
          >
            {pill.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-2 md:hidden">
        {ranked
          .filter((slot) => slot.universityId)
          .map((slot) => {
          const className = cn(
            "flex min-h-11 items-center gap-3 overflow-visible rounded-xl border bg-zinc-950/80 px-3 py-2",
            PLACE_BLOCK[slot.place],
          );
          const body = (
            <>
              <span
                className="font-jersey w-6 shrink-0 text-xl leading-none"
                style={{ color: METAL[slot.place] }}
              >
                {slot.place}
              </span>
              <UniversityCrest
                url={slot.logoUrl}
                label={slot.label}
                size="sm"
                glow={slot.place === 1 ? "gold" : "natural"}
              />
              <div className="min-w-0">
                <p className="font-semibold tracking-wide">{slot.label}</p>
                <p className="text-xs text-zinc-400">{slot.meta}</p>
              </div>
            </>
          );
          return slot.href ? (
            <Link key={slot.place} href={slot.href} className={className}>
              {body}
            </Link>
          ) : (
            <div key={slot.place} className={className}>
              {body}
            </div>
          );
        })}
      </div>

      <div className="relative mt-4 hidden min-h-0 flex-1 grid-cols-3 items-end gap-2 overflow-visible sm:gap-3 md:grid">
        <div className="pointer-events-none absolute inset-x-6 bottom-8 h-16 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.35),transparent_70%)] blur-xl" />
        {slots.map((slot, index) => {
          const className = "relative flex flex-col items-center overflow-visible";
          return slot.href ? (
            <Link key={slot.place} href={slot.href} className={className}>
              <SlotBody slot={slot} index={index} reduce={reduce} />
            </Link>
          ) : (
            <div key={slot.place} className={className}>
              <SlotBody slot={slot} index={index} reduce={reduce} />
            </div>
          );
        })}
      </div>
    </GlassCard>
    </LayoutGroup>
  );
}

export const MedalPodium = LivePodium;
