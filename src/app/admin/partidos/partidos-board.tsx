"use client";

import { useMemo, useState, useTransition } from "react";
import { PencilIcon, PlusIcon, TrophyIcon, Trash2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, NativeSelect } from "@/components/admin/field";
import { MATCH_STATUS_LABELS } from "@/lib/admin/labels";
import { toDatetimeLocal } from "@/lib/admin/sport";
import { deleteMatch, upsertMatch } from "@/app/admin/partidos/actions";
import { ResultDialog } from "@/app/admin/partidos/result-dialog";
import type {
  AthleteOption,
  MatchRow,
  MatchStatus,
  SportOption,
  TeamOption,
} from "@/app/admin/partidos/types";

type PartidosBoardProps = {
  sports: SportOption[];
  teams: TeamOption[];
  athletes: AthleteOption[];
  matches: MatchRow[];
};

type MatchDraft = {
  id?: string;
  sportId: string;
  homeTeamId: string;
  awayTeamId: string;
  matchDate: string;
  location: string;
  roundName: string;
  status: MatchStatus;
};

const STATUS_FILTERS = ["all", "scheduled", "live", "finished"] as const;

function emptyDraft(sports: SportOption[]): MatchDraft {
  return {
    sportId: sports[0]?.id ?? "",
    homeTeamId: "",
    awayTeamId: "",
    matchDate: toDatetimeLocal(new Date().toISOString()),
    location: "",
    roundName: "Fase de grupos",
    status: "scheduled",
  };
}

function statusClass(status: MatchStatus) {
  if (status === "live") {
    return "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
  }
  if (status === "finished") {
    return "border-zinc-700 bg-zinc-900 text-zinc-300";
  }
  return "border-zinc-700 bg-transparent text-zinc-400";
}

