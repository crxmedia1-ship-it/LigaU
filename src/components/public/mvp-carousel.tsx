"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export type MvpSlide = {
  id: string;
  href: string;
  name: string;
  sportName: string;
  teamShort: string;
  teamLogo: string | null;
  jersey: number | null;
  position: string | null;
  photoUrl: string | null;
  stat: string;
};

const SLIDE_MS = 8000;
const FADE_MS = 2600;
const RISE = "animate-[ligau-rise_1200ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none";

/** Weekly MVP per sport, crossfading on a timer. Pauses on hover; reduced motion stays on the first slide. */
export function MvpCarousel({ slides, className }: { slides: MvpSlide[]; className?: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = slides[active] ?? slides[0];

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  return (
    <article
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn(
        "group relative isolate flex flex-col overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#fafafa,#d4d4d8)] text-zinc-950 shadow-[0_24px_50px_-24px_rgba(9,9,11,0.45)] ring-1 ring-amber-500/35 ring-inset",
        className,
      )}
    >
      {slides.map((item, index) => (
        <div
          key={item.id}
          aria-hidden={index !== active}
          style={{
            transition: `opacity ${FADE_MS}ms cubic-bezier(0.65,0,0.35,1), filter ${FADE_MS}ms cubic-bezier(0.65,0,0.35,1), transform ${SLIDE_MS + FADE_MS}ms cubic-bezier(0.25,0.1,0.25,1)`,
          }}
          className={cn(
            "absolute inset-0 -z-10 origin-top motion-reduce:transition-none",
            index === active
              ? "scale-105 opacity-100 blur-0"
              : "scale-100 opacity-0 blur-[10px]",
          )}
        >
          {item.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.photoUrl} alt="" className="size-full object-cover object-top" />
          ) : null}
        </div>
      ))}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_50%_32%,rgba(251,191,36,0.38),rgba(251,191,36,0.12)_45%,transparent_72%)] mix-blend-multiply"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_12%,rgba(253,230,138,0.55),transparent_32%)] mix-blend-screen"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#e4e4e7_0%,rgba(228,228,231,0.95)_38%,rgba(228,228,231,0)_60%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_115%,rgba(245,158,11,0.22),transparent_55%)]"
      />
      <div aria-hidden className="absolute inset-1.5 -z-10 rounded-xl border border-amber-500/25" />

      <div className="flex flex-1 flex-col p-4">
        <div key={slide.id} className="mt-auto">
          <div className={cn("flex items-center gap-2", RISE, "[animation-delay:700ms]")}>
            {slide.teamLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slide.teamLogo} alt="" className="size-8 object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.25)]" />
            ) : null}
            <span className="text-[10px] font-black tracking-[0.16em] text-zinc-600 uppercase">
              {[slide.teamShort, slide.position, slide.jersey !== null ? `#${slide.jersey}` : null]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
          <h2 className={cn("font-jersey mt-1.5 text-4xl leading-[0.9] uppercase", RISE, "[animation-delay:900ms]")}>
            {slide.name}
          </h2>
          <p
            className={cn(
              "mt-1 text-xs font-black tracking-wide text-amber-700 uppercase",
              RISE,
              "[animation-delay:1100ms]",
            )}
          >
            {slide.stat}
          </p>
        </div>

        <div className="mt-3 flex h-14 shrink-0 items-end justify-between gap-2 border-t border-zinc-950/10">
          <div className="flex min-h-11 min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 text-zinc-950 shadow-[0_4px_14px_-2px_rgba(217,119,6,0.55)] ring-1 ring-amber-100/70 ring-inset">
              <Trophy className="size-4" strokeWidth={2.25} />
            </span>
            <p className="flex min-w-0 flex-col gap-1">
              <span className="text-[9px] leading-none font-bold tracking-[0.22em] text-amber-700 uppercase">
                MVP de la semana
              </span>
              <span
                key={slide.id}
                className={cn("font-jersey truncate text-lg leading-none tracking-wide uppercase", RISE)}
              >
                {slide.sportName}
              </span>
            </p>
          </div>
          <Link
            href={slide.href}
            className="inline-flex min-h-11 items-center gap-1 text-xs font-black tracking-wide uppercase"
          >
            Ver perfil
            <ArrowUpRight className="size-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </article>
  );
}
