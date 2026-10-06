"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  CrownIcon,
  MinusIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TeamCrest } from "@/components/admin/competition-filters";
import { adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { ImageUploader } from "@/components/admin/image-uploader";
import { athleteUploadPath } from "@/lib/cloudinary-paths";
import {
  getSportFormKind,
  parseMatchDetails,
  type MatchDetailsPayload,
  type MatchEventDraft,
} from "@/lib/admin/sport";
import { finishMatch, setAthletePhoto } from "@/app/admin/(panel)/partidos/actions";
import type { AthleteOption, MatchRow, TeamOption } from "@/app/admin/(panel)/partidos/types";
import { cn } from "@/lib/utils";

type ResultDialogProps = {
  match: MatchRow | null;
  athletes: AthleteOption[];
  teams: TeamOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Tab = "goals" | "cards" | "points" | "quarters" | "sets" | "mvp";

type Picker =
  | { mode: "goal"; teamId: string }
  | { mode: "assist"; teamId: string; scorerId: string; eventIndex?: number }
  | { mode: "card"; card: "yellow_card" | "red_card" }
  | { mode: "points" }
  | { mode: "mvp" };

const GENDER_LABEL = { male: "Masculino", female: "Femenino", mixed: "Mixto" } as const;

const TABS: Record<ReturnType<typeof getSportFormKind>, { id: Tab; label: string }[]> = {
  football: [
    { id: "goals", label: "Goles" },
    { id: "cards", label: "Tarjetas" },
    { id: "mvp", label: "MVP" },
  ],
  basketball: [
    { id: "points", label: "Puntos" },
    { id: "quarters", label: "Cuartos" },
    { id: "mvp", label: "MVP" },
  ],
  sets: [
    { id: "sets", label: "Sets" },
    { id: "mvp", label: "MVP" },
  ],
  chess: [{ id: "mvp", label: "MVP" }],
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

export function ResultDialog({ match, athletes, teams, open, onOpenChange }: ResultDialogProps) {
  const [pending, startTransition] = useTransition();
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [mvpAthleteId, setMvpAthleteId] = useState("");
  const [details, setDetails] = useState<MatchDetailsPayload>({ kind: "football" });
  const [events, setEvents] = useState<MatchEventDraft[]>([]);
  const [tab, setTab] = useState<Tab>("goals");
  const [picker, setPicker] = useState<Picker | null>(null);
  const [query, setQuery] = useState("");

  const kind = match ? getSportFormKind(match.sportSlug) : "football";
  const home = teams.find((team) => team.id === match?.homeTeamId);
  const away = teams.find((team) => team.id === match?.awayTeamId);
  const roster = useMemo(
    () =>
      match
        ? athletes
            .filter(
              (athlete) =>
                athlete.isActive && (athlete.teamId === match.homeTeamId || athlete.teamId === match.awayTeamId),
            )
            .sort((a, b) => (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999) || a.fullName.localeCompare(b.fullName))
        : [],
    [athletes, match],
  );
  const athleteById = useMemo(
    () =>
      new Map(
        athletes
          .filter((athlete) => match && (athlete.teamId === match.homeTeamId || athlete.teamId === match.awayTeamId))
          .map((athlete) => [athlete.id, athlete]),
      ),
    [athletes, match],
  );

  useEffect(() => {
    if (open && match) resetFromMatch(match);
  }, [open, match]);

  function resetFromMatch(next: MatchRow) {
    const sportKind = getSportFormKind(next.sportSlug);
    setHomeScore(next.homeScore ?? 0);
    setAwayScore(next.awayScore ?? 0);
    setMvpAthleteId(next.mvpAthleteId ?? "");
    setDetails(parseMatchDetails(sportKind, next.matchDetails));
    setTab(TABS[sportKind][0].id);
    setPicker(null);
    setEvents(
      next.events
        .filter((event) =>
          sportKind === "football"
            ? ["goal", "yellow_card", "red_card"].includes(event.eventType)
            : event.eventType === "points",
        )
        .map((event) => ({
          teamId: event.teamId,
          athleteId: event.athleteId,
          assistAthleteId: event.assistAthleteId,
          eventType: event.eventType as MatchEventDraft["eventType"],
          value: event.value,
          detail: event.detail,
        })),
    );
  }

  function openPicker(next: Picker) {
    setQuery("");
    setPicker(next);
  }

  function addGoal(teamId: string, scorerId: string, assistId: string | null) {
    const nextEvents: MatchEventDraft[] = [
      ...events,
      { teamId, athleteId: scorerId, assistAthleteId: assistId, eventType: "goal", value: 1, detail: null },
    ];
    setEvents(nextEvents);
    const goals = nextEvents.filter((event) => event.eventType === "goal" && event.teamId === teamId).length;
    if (teamId === match?.homeTeamId) setHomeScore((score) => Math.max(score, goals));
    else setAwayScore((score) => Math.max(score, goals));
  }

  function choose(athlete: AthleteOption | null) {
    if (!picker) return;
    if (picker.mode === "goal" && athlete) {
      openPicker({ mode: "assist", teamId: picker.teamId, scorerId: athlete.id });
      return;
    }
    if (picker.mode === "assist") {
      const { eventIndex } = picker;
      if (eventIndex === undefined) addGoal(picker.teamId, picker.scorerId, athlete?.id ?? null);
      else
        setEvents(
          events.map((event, itemIndex) =>
            itemIndex === eventIndex ? { ...event, assistAthleteId: athlete?.id ?? null } : event,
          ),
        );
    }
    if (picker.mode === "card" && athlete) {
      setEvents([
        ...events,
        { teamId: athlete.teamId, athleteId: athlete.id, assistAthleteId: null, eventType: picker.card, value: 1, detail: null },
      ]);
    }
    if (picker.mode === "points" && athlete) {
      if (!events.some((event) => event.eventType === "points" && event.athleteId === athlete.id)) {
        setEvents([
          ...events,
          { teamId: athlete.teamId, athleteId: athlete.id, assistAthleteId: null, eventType: "points", value: 2, detail: null },
        ]);
      }
    }
    if (picker.mode === "mvp" && athlete) setMvpAthleteId(athlete.id);
    setPicker(null);
  }

  function removeEvent(index: number) {
    setEvents(events.filter((_, itemIndex) => itemIndex !== index));
  }

  function setPoints(index: number, value: number) {
    setEvents(events.map((event, itemIndex) => (itemIndex === index ? { ...event, value: Math.max(0, value) } : event)));
  }

  if (!match) return null;

  const tabs = TABS[kind];
  const finished = match.status === "finished";
  const goals = events.map((event, index) => ({ event, index })).filter(({ event }) => event.eventType === "goal");
  const cards = events
    .map((event, index) => ({ event, index }))
    .filter(({ event }) => event.eventType === "yellow_card" || event.eventType === "red_card");
  const scorers = events.map((event, index) => ({ event, index })).filter(({ event }) => event.eventType === "points");
  const mvp = mvpAthleteId ? athleteById.get(mvpAthleteId) : undefined;
  const teamOf = (teamId: string) => (teamId === match.homeTeamId ? home : away);

  const pickerTeams =
    picker?.mode === "goal" || picker?.mode === "assist"
      ? [picker.teamId]
      : [match.homeTeamId, match.awayTeamId];
  const needle = normalize(query);
  const pickerTitle = !picker
    ? ""
    : picker.mode === "goal"
      ? `¿Quién anotó para ${teamOf(picker.teamId)?.universityShort ?? ""}?`
      : picker.mode === "assist"
        ? "¿Quién dio la asistencia?"
        : picker.mode === "card"
          ? picker.card === "yellow_card"
            ? "Tarjeta amarilla para…"
            : "Tarjeta roja para…"
          : picker.mode === "points"
            ? "Agregar anotador"
            : "Elige el MVP";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) resetFromMatch(match);
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex! max-h-[94dvh] flex-col gap-0 overflow-hidden p-0! max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none! sm:max-w-xl">
        <div className="shrink-0 px-5 pt-5 pb-4 sm:px-7">
          <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-zinc-200 sm:hidden" />
          <DialogTitle className="text-center text-xl font-semibold text-zinc-950">
            {finished ? "Editar resultado" : "Cargar resultado"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-center text-sm">
            {match.sportName}
            {home ? ` · ${GENDER_LABEL[home.gender]}` : ""}
            {match.roundName ? ` · ${match.roundName}` : ""}
          </DialogDescription>

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <ScoreSide team={home} label={match.homeLabel} value={homeScore} onChange={setHomeScore} />
            <span className="pt-6 text-2xl font-light text-zinc-300">:</span>
            <ScoreSide team={away} label={match.awayLabel} value={awayScore} onChange={setAwayScore} />
          </div>

          {tabs.length > 1 ? (
            <div className="mt-4 grid gap-1 rounded-2xl bg-zinc-100 p-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "rounded-xl py-2 text-sm font-semibold transition-all",
                    tab === item.id ? "bg-white text-[#9e1b28] shadow-sm" : "text-zinc-500 hover:text-zinc-800",
                  )}
                >
                  {item.label}
                  {item.id === "goals" && goals.length ? <span className="ml-1 text-xs text-zinc-400">{goals.length}</span> : null}
                  {item.id === "cards" && cards.length ? <span className="ml-1 text-xs text-zinc-400">{cards.length}</span> : null}
                  {item.id === "points" && scorers.length ? <span className="ml-1 text-xs text-zinc-400">{scorers.length}</span> : null}
                  {item.id === "mvp" && mvp ? <span className="ml-1 text-xs text-amber-500">★</span> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto border-t border-rose-100/70 px-5 pt-5 pb-8 sm:px-7">
          {[home, away].map((team) =>
            team && !roster.some((athlete) => athlete.teamId === team.id) ? (
              <Link
                key={team.id}
                href={`/admin/equipos?equipo=${team.id}`}
                className="mb-3 flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-100"
              >
                <UserPlusIcon className="size-4 shrink-0" />
                <span className="flex-1">
                  <b>{team.universityShort}</b> no tiene jugadores en {match.sportName}. Agrégalos en Equipos.
                </span>
              </Link>
            ) : null,
          )}

          {tab === "goals" ? (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                {[home, away].map((team) => {
                  if (!team) return null;
                  const count = goals.filter(({ event }) => event.teamId === team.id).length;
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => openPicker({ mode: "goal", teamId: team.id })}
                      className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-white p-3 text-left shadow-[0_10px_24px_-18px_rgba(24,24,27,0.45)] ring-1 ring-zinc-200/80 transition-all hover:-translate-y-0.5 hover:ring-[#C8102E]/40 active:scale-[0.98]"
                    >
                      <span aria-hidden className="pointer-events-none absolute -right-6 -bottom-8 size-20 rounded-full bg-[#f4c7c5]/40 blur-2xl" />
                      <TeamCrest logoUrl={team.logoUrl} label={team.universityShort} bare className="relative size-9 shrink-0" />
                      <span className="relative min-w-0 flex-1">
                        <span className="block text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">
                          {count ? `${count} ${count === 1 ? "gol" : "goles"}` : "Agregar"}
                        </span>
                        <span className="block truncate text-[15px] font-bold text-zinc-950">Gol {team.universityShort}</span>
                      </span>
                      <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white shadow-[0_8px_16px_-8px_rgba(200,16,46,0.9)] transition-transform group-hover:scale-105">
                        <PlusIcon className="size-4" strokeWidth={2.6} />
                      </span>
                    </button>
                  );
                })}
              </div>
              {goals.length === 0 ? (
                <Empty text="Toca “Gol” y elige al jugador que anotó." />
              ) : (
                <ul className="admin-surface divide-y divide-zinc-100 overflow-hidden rounded-2xl">
                  {goals.map(({ event, index }) => {
                    const scorer = athleteById.get(event.athleteId);
                    const assist = event.assistAthleteId ? athleteById.get(event.assistAthleteId) : undefined;
                    return (
                      <EventRow
                        key={index}
                        icon="⚽"
                        team={teamOf(event.teamId)}
                        title={scorer?.fullName ?? "Jugador"}
                        subtitle={
                          <button
                            type="button"
                            onClick={() =>
                              openPicker({ mode: "assist", teamId: event.teamId, scorerId: event.athleteId, eventIndex: index })
                            }
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full text-xs transition-colors",
                              assist
                                ? "text-zinc-500 hover:text-zinc-900"
                                : "mt-0.5 bg-rose-50 px-2 py-0.5 font-semibold text-[#C8102E] ring-1 ring-rose-100 hover:bg-rose-100",
                            )}
                          >
                            {assist ? (
                              <>
                                <span className="truncate">Asistencia: {assist.fullName}</span>
                                <PencilIcon className="size-3 shrink-0" />
                              </>
                            ) : (
                              <>
                                <PlusIcon className="size-3" /> Agregar asistencia
                              </>
                            )}
                          </button>
                        }
                        onRemove={() => removeEvent(index)}
                      />
                    );
                  })}
                </ul>
              )}
              {goals.length ? (
                <p className="text-center text-xs text-zinc-500">
                  {goals.filter(({ event }) => event.assistAthleteId).length} de {goals.length}{" "}
                  {goals.length === 1 ? "gol" : "goles"} con asistencia · toca un gol para cambiarla
                </p>
              ) : null}
            </div>
          ) : null}

          {tab === "cards" ? (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => openPicker({ mode: "card", card: "yellow_card" })}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold text-zinc-900 ring-1 ring-amber-200 active:bg-amber-50"
                >
                  <span className="h-4 w-3 rounded-[3px] bg-amber-400" />
                  Amarilla
                </button>
                <button
                  type="button"
                  onClick={() => openPicker({ mode: "card", card: "red_card" })}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold text-zinc-900 ring-1 ring-rose-200 active:bg-rose-50"
                >
                  <span className="h-4 w-3 rounded-[3px] bg-[#C8102E]" />
                  Roja
                </button>
              </div>
              {cards.length === 0 ? (
                <Empty text="Sin tarjetas en este partido." />
              ) : (
                <ul className="admin-surface divide-y divide-zinc-100 overflow-hidden rounded-2xl">
                  {cards.map(({ event, index }) => (
                    <EventRow
                      key={index}
                      icon={
                        <span
                          className={cn(
                            "block h-5 w-3.5 rounded-[3px]",
                            event.eventType === "yellow_card" ? "bg-amber-400" : "bg-[#C8102E]",
                          )}
                        />
                      }
                      team={teamOf(event.teamId)}
                      title={athleteById.get(event.athleteId)?.fullName ?? "Jugador"}
                      subtitle={event.eventType === "yellow_card" ? "Tarjeta amarilla" : "Tarjeta roja"}
                      onRemove={() => removeEvent(index)}
                    />
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {tab === "points" ? (
            <div className="grid gap-4">
              <button
                type="button"
                onClick={() => openPicker({ mode: "points" })}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold text-zinc-900 ring-1 ring-rose-100 hover:ring-[#C8102E]/40"
              >
                <PlusIcon className="size-4 text-[#C8102E]" />
                Agregar anotador
              </button>
              {scorers.length === 0 ? (
                <Empty text="Agrega a los jugadores que anotaron y sus puntos." />
              ) : (
                <ul className="admin-surface divide-y divide-zinc-100 overflow-hidden rounded-2xl">
                  {scorers.map(({ event, index }) => (
                    <li key={index} className="flex items-center gap-3 px-4 py-3">
                      <TeamCrest logoUrl={teamOf(event.teamId)?.logoUrl ?? null} label={teamOf(event.teamId)?.universityShort ?? ""} bare className="size-6" />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900">
                        {athleteById.get(event.athleteId)?.fullName ?? "Jugador"}
                      </span>
                      <Stepper value={event.value} onChange={(value) => setPoints(index, value)} />
                      <button
                        type="button"
                        aria-label="Quitar"
                        onClick={() => removeEvent(index)}
                        className="grid size-8 place-items-center rounded-lg text-zinc-300 hover:bg-rose-50 hover:text-[#C8102E]"
                      >
                        <XIcon className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {tab === "quarters" && details.kind === "basketball" ? (
            <div className="admin-surface grid gap-2 rounded-2xl p-4">
              <div className="grid grid-cols-[3rem_1fr_1fr] gap-2 text-center text-xs font-semibold text-zinc-500">
                <span />
                <span>{home?.universityShort}</span>
                <span>{away?.universityShort}</span>
              </div>
              {(["q1", "q2", "q3", "q4"] as const).map((quarter, index) => (
                <div key={quarter} className="grid grid-cols-[3rem_1fr_1fr] items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-500">{index + 1}º</span>
                  {(["home", "away"] as const).map((side) => (
                    <input
                      key={side}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={details.quarters[quarter][side]}
                      onChange={(event) =>
                        setDetails({
                          ...details,
                          quarters: {
                            ...details.quarters,
                            [quarter]: { ...details.quarters[quarter], [side]: Number(event.target.value) },
                          },
                        })
                      }
                      className="h-11 rounded-xl bg-white text-center text-lg font-semibold tabular-nums ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-[#C8102E]/30"
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : null}

          {tab === "sets" && details.kind === "sets" ? (
            <div className="grid gap-3">
              <div className="admin-surface grid gap-2 rounded-2xl p-4">
                <div className="grid grid-cols-[3rem_1fr_1fr_2rem] gap-2 text-center text-xs font-semibold text-zinc-500">
                  <span />
                  <span>{home?.universityShort}</span>
                  <span>{away?.universityShort}</span>
                  <span />
                </div>
                {details.sets.map((set, index) => (
                  <div key={index} className="grid grid-cols-[3rem_1fr_1fr_2rem] items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-500">Set {index + 1}</span>
                    {(["home", "away"] as const).map((side) => (
                      <input
                        key={side}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={set[side]}
                        onChange={(event) =>
                          setDetails({
                            ...details,
                            sets: details.sets.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, [side]: Number(event.target.value) } : item,
                            ),
                          })
                        }
                        className="h-11 rounded-xl bg-white text-center text-lg font-semibold tabular-nums ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-[#C8102E]/30"
                      />
                    ))}
                    <button
                      type="button"
                      aria-label="Quitar set"
                      onClick={() => setDetails({ ...details, sets: details.sets.filter((_, itemIndex) => itemIndex !== index) })}
                      className="grid size-8 place-items-center rounded-lg text-zinc-300 hover:bg-rose-50 hover:text-[#C8102E]"
                    >
                      <XIcon className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setDetails({ ...details, sets: [...details.sets, { home: 0, away: 0 }] })}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold text-zinc-900 ring-1 ring-rose-100"
              >
                <PlusIcon className="size-4 text-[#C8102E]" />
                Añadir set
              </button>
            </div>
          ) : null}

          {tab === "mvp" ? (
            <div className="grid gap-4">
              {mvp ? (
                <div className="admin-surface flex items-center gap-4 rounded-2xl p-4">
                  <PlayerAvatar athlete={mvp} className="size-16 rounded-2xl" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 text-xs font-bold tracking-wide text-amber-600 uppercase">
                      <CrownIcon className="size-3.5" /> MVP del partido
                    </p>
                    <p className="truncate text-lg font-semibold text-zinc-950">{mvp.fullName}</p>
                    <p className="text-xs text-zinc-500">
                      {teamOf(mvp.teamId)?.universityShort}
                      {mvp.jerseyNumber ? ` · #${mvp.jerseyNumber}` : ""}
                      {mvp.position ? ` · ${mvp.position}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Quitar MVP"
                    onClick={() => setMvpAthleteId("")}
                    className="grid size-9 place-items-center rounded-xl text-zinc-300 hover:bg-rose-50 hover:text-[#C8102E]"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => openPicker({ mode: "mvp" })}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold text-zinc-900 ring-1 ring-amber-200 hover:bg-amber-50/50"
              >
                <CrownIcon className="size-4 text-amber-500" />
                {mvp ? "Cambiar MVP" : "Elegir MVP"}
              </button>
              {mvp ? (
                <MvpPhoto key={mvp.id} athlete={mvp} team={teamOf(mvp.teamId)} sportSlug={match.sportSlug} />
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-rose-100/70 bg-[#fbf7f7] px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 sm:py-4">
          <Button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await finishMatch({
                  matchId: match.id,
                  homeScore,
                  awayScore,
                  mvpAthleteId: mvpAthleteId || null,
                  matchDetails: details,
                  events,
                });
                if (!result.ok) {
                  toast.add({ type: "error", title: "No se pudo guardar", description: result.error });
                  return;
                }
                toast.add({ type: "success", title: finished ? "Resultado actualizado" : "Resultado guardado" });
                onOpenChange(false);
              })
            }
            className={cn(adminLaserCtaClass, "h-12 w-full rounded-2xl text-[15px] font-semibold")}
          >
            {pending ? "Guardando..." : `Guardar ${homeScore} - ${awayScore}`}
          </Button>
        </div>

        {picker ? (
          <div className="absolute inset-0 z-20 flex flex-col bg-[#fbf8f8] duration-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="relative shrink-0 overflow-hidden border-b border-rose-100/70 bg-white px-5 pt-5 pb-4 sm:px-7">
              <span aria-hidden className="pointer-events-none absolute -top-20 left-1/2 size-56 -translate-x-1/2 rounded-full bg-[#f4c7c5]/40 blur-3xl" />
              <div className="relative flex items-center gap-2">
                {picker.mode === "assist" && picker.eventIndex === undefined ? (
                  <button
                    type="button"
                    aria-label="Volver"
                    onClick={() => openPicker({ mode: "goal", teamId: picker.teamId })}
                    className="grid size-9 place-items-center rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    <ChevronLeftIcon className="size-5" />
                  </button>
                ) : (
                  <span className="size-9" />
                )}
                <div className="min-w-0 flex-1 text-center">
                  {picker.mode === "goal" || picker.mode === "assist" ? (
                    <p className="text-[11px] font-bold tracking-[0.14em] text-[#C8102E] uppercase">
                      {picker.mode === "assist" && picker.eventIndex !== undefined
                        ? "Asistencia"
                        : picker.mode === "goal"
                          ? "Paso 1 de 2 · Goleador"
                          : "Paso 2 de 2 · Asistencia"}
                    </p>
                  ) : null}
                  <p className="truncate text-lg font-semibold text-zinc-950">{pickerTitle}</p>
                </div>
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={() => setPicker(null)}
                  className="grid size-9 place-items-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                >
                  <XIcon className="size-5" />
                </button>
              </div>
              {picker.mode === "assist" ? (
                <div className="relative mt-3 flex items-center justify-center gap-2 text-sm text-zinc-600">
                  <span className="text-base">⚽</span>
                  Gol de <b className="text-zinc-900">{athleteById.get(picker.scorerId)?.fullName}</b>
                </div>
              ) : null}
              {roster.length > 6 ? (
                <label className="relative mt-3 block">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar por nombre o número"
                    className="h-11 w-full rounded-2xl bg-zinc-50 pr-4 pl-11 text-sm ring-1 ring-zinc-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#C8102E]/30"
                  />
                </label>
              ) : null}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              {pickerTeams.map((teamId) => {
                const team = teamOf(teamId);
                const players = roster.filter(
                  (athlete) =>
                    athlete.teamId === teamId &&
                    !(picker.mode === "assist" && athlete.id === picker.scorerId) &&
                    (!needle ||
                      normalize(athlete.fullName).includes(needle) ||
                      String(athlete.jerseyNumber ?? "") === needle),
                );
                const current =
                  picker.mode === "mvp"
                    ? mvpAthleteId
                    : picker.mode === "assist" && picker.eventIndex !== undefined
                      ? events[picker.eventIndex]?.assistAthleteId
                      : null;
                return (
                  <div key={teamId} className="mb-6 last:mb-0">
                    <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
                      <TeamCrest logoUrl={team?.logoUrl ?? null} label={team?.universityShort ?? ""} bare className="size-6" />
                      {team?.universityShort}
                      <span className="text-xs font-normal text-zinc-400">
                        {players.length} {players.length === 1 ? "jugador" : "jugadores"}
                      </span>
                    </p>
                    {players.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-4 py-5 text-center text-sm text-zinc-500">
                        {needle ? (
                          "Nadie con ese nombre."
                        ) : (
                          <>
                            Este equipo no tiene más jugadores.{" "}
                            <Link href={`/admin/equipos?equipo=${teamId}`} className="font-semibold text-[#C8102E]">
                              Agregar
                            </Link>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {players.map((athlete) => {
                          const selected = current === athlete.id;
                          return (
                            <button
                              key={athlete.id}
                              type="button"
                              onClick={() => choose(athlete)}
                              className={cn(
                                "group relative flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_8px_24px_-18px_rgba(24,24,27,0.5)] ring-1 transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(24,24,27,0.55)] active:scale-[0.98]",
                                selected ? "ring-2 ring-[#C8102E]" : "ring-zinc-200/80",
                              )}
                            >
                              <span className="relative block aspect-square w-full bg-zinc-100">
                                <PlayerAvatar athlete={athlete} className="size-full text-2xl" />
                                {athlete.jerseyNumber ? (
                                  <span className="absolute top-2 left-2 grid min-w-7 place-items-center rounded-full bg-zinc-950/80 px-1.5 py-0.5 text-xs font-bold text-white tabular-nums backdrop-blur">
                                    {athlete.jerseyNumber}
                                  </span>
                                ) : null}
                                {selected ? (
                                  <span className="absolute top-2 right-2 rounded-full bg-[#C8102E] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                                    Elegido
                                  </span>
                                ) : null}
                              </span>
                              <span className="block px-3 pt-2.5 pb-3">
                                <span className="line-clamp-2 text-sm leading-tight font-semibold text-zinc-950">
                                  {athlete.fullName}
                                </span>
                                <span className="mt-0.5 block truncate text-[11px] text-zinc-500">
                                  {athlete.position ?? "Jugador"}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {picker.mode === "assist" ? (
              <div className="shrink-0 border-t border-rose-100/70 bg-white px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
                <button
                  type="button"
                  onClick={() => choose(null)}
                  className="h-12 w-full rounded-2xl bg-zinc-100 text-[15px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-200"
                >
                  Sin asistencia
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ScoreSide({
  team,
  label,
  value,
  onChange,
}: {
  team: TeamOption | undefined;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <TeamCrest logoUrl={team?.logoUrl ?? null} label={team?.universityShort ?? label} bare className="size-12" />
      <span className="max-w-full truncate text-sm font-semibold text-zinc-700">
        {team?.universityShort ?? label.split(" · ")[0]}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Restar"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="grid size-9 place-items-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
        >
          <MinusIcon className="size-4" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value}
          onChange={(event) => onChange(Math.max(0, Number(event.target.value)))}
          className="w-14 bg-transparent text-center text-4xl font-bold tabular-nums text-zinc-950 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label="Sumar"
          onClick={() => onChange(value + 1)}
          className="grid size-9 place-items-center rounded-full bg-[#C8102E] text-white shadow-[0_8px_16px_-8px_rgba(200,16,46,0.9)]"
        >
          <PlusIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Restar"
        onClick={() => onChange(value - 1)}
        className="grid size-8 place-items-center rounded-full bg-zinc-100 text-zinc-600"
      >
        <MinusIcon className="size-3.5" />
      </button>
      <span className="w-8 text-center text-lg font-bold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Sumar"
        onClick={() => onChange(value + 1)}
        className="grid size-8 place-items-center rounded-full bg-[#C8102E] text-white"
      >
        <PlusIcon className="size-3.5" />
      </button>
    </div>
  );
}

function EventRow({
  icon,
  team,
  title,
  subtitle,
  onRemove,
}: {
  icon: React.ReactNode;
  team: TeamOption | undefined;
  title: string;
  subtitle: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="grid w-6 shrink-0 place-items-center text-lg">{icon}</span>
      <TeamCrest logoUrl={team?.logoUrl ?? null} label={team?.universityShort ?? ""} bare className="size-6" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-zinc-900">{title}</span>
        <span className="block truncate text-xs text-zinc-500">{subtitle}</span>
      </span>
      <button
        type="button"
        aria-label="Quitar"
        onClick={onRemove}
        className="grid size-8 place-items-center rounded-lg text-zinc-300 hover:bg-rose-50 hover:text-[#C8102E]"
      >
        <XIcon className="size-4" />
      </button>
    </li>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-500">{text}</p>;
}

function PlayerAvatar({ athlete, className }: { athlete: AthleteOption; className?: string }) {
  if (athlete.photoUrl) {
    return <img src={athlete.photoUrl} alt="" className={cn("shrink-0 bg-zinc-100 object-cover", className)} />;
  }
  const initials = athlete.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return (
    <span className={cn("grid shrink-0 place-items-center bg-rose-50 text-base font-bold text-[#C8102E]", className)}>
      {initials}
    </span>
  );
}

function MvpPhoto({
  athlete,
  team,
  sportSlug,
}: {
  athlete: AthleteOption;
  team: TeamOption | undefined;
  sportSlug: string;
}) {
  return (
    <div className="grid gap-2 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
      <p className="text-sm font-semibold text-zinc-900">Foto del MVP</p>
      <p className="text-xs text-zinc-500">Sale en el carrusel de MVP y en la ficha del jugador. Mejor vertical y centrada.</p>
      <ImageUploader
        folder="jugadores"
        path={
          team
            ? athleteUploadPath({ universityShort: team.universityShort, sportSlug, gender: team.gender })
            : undefined
        }
        label={athlete.photoUrl ? "Cambiar foto" : "Subir foto"}
        initialUrl={athlete.photoUrl}
        onUploaded={async (asset) => {
          const result = await setAthletePhoto(athlete.id, asset.secureUrl);
          if (!result.ok) toast.add({ type: "error", title: "No se guardó la foto", description: result.error });
        }}
      />
    </div>
  );
}
