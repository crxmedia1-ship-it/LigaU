"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { CountUp, Segmented } from "@/components/public/app-motion";
import { Crest } from "@/components/public/match-ui";
import { CourtMark } from "@/components/public/sport-courts";
import { GenderSwitch, SelectionTitle, SportPicker, sportTheme, type GenderValue } from "@/components/public/sport-picker";
import { PresentedBy, SponsorMark, SponsorOffer } from "@/components/public/sponsor-slots";
import type { MedalTally, SponsorCard, SportCard, StandingRow, TeamGender, UniversityColors } from "@/lib/public/types";
import { cn } from "@/lib/utils";

export type StandingGroup = {
  id: string;
  sportId: string;
  gender: TeamGender;
  sportName: string;
  genderLabel: string;
  finished: number;
  rows: Array<StandingRow & { colors: UniversityColors }>;
};

type View = "tablas" | "medallero";

function celebrate(colors: UniversityColors) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  void import("canvas-confetti").then(({ default: confetti }) => {
    confetti({
      particleCount: 90,
      spread: 75,
      startVelocity: 38,
      origin: { y: 0.45 },
      colors: [colors.primary, colors.secondary, "#ffffff"],
      disableForReducedMotion: true,
    });
  });
}

const PODIUM = [
  { place: 2, height: "h-24", tone: "from-zinc-200 to-zinc-100", label: "text-zinc-500" },
  { place: 1, height: "h-36", tone: "from-amber-300 to-amber-100", label: "text-amber-700" },
  { place: 3, height: "h-16", tone: "from-orange-200 to-orange-50", label: "text-orange-700" },
];

function Podium({
  rows,
  leaderSponsor,
}: {
  rows: StandingGroup["rows"];
  leaderSponsor?: SponsorCard;
}) {
  const slots = PODIUM.filter((slot) => rows[slot.place - 1]);

  return (
    <div className="relative isolate overflow-hidden rounded-[1.9rem] bg-white px-4 pt-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.5)] ring-1 ring-zinc-200/80 sm:px-8">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.22),transparent_70%)]"
      />
      <div className="flex items-end justify-center gap-3 sm:gap-6">
        {slots.map((slot) => {
          const row = rows[slot.place - 1];
          const leader = slot.place === 1;
          return (
            <div key={row.teamId} className="flex w-full max-w-36 flex-col items-center">
              <button
                type="button"
                onClick={() => leader && celebrate(row.colors)}
                aria-label={leader ? `Celebrar al líder ${row.universityShort}` : row.universityShort}
                className={cn("relative flex flex-col items-center active:scale-95", !leader && "cursor-default")}
              >
                {leader ? (
                  <span className="mb-1 text-amber-500">
                    <Trophy className="size-6" strokeWidth={2.25} />
                  </span>
                ) : null}
                <span
                  className={cn("rounded-full p-1", leader && "shadow-[0_0_0_3px_rgba(212,175,55,0.5),0_12px_30px_-8px_rgba(212,175,55,0.8)]")}
                  style={{ backgroundColor: row.colors.primary }}
                >
                  <Crest label={row.universityShort} logo={row.logoUrl} size={leader ? "xl" : "lg"} />
                </span>
                <span className="font-jersey mt-2 max-w-full truncate text-2xl leading-none text-zinc-950">
                  {row.universityShort}
                </span>
                <span className="mt-0.5 text-[11px] font-semibold text-zinc-500">
                  <CountUp value={row.points} className="font-jersey text-base text-zinc-950" /> pts
                </span>
              </button>
              <div
                className={cn("mt-3 grid w-full place-items-start justify-center rounded-t-2xl bg-gradient-to-b pt-2", slot.height, slot.tone)}
              >
                <span className={cn("font-jersey text-4xl leading-none", slot.label)}>{slot.place}</span>
              </div>
            </div>
          );
        })}
      </div>
      {leaderSponsor ? (
        <div className="-mx-4 flex items-center justify-center gap-3 border-t border-zinc-100 bg-zinc-50/80 px-4 py-2.5 sm:-mx-8">
          <span className="text-[9px] font-semibold tracking-[0.22em] text-zinc-400 uppercase">Líder presentado por</span>
          <SponsorMark sponsor={leaderSponsor} className="h-6 max-w-20" />
        </div>
      ) : null}
    </div>
  );
}

