"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CountUp, Segmented } from "@/components/public/app-motion";
import { Crest } from "@/components/public/match-ui";
import { CourtMark } from "@/components/public/sport-courts";
import { GenderSwitch, SelectionTitle, SportPicker, sportTheme, type GenderValue } from "@/components/public/sport-picker";
import { PresentedBy, SponsorFlyer } from "@/components/public/sponsor-slots";
import { GENDER_LABELS } from "@/lib/admin/labels";
import {
  EDITION_STATUS_LABEL,
  defaultRound,
  defaultYear,
  listTitles,
  listValidas,
  listYears,
  scopeMatches,
  type TitleWin,
} from "@/lib/public/editions";
import { cloudinaryCutout, cloudinaryImage, cloudinaryThumb } from "@/lib/public/media";
import { PLAYER_STAT_CATEGORIES, computePlayerStats, rankBy, type PlayerStat, type PlayerStatKey } from "@/lib/public/player-stats";
import { computeStandings } from "@/lib/public/standings";
import type { AthleteCard, MatchCard, MatchEventCard, SponsorCard, SportCard, StandingRow, TeamCard, TeamGender, UniversityCard, UniversityColors } from "@/lib/public/types";
import { cn } from "@/lib/utils";

type StandingGroup = {
  id: string;
  sportId: string;
  gender: TeamGender;
  sportName: string;
  genderLabel: string;
  finished: number;
  rows: Array<StandingRow & { colors: UniversityColors }>;
};

type View = "tablas" | "jugadores" | "titulos";
type Slice = "ano" | "valida";

function buildGroups(matches: MatchCard[], teams: TeamCard[], sports: SportCard[]): StandingGroup[] {
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const buckets = new Map<string, { teams: Map<string, TeamCard>; matches: MatchCard[] }>();
  for (const match of matches) {
    const home = teamById.get(match.homeTeamId);
    const away = teamById.get(match.awayTeamId);
    if (!home || !away) continue;
    const key = `${home.sportId}:${home.gender}`;
    const bucket = buckets.get(key) ?? { teams: new Map<string, TeamCard>(), matches: [] };
    bucket.teams.set(home.id, home);
    bucket.teams.set(away.id, away);
    bucket.matches.push(match);
    buckets.set(key, bucket);
  }

  return [...buckets.entries()]
    .map(([id, bucket]) => {
      const list = [...bucket.teams.values()];
      const sport = sports.find((item) => item.id === list[0].sportId);
      return {
        id,
        sportId: list[0].sportId,
        gender: list[0].gender,
        sportName: sport?.name ?? "Deporte",
        genderLabel: GENDER_LABELS[list[0].gender],
        finished: bucket.matches.filter((match) => match.status === "finished" && match.homeScore !== null && match.awayScore !== null).length,
        rows: computeStandings(bucket.matches, list).map((row) => ({
          ...row,
          colors: list.find((team) => team.id === row.teamId)?.university.colors ?? { primary: "#C8102E", secondary: "#D4AF37" },
        })),
      };
    })
    .sort((a, b) => b.finished - a.finished || a.sportName.localeCompare(b.sportName, "es"));
}

