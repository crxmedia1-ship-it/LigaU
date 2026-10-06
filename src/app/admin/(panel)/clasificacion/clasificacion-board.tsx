"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClockIcon, CrownIcon, InfoIcon, TrophyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-chrome";
import { CompetitionFilters, TeamCrest } from "@/components/admin/competition-filters";
import { ResultDialog } from "@/app/admin/(panel)/partidos/result-dialog";
import type { MatchBoardData } from "@/app/admin/(panel)/partidos/data";
import type { MatchRow } from "@/app/admin/(panel)/partidos/types";
import { GENDER_LABELS } from "@/lib/admin/labels";
import { getSportFormKind } from "@/lib/admin/sport";
import {
  computeAdminStandings,
  isResultPending,
  type GenderFilter,
} from "@/lib/admin/stats";
import { cn } from "@/lib/utils";

const SCORE_LABELS = {
  football: ["GF", "GC", "DG"],
  basketball: ["PF", "PC", "Dif"],
  sets: ["SF", "SC", "Dif"],
  chess: ["PF", "PC", "Dif"],
} as const;

const FORM_STYLES = {
  W: "bg-emerald-500",
  D: "bg-zinc-300",
  L: "bg-brand-red",
} as const;

export function ClasificacionBoard({ sports, teams, athletes, matches }: MatchBoardData) {
  const sportsWithTeams = useMemo(
    () => sports.filter((sport) => teams.some((team) => team.sportId === sport.id)),
    [sports, teams],
  );
  const [sportId, setSportId] = useState(sportsWithTeams[0]?.id ?? "");
  const [gender, setGender] = useState<GenderFilter>("all");
  const [resultMatch, setResultMatch] = useState<MatchRow | null>(null);

  const sport = sports.find((item) => item.id === sportId);
  const kind = getSportFormKind(sport?.slug ?? "");
  const [scored, conceded, diff] = SCORE_LABELS[kind];

  const availableGenders = useMemo(
    () => new Set(teams.filter((team) => team.sportId === sportId).map((team) => team.gender)),
    [teams, sportId],
  );

  const rows = useMemo(
    () => computeAdminStandings(matches, teams, sportId, gender),
    [matches, teams, sportId, gender],
  );

  const teamIds = new Set(rows.map((row) => row.team.id));
  const pending = matches
    .filter(
      (match) =>
        match.sportId === sportId &&
        isResultPending(match) &&
        (teamIds.has(match.homeTeamId) || teamIds.has(match.awayTeamId)),
    )
    .sort((a, b) => +new Date(a.matchDate) - +new Date(b.matchDate));
  const finishedCount = matches.filter(
    (match) =>
      match.sportId === sportId &&
      match.status === "finished" &&
      (teamIds.has(match.homeTeamId) || teamIds.has(match.awayTeamId)),
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <AdminPageHeader
        kicker="Competición"
        title="Clasificación"
        description="La tabla se calcula sola con cada resultado que guardas en Partidos: 3 puntos por victoria, 1 por empate."
      />

      <CompetitionFilters
        sports={sports}
        sportId={sportId}
        onSportChange={(id) => {
          setSportId(id);
          setGender("all");
        }}
        gender={gender}
        onGenderChange={setGender}
        availableGenders={availableGenders}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="admin-surface overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-rose-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-zinc-950">
                {sport?.name ?? "Disciplina"}
                {gender !== "all" ? ` · ${GENDER_LABELS[gender]}` : ""}
              </h2>
              <p className="text-xs text-zinc-500">
                {rows.length} equipos · {finishedCount} partidos finalizados
              </p>
            </div>
            <Link
              href={`/clasificacion`}
              target="_blank"
              className="-my-2 inline-flex min-h-9 shrink-0 items-center text-xs font-semibold text-brand-red hover:underline"
            >
              Ver en el sitio
            </Link>
          </div>

          {rows.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-zinc-500">
              No hay equipos inscritos en esta disciplina. Créalos en{" "}
              <Link href="/admin/equipos" className="font-semibold text-brand-red hover:underline">
                Atletas
              </Link>
              .
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    <th className="w-12 px-4 py-3 text-left">#</th>
                    <th className="px-2 py-3 text-left">Equipo</th>
                    <th className="px-2 py-3 text-center">PJ</th>
                    <th className="px-2 py-3 text-center">G</th>
                    <th className="px-2 py-3 text-center">E</th>
                    <th className="px-2 py-3 text-center">P</th>
                    <th className="px-2 py-3 text-center">{scored}</th>
                    <th className="px-2 py-3 text-center">{conceded}</th>
                    <th className="px-2 py-3 text-center">{diff}</th>
                    <th className="px-2 py-3 text-center">Racha</th>
                    <th className="px-4 py-3 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={row.team.id}
                      className={cn(
                        "border-t border-rose-50 transition-colors hover:bg-rose-50/40",
                        index === 0 && row.played > 0 && "bg-linear-to-r from-[#fde4e3]/70 to-transparent",
                      )}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "grid size-7 place-items-center rounded-full text-xs font-bold",
                            index === 0 && row.played > 0
                              ? "bg-linear-to-br from-[#e0233f] to-[#8a0b20] text-white shadow-[0_6px_14px_-6px_rgba(200,16,46,0.8)]"
                              : "bg-zinc-100 text-zinc-600",
                          )}
                        >
                          {index === 0 && row.played > 0 ? <CrownIcon className="size-3.5" /> : index + 1}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          <TeamCrest logoUrl={row.team.logoUrl} label={row.team.universityShort} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-zinc-950">{row.team.universityShort}</p>
                            <p className="text-xs text-zinc-500">{GENDER_LABELS[row.team.gender]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-center tabular-nums">{row.played}</td>
                      <td className="px-2 py-3 text-center tabular-nums">{row.won}</td>
                      <td className="px-2 py-3 text-center tabular-nums">{row.drawn}</td>
                      <td className="px-2 py-3 text-center tabular-nums">{row.lost}</td>
                      <td className="px-2 py-3 text-center tabular-nums text-zinc-500">{row.scored}</td>
                      <td className="px-2 py-3 text-center tabular-nums text-zinc-500">{row.conceded}</td>
                      <td
                        className={cn(
                          "px-2 py-3 text-center font-medium tabular-nums",
                          row.diff > 0 ? "text-emerald-600" : row.diff < 0 ? "text-brand-red" : "text-zinc-500",
                        )}
                      >
                        {row.diff > 0 ? `+${row.diff}` : row.diff}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex justify-center gap-1">
                          {row.form.length === 0 ? (
                            <span className="text-xs text-zinc-300">—</span>
                          ) : (
                            row.form.map((result, formIndex) => (
                              <span
                                key={formIndex}
                                title={result === "W" ? "Ganó" : result === "D" ? "Empató" : "Perdió"}
                                className={cn("size-2.5 rounded-full", FORM_STYLES[result])}
                              />
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-base font-bold tabular-nums text-zinc-950">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="grid content-start gap-4">
          <section className="admin-surface rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <CalendarClockIcon className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-zinc-950">Resultados pendientes</h3>
                <p className="text-xs text-zinc-500">Partidos ya jugados sin marcador</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {pending.length === 0 ? (
                <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700">
                  Todo al día: la tabla refleja todos los partidos jugados.
                </p>
              ) : (
                pending.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-rose-100 bg-white px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {match.homeLabel.split(" · ")[0]} vs {match.awayLabel.split(" · ")[0]}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(match.matchDate).toLocaleDateString("es-VE", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="shrink-0 bg-brand-red text-white hover:bg-[#9e1b28]"
                      onClick={() => setResultMatch(match)}
                    >
                      <TrophyIcon />
                      Cargar
                    </Button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-rose-100 bg-linear-to-br from-[#fde4e3]/80 via-white to-white p-5">
            <div className="flex gap-3">
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-brand-red" />
              <div className="grid gap-1.5 text-xs leading-relaxed text-zinc-600">
                <p className="font-semibold text-zinc-900">Cómo se ordena</p>
                <p>Puntos, luego diferencia, luego {scored === "GF" ? "goles" : "puntos"} a favor.</p>
                <p>
                  Para corregir la tabla, edita el resultado del partido en{" "}
                  <Link href="/admin/partidos" className="font-semibold text-brand-red hover:underline">
                    Partidos
                  </Link>
                  ; se actualiza al instante aquí y en el sitio.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>

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
