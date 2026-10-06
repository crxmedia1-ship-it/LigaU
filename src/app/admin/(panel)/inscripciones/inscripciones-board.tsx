"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { CompetitionFilters } from "@/components/admin/competition-filters";
import { deleteTeam, upsertTeam } from "@/app/admin/(panel)/equipos/actions";
import { GENDER_LABELS } from "@/lib/admin/labels";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type TeamGender = Database["public"]["Enums"]["team_gender"];

type University = { id: string; name: string; shortName: string; logoUrl: string | null };
type Sport = { id: string; name: string; slug: string };
type Team = { id: string; universityId: string; sportId: string; gender: TeamGender; athletes: number };

const NO_GENDERS = new Set<string>();

export function InscripcionesBoard({
  universities,
  sports,
  teams,
}: {
  universities: University[];
  sports: Sport[];
  teams: Team[];
}) {
  const [sportId, setSportId] = useState(sports[0]?.id ?? "");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const teamsBySport = useMemo(() => {
    const counts = new Map<string, number>();
    for (const team of teams) counts.set(team.sportId, (counts.get(team.sportId) ?? 0) + 1);
    return counts;
  }, [teams]);

  const sportTeams = teams.filter((team) => team.sportId === sportId);
  const sport = sports.find((item) => item.id === sportId);
  const enrolled = new Set(sportTeams.map((team) => team.universityId)).size;
  const maleCount = sportTeams.filter((team) => team.gender === "male").length;
  const femaleCount = sportTeams.filter((team) => team.gender === "female").length;

  function toggle(university: University, gender: TeamGender) {
    const existing = sportTeams.find((team) => team.universityId === university.id && team.gender === gender);
    const key = `${university.id}:${gender}`;
    if (existing) {
      const warning = existing.athletes
        ? `${university.shortName} ${GENDER_LABELS[gender]} tiene ${existing.athletes} ${existing.athletes === 1 ? "atleta" : "atletas"}. Si lo quitas se borran también. ¿Continuar?`
        : `¿Quitar el equipo ${GENDER_LABELS[gender].toLowerCase()} de ${university.shortName}?`;
      if (!confirm(warning)) return;
    }
    setBusyKey(key);
    startTransition(async () => {
      const result = existing
        ? await deleteTeam(existing.id)
        : await upsertTeam({ universityId: university.id, sportId, gender, coachName: "" });
      setBusyKey(null);
      if (!result.ok) {
        toast.add({ type: "error", title: "No se pudo guardar", description: result.error });
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Equipos</h1>

      <CompetitionFilters
        sports={sports}
        sportId={sportId}
        onSportChange={setSportId}
        gender="all"
        onGenderChange={() => {}}
        availableGenders={NO_GENDERS}
        counts={teamsBySport}
      />

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-rose-100">
          <p className="text-2xl font-bold text-zinc-950 tabular-nums">
            {enrolled}
            <span className="text-base font-semibold text-zinc-400">/{universities.length}</span>
          </p>
          <p className="text-[11px] font-semibold text-zinc-500">Universidades</p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-rose-100">
          <p className="text-2xl font-bold text-zinc-950 tabular-nums">{maleCount}</p>
          <p className="text-[11px] font-semibold text-zinc-500">Masculino</p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-rose-100">
          <p className="text-2xl font-bold text-zinc-950 tabular-nums">{femaleCount}</p>
          <p className="text-[11px] font-semibold text-zinc-500">Femenino</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-rose-100">
        <p className="border-b border-rose-50 px-4 py-3 text-xs text-zinc-500">
          Toca <span className="font-semibold text-zinc-800">Masculino</span> o{" "}
          <span className="font-semibold text-zinc-800">Femenino</span> para inscribir o quitar el equipo de{" "}
          {sport?.name ?? "este deporte"}.
        </p>
        <ul className="divide-y divide-rose-50">
          {universities.map((university) => {
            const uniTeams = sportTeams.filter((team) => team.universityId === university.id);
            const hasMixed = uniTeams.some((team) => team.gender === "mixed");
            const genders: TeamGender[] = hasMixed ? ["male", "female", "mixed"] : ["male", "female"];
            const playing = uniTeams.length > 0;
            return (
              <li key={university.id} className="flex items-center gap-3 px-4 py-3">
                {university.logoUrl ? (
                  <img
                    src={university.logoUrl}
                    alt=""
                    className={cn("size-10 shrink-0 object-contain", !playing && "opacity-40 grayscale")}
                  />
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center text-xs font-black text-zinc-400">
                    {university.shortName.slice(0, 3)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className={cn("font-semibold", playing ? "text-zinc-950" : "text-zinc-400")}>
                    {university.shortName}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {playing
                      ? `${uniTeams.reduce((sum, team) => sum + team.athletes, 0)} atletas`
                      : "No participa"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {genders.map((gender) => {
                    const active = uniTeams.some((team) => team.gender === gender);
                    const busy = busyKey === `${university.id}:${gender}`;
                    return (
                      <button
                        key={gender}
                        type="button"
                        aria-pressed={active}
                        disabled={busy}
                        onClick={() => toggle(university, gender)}
                        className={cn(
                          "flex h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold transition-all active:scale-95",
                          active
                            ? "bg-[#C8102E] text-white shadow-[0_8px_18px_-10px_rgba(200,16,46,0.9)]"
                            : "bg-zinc-50 text-zinc-500 ring-1 ring-zinc-200 hover:text-zinc-900",
                        )}
                      >
                        {busy ? (
                          <Loader2Icon className="size-3.5 animate-spin" />
                        ) : active ? (
                          <CheckIcon className="size-3.5" strokeWidth={3} />
                        ) : (
                          <PlusIcon className="size-3.5" />
                        )}
                        <span className="sm:hidden">{gender === "male" ? "Masc" : gender === "female" ? "Fem" : "Mixto"}</span>
                        <span className="hidden sm:inline">{GENDER_LABELS[gender]}</span>
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
