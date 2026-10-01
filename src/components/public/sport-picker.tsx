"use client";

import { useEffect, useRef } from "react";
import { Check, Mars, Users, Venus } from "lucide-react";
import { CourtMark } from "@/components/public/sport-courts";
import { cn } from "@/lib/utils";

/** Surface colour of each sport's playing area, so every tile reads as its own venue. */
const THEMES: { match: string[]; from: string; to: string }[] = [
  { match: ["futsal", "sala"], from: "#0369a1", to: "#0ea5e9" },
  { match: ["balonc", "basket"], from: "#9a3412", to: "#ea8a2c" },
  { match: ["playa", "beach"], from: "#b7791f", to: "#e9c46a" },
  { match: ["voleib", "voley"], from: "#9f1239", to: "#f43f5e" },
  { match: ["mesa", "ping"], from: "#115e59", to: "#14b8a6" },
  { match: ["tenis", "tennis"], from: "#3730a3", to: "#6d6af0" },
  { match: ["rugby"], from: "#3f6212", to: "#84cc16" },
  { match: ["ajedrez", "chess"], from: "#18181b", to: "#52525b" },
  { match: ["fútbol", "futbol"], from: "#14532d", to: "#22a355" },
];

export function sportTheme(name: string) {
  const key = name.toLowerCase();
  return THEMES.find((t) => t.match.some((m) => key.includes(m))) ?? THEMES[THEMES.length - 1];
}

export type PickerSport = {
  id: string;
  name: string;
  count: number;
  /** Stable sort weight, so tiles don't reshuffle when the count changes with a filter. */
  rank?: number;
};

export function SportPicker({
  sports,
  value,
  onChange,
  countLabel,
  allOption,
}: {
  sports: PickerSport[];
  value: string;
  onChange: (id: string) => void;
  countLabel: (count: number) => string;
  /** Adds a leading "Todos" tile with this total. */
  allOption?: { count: number };
}) {
  const rail = useRef<HTMLDivElement>(null);
  const tiles = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    const box = rail.current;
    const tile = tiles.current.get(value);
    if (!box || !tile || box.scrollWidth <= box.clientWidth) return;
    box.scrollTo({ left: tile.offsetLeft - (box.clientWidth - tile.clientWidth) / 2, behavior: "smooth" });
  }, [value]);

  const items = [
    ...(allOption ? [{ id: "all", name: "Todos", count: allOption.count }] : []),
    ...sports.toSorted((a, b) => (b.rank ?? b.count) - (a.rank ?? a.count) || a.name.localeCompare(b.name)),
  ];

  return (
    <div
      ref={rail}
      role="tablist"
      aria-label="Deporte"
      className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-3 md:mx-0 md:px-1 lg:grid lg:grid-cols-5 lg:overflow-visible xl:auto-cols-fr xl:grid-flow-col xl:grid-cols-none"
    >
      {items.map((sport) => {
        const active = sport.id === value;
        const all = sport.id === "all";
        const theme = all ? { from: "#7f0a1f", to: "#e8193c" } : sportTheme(sport.name);
        return (
          <button
            key={sport.id}
            ref={(node) => {
              if (node) tiles.current.set(sport.id, node);
              else tiles.current.delete(sport.id);
            }}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(sport.id)}
            className={cn(
              "relative isolate flex h-44 w-36 shrink-0 touch-manipulation snap-center flex-col justify-between overflow-hidden rounded-[1.6rem] p-3 text-left text-white active:scale-95 lg:w-auto",
              active ? "-translate-y-1" : "scale-[0.93] opacity-80 saturate-[0.4]",
            )}
            style={{
              background: `linear-gradient(160deg, ${theme.from} 0%, ${theme.to} 100%)`,
              boxShadow: active ? `0 20px 40px -18px ${theme.from}, 0 0 0 3px #fff, 0 0 0 5px ${theme.from}` : undefined,
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_45%)]"
            />
            {all ? (
              <span aria-hidden className="absolute inset-x-4 top-11 -z-10 grid grid-cols-3 gap-1.5 opacity-40">
                {THEMES.map((t) => (
                  <span key={t.from} className="aspect-square rounded-md" style={{ background: t.to }} />
                ))}
              </span>
            ) : (
              <CourtMark
                sport={sport.name}
                className="absolute inset-x-3 top-1/2 -z-10 w-[calc(100%-1.5rem)] -translate-y-[40%] text-white/40"
              />
            )}
            <span className="flex items-start justify-between gap-1">
              <span className="rounded-full bg-black/25 px-2 py-0.5 text-[9px] font-semibold tracking-[0.12em] whitespace-nowrap uppercase backdrop-blur-sm">
                {sport.count ? countLabel(sport.count) : "Pronto"}
              </span>
              {active ? (
                <span
                  className="grid size-5 shrink-0 place-items-center rounded-full bg-white"
                  style={{ color: theme.from }}
                >
                  <Check className="size-3" strokeWidth={3.5} />
                </span>
              ) : null}
            </span>
            <span className="font-jersey text-[1.45rem] leading-[0.9] break-words uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] lg:text-[1.3rem]">
              {sport.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export type GenderValue = "all" | "male" | "female" | "mixed";

const GENDERS: { id: GenderValue; label: string; icon: typeof Mars; tint: string }[] = [
  { id: "all", label: "Todas", icon: Users, tint: "text-zinc-500" },
  { id: "male", label: "Masculino", icon: Mars, tint: "text-sky-600" },
  { id: "female", label: "Femenino", icon: Venus, tint: "text-pink-600" },
  { id: "mixed", label: "Mixto", icon: Users, tint: "text-violet-600" },
];

/** Big two-tone branch switch; branches without teams stay visible but disabled. */
export function GenderSwitch({
  value,
  onChange,
  available,
  includeAll = true,
}: {
  value: GenderValue;
  onChange: (value: GenderValue) => void;
  available: GenderValue[];
  includeAll?: boolean;
}) {
  const options = GENDERS.filter(
    (g) => (g.id === "all" ? includeAll : g.id !== "mixed" || available.includes("mixed")),
  );
  return (
    <div role="tablist" aria-label="Rama" className="grid auto-cols-fr grid-flow-col gap-1 rounded-2xl bg-white p-1.5 ring-1 ring-zinc-200/80">
      {options.map((g) => {
        const active = g.id === value;
        const enabled = g.id === "all" || available.includes(g.id);
        const Icon = g.icon;
        return (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={!enabled}
            onClick={() => onChange(g.id)}
            className={cn(
              "relative flex h-12 touch-manipulation items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-35",
              active ? "text-white" : "text-zinc-700 hover:bg-zinc-50",
            )}
          >
            {active ? (
              <span className="absolute inset-0 rounded-xl bg-zinc-950 shadow-[0_10px_24px_-12px_rgba(15,23,42,0.8)]" />
            ) : null}
            <Icon className={cn("relative size-4", active ? "text-white" : g.tint)} strokeWidth={2.5} />
            <span className="relative">{g.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Heading that slides the new selection in, like a scoreboard flip. */
export function SelectionTitle({ title, suffix, meta }: { title: string; suffix?: string; meta?: string }) {
  return (
    <div className="flex items-end justify-between gap-3 overflow-hidden">
      <h2 className="font-jersey min-w-0 text-[2rem] leading-none text-zinc-950 uppercase sm:text-5xl">
        {title} {suffix ? <span className="text-zinc-400">{suffix}</span> : null}
      </h2>
      {meta ? (
        <span className="mb-1 shrink-0 text-[11px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">{meta}</span>
      ) : null}
    </div>
  );
}
