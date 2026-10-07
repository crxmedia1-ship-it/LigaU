"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SafeLogo } from "@/components/public/safe-logo";
import type { UniversityCard } from "@/lib/public/types";
import { MASCOT_OUTLINE, paletteBackground, universityPalette as paletteOf } from "@/lib/public/university-palette";
import { cn } from "@/lib/utils";

export type UniversityPick = UniversityCard & { sports: number; teams: number; athletes: number };

/** FIFA-style team select: one university at a time on its own colors, swipe or use the arrows/crests to change. */
export function UniversitySelector({ universities }: { universities: UniversityPick[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const center = node.scrollLeft + node.clientWidth / 2;
        let best = 0;
        let distance = Infinity;
        Array.from(node.children).forEach((child, index) => {
          const card = child as HTMLElement;
          const gap = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
          if (gap < distance) {
            distance = gap;
            best = index;
          }
        });
        setActive(best);
      });
    };
    onScroll();
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const node = strip.current;
    const tab = node?.children[active] as HTMLElement | undefined;
    if (!node || !tab) return;
    node.scrollTo({ left: tab.offsetLeft + tab.offsetWidth / 2 - node.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  const go = (index: number) => {
    const node = rail.current;
    const card = node?.children[Math.max(0, Math.min(universities.length - 1, index))] as HTMLElement | undefined;
    if (!node || !card) return;
    node.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - node.clientWidth / 2, behavior: "smooth" });
  };

  const current = universities[active];

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Elige una universidad"
      className="max-md:flex max-md:h-[min(calc(100svh-4.25rem-5rem-env(safe-area-inset-bottom,0px)-1.5rem),calc(88vw*1.55+11rem))] sm:max-md:h-[min(calc(100svh-4.25rem-5rem-env(safe-area-inset-bottom,0px)-1.5rem),calc(72vw*1.35+11rem))] max-md:min-h-[34rem] max-md:flex-col"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(active + 1);
        if (event.key === "ArrowLeft") go(active - 1);
      }}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black tracking-[0.24em] text-brand-red uppercase">Temporada 2026</p>
          <h1 className="font-jersey mt-1 text-4xl leading-[0.85] text-zinc-950 uppercase sm:text-5xl md:text-7xl">Elige tu universidad</h1>
        </div>
        <p className="font-jersey shrink-0 text-2xl leading-none text-zinc-300 tabular-nums md:text-4xl">
          <span className="text-zinc-950">{String(active + 1).padStart(2, "0")}</span>/{String(universities.length).padStart(2, "0")}
        </p>
      </div>

      <div className="relative -mx-4 mt-3 md:mt-8 max-md:min-h-0 max-md:flex-1">
        <div
          ref={rail}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[6vw] pt-2 pb-4 [scrollbar-width:none] max-md:h-full sm:px-[14vw] md:gap-5 md:px-[20vw] md:pb-6 lg:px-[max(1rem,calc(50%-19rem))] [&::-webkit-scrollbar]:hidden"
        >
          {universities.map((university, index) => (
            <TeamCard key={university.id} university={university} active={index === active} />
          ))}
        </div>

        <button
          type="button"
          aria-label="Universidad anterior"
          onClick={() => go(active - 1)}
          disabled={active === 0}
          className="absolute top-1/2 left-4 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-900 shadow-lg ring-1 ring-zinc-200 backdrop-blur transition hover:scale-105 disabled:opacity-0 md:grid"
        >
          <ChevronLeft className="size-6" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          aria-label="Universidad siguiente"
          onClick={() => go(active + 1)}
          disabled={active === universities.length - 1}
          className="absolute top-1/2 right-4 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-900 shadow-lg ring-1 ring-zinc-200 backdrop-blur transition hover:scale-105 disabled:opacity-0 md:grid"
        >
          <ChevronRight className="size-6" strokeWidth={2.5} />
        </button>
      </div>

      <div
        ref={strip}
        role="tablist"
        aria-label="Universidades"
        className="relative -mx-4 flex gap-2 overflow-x-auto px-4 pt-2 pb-3 [scrollbar-width:none] md:justify-center [&::-webkit-scrollbar]:hidden"
      >
        {universities.map((university, index) => {
          const selected = index === active;
          const palette = paletteOf(university);
          return (
            <button
              key={university.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={university.name}
              onClick={() => go(index)}
              className={cn(
                "grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl p-1.5 transition-all duration-300",
                selected
                  ? "-translate-y-1 shadow-[0_12px_24px_-10px_var(--glow)] ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-white"
                  : "brightness-[0.6] saturate-[0.85] hover:brightness-100 hover:saturate-100",
              )}
              style={
                {
                  "--glow": palette.glow,
                  "--accent": palette.accent,
                  background: `radial-gradient(circle at 50% 40%, ${palette.glow}, ${palette.base} 75%)`,
                } as React.CSSProperties
              }
            >
              <SafeLogo url={university.mascotUrl ?? university.crestUrl} label={university.shortName} className="size-full" />
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {current ? `${current.name} seleccionada` : null}
      </p>
    </section>
  );
}

function TeamCard({ university, active }: { university: UniversityPick; active: boolean }) {
  const palette = paletteOf(university);
  const stats = [
    { label: "Deportes", value: university.sports },
    { label: "Equipos", value: university.teams },
    { label: "Atletas", value: university.athletes },
  ];

  return (
    <Link
      href={`/universidades/${university.id}`}
      aria-label={`Ver la plantilla de ${university.name}`}
      tabIndex={active ? 0 : -1}
      className={cn(
        "group relative isolate flex h-full w-[88vw] max-w-[38rem] shrink-0 snap-center flex-col overflow-hidden rounded-[2rem] text-white transition-all duration-500 ease-out sm:w-[72vw] md:aspect-[16/11] md:h-auto md:w-[60vw] lg:w-[38rem]",
        active
          ? "scale-100 opacity-100 shadow-[0_40px_70px_-35px_var(--glow)]"
          : "scale-[0.88] brightness-[0.55] saturate-[0.85]",
      )}
      style={
        {
          "--glow": palette.glow,
          "--accent": palette.accent,
          background: paletteBackground(palette),
        } as React.CSSProperties
      }
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10 opacity-50 [background-image:repeating-linear-gradient(115deg,rgba(255,255,255,0.06)_0_2px,transparent_2px_22px)]"
      />
      <span
        aria-hidden
        className="absolute top-[-10%] left-[58%] -z-10 h-[130%] w-[18%] rotate-[18deg] opacity-25"
        style={{ background: `linear-gradient(to bottom, transparent, ${palette.accent}, transparent)` }}
      />
      <span
        aria-hidden
        className="absolute top-[-10%] left-[78%] -z-10 h-[130%] w-[3%] rotate-[18deg] opacity-40"
        style={{ background: `linear-gradient(to bottom, transparent, ${palette.accent}, transparent)` }}
      />
      <span
        aria-hidden
        className="font-jersey absolute top-[8%] -right-[6%] -z-10 text-[9rem] leading-none text-transparent opacity-30 select-none [-webkit-text-stroke:2px_var(--accent)] md:text-[12rem]"
      >
        {university.shortName}
      </span>

      <span className="flex items-center gap-2 p-5 md:p-7">
        <span className="h-1 w-8 rounded-full" style={{ background: palette.accent }} />
        <span className="text-[10px] font-black tracking-[0.24em] text-white/75 uppercase">Liga U · 2026</span>
      </span>

      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-[10%] bottom-[41%] -z-10 grid place-items-center transition-transform duration-700 ease-out",
          active ? "translate-y-0 scale-100" : "translate-y-6 scale-90",
        )}
      >
        <SafeLogo
          url={university.mascotUrl ?? university.crestUrl}
          label={university.shortName}
          className={cn(
            "size-full drop-shadow-[0_24px_30px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105",
            palette.outline && MASCOT_OUTLINE,
          )}
        />
      </span>

      <span
        className="mt-auto px-5 pt-16 pb-5 md:px-7 md:pb-7"
        style={{ background: `linear-gradient(to top, ${palette.base} 15%, color-mix(in srgb, ${palette.base} 70%, transparent) 55%, transparent)` }}
      >
        <span className="font-jersey block text-6xl leading-[0.85] uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] md:text-7xl">
          {university.shortName}
        </span>
        <span className="mt-3 flex max-w-full -skew-x-12 items-center gap-2.5 rounded-md bg-white py-1.5 pr-3.5 pl-2 text-zinc-900 shadow-lg md:w-fit">
          <span className="w-1 self-stretch rounded-full" style={{ background: palette.accent }} />
          {university.crestUrl ? (
            <SafeLogo
              url={university.crestUrl}
              label={university.shortName}
              fallback={false}
              className="h-7 w-auto max-w-16 shrink-0 skew-x-12"
            />
          ) : null}
          <span className="skew-x-12 truncate text-xs font-bold">{university.name}</span>
        </span>

        <span className="mt-4 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
          {university.teams ? (
            <span className="flex gap-5">
              {stats.map((stat) => (
                <span key={stat.label}>
                  <span className="font-jersey block text-3xl leading-none tabular-nums">{stat.value}</span>
                  <span className="text-[9px] font-black tracking-[0.18em] text-white/65 uppercase">{stat.label}</span>
                </span>
              ))}
            </span>
          ) : (
            <span className="text-[10px] font-black tracking-[0.2em] text-white/70 uppercase">Plantilla por anunciar</span>
          )}
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-black tracking-wide text-zinc-950 uppercase shadow-lg transition-transform group-hover:translate-x-0.5">
            Plantilla
            <ArrowRight className="size-4" strokeWidth={2.75} />
          </span>
        </span>
      </span>
    </Link>
  );
}

