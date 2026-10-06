"use client";

import { useMemo, useState } from "react";
import {
  CalendarCheckIcon,
  CrownIcon,
  GaugeIcon,
  GoalIcon,
  HandshakeIcon,
  SearchIcon,
  ShieldCheckIcon,
  SquareIcon,
  StarIcon,
  TargetIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/admin-chrome";
import { CompetitionFilters, TeamCrest } from "@/components/admin/competition-filters";
import type { MatchBoardData } from "@/app/admin/(panel)/partidos/data";
import { GENDER_LABELS } from "@/lib/admin/labels";
import { getSportFormKind } from "@/lib/admin/sport";
import { cloudinaryThumb } from "@/lib/public/media";
import { computePlayerStats, type GenderFilter, type PlayerStatRow } from "@/lib/admin/stats";
import { cn } from "@/lib/utils";

type Metric = "goals" | "assists" | "points" | "average" | "mvps" | "cards" | "cleanSheets";

type Column = {
  id: Metric | "games";
  label: string;
  unit: string;
  icon: typeof GoalIcon;
  value: (row: PlayerStatRow) => number;
  format?: (value: number) => string;
};

const VALUE: Record<Metric | "games", (row: PlayerStatRow) => number> = {
  goals: (row) => row.goals,
  assists: (row) => row.assists,
  points: (row) => row.points,
  average: (row) => (row.games ? row.points / row.games : 0),
  mvps: (row) => row.mvps,
  cards: (row) => row.yellow + row.red * 2,
  cleanSheets: (row) => row.cleanSheets,
  games: (row) => row.games,
};

const LEADER_CARDS: Record<
  "football" | "basketball" | "other",
  { metric: Metric; title: string; unit: string; icon: typeof GoalIcon }[]
> = {
  football: [
    { metric: "goals", title: "Goleadores", unit: "goles", icon: GoalIcon },
    { metric: "assists", title: "Asistencias", unit: "asist.", icon: HandshakeIcon },
    { metric: "cleanSheets", title: "Porterías a 0", unit: "partidos", icon: ShieldCheckIcon },
    { metric: "mvps", title: "MVP", unit: "veces", icon: StarIcon },
    { metric: "cards", title: "Tarjetas", unit: "pts disc.", icon: SquareIcon },
  ],
  basketball: [
    { metric: "points", title: "Anotadores", unit: "pts", icon: TargetIcon },
    { metric: "average", title: "Promedio", unit: "pts/pj", icon: GaugeIcon },
    { metric: "mvps", title: "MVP", unit: "veces", icon: StarIcon },
  ],
  other: [{ metric: "mvps", title: "MVP", unit: "veces", icon: StarIcon }],
};

const COLUMNS: Record<"football" | "basketball" | "other", Column[]> = {
  football: [
    { id: "goals", label: "Goles", unit: "goles", icon: GoalIcon, value: VALUE.goals },
    { id: "assists", label: "Asistencias", unit: "asist.", icon: HandshakeIcon, value: VALUE.assists },
    { id: "cleanSheets", label: "Porterías a 0", unit: "partidos", icon: ShieldCheckIcon, value: VALUE.cleanSheets },
    { id: "cards", label: "Tarjetas", unit: "pts disc.", icon: SquareIcon, value: VALUE.cards },
    { id: "mvps", label: "MVP", unit: "veces", icon: StarIcon, value: VALUE.mvps },
    { id: "games", label: "Partidos", unit: "PJ", icon: CalendarCheckIcon, value: VALUE.games },
  ],
  basketball: [
    { id: "points", label: "Puntos", unit: "pts", icon: TargetIcon, value: VALUE.points },
    {
      id: "average",
      label: "Promedio",
      unit: "pts/pj",
      icon: GaugeIcon,
      value: VALUE.average,
      format: (value) => value.toFixed(1),
    },
    { id: "mvps", label: "MVP", unit: "veces", icon: StarIcon, value: VALUE.mvps },
    { id: "games", label: "Partidos", unit: "PJ", icon: CalendarCheckIcon, value: VALUE.games },
  ],
  other: [
    { id: "mvps", label: "MVP", unit: "veces", icon: StarIcon, value: VALUE.mvps },
    { id: "games", label: "Partidos", unit: "PJ", icon: CalendarCheckIcon, value: VALUE.games },
  ],
};

export function EstadisticasBoard({ sports, teams, athletes, matches }: MatchBoardData) {
  const sportsWithTeams = useMemo(
    () => sports.filter((sport) => teams.some((team) => team.sportId === sport.id)),
    [sports, teams],
  );
  const [sportId, setSportId] = useState(sportsWithTeams[0]?.id ?? "");
  const [gender, setGender] = useState<GenderFilter>("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<Column["id"] | null>(null);

  const sport = sports.find((item) => item.id === sportId);
  const formKind = getSportFormKind(sport?.slug ?? "");
  const kind = formKind === "football" || formKind === "basketball" ? formKind : "other";
  const columns = COLUMNS[kind];
  const activeColumn = columns.find((column) => column.id === sortBy) ?? columns[0];
  const activeSort = activeColumn.id;

  const availableGenders = useMemo(
    () => new Set(teams.filter((team) => team.sportId === sportId).map((team) => team.gender)),
    [teams, sportId],
  );

  const stats = useMemo(
    () => computePlayerStats(matches, athletes, teams, sportId, gender),
    [matches, athletes, teams, sportId, gender],
  );

  const sortValue = VALUE[activeSort];
  const needle = query.trim().toLowerCase();
  const sorted = stats
    .filter((row) => sortValue(row) > 0)
    .filter(
      (row) =>
        !needle ||
        row.athlete.fullName.toLowerCase().includes(needle) ||
        row.team?.universityShort.toLowerCase().includes(needle),
    )
    .sort((a, b) => sortValue(b) - sortValue(a) || a.athlete.fullName.localeCompare(b.athlete.fullName));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <AdminPageHeader
        kicker="Competición"
        title="Estadísticas"
        description="Los números salen de lo que cargas en cada partido: goles, asistencias, tarjetas, puntos y MVP."
      />

      <CompetitionFilters
        sports={sports}
        sportId={sportId}
        onSportChange={(id) => {
          setSportId(id);
          setGender("all");
          setSortBy(null);
        }}
        gender={gender}
        onGenderChange={setGender}
        availableGenders={availableGenders}
      />

      <div
        className={cn(
          "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 sm:-mx-6 sm:scroll-px-6 sm:px-6",
          LEADER_CARDS[kind].length === 1
            ? "lg:mx-auto lg:grid lg:max-w-60 lg:px-0"
            : LEADER_CARDS[kind].length === 3
              ? "lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0"
              : "xl:mx-0 xl:grid xl:grid-cols-5 xl:gap-4 xl:overflow-visible xl:px-0",
        )}
      >
        {LEADER_CARDS[kind].map((card) => (
          <LeaderCard
            key={card.metric}
            className="w-44 shrink-0 snap-start sm:w-48 lg:w-auto"
            title={card.title}
            unit={card.unit}
            icon={card.icon}
            rows={stats}
            value={VALUE[card.metric]}
            format={card.metric === "average" ? (value) => value.toFixed(1) : undefined}
          />
        ))}
      </div>

      <section className="admin-surface overflow-hidden rounded-3xl">
        <div className="grid gap-4 border-b border-zinc-100 px-4 pt-5 pb-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">Ranking de jugadores</h2>
              <p className="text-xs text-zinc-500">
                {activeColumn.label} · {sorted.length} {sorted.length === 1 ? "jugador" : "jugadores"}
              </p>
            </div>
            <div className="relative sm:w-64">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar jugador o universidad"
                className="h-10 rounded-full bg-white pl-10"
              />
            </div>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
            {columns.map((column) => {
              const active = column.id === activeSort;
              const Icon = column.icon;
              return (
                <button
                  key={column.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSortBy(column.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.97]",
                    active
                      ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white"
                      : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:text-zinc-950 hover:ring-[#C8102E]/40",
                  )}
                >
                  <Icon className="size-4" />
                  {column.label}
                </button>
              );
            })}
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <activeColumn.icon className="mx-auto size-7 text-rose-200" />
            <p className="mt-3 text-sm text-zinc-500">
              {query
                ? "Nadie coincide con la búsqueda."
                : `Todavía no hay ${activeColumn.label.toLowerCase()} registrados en esta disciplina.`}
            </p>
            {!query ? (
              <p className="mt-1 text-xs text-zinc-400">
                Se llenan al cargar el resultado de un partido en{" "}
                <span className="font-semibold text-zinc-600">Partidos</span>.
              </p>
            ) : null}
          </div>
        ) : (
          <ol className="grid gap-2 p-3 sm:p-4 lg:grid-cols-2">
            {sorted.map((row, index) => (
              <li
                key={row.athlete.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 ring-1",
                  index === 0 ? "bg-linear-to-r from-[#fde4e3]/80 to-white ring-rose-100" : "bg-white ring-zinc-100",
                )}
              >
                <RankBadge rank={index + 1} />
                <SquarePhoto row={row} size={120} className="size-12 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm leading-tight font-semibold break-words text-zinc-950">
                    {row.athlete.fullName}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                    {row.team?.universityShort}
                    {row.team ? ` · ${GENDER_LABELS[row.team.gender]}` : ""}
                    {row.athlete.jerseyNumber ? ` · #${row.athlete.jerseyNumber}` : ""}
                  </p>
                </div>
                {activeSort === "cards" ? (
                  <span className="flex shrink-0 items-center gap-2 text-sm font-black tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block h-4 w-3 rounded-[3px] bg-amber-400" />
                      {row.yellow}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block h-4 w-3 rounded-[3px] bg-[#C8102E]" />
                      {row.red}
                    </span>
                  </span>
                ) : (
                  <p className="shrink-0 text-right">
                    <span className="block text-2xl leading-none font-black text-zinc-950 tabular-nums italic">
                      {activeColumn.format ? activeColumn.format(activeColumn.value(row)) : activeColumn.value(row)}
                    </span>
                    <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">
                      {activeColumn.unit}
                    </span>
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const medal =
    rank === 1
      ? "bg-linear-to-br from-amber-300 to-amber-500 text-amber-950"
      : rank === 2
        ? "bg-linear-to-br from-zinc-200 to-zinc-400 text-zinc-800"
        : rank === 3
          ? "bg-linear-to-br from-orange-200 to-orange-400 text-orange-950"
          : "bg-zinc-100 text-zinc-500";
  return (
    <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-xs font-black", medal)}>{rank}</span>
  );
}

function SquarePhoto({ row, size, className }: { row: PlayerStatRow; size: number; className?: string }) {
  if (row.athlete.photoUrl) {
    return (
      <img
        src={cloudinaryThumb(row.athlete.photoUrl, size) ?? row.athlete.photoUrl}
        alt=""
        className={cn("shrink-0 bg-zinc-100 object-cover object-top ring-1 ring-zinc-200/70", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center bg-zinc-100 ring-1 ring-zinc-200/70",
        className,
      )}
    >
      <TeamCrest
        bare
        logoUrl={row.team?.logoUrl ?? null}
        label={row.team?.universityShort ?? "?"}
        className="size-3/5"
      />
    </span>
  );
}

function LeaderCard({
  className,
  title,
  unit,
  icon: Icon,
  rows,
  value,
  format,
}: {
  className?: string;
  title: string;
  unit: string;
  icon: typeof GoalIcon;
  rows: PlayerStatRow[];
  value: (row: PlayerStatRow) => number;
  format?: (value: number) => string;
}) {
  const top = rows
    .filter((row) => value(row) > 0)
    .sort((a, b) => value(b) - value(a))
    .slice(0, 3);
  const [leader, ...rest] = top;

  const show = (row: PlayerStatRow) => (format ? format(value(row)) : value(row));

  return (
    <section
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_8px_24px_-18px_rgba(24,24,27,0.25)] ring-1 ring-zinc-200/70",
        className,
      )}
    >
      <div className="relative overflow-hidden bg-linear-to-br from-[#e0233f] via-[#C8102E] to-[#8a0b20] px-3 pt-3 pb-8">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_10px,rgba(255,255,255,0.06)_10px_20px)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -top-10 -right-8 size-28 rounded-full bg-white/20 blur-2xl"
        />
        <div className="relative flex items-center justify-between gap-2">
          <p className="text-[11px] font-black tracking-[0.18em] text-white uppercase italic">{title}</p>
          <span className="grid size-7 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25">
            <Icon className="size-3.5" />
          </span>
        </div>
      </div>

      <div className="relative -mt-6 px-2">
        {leader ? (
          <div className="relative aspect-square overflow-hidden rounded-2xl ring-2 ring-white">
            <SquarePhoto
              row={leader}
              size={480}
              className="size-full rounded-2xl ring-0 transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-zinc-950/80 via-zinc-950/30 to-transparent" />
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-linear-to-r from-amber-300 to-amber-500 px-2 py-0.5 text-[10px] font-black text-amber-950 shadow-sm">
              <CrownIcon className="size-3" /> #1
            </span>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm leading-tight font-bold break-words text-white sm:text-base">
                  {leader.athlete.fullName}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-white/75 uppercase">
                  {leader.team?.universityShort}
                </p>
              </div>
              <p className="shrink-0 text-right text-white">
                <span className="block text-4xl leading-none font-black tabular-nums italic drop-shadow">
                  {show(leader)}
                </span>
                <span className="text-[9px] font-bold tracking-widest text-white/75 uppercase">{unit}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-rose-200 bg-linear-to-br from-[#fde4e3]/70 to-white text-center ring-2 ring-white">
            <span>
              <Icon className="mx-auto size-6 text-rose-300" />
              <span className="mt-2 block text-xs font-semibold text-zinc-400">Aún sin datos</span>
            </span>
          </div>
        )}
      </div>

      <div className="grid flex-1 content-start gap-1.5 px-2 pt-2 pb-2">
        {[0, 1].map((slot) => {
          const row = rest[slot];
          return row ? (
            <div key={row.athlete.id} className="flex items-center gap-2 rounded-xl bg-zinc-50 px-1.5 py-1.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white text-[10px] font-black text-[#C8102E] ring-1 ring-rose-100">
                {slot + 2}
              </span>
              <SquarePhoto row={row} size={96} className="size-8 rounded-lg" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-xs leading-tight font-semibold break-words text-zinc-800">
                  {row.athlete.fullName}
                </span>
                <span className="block text-[10px] font-medium text-zinc-400">{row.team?.universityShort}</span>
              </span>
              <span className="shrink-0 text-base font-black text-zinc-950 tabular-nums italic">{show(row)}</span>
            </div>
          ) : (
            <div
              key={slot}
              className="flex h-11 items-center gap-2 rounded-xl border border-dashed border-zinc-200 px-1.5 text-[11px] text-zinc-300"
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-black ring-1 ring-zinc-200">
                {slot + 2}
              </span>
              Sin registro
            </div>
          );
        })}
      </div>
    </section>
  );
}
