"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, NativeSelect } from "@/components/admin/field";
import {
  getSportFormKind,
  parseMatchDetails,
  type MatchDetailsPayload,
  type MatchEventDraft,
} from "@/lib/admin/sport";
import { finishMatch } from "@/app/admin/partidos/actions";
import type { AthleteOption, MatchRow } from "@/app/admin/partidos/types";

type ResultDialogProps = {
  match: MatchRow | null;
  athletes: AthleteOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function rosterForMatch(match: MatchRow, athletes: AthleteOption[]) {
  return athletes.filter(
    (athlete) =>
      athlete.isActive &&
      (athlete.teamId === match.homeTeamId || athlete.teamId === match.awayTeamId),
  );
}

export function ResultDialog({
  match,
  athletes,
  open,
  onOpenChange,
}: ResultDialogProps) {
  const [pending, startTransition] = useTransition();
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [mvpAthleteId, setMvpAthleteId] = useState("");
  const [details, setDetails] = useState<MatchDetailsPayload>({ kind: "football" });
  const [events, setEvents] = useState<MatchEventDraft[]>([]);

  const kind = match ? getSportFormKind(match.sportSlug) : "football";
  const roster = useMemo(
    () => (match ? rosterForMatch(match, athletes) : []),
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

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next && match) resetFromMatch(match);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Carga post-partido</DialogTitle>
          <DialogDescription>
            {match
              ? `${match.homeLabel} vs ${match.awayLabel} · ${match.sportName}`
              : "Selecciona un encuentro"}
          </DialogDescription>
        </DialogHeader>
        {match ? (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
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
                toast.add({ type: "success", title: "Partido finalizado" });
                onOpenChange(false);
              });
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label={`Marcador ${match.homeLabel}`}>
                <Input
                  type="number"
                  min={0}
                  value={homeScore}
                  onChange={(e) => setHomeScore(Number(e.target.value))}
                />
              </Field>
              <Field label={`Marcador ${match.awayLabel}`}>
                <Input
                  type="number"
                  min={0}
                  value={awayScore}
                  onChange={(e) => setAwayScore(Number(e.target.value))}
                />
              </Field>
            </div>

            {kind === "basketball" && details.kind === "basketball" ? (
              <div className="grid gap-2">
                <p className="text-sm font-medium">Parciales por cuarto</p>
                {(["q1", "q2", "q3", "q4"] as const).map((quarter) => (
                  <div key={quarter} className="grid grid-cols-[3rem_1fr_1fr] items-center gap-2">
                    <span className="text-xs uppercase text-muted-foreground">{quarter}</span>
                    <Input
                      type="number"
                      min={0}
                      value={details.quarters[quarter].home}
                      onChange={(e) =>
                        setDetails({
                          ...details,
                          quarters: {
                            ...details.quarters,
                            [quarter]: {
                              ...details.quarters[quarter],
                              home: Number(e.target.value),
                            },
                          },
                        })
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      value={details.quarters[quarter].away}
                      onChange={(e) =>
                        setDetails({
                          ...details,
                          quarters: {
                            ...details.quarters,
                            [quarter]: {
                              ...details.quarters[quarter],
                              away: Number(e.target.value),
                            },
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {kind === "sets" && details.kind === "sets" ? (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Sets</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setDetails({
                        ...details,
                        sets: [...details.sets, { home: 0, away: 0 }],
                      })
                    }
                  >
                    Añadir set
                  </Button>
                </div>
                {details.sets.map((set, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={set.home}
                      onChange={(e) => {
                        const sets = details.sets.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, home: Number(e.target.value) }
                            : item,
                        );
                        setDetails({ ...details, sets });
                      }}
                    />
                    <Input
                      type="number"
                      min={0}
                      value={set.away}
                      onChange={(e) => {
                        const sets = details.sets.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, away: Number(e.target.value) }
                            : item,
                        );
                        setDetails({ ...details, sets });
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <Field label="MVP (solo plantillas del partido)">
              <NativeSelect
                value={mvpAthleteId}
                onChange={(e) => setMvpAthleteId(e.target.value)}
              >
                <option value="">Sin MVP</option>
                {roster.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athleteLabel(athlete, match)}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            {(kind === "football" || kind === "basketball") && match ? (
              <EventsEditor
                match={match}
                roster={roster}
                kind={kind}
                events={events}
                onChange={setEvents}
              />
            ) : null}

            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando..." : "Marcar FINISHED"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function athleteLabel(athlete: AthleteOption, match: MatchRow) {
  const team = athlete.teamId === match.homeTeamId ? match.homeLabel : match.awayLabel;
  const number = athlete.jerseyNumber ? `#${athlete.jerseyNumber} ` : "";
  return `${team} · ${number}${athlete.fullName}`;
}

function EventsEditor({
  match,
  roster,
  kind,
  events,
  onChange,
}: {
  match: MatchRow;
  roster: AthleteOption[];
  kind: "football" | "basketball";
  events: MatchEventDraft[];
  onChange: (events: MatchEventDraft[]) => void;
}) {
  function addEvent() {
    const first = roster[0];
    if (!first) return;
    onChange([
      ...events,
      {
        teamId: first.teamId,
        athleteId: first.id,
        assistAthleteId: null,
        eventType: kind === "football" ? "goal" : "points",
        value: 1,
        detail: null,
      },
    ]);
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {kind === "football" ? "Goles, asistencias y tarjetas" : "Máximos anotadores"}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addEvent} disabled={roster.length === 0}>
          Añadir evento
        </Button>
      </div>
      {roster.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No hay atletas activos en las plantillas de estos dos equipos.
        </p>
      ) : null}
      {events.map((event, index) => {
        const teamAthletes = roster.filter((athlete) => athlete.teamId === event.teamId);
        return (
          <div key={index} className="grid gap-2 rounded-lg border border-border p-3">
            <div className="grid grid-cols-2 gap-2">
              <NativeSelect
                value={event.teamId}
                onChange={(e) => {
                  const teamId = e.target.value;
                  const nextAthlete = roster.find((athlete) => athlete.teamId === teamId);
                  const next = [...events];
                  next[index] = {
                    ...event,
                    teamId,
                    athleteId: nextAthlete?.id ?? "",
                    assistAthleteId: null,
                  };
                  onChange(next);
                }}
              >
                <option value={match.homeTeamId}>{match.homeLabel}</option>
                <option value={match.awayTeamId}>{match.awayLabel}</option>
              </NativeSelect>
              <NativeSelect
                value={event.athleteId}
                onChange={(e) => {
                  const next = [...events];
                  next[index] = { ...event, athleteId: e.target.value };
                  onChange(next);
                }}
              >
                {teamAthletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.fullName}
                  </option>
                ))}
              </NativeSelect>
            </div>
            {kind === "football" ? (
              <div className="grid grid-cols-2 gap-2">
                <NativeSelect
                  value={event.eventType}
                  onChange={(e) => {
                    const next = [...events];
                    next[index] = {
                      ...event,
                      eventType: e.target.value as MatchEventDraft["eventType"],
                    };
                    onChange(next);
                  }}
                >
                  <option value="goal">Gol</option>
                  <option value="yellow_card">Tarjeta amarilla</option>
                  <option value="red_card">Tarjeta roja</option>
                </NativeSelect>
                {event.eventType === "goal" ? (
                  <NativeSelect
                    value={event.assistAthleteId ?? ""}
                    onChange={(e) => {
                      const next = [...events];
                      next[index] = {
                        ...event,
                        assistAthleteId: e.target.value || null,
                      };
                      onChange(next);
                    }}
                  >
                    <option value="">Sin asistencia</option>
                    {teamAthletes
                      .filter((athlete) => athlete.id !== event.athleteId)
                      .map((athlete) => (
                        <option key={athlete.id} value={athlete.id}>
                          Asistencia: {athlete.fullName}
                        </option>
                      ))}
                  </NativeSelect>
                ) : (
                  <Input
                    type="number"
                    min={1}
                    value={event.value}
                    onChange={(e) => {
                      const next = [...events];
                      next[index] = { ...event, value: Number(e.target.value) };
                      onChange(next);
                    }}
                  />
                )}
              </div>
            ) : (
              <Input
                type="number"
                min={1}
                value={event.value}
                onChange={(e) => {
                  const next = [...events];
                  next[index] = { ...event, eventType: "points", value: Number(e.target.value) };
                  onChange(next);
                }}
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(events.filter((_, itemIndex) => itemIndex !== index))}
            >
              Quitar
            </Button>
          </div>
        );
      })}
    </div>
  );
}
