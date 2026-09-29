"use client";

import Link from "next/link";
import { Fragment, ViewTransition, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, MapPin } from "lucide-react";
import { CountUp, Segmented } from "@/components/public/app-motion";
import { Crest, dayKey, dayParts, hasScore, kickoff } from "@/components/public/match-ui";
import { CourtMark } from "@/components/public/sport-courts";
import { GenderSwitch, SelectionTitle, SportPicker, type GenderValue } from "@/components/public/sport-picker";
import { PresentedBy, SponsorMark, SponsorOffer } from "@/components/public/sponsor-slots";
import type { MatchCard, SponsorCard, SportCard } from "@/lib/public/types";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "upcoming" | "results";

const STATUS_MATCH: Record<StatusFilter, (m: MatchCard) => boolean> = {
  all: () => true,
  upcoming: (m) => m.status === "scheduled" || m.status === "live",
  results: (m) => m.status === "finished",
};

function CrestMorph({ match, side, size }: { match: MatchCard; side: "home" | "away"; size: "sm" | "md" }) {
  const home = side === "home";
  return (
    <ViewTransition name={`crest-${match.id}-${side}`} share="morph" default="none">
      <Crest label={home ? match.homeShort : match.awayShort} logo={home ? match.homeLogoUrl : match.awayLogoUrl} size={size} />
    </ViewTransition>
  );
}

function MatchRow({ match }: { match: MatchCard }) {
  const { clock, period } = kickoff(match.matchDate);
  const scored = hasScore(match);
  const homeWins = scored && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWins = scored && (match.awayScore ?? 0) > (match.homeScore ?? 0);
  const side = (s: "home" | "away") => {
    const home = s === "home";
    const dim = match.status === "finished" && (home ? awayWins : homeWins);
    return (
      <div className={cn("flex items-center gap-2.5", dim && "opacity-45")}>
        <CrestMorph match={match} side={s} size="sm" />
        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-zinc-900">
          {home ? match.homeShort : match.awayShort}
        </span>
        {scored ? (
          <span className="font-jersey text-xl leading-none text-zinc-950 tabular-nums">
            {(home ? match.homeScore : match.awayScore) ?? 0}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <Link
      href={`/partidos/${match.id}`}
      className="group grid grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-[1.4rem] bg-white px-4 py-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.6)] ring-1 ring-zinc-200/80 transition-transform duration-200 active:scale-[0.985]"
    >
      <div className="text-center">
        {match.status === "finished" ? (
          <p className="text-[11px] font-bold tracking-wider text-zinc-400">FINAL</p>
        ) : (
          <p className="font-jersey text-2xl leading-none text-zinc-950 tabular-nums">
            {clock}
            <span className="ml-0.5 text-[10px] text-zinc-400">{period}</span>
          </p>
        )}
        <p className="mt-1 line-clamp-2 text-[9px] leading-tight font-semibold tracking-wide text-zinc-400 uppercase">
          {match.roundName ?? "Jornada"}
        </p>
      </div>
      <div className="min-w-0 space-y-2.5 border-l border-zinc-100 pl-3">
        {side("home")}
        {side("away")}
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="max-w-24 truncate rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-semibold text-zinc-600">
          {match.sportName}
        </span>
        <ChevronRight className="size-4 text-zinc-300 transition-transform group-hover:translate-x-0.5" />
      </div>
      {match.location ? (
        <p className="col-span-3 -mt-1 flex items-center gap-1.5 border-t border-zinc-100 pt-2.5 text-[12px] text-zinc-500">
          <MapPin className="size-3 shrink-0 text-[#C8102E]" strokeWidth={2.25} />
          <span className="truncate">{match.location}</span>
        </p>
      ) : null}
    </Link>
  );
}

export function CalendarView({
  matches,
  sports,
  presenter,
  daySponsor,
  feedSponsor,
  feedOffer,
}: {
  /** Sorted by kickoff, oldest first. */
  matches: MatchCard[];
  sports: SportCard[];
  presenter?: SponsorCard;
  /** Presents the first matchday on screen. */
  daySponsor?: SponsorCard;
  feedSponsor?: SponsorCard;
  feedOffer?: string;
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
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.3em] text-[#C8102E] uppercase">Temporada 2026</p>
          <h1 className="font-jersey mt-1 text-[4.25rem] leading-[0.82] text-zinc-950 uppercase sm:text-8xl">Calendario</h1>
          <dl className="mt-3 flex gap-5 text-zinc-500">
            {[
              { label: "Partidos", value: matches.length },
              { label: "Por jugar", value: matches.filter(STATUS_MATCH.upcoming).length },
              { label: "Deportes", value: sports.length },
            ].map((item) => (
              <div key={item.label} className="flex items-baseline gap-1.5">
                <dd className="font-jersey text-2xl leading-none text-zinc-950">
                  <CountUp value={item.value} />
                </dd>
                <dt className="text-[11px] font-semibold tracking-[0.14em] uppercase">{item.label}</dt>
              </div>
            ))}
          </dl>
        </div>
        {presenter ? <PresentedBy sponsor={presenter} className="self-start sm:self-auto" /> : null}
      </header>

      <section aria-label="Filtrar por deporte y rama" className="space-y-3">
        <SportPicker
          layoutId="cal-sport"
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
        <GenderSwitch layoutId="cal-gender" value={gender} onChange={setGender} available={genders} />
      </section>

      <div className="sticky top-[calc(3rem+env(safe-area-inset-top,0px))] z-30 -mx-4 space-y-3 bg-[#eef1f4]/90 px-4 py-3 backdrop-blur-xl md:top-14 md:mx-0 md:rounded-b-3xl md:px-0">
        <Segmented
          layoutId="cal-status"
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
                    "relative flex w-14 shrink-0 touch-manipulation flex-col items-center rounded-2xl py-2 transition-colors",
                    active ? "text-white" : "bg-white text-zinc-700 ring-1 ring-zinc-200",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="cal-day"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-2xl bg-zinc-950"
                    />
                  ) : null}
                  <span className="relative text-[10px] font-semibold tracking-wider uppercase opacity-70">{parts.weekday}</span>
                  <span className="font-jersey relative text-2xl leading-none">{parts.day}</span>
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

      <SelectionTitle
        title={selectedSport?.name ?? "Todos los deportes"}
        suffix={genderSuffix}
        meta={`${filtered.length} ${filtered.length === 1 ? "partido" : "partidos"}`}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${status}-${sportId}-${gender}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.14 } }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
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
                    <h2 className="font-jersey text-[1.75rem] leading-none text-zinc-950 uppercase first-letter:uppercase sm:text-4xl">
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
                  <motion.ul
                    initial="hidden"
                    whileInView="shown"
                    viewport={{ once: true, margin: "-8% 0px" }}
                    variants={{ shown: { transition: { staggerChildren: 0.06 } } }}
                    className="grid gap-3 lg:grid-cols-2"
                  >
                    {list.map((m) => (
                      <motion.li
                        key={m.id}
                        variants={{ hidden: { opacity: 0, y: 18 }, shown: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <MatchRow match={m} />
                      </motion.li>
                    ))}
                  </motion.ul>
                </section>
                {index === 0 && feedSponsor ? (
                  <SponsorOffer sponsor={feedSponsor} offer={feedOffer} context="Aliado del calendario" />
                ) : null}
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
