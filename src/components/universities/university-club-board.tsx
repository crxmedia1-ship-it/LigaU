"use client";

import { useMemo, useState } from "react";
import { SportPicker } from "@/components/public/sport-picker";
import { SafeLogo } from "@/components/public/safe-logo";
import { AthleteCardModal } from "@/components/athletes/AthleteCardModal";
import {
  SPORT_TAB_ORDER,
  buildAthleteSheet,
  type AthleteSheet,
} from "@/lib/public/athlete-sheet";
import type {
  AthleteCard,
  MatchCard,
  MatchEventCard,
  SportCard,
  TeamCard,
  UniversityCard,
} from "@/lib/public/types";

export function UniversityClubBoard({
  university,
  sports,
  teams,
  athletes,
  matches,
  events,
}: {
  university: UniversityCard;
  sports: SportCard[];
  teams: TeamCard[];
  athletes: AthleteCard[];
  matches: MatchCard[];
  events: MatchEventCard[];
}) {
  const orderedSports = useMemo(() => {
    const rank = new Map<string, number>(SPORT_TAB_ORDER.map((slug, index) => [slug, index]));
    return [...sports].sort((a, b) => {
      const left = rank.get(a.slug) ?? 99;
      const right = rank.get(b.slug) ?? 99;
      return left - right || a.name.localeCompare(b.name, "es");
    });
  }, [sports]);

  const defaultSport =
    orderedSports.find((sport) =>
      teams.some((team) => team.sportId === sport.id && athletes.some((athlete) => athlete.teamId === team.id)),
    ) ?? orderedSports[0];

  const [sportId, setSportId] = useState(defaultSport?.id ?? "");
  const [selected, setSelected] = useState<AthleteSheet | null>(null);

  const sportTeams = teams.filter((team) => team.sportId === sportId);
  const roster = athletes.filter((athlete) =>
    sportTeams.some((team) => team.id === athlete.teamId && athlete.isActive),
  );
  const activeSport = orderedSports.find((sport) => sport.id === sportId);

  return (
    <div className="space-y-8">
      <header
        className="overflow-hidden rounded-2xl border border-zinc-800"
        style={{
          background: `linear-gradient(135deg, ${university.colors.primary} 0%, #09090B 58%)`,
        }}
      >
        <div className="flex flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:px-8">
          <div className="flex h-24 shrink-0 items-center gap-4 self-start rounded-2xl bg-white px-4">
            <SafeLogo
              url={university.crestUrl}
              label={university.shortName}
              className="h-16 w-32"
              fallback={false}
            />
            <SafeLogo
              url={university.mascotUrl}
              label={university.shortName}
              className="h-20 w-20"
              fallback={!university.crestUrl}
            />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xs tracking-[0.28em] text-white/70 uppercase">
              {university.shortName}
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white uppercase sm:text-4xl">
              {university.name}
            </h1>
            <div className="mt-3 flex gap-2">
              <span
                className="h-2 w-10 rounded-full"
                style={{ backgroundColor: university.colors.primary }}
              />
              <span
                className="h-2 w-10 rounded-full"
                style={{ backgroundColor: university.colors.secondary }}
              />
            </div>
          </div>
        </div>
      </header>

      <SportPicker
        dense
        sports={orderedSports.map((sport, index) => {
          const count = athletes.filter(
            (athlete) =>
              athlete.isActive &&
              teams.some((team) => team.id === athlete.teamId && team.sportId === sport.id),
          ).length;
          return { id: sport.id, name: sport.name, count, rank: orderedSports.length - index };
        })}
        value={sportId}
        onChange={setSportId}
        countLabel={(count) => `${count} ${count === 1 ? "atleta" : "atletas"}`}
      />

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-950">
            {activeSport?.name ?? "Plantilla"}
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            {roster.length} {roster.length === 1 ? "convocado" : "convocados"}
          </p>
        </div>

        {roster.length === 0 ? (
          <p className="rounded-[1.35rem] bg-white px-4 py-8 text-sm text-zinc-500 shadow-[0_16px_36px_-26px_rgba(15,23,42,0.45)] ring-1 ring-zinc-200/90">
            Aún no hay atletas convocados en esta disciplina.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roster.map((athlete) => {
              const team = sportTeams.find((item) => item.id === athlete.teamId);
              if (!team || !activeSport) return null;
              const sheet = buildAthleteSheet({
                athlete,
                team,
                sportName: activeSport.name,
                matches,
                events,
              });
              return (
                <button
                  key={athlete.id}
                  type="button"
                  onClick={() => setSelected(sheet)}
                  className="group flex min-h-[5.5rem] items-center gap-3 overflow-hidden rounded-[1.35rem] bg-white p-3 text-left shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)] ring-1 ring-zinc-200/90 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-24px_rgba(15,23,42,0.4)]"
                >
                  <span
                    aria-hidden
                    className="h-14 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: university.colors.primary }}
                  />
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-zinc-50 ring-1 ring-zinc-200">
                    <SafeLogo url={university.logoUrl} label={university.shortName} className="size-10" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold tracking-tight text-zinc-950">
                      {athlete.fullName}
                    </span>
                    <span className="mt-1 block text-[10px] font-semibold tracking-[0.16em] text-zinc-400 uppercase">
                      {athlete.position || "Roster"}
                    </span>
                  </span>
                  <span className="font-jersey pr-1 text-4xl leading-none text-zinc-950">
                    {athlete.jerseyNumber ?? "—"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <AthleteCardModal athlete={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
