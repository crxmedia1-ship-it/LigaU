"use client";

import Link from "next/link";
import { LigaULogo } from "@/components/public/brand";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, MapPin } from "lucide-react";
import { CountUp, Segmented } from "@/components/public/app-motion";
import { Crest, dayKey, dayParts, hasScore, kickoff } from "@/components/public/match-ui";
import { CourtMark } from "@/components/public/sport-courts";
import { GenderSwitch, SelectionTitle, SportPicker, type GenderValue } from "@/components/public/sport-picker";
import { PresentedBy, SponsorFlyer, SponsorMark } from "@/components/public/sponsor-slots";
import type { MatchCard, SponsorCard, SportCard } from "@/lib/public/types";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "upcoming" | "results";

const STATUS_MATCH: Record<StatusFilter, (m: MatchCard) => boolean> = {
  all: () => true,
  upcoming: (m) => m.status === "scheduled" || m.status === "live",
  results: (m) => m.status === "finished",
};

/** Mascot colors, same family as the home match tile, so each side of the clash reads as that club. */
const TEAM_TONES: Record<string, string> = {
  UAH: "#472812",
  UCAB: "#00293f",
  UCV: "#5c0606",
  UMA: "#114a04",
  UNE: "#014450",
  UNIMET: "#3d2406",
  USB: "#4a3307",
  USM: "#0a1145",
};

function teamTone(short: string) {
  return TEAM_TONES[short.toUpperCase()] ?? "#18181b";
}

function ClashSide({
  short,
  logo,
  dim,
}: {
  short: string;
  logo: string | null;
  dim: boolean;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col items-center gap-1.5", dim && "opacity-40")}>
      <Crest
        label={short}
        logo={logo}
        size="poster"
        className="shadow-[0_14px_28px_-14px_rgba(0,0,0,0.75)] ring-2 ring-white/85"
      />
      <span className="font-jersey max-w-full truncate text-[2.35rem] leading-none tracking-wide uppercase md:text-5xl">
        {short}
      </span>
    </div>
  );
}

function MatchRow({ match }: { match: MatchCard }) {
  const { clock, period } = kickoff(match.matchDate);
  const scored = hasScore(match);
  const homeWins = scored && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWins = scored && (match.awayScore ?? 0) > (match.homeScore ?? 0);
  const closed = match.status === "finished" || match.status === "postponed" || match.status === "cancelled";
  const statusLabel =
    match.status === "finished" ? "Final" : match.status === "postponed" ? "Aplazado" : match.status === "cancelled" ? "Cancelado" : null;

  return (
    <Link
      href={`/partidos/${match.id}`}
      className="group relative isolate block overflow-hidden rounded-[1.75rem] text-white shadow-[0_22px_44px_-26px_rgba(9,9,11,0.65)] ring-1 ring-black/20 transition-transform duration-200 active:scale-[0.985] md:hover:-translate-y-0.5"
    >
      <div aria-hidden className="absolute inset-0" style={{ backgroundColor: teamTone(match.homeShort) }} />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: teamTone(match.awayShort), clipPath: "polygon(58% 0, 100% 0, 100% 100%, 42% 100%)" }}
      />
      <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <line x1="58" y1="0" x2="42" y2="100" stroke="white" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.28)_100%)]" />

      <div className="relative flex items-center justify-between gap-3 px-4 pt-3.5">
        <p className="min-w-0 truncate text-[10px] font-bold tracking-[0.18em] text-white/75 uppercase">
          {match.roundName ?? "Jornada"}
        </p>
        <p className="max-w-[48%] truncate text-right text-[10px] font-bold tracking-[0.16em] text-white/75 uppercase">
          {match.sportName}
        </p>
      </div>

      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-1 px-3 pt-2 pb-4">
        <ClashSide short={match.homeShort} logo={match.homeLogoUrl} dim={awayWins} />
        {scored ? (
          <p className="relative z-10 flex items-center gap-1 rounded-2xl bg-black/45 px-2.5 py-1.5 font-jersey text-[3.25rem] leading-none tabular-nums ring-1 ring-white/30 backdrop-blur-md md:text-7xl">
            <span>{match.homeScore}</span>
            <span className="text-[1.35rem] text-white/55 md:text-3xl">–</span>
            <span>{match.awayScore}</span>
          </p>
        ) : (
          <span className="relative z-10 -rotate-[12deg]">
            <span aria-hidden className="absolute inset-0 translate-x-1 translate-y-1 -skew-x-12 bg-zinc-950/80" />
            <span className="relative block -skew-x-12 bg-white px-2.5 py-1 shadow-[0_0_24px_rgba(255,255,255,0.35)]">
              <span className="font-jersey block skew-x-12 text-[1.65rem] leading-none tracking-wide text-zinc-950 italic md:text-3xl">
                VS
              </span>
            </span>
          </span>
        )}
        <ClashSide short={match.awayShort} logo={match.awayLogoUrl} dim={homeWins} />
      </div>

      <div className="relative flex items-center justify-between gap-3 border-t border-white/15 bg-black/30 px-4 py-3">
        <p className="flex shrink-0 items-baseline gap-2 leading-none">
          {statusLabel ? (
            <span className="text-[11px] font-bold tracking-[0.18em] text-white/70 uppercase">{statusLabel}</span>
          ) : null}
          {scored ? null : match.status === "finished" ? (
            <span className="text-[11px] font-semibold tracking-[0.14em] text-white/55 uppercase">Sin marcador</span>
          ) : (
            <span className={cn("font-jersey tabular-nums", closed ? "text-xl text-white/80" : "text-[2rem]")}>
              {clock}
              <span className={cn("ml-1", closed ? "text-xs text-white/50" : "text-sm text-white/60")}>{period}</span>
            </span>
          )}
        </p>
        <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-medium text-white/80">
          {match.location ? (
            <>
              <MapPin className="size-3.5 shrink-0 text-[#ff8fa3]" strokeWidth={2.25} />
              <span className="truncate">{match.location}</span>
            </>
          ) : (
            <span className="text-white/50">Sede por confirmar</span>
          )}
          <ChevronRight className="size-4 shrink-0 text-white/50 transition-transform group-hover:translate-x-0.5" />
        </p>
      </div>
    </Link>
  );
}

