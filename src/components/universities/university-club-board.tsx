"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
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
          <div className="flex items-center gap-4">
            <SafeLogo
              url={university.crestUrl}
              label={university.shortName}
              className="h-16 w-16"
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

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex w-max gap-2 pb-1" role="tablist" aria-label="Disciplinas">
          {orderedSports.map((sport) => {
            const active = sport.id === sportId;
            return (
              <button
                key={sport.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSportId(sport.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors",
                  active
                    ? "border-[#BA0C2F] bg-[#BA0C2F] text-white"
                    : "border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:border-red-600/40",
                )}
              >
                {sport.name}
              </button>
            );
          })}
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">
            {activeSport?.name ?? "Plantilla"}
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            {roster.length} {roster.length === 1 ? "convocado" : "convocados"}
          </p>
        </div>

        {roster.length === 0 ? (
          <p className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-8 text-sm text-zinc-500">
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
                  className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-left transition-all hover:border-red-600/60"
                >
                  {athlete.photoUrl ? (
                    <img
                      src={athlete.photoUrl}
                      alt=""
                      className="size-12 rounded-xl object-cover"
                    />
                  ) : (
                    <span
                      className="grid size-12 place-items-center rounded-xl text-sm font-black text-white"
                      style={{ backgroundColor: university.colors.primary }}
                    >
                      {athlete.fullName.slice(0, 1)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-white">
                      {athlete.fullName}
                    </span>
                    <span className="block text-xs text-zinc-500">
                      {athlete.position || "Roster"}
                    </span>
                  </span>
                  <span className="font-mono text-xl text-zinc-400">
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
