"use client";

import { useEffect, useRef } from "react";
import { Check, Mars, Users, Venus } from "lucide-react";
import { CourtMark } from "@/components/public/sport-courts";
import { cn } from "@/lib/utils";

const GRASS =
  "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 16px, rgba(0,0,0,0.06) 16px 32px), linear-gradient(170deg, #2f8f3e 0%, #1f6b2c 100%)";

/**
 * Each sport's real venue: `surface` is the floor around the field, `court` paints the area inside the lines.
 * `from`/`to` stay as the accent pair for shadows, the check badge and the standings banner.
 */
const THEMES: { match: string[]; from: string; to: string; surface: string; court?: string; line: string }[] = [
  {
    match: ["futsal", "sala"],
    from: "#0b4f8a",
    to: "#2b86cf",
    surface: "linear-gradient(165deg, #c2410c 0%, #9a3412 100%)",
    court: "#2477c2",
    line: "rgba(255,255,255,0.92)",
  },
  {
    match: ["balonc", "basket"],
    from: "#8a4b1c",
    to: "#d9964f",
    surface:
      "repeating-linear-gradient(90deg, rgba(60,30,8,0.16) 0 1px, transparent 1px 14px), repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 9px), linear-gradient(165deg, #dca064 0%, #c27f40 55%, #a8662d 100%)",
    line: "rgba(255,255,255,0.92)",
  },
  {
    match: ["playa", "beach"],
    from: "#a87a3a",
    to: "#ecd09a",
    surface:
      "radial-gradient(rgba(120,82,34,0.22) 0.8px, transparent 1.3px) 0 0 / 5px 5px, radial-gradient(rgba(255,255,255,0.35) 0.8px, transparent 1.3px) 2px 3px / 7px 7px, linear-gradient(165deg, #efd49e 0%, #dcb676 60%, #c99d5c 100%)",
    line: "rgba(29,78,216,0.85)",
  },
  {
    match: ["voleib", "voley"],
    from: "#a5461a",
    to: "#ee8a4a",
    surface: "linear-gradient(165deg, #2457a0 0%, #173d70 100%)",
    court: "#e3773a",
    line: "rgba(255,255,255,0.95)",
  },
  {
    match: ["mesa", "ping"],
    from: "#123766",
    to: "#2a5c9e",
    surface: "linear-gradient(165deg, #3f3f46 0%, #18181b 100%)",
    court: "#1f4f8c",
    line: "rgba(255,255,255,0.95)",
  },
  {
    match: ["tenis", "tennis"],
    from: "#1f4e8c",
    to: "#3f7cc8",
    surface: "linear-gradient(165deg, #3f8a4a 0%, #2a6233 100%)",
    court: "#2f63aa",
    line: "rgba(255,255,255,0.95)",
  },
  {
    match: ["rugby"],
    from: "#1d5e2a",
    to: "#3aa04c",
    surface:
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 22px, rgba(0,0,0,0.07) 22px 44px), linear-gradient(170deg, #36993f 0%, #22702c 100%)",
    line: "rgba(255,255,255,0.9)",
  },
  {
    match: ["ajedrez", "chess"],
    from: "#3b2416",
    to: "#8b5a2b",
    surface:
      "linear-gradient(rgba(20,12,6,0.35), rgba(20,12,6,0.35)), conic-gradient(#f0d9b5 25%, #b58863 0 50%, #f0d9b5 0 75%, #b58863 0) 0 0 / 18px 18px",
    line: "transparent",
  },
  { match: ["fútbol", "futbol"], from: "#14532d", to: "#2f8f3e", surface: GRASS, line: "rgba(255,255,255,0.9)" },
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
        const theme = all
          ? {
              from: "#7f0a1f",
              to: "#e8193c",
              surface: "linear-gradient(160deg, #7f0a1f 0%, #e8193c 100%)",
              line: "",
              court: undefined,
            }
          : sportTheme(sport.name);
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
              active ? "-translate-y-1" : "scale-[0.93] opacity-85 saturate-[0.6]",
            )}
            style={{
              background: theme.surface,
              boxShadow: active ? `0 20px 40px -18px ${theme.from}, 0 0 0 3px #fff, 0 0 0 5px ${theme.from}` : undefined,
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_40%)]"
            />
            {all ? (
              <span aria-hidden className="absolute inset-x-4 top-11 -z-10 grid grid-cols-3 gap-1.5 opacity-55">
                {THEMES.map((t) => (
                  <span key={t.from} className="aspect-square rounded-md" style={{ background: t.court ?? t.surface }} />
                ))}
              </span>
            ) : (
              <span aria-hidden className="absolute inset-0 -z-10" style={{ color: theme.line }}>
                <CourtMark
                  sport={sport.name}
                  court={theme.court}
                  className="absolute inset-x-3 top-1/2 w-[calc(100%-1.5rem)] -translate-y-[40%] drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
                />
              </span>
            )}
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-[linear-gradient(to_top,rgba(0,0,0,0.45),transparent)]"
            />
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
