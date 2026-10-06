"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  CalendarXIcon,
  CircleCheckIcon,
  ChevronRightIcon,
  HistoryIcon,
  LayersIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  TrophyIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { MATCH_STATUS_LABELS } from "@/lib/admin/labels";
import { toDatetimeLocal } from "@/lib/admin/sport";
import { isResultPending, type GenderFilter } from "@/lib/admin/stats";
import { CompetitionFilters } from "@/components/admin/competition-filters";
import { deleteMatch } from "@/app/admin/(panel)/partidos/actions";
import { MatchFormDialog, type MatchDraft } from "@/app/admin/(panel)/partidos/match-form-dialog";
import { ResultDialog } from "@/app/admin/(panel)/partidos/result-dialog";
import { BulkMatchDialog } from "@/app/admin/(panel)/partidos/bulk-dialog";
import type {
  AthleteOption,
  MatchRow,
  MatchStatus,
  SportOption,
  TeamOption,
  UniversityOption,
} from "@/app/admin/(panel)/partidos/types";
import { cn } from "@/lib/utils";

type PartidosBoardProps = {
  sports: SportOption[];
  teams: TeamOption[];
  athletes: AthleteOption[];
  matches: MatchRow[];
  universities: UniversityOption[];
  initialResultId?: string;
  startNew?: boolean;
  view: "resultados" | "calendario";
};

const STATUS_STYLE: Record<MatchStatus, string> = {
  scheduled: "bg-rose-50 text-[#9e1b28]",
  live: "bg-emerald-50 text-emerald-700",
  finished: "bg-zinc-100 text-zinc-600",
  postponed: "bg-amber-50 text-amber-700",
  cancelled: "bg-amber-50 text-amber-700",
};

function emptyDraft(sports: SportOption[], teams: TeamOption[]): MatchDraft {
  const playable = sports.filter((sport) => teams.filter((team) => team.sportId === sport.id).length >= 2);
  const sportId = playable.length === 1 ? playable[0].id : "";
  const pool = teams.filter((team) => team.sportId === sportId);
  const pair = pool.length === 2 && pool[0].gender === pool[1].gender;
  return {
    sportId,
    gender: pair ? pool[0].gender : "male",
    homeUniversityId: pair ? pool[0].universityId : "",
    awayUniversityId: pair ? pool[1].universityId : "",
    matchDate: "",
    location: "",
    roundName: "Fase de grupos",
    status: "scheduled",
  };
}