export function PartidosBoard({
  sports,
  teams,
  athletes,
  matches,
}: PartidosBoardProps) {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [sportFilter, setSportFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<MatchDraft>(() => emptyDraft(sports));
  const [resultMatch, setResultMatch] = useState<MatchRow | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      matches.filter((match) => {
        const statusOk =
          statusFilter === "all" ? true : match.status === statusFilter;
        const sportOk = sportFilter === "all" ? true : match.sportId === sportFilter;
        return statusOk && sportOk;
      }),
    [matches, sportFilter, statusFilter],
  );

  const sportTeams = teams.filter((team) => team.sportId === draft.sportId);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#C8102E]">
            Mesa técnica
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">Partidos</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Calendario, filtros por disciplina y carga post-partido adaptativa.
          </p>
        </div>
        <Button
          type="button"
          className="h-11 border-0 bg-linear-to-r from-red-600 to-rose-800 px-5 text-white shadow-[0_0_25px_rgba(200,16,46,0.35)] hover:from-red-500 hover:to-rose-700"
          onClick={() => {
            setDraft(emptyDraft(sports));
            setFormOpen(true);
          }}
        >
          <PlusIcon />
          Nuevo partido
        </Button>
      </div>

      <Card className="border-zinc-800/80 bg-zinc-950 shadow-none">
        <CardHeader className="border-b border-zinc-800/80">
          <CardTitle className="text-zinc-100">Encuentros</CardTitle>
          <CardDescription className="text-zinc-400">
            Filtra por estado operativo y por deporte. El formulario de resultado
            solo muestra atletas activos de los dos equipos.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as (typeof STATUS_FILTERS)[number])
              }
            >
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="scheduled">SCHEDULED</TabsTrigger>
                <TabsTrigger value="live">LIVE</TabsTrigger>
                <TabsTrigger value="finished">FINISHED</TabsTrigger>
              </TabsList>
            </Tabs>
            <NativeSelect
              value={sportFilter}
              onChange={(event) => setSportFilter(event.target.value)}
              className="lg:max-w-xs"
            >
              <option value="all">Todas las disciplinas</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Encuentro</TableHead>
                <TableHead>Deporte</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No hay partidos para este filtro. Crea un encuentro o revisa
                    que existan equipos en esa disciplina.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>
                      <div className="font-medium">
                        {match.homeLabel} vs {match.awayLabel}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {match.location || "Sede por confirmar"}
                        {match.status === "finished"
                          ? ` · ${match.homeScore ?? 0}-${match.awayScore ?? 0}`
                          : null}
                      </div>
                    </TableCell>
                    <TableCell>{match.sportName}</TableCell>
                    <TableCell>
                      {new Date(match.matchDate).toLocaleString("es-VE", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell>{match.roundName || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusClass(match.status)}>
                        {MATCH_STATUS_LABELS[match.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className="text-zinc-500 transition-colors hover:bg-transparent hover:text-red-500"
                          onClick={() => {
                            setDraft({
                              id: match.id,
                              sportId: match.sportId,
                              homeTeamId: match.homeTeamId,
                              awayTeamId: match.awayTeamId,
                              matchDate: toDatetimeLocal(match.matchDate),
                              location: match.location ?? "",
                              roundName: match.roundName ?? "",
                              status: match.status,
                            });
                            setFormOpen(true);
                          }}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className="text-zinc-500 transition-colors hover:bg-transparent hover:text-red-500"
                          onClick={() => setResultMatch(match)}
                        >
                          <TrophyIcon />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className="text-zinc-500 transition-colors hover:bg-transparent hover:text-red-500"
                          onClick={() => {
                            if (!confirm("¿Eliminar este partido?")) return;
                            startTransition(async () => {
                              const result = await deleteMatch(match.id);
                              if (!result.ok) {
                                toast.add({
                                  type: "error",
                                  title: "No se pudo eliminar",
                                  description: result.error,
                                });
                              }
                            });
                          }}
                          disabled={pending}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Editar partido" : "Nuevo partido"}</DialogTitle>
            <DialogDescription>
              Local y visitante se filtran por la disciplina seleccionada.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await upsertMatch(draft);
                if (!result.ok) {
                  toast.add({
                    type: "error",
                    title: "No se pudo guardar",
                    description: result.error,
                  });
                  return;
                }
                toast.add({ type: "success", title: "Partido guardado" });
                setFormOpen(false);
              });
            }}
          >
            <Field label="Deporte">
              <NativeSelect
                value={draft.sportId}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    sportId: event.target.value,
                    homeTeamId: "",
                    awayTeamId: "",
                  })
                }
                required
              >
                <option value="" disabled>
                  Selecciona un deporte
                </option>
                {sports.map((sport) => (
                  <option key={sport.id} value={sport.id}>
                    {sport.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Equipo local">
                <NativeSelect
                  value={draft.homeTeamId}
                  onChange={(event) =>
                    setDraft({ ...draft, homeTeamId: event.target.value })
                  }
                  required
                >
                  <option value="">Selecciona local</option>
                  {sportTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.label}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Equipo visitante">
                <NativeSelect
                  value={draft.awayTeamId}
                  onChange={(event) =>
                    setDraft({ ...draft, awayTeamId: event.target.value })
                  }
                  required
                >
                  <option value="">Selecciona visitante</option>
                  {sportTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.label}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>
            <Field label="Fecha y hora">
              <Input
                type="datetime-local"
                value={draft.matchDate}
                onChange={(event) =>
                  setDraft({ ...draft, matchDate: event.target.value })
                }
                required
              />
            </Field>
            <Field label="Sede">
              <Input
                value={draft.location}
                onChange={(event) =>
                  setDraft({ ...draft, location: event.target.value })
                }
                placeholder="Cancha, complejo o recinto"
              />
            </Field>
            <Field label="Fase">
              <Input
                value={draft.roundName}
                onChange={(event) =>
                  setDraft({ ...draft, roundName: event.target.value })
                }
                placeholder="Fase de grupos, Semifinal..."
              />
            </Field>
            <Field label="Estado">
              <NativeSelect
                value={draft.status}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    status: event.target.value as MatchStatus,
                  })
                }
              >
                <option value="scheduled">SCHEDULED</option>
                <option value="live">LIVE</option>
                <option value="finished">FINISHED</option>
                <option value="postponed">POSTPONED</option>
                <option value="cancelled">CANCELLED</option>
              </NativeSelect>
            </Field>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando..." : "Guardar partido"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ResultDialog
        match={resultMatch}
        athletes={athletes}
        open={Boolean(resultMatch)}
        onOpenChange={(open) => {
          if (!open) setResultMatch(null);
        }}
      />
    </div>
  );
}