function Table({ group }: { group: StandingGroup }) {
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
              <Crest label={row.universityShort} logo={row.logoUrl} size="sm" bare />
              <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-zinc-900">{row.universityShort}</p>
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

function PlayerAvatar({ athlete, color, className }: { athlete: AthleteCard; color: string; className?: string }) {
  return athlete.photoUrl ? (
    <img
      src={cloudinaryThumb(athlete.photoUrl, 160) ?? athlete.photoUrl}
      alt=""
      loading="lazy"
      className={cn("shrink-0 rounded-full object-cover object-top", className)}
    />
  ) : (
    <span
      aria-hidden
      className={cn("font-jersey grid shrink-0 place-items-center rounded-full text-white", className)}
      style={{ backgroundColor: color }}
    >
      {athlete.fullName.slice(0, 1)}
    </span>
  );
}

/** The player cut out of the profile photo; until Cloudinary has a cutout, the photo fades into the card instead. */
function LeaderFigure({ athlete }: { athlete: AthleteCard }) {
  const cutout = cloudinaryCutout(athlete.photoUrl, 560);
  const [failed, setFailed] = useState(false);
  if (cutout && !failed) {
    return (
      <img
        src={cutout}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="absolute right-0 bottom-0 h-[88%] w-auto max-w-[64%] object-contain object-bottom drop-shadow-[0_18px_22px_rgba(15,23,42,0.3)] transition-transform duration-500 group-hover:scale-[1.04]"
      />
    );
  }
  if (!athlete.photoUrl) return null;
  return (
    <img
      src={cloudinaryImage(athlete.photoUrl, 560) ?? athlete.photoUrl}
      alt=""
      loading="lazy"
      className="absolute inset-y-0 right-0 h-full w-[62%] object-cover object-top [mask-image:linear-gradient(to_left,black_55%,transparent)] transition-transform duration-500 group-hover:scale-[1.04]"
    />
  );
}

function PlayerLeaders({ stats }: { stats: PlayerStat[] }) {
  const categories = PLAYER_STAT_CATEGORIES.filter((category) => stats.some((stat) => stat[category.key] > 0));
  const [picked, setPicked] = useState<PlayerStatKey | null>(null);
  const active = categories.find((category) => category.key === picked) ?? categories[0];

  if (!active) {
    return (
      <div className="rounded-[1.6rem] bg-white px-6 py-10 text-center ring-1 ring-zinc-200/80">
        <p className="font-jersey text-3xl leading-none text-zinc-950 uppercase">Sin estadísticas aún</p>
        <p className="mx-auto mt-2 max-w-xs text-[13px] leading-snug text-zinc-500">
          Cuando se carguen los goles, asistencias y MVP de los partidos jugados, aquí salen los líderes.
        </p>
      </div>
    );
  }

  const ranking = rankBy(stats, active.key).slice(0, 10);

  return (
    <div className="space-y-4">
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
        {categories.filter((category) => category.key !== "yellow" && category.key !== "red").slice(0, 3).map((category) => {
          const leader = rankBy(stats, category.key)[0];
          const value = leader[category.key];
          const color = leader.team.university.colors.primary;
          return (
            <li key={category.key} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <Link
                href={`/atletas/${leader.athlete.id}`}
                className="group relative isolate flex h-60 flex-col overflow-hidden rounded-[1.6rem] p-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.55)] ring-1 ring-zinc-200/80"
                style={{
                  background: `linear-gradient(155deg, color-mix(in srgb, ${color} 26%, white) 0%, color-mix(in srgb, ${color} 8%, white) 55%, #fff 100%)`,
                }}
              >
                <span
                  aria-hidden
                  className="font-jersey pointer-events-none absolute -top-4 -right-2 -z-10 text-[11rem] leading-none select-none"
                  style={{ color: `color-mix(in srgb, ${color} 16%, transparent)` }}
                >
                  {leader.athlete.jerseyNumber ?? leader.athlete.fullName.slice(0, 1)}
                </span>
                <span aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                  <LeaderFigure athlete={leader.athlete} />
                </span>
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.85),rgba(255,255,255,0.35)_45%,transparent_68%)]"
                />

                <span className="w-fit rounded-full bg-white/85 px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] text-zinc-600 uppercase shadow-sm ring-1 ring-zinc-900/5 backdrop-blur">
                  {category.leader}
                </span>
                <p className="mt-2 flex flex-col">
                  <CountUp value={value} className="font-jersey text-7xl leading-[0.85] text-zinc-950" />
                  <span className="text-[11px] font-bold tracking-[0.16em] text-zinc-500 uppercase">
                    {category.unit[value === 1 ? 0 : 1]}
                  </span>
                </p>
                <div className="mt-auto max-w-[78%]">
                  <p className="font-jersey line-clamp-2 text-2xl leading-[0.95] text-zinc-950 uppercase">{leader.athlete.fullName}</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-600">
                    <Crest label={leader.team.university.shortName} logo={leader.team.university.logoUrl} size="sm" bare />
                    <span className="truncate">
                      {leader.team.university.shortName}
                      {leader.athlete.jerseyNumber ? ` · #${leader.athlete.jerseyNumber}` : ""}
                    </span>
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="overflow-hidden rounded-[1.6rem] bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)] ring-1 ring-zinc-200/80">
        <div className="flex gap-1.5 overflow-x-auto border-b border-zinc-100 px-3 py-3 [scrollbar-width:none]">
          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              aria-pressed={category.key === active.key}
              onClick={() => setPicked(category.key)}
              className={cn(
                "min-h-8 shrink-0 rounded-full px-3.5 text-xs font-semibold",
                category.key === active.key ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-500",
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-[1.75rem_minmax(0,1fr)_2.25rem_2.75rem] items-center gap-2 border-b border-zinc-100 px-4 py-2.5 text-[10px] font-bold tracking-[0.16em] text-zinc-400 uppercase">
          <span>#</span>
          <span>Jugador</span>
          <span className="text-center">PJ</span>
          <span className="text-right">{active.label.slice(0, 3)}</span>
        </div>
        <ol>
          {ranking.map((stat, index) => (
            <li key={stat.athlete.id} className="border-b border-zinc-100 last:border-b-0">
              <Link
                href={`/atletas/${stat.athlete.id}`}
                className="grid grid-cols-[1.75rem_minmax(0,1fr)_2.25rem_2.75rem] items-center gap-2 px-4 py-3 hover:bg-zinc-50"
              >
                <span className={cn("font-jersey text-xl leading-none", index === 0 ? "text-amber-600" : "text-zinc-400")}>
                  {index + 1}
                </span>
                <span className="flex min-w-0 items-center gap-2.5">
                  <PlayerAvatar athlete={stat.athlete} color={stat.team.university.colors.primary} className="size-9 text-base" />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold text-zinc-900">{stat.athlete.fullName}</span>
                    <span className="block truncate text-[11px] text-zinc-500">{stat.team.university.shortName}</span>
                  </span>
                </span>
                <span className="text-center text-sm text-zinc-600 tabular-nums">{stat.games}</span>
                <span className="font-jersey text-right text-2xl leading-none text-zinc-950">{stat[active.key]}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function EmptySport({ name, edition }: { name: string; edition: string }) {
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
        {edition} no tiene partidos de esta disciplina. Las ediciones pasadas y las próximas aparecen cuando ya tienen fecha.
      </p>
    </div>
  );
}

function EditionLabel({
  active,
  onClick,
  children,
  label,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "font-jersey inline-flex min-h-8 min-w-8 items-center justify-center rounded-full px-2.5 text-sm leading-none",
        active ? "bg-zinc-950 text-white" : "text-zinc-400",
      )}
    >
      {children}
    </button>
  );
}

/** Example cup name until each title stores its own competition. */
const EXAMPLE_CUP = "Copa Liga U";

function TitleTicket({
  year,
  sport,
  detail,
  color,
  accent,
  athletes,
  university,
  photo,
}: {
  year: string;
  sport: string;
  detail: string;
  color: string;
  accent: string;
  athletes: AthleteCard[];
  university: string;
  photo?: string;
}) {
  const [squadOpen, setSquadOpen] = useState(false);
  const ordered = [...athletes].sort(
    (a, b) => (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999) || a.fullName.localeCompare(b.fullName, "es"),
  );
  const haze = `color-mix(in srgb, ${color} 72%, ${accent})`;

  return (
    <>
      <div className="relative isolate">
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-x-3 -top-5 -bottom-7 -z-10 blur-2xl"
          style={{ background: `radial-gradient(ellipse at 50% 58%, ${haze} 0%, transparent 70%)` }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-8 -bottom-6 -z-10 h-8 blur-2xl"
          style={{ background: color, opacity: 0.7 }}
        />
        <article className="relative overflow-hidden rounded-2xl shadow-[0_14px_28px_-22px_rgba(15,23,42,0.45)] ring-1 ring-white/70 transition-transform duration-200 has-[:active]:scale-[0.985]">
          <div className="flex items-center justify-between gap-3 border-b border-white/60 bg-white/85 px-3 py-1 text-zinc-950 backdrop-blur-md">
            <span className="font-jersey text-2xl leading-none">{year}</span>
            <span className="text-[10px] font-semibold tracking-[0.16em] text-zinc-500 uppercase">{detail}</span>
          </div>
          {photo ? (
            <img src={photo} alt="" className="h-24 w-full object-cover object-top sm:h-28" />
          ) : (
            <div className="grid h-24 place-items-center bg-zinc-100 sm:h-28">
              <span className="text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase">Foto pendiente</span>
            </div>
          )}
          <div className="flex items-center gap-2 border-t border-white/60 bg-white/85 px-3 py-1.5 text-zinc-950 backdrop-blur-md">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold tracking-tight">{sport}</span>
              <span className="block truncate text-[10px] font-semibold tracking-[0.16em] text-zinc-500 uppercase">
                {EXAMPLE_CUP}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setSquadOpen(true)}
              aria-label={`Ver los jugadores de ${sport}`}
              className="grid size-8 shrink-0 place-items-center rounded-full bg-white/70 ring-1 ring-zinc-900/10"
            >
              <User className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </article>
      </div>

      <Dialog open={squadOpen} onOpenChange={setSquadOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-md">
          <div className="h-2" style={{ background: `linear-gradient(90deg, ${color}, ${accent})` }} />
          <DialogHeader className="px-4 pt-4">
            <DialogTitle className="font-jersey text-4xl uppercase">{university}</DialogTitle>
            <DialogDescription>
              {year === "—"
                ? "Toca un jugador para abrir su perfil."
                : `${[year, sport, detail, EXAMPLE_CUP].filter(Boolean).join(" · ")}. Toca un jugador para abrir su perfil.`}
            </DialogDescription>
          </DialogHeader>
          {ordered.length === 0 ? (
            <p className="px-4 pb-4 text-[13px] leading-snug text-zinc-500">
              Este título todavía no cerró. Cuando lo haga, aquí salen las personas del equipo.
            </p>
          ) : (
            <ul className="grid max-h-[50vh] gap-2 overflow-y-auto px-4 pb-4">
              {ordered.map((athlete) => (
                <li key={athlete.id}>
                  <Link
                    href={`/atletas/${athlete.id}`}
                    className="flex min-w-0 items-center gap-3 rounded-2xl bg-zinc-50 px-2.5 py-2"
                  >
                    {athlete.photoUrl ? (
                      <img
                        src={cloudinaryThumb(athlete.photoUrl, 96) ?? athlete.photoUrl}
                        alt=""
                        loading="lazy"
                        className="size-12 shrink-0 rounded-full object-cover object-top"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="font-jersey grid size-12 shrink-0 place-items-center rounded-full text-xl text-white"
                        style={{ backgroundColor: color }}
                      >
                        {athlete.fullName.slice(0, 1)}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-zinc-950">{athlete.fullName}</span>
                      <span className="block truncate text-[11px] text-zinc-500">
                        {athlete.jerseyNumber ? `#${athlete.jerseyNumber}` : "Sin número"}
                        {athlete.position ? ` · ${athlete.position}` : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Sampled from each mascot so the halo matches the mark on screen. */
const LOGO_GLOW: Record<string, string> = {
  UAH: "#9a6233",
  UCAB: "#0e5a85",
  UCV: "#d11a1a",
  UMA: "#2c920b",
  UNE: "#0a8396",
  UNIMET: "#c47a12",
  USB: "#d99a0b",
  USM: "#2b3f9e",
};

function logoGlow(shortName: string) {
  return LOGO_GLOW[shortName.toUpperCase()] ?? "#94a3b8";
}

function TitleShelf({
  universities,
  titles,
  athletes,
  teams,
  sports,
  editionYear,
}: {
  universities: UniversityCard[];
  titles: TitleWin[];
  athletes: AthleteCard[];
  teams: TeamCard[];
  sports: SportCard[];
  editionYear: number | null;
}) {
  const byUniversity = new Map<string, TitleWin[]>();
  for (const title of titles) byUniversity.set(title.universityId, [...(byUniversity.get(title.universityId) ?? []), title]);
  const ranked = [...universities].sort(
    (a, b) => (byUniversity.get(b.id)?.length ?? 0) - (byUniversity.get(a.id)?.length ?? 0) || a.shortName.localeCompare(b.shortName, "es"),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = ranked.find((university) => university.id === selectedId) ?? null;
  const wins = selected ? (byUniversity.get(selected.id) ?? []) : [];
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedId) return;
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-jersey text-[1.75rem] leading-none text-zinc-950 uppercase sm:text-4xl">Títulos</h2>
        <span className="shrink-0 text-[11px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
          {titles.length} {titles.length === 1 ? "título" : "títulos"}
        </span>
      </div>
      <ul className="grid grid-cols-4 gap-x-1.5 gap-y-3 lg:grid-cols-8">
        {ranked.map((university) => {
          const count = byUniversity.get(university.id)?.length ?? 0;
          const active = university.id === selectedId;
          return (
            <li key={university.id}>
              <button
                type="button"
                aria-pressed={active}
                aria-label={
                  count === 0
                    ? university.shortName
                    : `${university.shortName}, ${count} ${count === 1 ? "título" : "títulos"}`
                }
                onClick={() => setSelectedId(active ? null : university.id)}
                className="flex w-full flex-col items-center text-center"
              >
                <span className="grid h-16 w-full place-items-center">
                  {university.logoUrl ? (
                    <img
                      src={university.logoUrl}
                      alt=""
                      className={cn("h-14 w-auto max-w-full object-contain", active ? "scale-105" : "opacity-80")}
                    />
                  ) : (
                    <span className="font-jersey text-2xl leading-none text-zinc-950">{university.shortName}</span>
                  )}
                </span>
                <span className={cn("font-jersey mt-1 max-w-full truncate text-lg leading-none sm:text-2xl", active ? "text-zinc-950" : "text-zinc-500")}>
                  {university.shortName}
                  {count > 0 ? <span className="ml-1 text-zinc-400">{count}</span> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {selected ? (
        <div ref={panelRef} className="space-y-3">
          <div className="relative flex flex-col items-center gap-1 pt-1 text-center">
            <span
              aria-hidden
              className="pointer-events-none absolute top-6 left-1/2 size-48 -translate-x-1/2 rounded-full blur-2xl"
              style={{ background: logoGlow(selected.shortName), opacity: 0.55 }}
            />
            {selected.logoUrl ? (
              <img src={selected.logoUrl} alt="" className="relative h-44 w-auto max-w-[16rem] object-contain sm:h-52" />
            ) : (
              <span className="font-jersey text-6xl leading-none text-zinc-950">{selected.shortName}</span>
            )}
            <p className="font-jersey text-5xl leading-none text-zinc-950">{wins.length}</p>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase">
              {wins.length === 1 ? "título" : "títulos"}
            </p>
          </div>
          {wins.length ? (
            <ul className="grid gap-3 lg:grid-cols-2">
              {wins.map((title) => (
                <li key={`${title.teamId}:${title.year}:${title.sportName}`}>
                  <TitleTicket
                    year={String(title.year)}
                    sport={title.sportName}
                    detail={GENDER_LABELS[title.gender]}
                    color={selected.colors.primary}
                    accent={selected.colors.secondary}
                    university={selected.shortName}
                    athletes={athletes.filter((athlete) => athlete.teamId === title.teamId && athlete.isActive)}
                  />
                </li>
              ))}
            </ul>
          ) : teams.some((team) => team.universityId === selected.id) ? (
            <ul className="grid gap-3 lg:grid-cols-2">
              {teams
                .filter((team) => team.universityId === selected.id)
                .map((team) => (
                  <li key={team.id}>
                    <TitleTicket
                      year={editionYear ? String(editionYear) : "—"}
                      sport={sports.find((sport) => sport.id === team.sportId)?.name ?? "Deporte"}
                      detail={GENDER_LABELS[team.gender]}
                      color={selected.colors.primary}
                      accent={selected.colors.secondary}
                      university={selected.shortName}
                      athletes={athletes.filter((athlete) => athlete.teamId === team.id && athlete.isActive)}
                    />
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-[13px] leading-snug text-zinc-500">Esta universidad todavía no tiene un deporte inscrito.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function StandingsView({
  sports,
  matches,
  teams,
  athletes,
  universities,
  initialView,
  initialYear,
  initialRound,
  events,
  presenter,
  feedSponsor,
}: {
  sports: SportCard[];
  matches: MatchCard[];
  events: Array<MatchEventCard & { matchId: string }>;
  teams: TeamCard[];
  athletes: AthleteCard[];
  universities: UniversityCard[];
  initialView: View;
  initialYear: number | null;
  initialRound: string | null;
  presenter?: SponsorCard;
  /** Official sponsor flyer. Not a U Pass brand unless that brand also bought a sponsorship. */
  feedSponsor?: SponsorCard;
}) {
  const years = useMemo(() => listYears(matches), [matches]);
  const validas = useMemo(() => listValidas(matches), [matches]);
  const titles = useMemo(() => listTitles(matches, teams), [matches, teams]);
  const fallbackYear = defaultYear(years);
  const [view, setView] = useState<View>(initialView);
  const [slice, setSlice] = useState<Slice>(initialRound ? "valida" : "ano");
  const [year, setYear] = useState<number | null>(years.some((edition) => edition.year === initialYear) ? initialYear : fallbackYear);
  const [round, setRound] = useState<string | null>(initialRound);
  const [sportId, setSportId] = useState(() => {
    const scoped = scopeMatches(matches, initialRound ? "valida" : "ano", years.some((edition) => edition.year === initialYear) ? initialYear : fallbackYear, initialRound);
    return buildGroups(scoped, teams, sports)[0]?.sportId ?? sports[0]?.id ?? "";
  });
  const [gender, setGender] = useState<GenderValue>("male");

  const scoped = useMemo(() => scopeMatches(matches, slice, year, round), [matches, slice, year, round]);
  const groups = useMemo(() => buildGroups(scoped, teams, sports), [scoped, teams, sports]);

  const followEdition = (nextSlice: Slice, nextYear: number | null, nextRound: string | null) => {
    const nextGroups = buildGroups(scopeMatches(matches, nextSlice, nextYear, nextRound), teams, sports);
    const inSport = nextGroups.filter((item) => item.sportId === sportId);
    if (!inSport.length) {
      if (!nextGroups[0]) return;
      setSportId(nextGroups[0].sportId);
      setGender(nextGroups[0].gender);
      return;
    }
    if (!inSport.some((item) => item.gender === gender)) setGender(inSport[0].gender);
  };
  const sportGroups = groups.filter((item) => item.sportId === sportId);
  const group = sportGroups.find((item) => item.gender === gender) ?? sportGroups[0];
  const selectedSport = sports.find((sport) => sport.id === sportId);
  const editionLabel = slice === "valida" && round && year ? `${round} ${year}` : year ? String(year) : "Esta edición";
  const playerStats = group ? computePlayerStats(scoped, events, athletes, teams, group.sportId, group.gender) : [];

  const writeUrl = (nextView: View, nextSlice: Slice, nextYear: number | null, nextRound: string | null) => {
    const params = new URLSearchParams();
    if (nextView !== "tablas") params.set("vista", nextView);
    if (nextYear) params.set("ano", String(nextYear));
    if (nextSlice === "valida" && nextRound) params.set("valida", nextRound);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `/clasificacion?${query}` : "/clasificacion");
  };

  const pickSport = (id: string) => {
    setSportId(id);
    const next = groups.filter((item) => item.sportId === id);
    if (next.length && !next.some((item) => item.gender === gender)) setGender(next[0].gender);
  };

  const pickYear = (nextYear: number) => {
    const nextRound = defaultRound(validas, nextYear);
    setYear(nextYear);
    setRound(nextRound);
    followEdition(slice, nextYear, nextRound);
    writeUrl(view, slice, nextYear, nextRound);
  };

  const pickSlice = (next: Slice) => {
    const nextRound = round ?? defaultRound(validas, year);
    if (next === "valida" && nextRound) setRound(nextRound);
    setSlice(next);
    followEdition(next, year, nextRound);
    writeUrl(view, next, year, nextRound);
  };

  const pickRound = (nextRound: string, nextYear: number) => {
    setRound(nextRound);
    setYear(nextYear);
    followEdition("valida", nextYear, nextRound);
    writeUrl(view, "valida", nextYear, nextRound);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div className="relative">
            <p className="relative z-10 text-[11px] font-semibold tracking-[0.3em] text-brand-red uppercase">
              {view === "titulos" ? "Historial" : editionLabel}
            </p>
            <h1 className="font-jersey relative z-10 mt-0.5 text-[2.55rem] leading-[0.8] text-zinc-950 uppercase sm:mt-1 sm:text-8xl sm:leading-[0.82]">
              Clasificación
            </h1>
          </div>
          {view !== "titulos" ? (
            <p className="relative z-10 mt-2 max-w-md text-[13px] leading-snug text-zinc-500 sm:mt-3 sm:text-sm">
              {view === "tablas"
                ? "Posiciones, puntos y rendimiento de cada universidad. Elige la temporada o la válida que quieres ver."
                : "Goleadores, asistidores y MVP de la edición que elijas."}
            </p>
          ) : null}
        </div>
        {presenter ? <PresentedBy sponsor={presenter} label="Tabla oficial por" className="hidden self-auto sm:inline-flex" /> : null}
      </header>

      <Segmented
        value={view}
        onChange={(id) => {
          const next = id as View;
          setView(next);
          writeUrl(next, slice, year, round);
        }}
        options={[
          { id: "tablas", label: "Tabla" },
          { id: "jugadores", label: "Jugadores" },
          { id: "titulos", label: "Títulos" },
        ]}
        className="w-full"
      />

        {view !== "titulos" ? (
          <div className="space-y-5">
            <section aria-label="Elegir edición" className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => pickSlice("ano")}
                className={cn(
                  "inline-flex min-h-8 items-center text-[10px] font-semibold tracking-[0.18em] uppercase",
                  slice === "ano" ? "text-zinc-950" : "text-zinc-400",
                )}
              >
                Por año
              </button>
              {slice === "ano"
                ? years.map((edition) => (
                    <EditionLabel
                      key={edition.year}
                      active={edition.year === year}
                      label={`${edition.year}, ${EDITION_STATUS_LABEL[edition.status]}`}
                      onClick={() => pickYear(edition.year)}
                    >
                      {String(edition.year)}
                    </EditionLabel>
                  ))
                : null}
              <button
                type="button"
                onClick={() => pickSlice("valida")}
                className={cn(
                  "inline-flex min-h-8 items-center text-[10px] font-semibold tracking-[0.18em] uppercase",
                  slice === "ano" ? "ml-auto text-zinc-400" : "text-zinc-950",
                )}
              >
                Por válida
              </button>
              {slice === "valida"
                ? validas.map((edition) => (
                    <EditionLabel
                      key={`${edition.year}:${edition.round}`}
                      active={edition.year === year && edition.round === round}
                      label={`${edition.round} ${edition.year}, ${EDITION_STATUS_LABEL[edition.status]}`}
                      onClick={() => pickRound(edition.round, edition.year)}
                    >
                      {edition.round}
                    </EditionLabel>
                  ))
                : null}
            </section>

            <section aria-label="Elegir deporte y rama" className="space-y-2 md:space-y-3">
              <SportPicker
                dense
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
              <div key={`${group.id}:${editionLabel}`} className="space-y-5">
                <div className="hidden sm:block">
                  <SelectionTitle
                    title={group.sportName}
                    suffix={group.genderLabel}
                    meta={`${editionLabel} · ${group.finished} ${group.finished === 1 ? "resultado" : "resultados"}`}
                  />
                </div>
                {view === "tablas" ? <Table group={group} /> : <PlayerLeaders key={group.id} stats={playerStats} />}
              </div>
            ) : (
              <EmptySport name={selectedSport?.name ?? "este deporte"} edition={editionLabel} />
            )}
          </div>
        ) : (
          <TitleShelf
            universities={universities}
            titles={titles}
            athletes={athletes}
            teams={teams}
            sports={sports}
            editionYear={year}
          />
        )}

      {feedSponsor ? <SponsorFlyer sponsor={feedSponsor} context="Clasificación" /> : null}
    </div>
  );
}