export function PartidosBoard({
  sports,
  teams,
  athletes,
  matches,
  universities,
  initialResultId,
  startNew = false,
  view,
}: PartidosBoardProps) {
  const [formOpen, setFormOpen] = useState(startNew);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [draft, setDraft] = useState<MatchDraft>(() => emptyDraft(sports, teams));
  const [resultMatch, setResultMatch] = useState<MatchRow | null>(
    () => matches.find((match) => match.id === initialResultId) ?? null,
  );
  const [sportFilter, setSportFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [historyQuery, setHistoryQuery] = useState("");
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [pending, startTransition] = useTransition();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);

  const matchesBySport = useMemo(() => {
    const counts = new Map<string, number>();
    for (const match of matches) counts.set(match.sportId, (counts.get(match.sportId) ?? 0) + 1);
    return counts;
  }, [matches]);

  const { toLoad, upcoming, history } = useMemo(() => {
    const scoped = matches.filter(
      (match) =>
        (sportFilter === "all" || match.sportId === sportFilter) &&
        (genderFilter === "all" || teamById.get(match.homeTeamId)?.gender === genderFilter),
    );
    const byDateAsc = (a: MatchRow, b: MatchRow) => +new Date(a.matchDate) - +new Date(b.matchDate);
    const done = (match: MatchRow) => match.status === "finished" || match.status === "cancelled";
    return {
      toLoad: scoped
        .filter((match) => match.status === "live" || (!done(match) && +new Date(match.matchDate) < now))
        .sort(byDateAsc),
      upcoming: scoped
        .filter((match) => match.status !== "live" && !done(match) && +new Date(match.matchDate) >= now)
        .sort(byDateAsc),
      history: scoped.filter(done).sort((a, b) => byDateAsc(b, a)),
    };
  }, [matches, now, sportFilter, genderFilter, teamById]);

  const availableGenders = useMemo(
    () =>
      new Set(
        matches
          .filter((match) => sportFilter === "all" || match.sportId === sportFilter)
          .map((match) => teamById.get(match.homeTeamId)?.gender)
          .filter((gender): gender is TeamOption["gender"] => Boolean(gender)),
      ),
    [matches, sportFilter, teamById],
  );

  const filteredHistory = useMemo(() => {
    const needle = historyQuery
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .trim();
    return history.filter((match) => {
      if (!needle) return true;
      return `${match.homeLabel} ${match.awayLabel} ${match.sportName} ${match.roundName ?? ""}`
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .includes(needle);
    });
  }, [history, historyQuery]);
  const visibleHistory = showAllHistory ? filteredHistory : filteredHistory.slice(0, 10);

  const locations = useMemo(() => {
    const counts = new Map<string, number>();
    for (const match of matches) {
      if (match.location) counts.set(match.location, (counts.get(match.location) ?? 0) + 1);
    }
    return [...counts].sort((a, b) => b[1] - a[1]).map(([location]) => location);
  }, [matches]);

  function openNew() {
    setDraft(emptyDraft(sports, teams));
    setFormOpen(true);
  }

  function openEdit(match: MatchRow) {
    const homeTeam = teamById.get(match.homeTeamId);
    const awayTeam = teamById.get(match.awayTeamId);
    setDraft({
      id: match.id,
      sportId: match.sportId,
      gender: homeTeam?.gender ?? "male",
      homeUniversityId: homeTeam?.universityId ?? "",
      awayUniversityId: awayTeam?.universityId ?? "",
      matchDate: toDatetimeLocal(match.matchDate),
      location: match.location ?? "",
      roundName: match.roundName ?? "",
      status: match.status,
    });
    setFormOpen(true);
  }

  function remove(match: MatchRow) {
    if (!confirm("¿Eliminar este partido? También se borran sus estadísticas.")) return;
    startTransition(async () => {
      const result = await deleteMatch(match.id);
      if (!result.ok) {
        toast.add({ type: "error", title: "No se pudo eliminar", description: result.error });
        return;
      }
      toast.add({ type: "success", title: "Partido eliminado" });
    });
  }

  const upcomingDays = useMemo(() => {
    const days: { key: string; label: string; matches: MatchRow[] }[] = [];
    const today = new Date(now);
    const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const tomorrow = new Date(now + 86_400_000);
    for (const match of upcoming) {
      const date = new Date(match.matchDate);
      const key = dayKey(date);
      let day = days.at(-1);
      if (day?.key !== key) {
        const label =
          key === dayKey(today)
            ? "Hoy"
            : key === dayKey(tomorrow)
              ? "Mañana"
              : date.toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long" });
        day = { key, label, matches: [] };
        days.push(day);
      }
      day.matches.push(match);
    }
    return days;
  }, [upcoming, now]);

  const calendar = view === "calendario";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div className="px-1">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">{calendar ? "Calendario" : "Partidos"}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {calendar ? "Programa los partidos de cada jornada." : "Carga marcadores y estadísticas de los partidos jugados."}
        </p>
      </div>

      {calendar ? null : (
        <CompetitionFilters
          withAll
          sports={sports}
          sportId={sportFilter}
          onSportChange={(id) => {
            setSportFilter(id);
            setGenderFilter("all");
          }}
          counts={matchesBySport}
          gender={genderFilter}
          onGenderChange={setGenderFilter}
          availableGenders={availableGenders}
        />
      )}

      {calendar ? (
        <>
          <button
            type="button"
            onClick={openNew}
            className="group relative isolate flex w-full items-center gap-4 overflow-hidden rounded-3xl bg-linear-to-br from-[#e0233f] via-[#b5122b] to-[#6e0a18] p-5 text-left text-white shadow-[0_24px_48px_-24px_rgba(158,27,40,0.85)] ring-1 ring-white/10 transition-transform active:scale-[0.99] sm:p-6"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] [background-image:repeating-linear-gradient(-55deg,#fff_0_2px,transparent_2px_18px)]"
            />
            <span aria-hidden className="pointer-events-none absolute -top-24 -left-10 -z-10 size-64 rounded-full bg-[#ff5a6e]/40 blur-3xl" />
            <span aria-hidden className="pointer-events-none absolute -right-16 -bottom-24 -z-10 size-64 rounded-full bg-black/30 blur-3xl" />
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />
            <span className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-white/20 backdrop-blur-md">
              <PlusIcon className="size-7" />
            </span>
            <span className="relative min-w-0 flex-1">
              <span className="block text-xl font-semibold">Subir partido</span>
              <span className="block text-sm text-white/80">Deporte, equipos, fecha y sede en segundos</span>
            </span>
            <ChevronRightIcon className="relative size-6 shrink-0 text-white/70 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={() => setBulkOpen(true)}
            className="admin-surface -mt-5 flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors hover:bg-rose-50/40"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-brand-red ring-1 ring-rose-100">
              <LayersIcon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-zinc-950">Carga masiva</span>
              <span className="block text-xs text-zinc-500">Una jornada completa, todos contra todos o desde Excel</span>
            </span>
            <ChevronRightIcon className="size-5 shrink-0 text-zinc-300" />
          </button>

          {toLoad.length ? (
            <Link
              href="/admin/partidos"
              className="-mt-3 flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-100 hover:bg-amber-100/70"
            >
              <TrophyIcon className="size-4 shrink-0" />
              <span className="flex-1">
                {toLoad.length === 1 ? "1 partido espera resultado" : `${toLoad.length} partidos esperan resultado`}
              </span>
              <ChevronRightIcon className="size-4 shrink-0" />
            </Link>
          ) : null}

          <section className="space-y-3">
            <SectionTitle title="Próximos" count={upcoming.length} />
            {upcoming.length === 0 ? (
              <div className="admin-surface flex items-center gap-3 rounded-2xl px-5 py-4 text-sm text-zinc-500">
                <CalendarXIcon className="size-5 text-zinc-300" />
                No hay partidos programados.
              </div>
            ) : (
              upcomingDays.map((day) => (
                <div key={day.key} className="space-y-2">
                  <p className="px-1 pt-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase first-letter:uppercase">
                    {day.label}
                  </p>
                  <div className="admin-surface divide-y divide-zinc-100 overflow-hidden rounded-3xl">
                    {day.matches.map((match) => (
                      <CompactRow
                        key={match.id}
                        match={match}
                        home={teamById.get(match.homeTeamId)}
                        away={teamById.get(match.awayTeamId)}
                        onOpen={() => openEdit(match)}
                        onDelete={() => remove(match)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      ) : (
        <>
          <section className="space-y-3">
            <SectionTitle title="Por cargar" count={toLoad.length} hint="Ya se jugaron o están en vivo" />
            {toLoad.length === 0 ? (
              <div className="admin-surface flex items-center gap-3 rounded-2xl px-5 py-4">
                <CircleCheckIcon className="size-6 shrink-0 text-emerald-500" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-zinc-900">Todo al día</span>
                  <span className="block text-xs text-zinc-500">
                    {upcoming[0]
                      ? `Próximo: ${upcoming[0].homeLabel.split(" · ")[0]} vs ${upcoming[0].awayLabel.split(" · ")[0]} · ${new Date(upcoming[0].matchDate).toLocaleDateString("es-VE", { weekday: "short", day: "numeric", month: "short" })}`
                      : "No hay resultados pendientes."}
                  </span>
                </span>
                <Link
                  href="/admin/calendario"
                  className="-my-2 inline-flex min-h-9 shrink-0 items-center text-sm font-semibold text-brand-red hover:underline"
                >
                  Calendario
                </Link>
              </div>
            ) : (
              toLoad.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  home={teamById.get(match.homeTeamId)}
                  away={teamById.get(match.awayTeamId)}
                  busy={pending}
                  now={now}
                  onResult={() => setResultMatch(match)}
                  onDelete={() => remove(match)}
                />
              ))
            )}
          </section>

          {upcoming.length ? (
            <section className="space-y-3">
              <SectionTitle title="Pendientes" count={upcoming.length} hint="Se cargan cuando empiecen" />
              <div className="admin-surface divide-y divide-zinc-100 overflow-hidden rounded-3xl">
                {upcoming.map((match) => (
                  <CompactRow
                    key={match.id}
                    match={match}
                    home={teamById.get(match.homeTeamId)}
                    away={teamById.get(match.awayTeamId)}
                    tag={match.status === "postponed" ? "Aplazado" : "Pendiente"}
                    onOpen={() =>
                      toast.add({
                        title: "Aún no empieza",
                        description: "Podrás cargar el resultado cuando llegue la hora. Para cambiar fecha o sede ve a Calendario.",
                      })
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <SectionTitle title="Jugados" count={history.length} hint="Toca uno para corregir" />
            {history.length > 4 ? (
              <label className="relative block">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={historyQuery}
                  onChange={(event) => setHistoryQuery(event.target.value)}
                  placeholder="Buscar por universidad, deporte o fase"
                  className="h-12 w-full rounded-2xl bg-white pr-4 pl-11 text-sm text-zinc-900 ring-1 ring-rose-100 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-red/30"
                />
              </label>
            ) : null}
            {history.length === 0 ? (
              <div className="admin-surface flex items-center gap-3 rounded-2xl px-5 py-4 text-sm text-zinc-500">
                <HistoryIcon className="size-5 text-zinc-300" />
                Aún no hay partidos jugados.
              </div>
            ) : filteredHistory.length === 0 ? (
              <p className="px-1 py-4 text-sm text-zinc-500">Nada con ese filtro.</p>
            ) : (
              <div className="admin-surface divide-y divide-zinc-100 overflow-hidden rounded-3xl">
                {visibleHistory.map((match) => (
                  <CompactRow
                    key={match.id}
                    match={match}
                    home={teamById.get(match.homeTeamId)}
                    away={teamById.get(match.awayTeamId)}
                    onOpen={() => setResultMatch(match)}
                    onEdit={() => setResultMatch(match)}
                    onDelete={() => remove(match)}
                  />
                ))}
                {filteredHistory.length > 10 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllHistory((value) => !value)}
                    className="block w-full py-3.5 text-center text-sm font-semibold text-brand-red hover:bg-rose-50/50"
                  >
                    {showAllHistory ? "Ver menos" : `Ver los ${filteredHistory.length}`}
                  </button>
                ) : null}
              </div>
            )}
          </section>
        </>
      )}

      <MatchFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={draft}
        sports={sports}
        teams={teams}
        universities={universities}
        locations={locations}
      />

      <BulkMatchDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        sports={sports}
        teams={teams}
        universities={universities}
        locations={locations}
      />

      <ResultDialog
        match={resultMatch}
        athletes={athletes}
        teams={teams}
        open={Boolean(resultMatch)}
        onOpenChange={(open) => {
          if (!open) setResultMatch(null);
        }}
      />
    </div>
  );
}

function SectionTitle({ title, count, hint }: { title: string; count: number; hint?: string }) {
  return (
    <div className="flex items-baseline gap-2 px-1">
      <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
      {count ? <span className="text-sm font-semibold text-brand-red">{count}</span> : null}
      {hint ? <span className="ml-auto text-xs text-zinc-400">{hint}</span> : null}
    </div>
  );
}

function CompactRow({
  match,
  home,
  away,
  onOpen,
  onEdit,
  onDelete,
  tag,
}: {
  match: MatchRow;
  home: TeamOption | undefined;
  away: TeamOption | undefined;
  tag?: string;
  onOpen: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const date = new Date(match.matchDate);
  const played = match.status === "finished";
  return (
    <div className="flex items-center gap-1 pr-2 transition-colors hover:bg-rose-50/40">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 py-3.5 pl-4 text-left">
        <span className="w-11 shrink-0 text-center">
          <span className="block text-[10px] font-semibold uppercase text-brand-red">
            {date.toLocaleDateString("es-VE", { month: "short" })}
          </span>
          <span className="block text-xl leading-none font-semibold text-zinc-950">{date.getDate()}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-zinc-900">
            <MiniCrest team={home} />
            {home?.universityShort ?? match.homeLabel.split(" · ")[0]}
            <span className="font-normal text-zinc-400">vs</span>
            <MiniCrest team={away} />
            {away?.universityShort ?? match.awayLabel.split(" · ")[0]}
          </span>
          <span className="block truncate text-xs text-zinc-500">
            {match.sportName}
            {match.status === "cancelled" ? " · Suspendido" : match.roundName ? ` · ${match.roundName}` : ""}
          </span>
        </span>
        {played ? (
          <span className="flex shrink-0 items-center gap-1.5 text-2xl leading-none font-bold tabular-nums text-zinc-950 sm:text-[26px]">
            <span className={cn((match.homeScore ?? 0) < (match.awayScore ?? 0) && "text-zinc-400")}>
              {match.homeScore ?? 0}
            </span>
            <span className="text-base font-medium text-zinc-300">-</span>
            <span className={cn((match.awayScore ?? 0) < (match.homeScore ?? 0) && "text-zinc-400")}>
              {match.awayScore ?? 0}
            </span>
          </span>
        ) : (
          <span className="flex shrink-0 flex-col items-end gap-1 text-right text-sm font-semibold tabular-nums text-zinc-950">
            {date.toLocaleTimeString("es-VE", { hour: "numeric", minute: "2-digit" })}
            {tag ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase ring-1 ring-amber-100">
                {tag}
              </span>
            ) : null}
          </span>
        )}
      </button>
      {onEdit ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEdit}
          aria-label="Editar resultado"
          className="size-10 shrink-0 rounded-xl text-zinc-400 hover:bg-white hover:text-zinc-900"
        >
          <PencilIcon />
        </Button>
      ) : (
        <ChevronRightIcon className="size-5 shrink-0 text-zinc-300" />
      )}
      {onDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label="Eliminar partido"
          className="size-10 shrink-0 rounded-xl text-zinc-300 hover:bg-white hover:text-brand-red"
        >
          <Trash2Icon />
        </Button>
      ) : null}
    </div>
  );
}

function MiniCrest({ team }: { team: TeamOption | undefined }) {
  if (!team?.logoUrl) return null;
  return <img src={team.logoUrl} alt="" className="size-5 shrink-0 rounded-full object-contain" />;
}

function MatchCard({
  match,
  home,
  away,
  busy,
  now,
  onResult,
  onEdit,
  onDelete,
}: {
  match: MatchRow;
  home: TeamOption | undefined;
  away: TeamOption | undefined;
  busy: boolean;
  now: number;
  onResult: () => void;
  onEdit?: () => void;
  onDelete: () => void;
}) {
  const finished = match.status === "finished";
  const needsResult = isResultPending(match, now);
  const time = new Date(match.matchDate).toLocaleTimeString("es-VE", { hour: "numeric", minute: "2-digit" });

  return (
    <article
      className={cn(
        "admin-surface overflow-hidden rounded-3xl",
        needsResult && "ring-2 ring-brand-red/25",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-5 pt-4">
        <p className="truncate text-xs font-medium text-zinc-500">
          {match.sportName}
          {match.roundName ? ` · ${match.roundName}` : ""}
        </p>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            needsResult ? "bg-brand-red text-white" : STATUS_STYLE[match.status],
          )}
        >
          {needsResult ? "Sin cargar" : MATCH_STATUS_LABELS[match.status]}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-5">
        <TeamSide team={home} fallback={match.homeLabel} />
        <div className="text-center">
          {finished || match.status === "live" ? (
            <p className="text-3xl font-bold tracking-tight tabular-nums text-zinc-950">
              {match.homeScore ?? 0}
              <span className="mx-1.5 text-zinc-300">-</span>
              {match.awayScore ?? 0}
            </p>
          ) : (
            <p className="text-xl font-semibold tabular-nums text-zinc-950">{time}</p>
          )}
        </div>
        <TeamSide team={away} fallback={match.awayLabel} />
      </div>

      {match.location ? (
        <p className="flex items-center justify-center gap-1.5 px-5 pb-4 text-xs text-zinc-500">
          <MapPinIcon className="size-3.5" />
          {match.location}
        </p>
      ) : null}

      <div className="flex items-center gap-2 border-t border-zinc-100 bg-zinc-50/60 px-3 py-2.5">
        <Button
          type="button"
          onClick={onResult}
          className={cn(
            "h-11 flex-1 rounded-2xl text-sm font-semibold",
            needsResult || match.status === "live"
              ? adminLaserCtaClass
              : "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-rose-50 hover:text-[#9e1b28]",
          )}
        >
          <TrophyIcon />
          {finished ? "Resultado y estadísticas" : match.status === "live" ? "Actualizar marcador" : "Cargar resultado"}
        </Button>
        {onEdit ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onEdit}
            aria-label="Editar partido"
            className="size-11 rounded-2xl text-zinc-500 hover:bg-white hover:text-zinc-900"
          >
            <PencilIcon />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          onClick={onDelete}
          disabled={busy}
          aria-label="Eliminar partido"
          className="size-11 rounded-2xl text-zinc-400 hover:bg-white hover:text-brand-red"
        >
          <Trash2Icon />
        </Button>
      </div>
    </article>
  );
}

function TeamSide({ team, fallback }: { team: TeamOption | undefined; fallback: string }) {
  const name = team?.universityShort ?? fallback.split(" · ")[0];
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      {team?.logoUrl ? (
        <img
          src={team.logoUrl}
          alt=""
          className="size-14 rounded-full bg-white object-contain p-1.5 shadow-[0_8px_20px_-12px_rgba(24,24,27,0.5)] ring-1 ring-zinc-100"
        />
      ) : (
        <span className="grid size-14 place-items-center rounded-full bg-rose-50 text-sm font-bold text-[#9e1b28] ring-1 ring-rose-100">
          {name.slice(0, 3).toUpperCase()}
        </span>
      )}
      <span className="w-full truncate text-sm font-semibold text-zinc-900">{name}</span>
    </div>
  );
}