function Table({ group }: { group: StandingGroup }) {
  const top = Math.max(1, ...group.rows.map((row) => row.points));
  const cols = "grid-cols-[1.75rem_minmax(0,1fr)_2rem_2.25rem_2.5rem] sm:grid-cols-[2rem_minmax(0,1fr)_repeat(5,2.5rem)_3rem]";
  return (
    <div className="overflow-hidden rounded-[1.6rem] bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)] ring-1 ring-zinc-200/80">
      <div className={cn("grid items-center gap-2 border-b border-zinc-100 px-4 py-3 text-[10px] font-bold tracking-[0.16em] text-zinc-400 uppercase", cols)}>
        <span>#</span>
        <span>Equipo</span>
        <span className="text-center">PJ</span>
        <span className="hidden text-center sm:block">G</span>
        <span className="hidden text-center sm:block">E</span>
        <span className="hidden text-center sm:block">P</span>
        <span className="text-center">DG</span>
        <span className="text-right">Pts</span>
      </div>
      <ol>
        {group.rows.map((row, index) => (
          <li
            key={row.teamId}
            className={cn("relative grid items-center gap-2 border-b border-zinc-100 px-4 py-3.5 last:border-b-0", cols)}
          >
            {index === 0 ? <span aria-hidden className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-amber-400" /> : null}
            <span className={cn("font-jersey text-xl leading-none", index === 0 ? "text-amber-600" : "text-zinc-400")}>
              {index + 1}
            </span>
            <div className="flex min-w-0 items-center gap-2.5">
              <Crest label={row.universityShort} logo={row.logoUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-zinc-900">{row.universityShort}</p>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full origin-left rounded-full"
                    style={{ width: `${Math.max(6, (row.points / top) * 100)}%`, backgroundColor: row.colors.primary }}
                  />
                </div>
              </div>
            </div>
            <span className="text-center text-sm text-zinc-600 tabular-nums">{row.played}</span>
            <span className="hidden text-center text-sm text-zinc-600 tabular-nums sm:block">{row.won}</span>
            <span className="hidden text-center text-sm text-zinc-600 tabular-nums sm:block">{row.drawn}</span>
            <span className="hidden text-center text-sm text-zinc-600 tabular-nums sm:block">{row.lost}</span>
            <span className="text-center text-sm text-zinc-600 tabular-nums">
              {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
            </span>
            <CountUp value={row.points} className="font-jersey text-right text-2xl leading-none text-zinc-950" />
          </li>
        ))}
      </ol>
    </div>
  );
}

const MEDALS = [
  { key: "gold", label: "Oro", tone: "bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900" },
  { key: "silver", label: "Plata", tone: "bg-gradient-to-br from-zinc-100 to-zinc-300 text-zinc-700" },
  { key: "bronze", label: "Bronce", tone: "bg-gradient-to-br from-orange-100 to-orange-300 text-orange-900" },
] as const;

function MedalBoard({ medals }: { medals: MedalTally[] }) {
  return (
    <ol className="overflow-hidden rounded-[1.6rem] bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)] ring-1 ring-zinc-200/80">
      {medals.map((row, index) => (
        <li
          key={row.universityId}
          className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3.5 last:border-b-0"
        >
          <span className={cn("font-jersey w-6 text-xl leading-none", index < 3 && row.total ? "text-amber-600" : "text-zinc-400")}>
            {index + 1}
          </span>
          <span aria-hidden className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: row.colors.primary }} />
          <Crest label={row.universityShort} logo={row.logoUrl} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-zinc-900">{row.universityShort}</p>
            <p className="truncate text-[11px] text-zinc-500">{row.universityName}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {MEDALS.map((medal) => (
              <span
                key={medal.key}
                title={medal.label}
                className={cn("font-jersey grid size-8 place-items-center rounded-full text-base leading-none shadow-inner", medal.tone)}
              >
                <CountUp value={row[medal.key]} />
              </span>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

function EmptySport({ name }: { name: string }) {
  const theme = sportTheme(name);
  return (
    <div
      key={name}
      className="relative isolate overflow-hidden rounded-[1.9rem] px-6 py-12 text-center text-white"
      style={{ background: `linear-gradient(160deg, ${theme.from}, ${theme.to})` }}
    >
      <CourtMark sport={name} className="absolute inset-6 -z-10 h-[calc(100%-3rem)] w-[calc(100%-3rem)] text-white/25" />
      <p className="text-[11px] font-semibold tracking-[0.3em] text-white/70 uppercase">Próximamente</p>
      <p className="font-jersey mt-2 text-4xl leading-none uppercase sm:text-5xl">{name}</p>
      <p className="mx-auto mt-3 max-w-xs text-sm text-white/80">
        La tabla aparece en cuanto se inscriban los equipos de esta disciplina.
      </p>
    </div>
  );
}

export function StandingsView({
  sports,
  groups,
  medals,
  initialView,
  presenter,
  leaderSponsor,
  feedSponsor,
  feedOffer,
}: {
  sports: SportCard[];
  /** One table per sport and branch, busiest first. */
  groups: StandingGroup[];
  medals: MedalTally[];
  initialView: View;
  presenter?: SponsorCard;
  leaderSponsor?: SponsorCard;
  feedSponsor?: SponsorCard;
  feedOffer?: string;
}) {
  const [view, setView] = useState<View>(initialView);
  const [sportId, setSportId] = useState(groups[0]?.sportId ?? sports[0]?.id ?? "");
  const [gender, setGender] = useState<GenderValue>(groups[0]?.gender ?? "male");
  const sportGroups = groups.filter((item) => item.sportId === sportId);
  const group = sportGroups.find((item) => item.gender === gender) ?? sportGroups[0];
  const selectedSport = sports.find((sport) => sport.id === sportId);

  const pickSport = (id: string) => {
    setSportId(id);
    const next = groups.filter((item) => item.sportId === id);
    if (next.length && !next.some((item) => item.gender === gender)) setGender(next[0].gender);
  };
  const medalsAwarded = medals.some((row) => row.total > 0);

  const changeView = (next: View) => {
    setView(next);
    window.history.replaceState(null, "", next === "medallero" ? "/clasificacion?vista=medallero" : "/clasificacion");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.3em] text-[#C8102E] uppercase">Temporada 2026</p>
          <h1 className="font-jersey mt-1 text-[3.6rem] leading-[0.82] text-zinc-950 uppercase sm:text-8xl">Clasificación</h1>
          <p className="mt-3 max-w-md text-sm text-zinc-500">
            Se recalcula sola con cada resultado oficial. 3 puntos por victoria, 1 por empate.
          </p>
        </div>
        {presenter ? <PresentedBy sponsor={presenter} label="Tabla oficial por" className="self-start sm:self-auto" /> : null}
      </header>

      <Segmented
        value={view}
        onChange={(id) => changeView(id as View)}
        options={[
          { id: "tablas", label: "Tablas" },
          { id: "medallero", label: "Medallero" },
        ]}
        className="sm:max-w-sm"
      />

        {view === "tablas" ? (
          <div className="space-y-5">
            <section aria-label="Elegir deporte y rama" className="space-y-3">
              <SportPicker
                sports={sports.map((sport) => ({
                  id: sport.id,
                  name: sport.name,
                  count: groups.filter((item) => item.sportId === sport.id).reduce((sum, item) => sum + item.rows.length, 0),
                }))}
                value={sportId}
                onChange={pickSport}
                countLabel={(n) => `${n} ${n === 1 ? "equipo" : "equipos"}`}
              />
              <GenderSwitch
                value={group?.gender ?? gender}
                onChange={setGender}
                available={sportGroups.map((item) => item.gender)}
                includeAll={false}
              />
            </section>

            {group ? (
              <div key={group.id} className="space-y-5">
                <SelectionTitle
                  title={group.sportName}
                  suffix={group.genderLabel}
                  meta={`${group.finished} ${group.finished === 1 ? "resultado" : "resultados"}`}
                />
                {group.finished === 0 ? (
                  <p className="rounded-2xl bg-amber-50 px-4 py-3 text-[13px] text-amber-800 ring-1 ring-amber-200/70">
                    Aún no hay resultados oficiales: la tabla se moverá con el primer partido finalizado.
                  </p>
                ) : null}
                <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
                  <Podium rows={group.rows} leaderSponsor={leaderSponsor} />
                  <Table group={group} />
                </div>
              </div>
            ) : (
              <EmptySport name={selectedSport?.name ?? "este deporte"} />
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-jersey text-[1.75rem] leading-none text-zinc-950 uppercase sm:text-4xl">Medallero general</h2>
              <span className="shrink-0 text-[11px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
                {medals.length} universidades
              </span>
            </div>
            {!medalsAwarded ? (
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-[13px] text-amber-800 ring-1 ring-amber-200/70">
                Las medallas se reparten al cerrar cada disciplina: top 3 de cada tabla.
              </p>
            ) : null}
            <MedalBoard medals={medals} />
          </div>
        )}

      {feedSponsor ? <SponsorOffer sponsor={feedSponsor} offer={feedOffer} context="Aliado de la clasificación" /> : null}
    </div>
  );
}
