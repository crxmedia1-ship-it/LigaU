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
import { KitViewer } from "@/components/universities/kit-viewer";
import { universityKit } from "@/lib/public/university-kits";
import { MASCOT_OUTLINE, paletteBackground, universityPalette } from "@/lib/public/university-palette";
import { cn } from "@/lib/utils";
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
  const palette = universityPalette(university);
  const kit = universityKit(university.shortName);
  const stripe = palette.accent === "#ffffff" ? palette.glow : palette.accent;

  return (
    <div className="space-y-8">
      <header
        className="relative isolate overflow-hidden rounded-[1.75rem] text-white shadow-[0_30px_60px_-35px_var(--glow)]"
        style={
          {
            "--glow": palette.glow,
            background: paletteBackground(palette, "18% 50%"),
          } as React.CSSProperties
        }
      >
        <span
          aria-hidden
          className="absolute inset-0 -z-10 opacity-50 [background-image:repeating-linear-gradient(115deg,rgba(255,255,255,0.06)_0_2px,transparent_2px_22px)]"
        />
        <span
          aria-hidden
          className="absolute -top-1/4 left-[62%] -z-10 h-[150%] w-[14%] rotate-[18deg] opacity-25"
          style={{ background: `linear-gradient(to bottom, transparent, ${palette.accent}, transparent)` }}
        />
        <span
          aria-hidden
          className="font-jersey absolute -right-[2%] -bottom-[18%] -z-10 text-[8rem] leading-none text-transparent opacity-30 select-none [-webkit-text-stroke:2px_var(--accent)] sm:text-[11rem]"
          style={{ "--accent": palette.accent } as React.CSSProperties}
        >
          {university.shortName}
        </span>

        <div className="flex items-center gap-4 px-4 py-6 sm:gap-7 sm:px-8 sm:py-8">
          <SafeLogo
            url={university.mascotUrl ?? university.crestUrl}
            label={university.shortName}
            className={cn(
              "size-28 shrink-0 drop-shadow-[0_18px_24px_rgba(0,0,0,0.5)] sm:size-40",
              palette.outline && MASCOT_OUTLINE,
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[10px] font-black tracking-[0.24em] text-white/75 uppercase">
              <span className="h-1 w-6 rounded-full" style={{ background: palette.accent }} />
              Liga U · 2026
            </p>
            <h1 className="font-jersey mt-2 text-6xl leading-[0.85] uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] sm:text-8xl">
              {university.shortName}
            </h1>
            <p className="mt-3 flex w-fit max-w-full -skew-x-12 items-center gap-2.5 rounded-md bg-white py-1.5 pr-3.5 pl-2 text-zinc-900 shadow-lg">
              <span className="w-1 self-stretch rounded-full" style={{ background: stripe }} />
              {university.crestUrl ? (
                <SafeLogo
                  url={university.crestUrl}
                  label={university.shortName}
                  fallback={false}
                  className="h-7 w-auto max-w-16 shrink-0 skew-x-12"
                />
              ) : null}
              <span className="skew-x-12 truncate text-xs font-bold sm:text-sm">{university.name}</span>
            </p>
            {kit ? (
              <div className="mt-4">
                <KitViewer
                  kit={kit}
                  palette={palette}
                  shortName={university.shortName}
                  logoUrl={university.mascotUrl ?? university.crestUrl}
                />
              </div>
            ) : null}
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
                    style={{ backgroundColor: stripe }}
                  />
                  <span
                    className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl p-1.5"
                    style={{ background: paletteBackground(palette, "50% 45%") }}
                  >
                    <SafeLogo
                      url={university.logoUrl}
                      label={university.shortName}
                      className={cn("size-full", palette.outline && MASCOT_OUTLINE)}
                    />
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