export function CalendarView({
  matches,
  sports,
  presenter,
  daySponsor,
  feedSponsor,
}: {
  /** Sorted by kickoff, oldest first. */
  matches: MatchCard[];
  sports: SportCard[];
  presenter?: SponsorCard;
  /** Presents the first matchday on screen. */
  daySponsor?: SponsorCard;
  /** Official sponsor flyer. Not a U Pass brand unless that brand also bought a sponsorship. */
  feedSponsor?: SponsorCard;
}) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sportId, setSportId] = useState("all");
  const [gender, setGender] = useState<GenderValue>("all");
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const dayRefs = useRef(new Map<string, HTMLElement>());

  const filtered = useMemo(
    () =>
      matches.filter(
        (m) =>
          STATUS_MATCH[status](m) &&
          (sportId === "all" || m.sportId === sportId) &&
          (gender === "all" || m.gender === gender),
      ),
    [gender, matches, sportId, status],
  );
  const days = useMemo(() => {
    const groups = new Map<string, MatchCard[]>();
    for (const match of filtered) {
      const key = dayKey(match.matchDate);
      groups.set(key, [...(groups.get(key) ?? []), match]);
    }
    return [...groups.entries()];
  }, [filtered]);

  const inGender = matches.filter((m) => gender === "all" || m.gender === gender);
  const pickerSports = sports.map((sport) => ({
    id: sport.id,
    name: sport.name,
    count: inGender.filter((m) => m.sportId === sport.id).length,
    rank: matches.filter((m) => m.sportId === sport.id).length,
  }));
  const inSport = matches.filter((m) => sportId === "all" || m.sportId === sportId);
  const genders = [...new Set(inSport.map((m) => m.gender).filter(Boolean))] as GenderValue[];
  const selectedSport = sports.find((sport) => sport.id === sportId);
  const genderSuffix = { all: undefined, male: "Masculino", female: "Femenino", mixed: "Mixto" }[gender];

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const nodes = [...dayRefs.current.values()].sort((a, b) => a.offsetTop - b.offsetTop);
      if (!nodes.length) return;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const line = window.innerHeight * 0.45;
      const current = atBottom ? nodes.at(-1) : nodes.filter((node) => node.getBoundingClientRect().top <= line).at(-1);
      setActiveDay((current ?? nodes[0]).dataset.day ?? null);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [days]);

  const jumpTo = (key: string) => {
    setActiveDay(key);
    dayRefs.current.get(key)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectedDay = activeDay ?? days[0]?.[0] ?? null;

  return (
    <div className="space-y-4 md:space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div className="relative">
            <Link href="/" aria-label="Liga U — inicio" className="absolute right-0 bottom-0 z-0 md:hidden">
              <LigaULogo className="h-12 w-auto [mask-image:linear-gradient(to_right,transparent,black_28%)]" />
            </Link>
            <p className="relative z-10 text-[11px] font-semibold tracking-[0.3em] text-[#C8102E] uppercase">Temporada 2026</p>
            <h1 className="font-jersey relative z-10 mt-0.5 text-[2.85rem] leading-[0.8] text-zinc-950 uppercase sm:mt-1 sm:text-8xl sm:leading-[0.82]">
              Calendario
            </h1>
          </div>
          <dl className="mt-2 flex gap-4 text-zinc-500 sm:mt-3 sm:gap-5">
            {[
              { label: "Partidos", value: matches.length },
              { label: "Por jugar", value: matches.filter(STATUS_MATCH.upcoming).length },
              { label: "Deportes", value: sports.length },
            ].map((item) => (
              <div key={item.label} className="flex items-baseline gap-1.5">
                <dd className="font-jersey text-xl leading-none text-zinc-950 sm:text-2xl">
                  <CountUp value={item.value} />
                </dd>
                <dt className="text-[11px] font-semibold tracking-[0.14em] whitespace-nowrap uppercase">{item.label}</dt>
              </div>
            ))}
          </dl>
        </div>
        {presenter ? <PresentedBy sponsor={presenter} className="hidden self-auto sm:inline-flex" /> : null}
      </header>

      <section aria-label="Filtrar por deporte y rama" className="space-y-2 md:space-y-3">
        <SportPicker
          dense
          sports={pickerSports}
          value={sportId}
          onChange={(id) => {
            setSportId(id);
            const next = matches.filter((m) => id === "all" || m.sportId === id);
            if (gender !== "all" && !next.some((m) => m.gender === gender)) setGender("all");
          }}
          allOption={{ count: inGender.length }}
          countLabel={(n) => `${n} ${n === 1 ? "partido" : "partidos"}`}
        />
        <GenderSwitch value={gender} onChange={setGender} available={genders} />
      </section>

      <div className="sticky top-[env(safe-area-inset-top,0px)] z-30 -mx-4 space-y-2 bg-[#eef1f4] px-4 py-2 md:top-14 md:mx-0 md:space-y-3 md:rounded-b-3xl md:px-0 md:py-3">
        <Segmented
          value={status}
          onChange={(id) => setStatus(id as StatusFilter)}
          options={[
            { id: "all", label: "Todos" },
            { id: "upcoming", label: "Próximos" },
            { id: "results", label: "Resultados" },
          ]}
          className="md:max-w-xl"
        />
        {days.length > 1 ? (
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
            {days.map(([key, list]) => {
              const parts = dayParts(list[0].matchDate);
              const active = key === selectedDay;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => jumpTo(key)}
                  className={cn(
                    "relative flex w-14 shrink-0 touch-manipulation flex-col items-center rounded-2xl py-1.5 md:py-2",
                    active ? "bg-zinc-950 text-white" : "bg-white text-zinc-700 ring-1 ring-zinc-200",
                  )}
                >
                  <span className="relative text-[10px] font-semibold tracking-wider uppercase opacity-70">{parts.weekday}</span>
                  <span className="font-jersey relative text-xl leading-none md:text-2xl">{parts.day}</span>
                  <span className="relative mt-1 flex gap-0.5">
                    {list.slice(0, 3).map((m) => (
                      <span key={m.id} className={cn("size-1 rounded-full", active ? "bg-[#ff8fa3]" : "bg-[#C8102E]")} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="hidden sm:block">
        <SelectionTitle
          title={selectedSport?.name ?? "Todos los deportes"}
          suffix={genderSuffix}
          meta={`${filtered.length} ${filtered.length === 1 ? "partido" : "partidos"}`}
        />
      </div>

        <div key={`${status}-${sportId}-${gender}`} className="space-y-8">
          {days.map(([key, list], index) => {
            const parts = dayParts(list[0].matchDate);
            return (
              <Fragment key={key}>
                <section
                  data-day={key}
                  ref={(node) => {
                    if (node) dayRefs.current.set(key, node);
                    else dayRefs.current.delete(key);
                  }}
                  className="scroll-mt-[calc(9.5rem+env(safe-area-inset-top,0px))] md:scroll-mt-44"
                >
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <h2 className="font-jersey text-2xl leading-none text-zinc-950 uppercase first-letter:uppercase sm:text-4xl">
                      {parts.long}
                    </h2>
                    <span className="text-[11px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
                      {list.length} {list.length === 1 ? "partido" : "partidos"}
                    </span>
                  </div>
                  {index === 0 && daySponsor ? (
                    <p className="-mt-1 mb-3 flex items-center gap-2 text-[9px] font-semibold tracking-[0.22em] text-zinc-400 uppercase">
                      Jornada presentada por
                      <SponsorMark sponsor={daySponsor} className="h-5 max-w-16" />
                    </p>
                  ) : null}
                  <ul className="grid gap-4 lg:grid-cols-2">
                    {list.map((m) => (
                      <li key={m.id}>
                        <MatchRow match={m} />
                      </li>
                    ))}
                    {index === 0 && feedSponsor ? (
                      <li>
                        <SponsorFlyer sponsor={feedSponsor} context="Calendario" />
                      </li>
                    ) : null}
                  </ul>
                </section>
              </Fragment>
            );
          })}

          {!days.length ? (
            <div className="relative isolate grid place-items-center overflow-hidden rounded-[1.75rem] bg-white px-6 py-14 text-center ring-1 ring-zinc-200/80">
              <CourtMark sport="fútbol" className="absolute inset-6 -z-10 h-[calc(100%-3rem)] w-[calc(100%-3rem)] text-zinc-900/[0.06]" />
              <p className="font-jersey text-3xl text-zinc-950 uppercase">Sin partidos aquí</p>
              <p className="mt-1 max-w-xs text-sm text-zinc-500">Prueba con otro filtro o vuelve pronto: la agenda se actualiza cada jornada.</p>
              <button
                type="button"
                onClick={() => {
                  setStatus("all");
                  setSportId("all");
                  setGender("all");
                }}
                className="mt-5 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Ver todo el calendario
              </button>
            </div>
          ) : null}
        </div>
    </div>
  );
}
