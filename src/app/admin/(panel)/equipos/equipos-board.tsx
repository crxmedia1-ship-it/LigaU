"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDownIcon, PencilIcon, PlusIcon, RotateCcwIcon, TableIcon, Trash2Icon, UsersIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Field, NativeSelect } from "@/components/admin/field";
import { GENDER_LABELS } from "@/lib/admin/labels";
import { SPORT_EMOJI } from "@/lib/admin/sport";
import {
  deleteAthlete,
  setAthleteActive,
  deleteTeam,
  upsertTeam,
} from "@/app/admin/(panel)/equipos/actions";
import {
  AthleteDialog,
  sportProfile,
  type AthleteDraft,
} from "@/app/admin/(panel)/equipos/athlete-dialog";
import { AthletesBulkDialog } from "@/app/admin/(panel)/equipos/athletes-bulk-dialog";
import { adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { cn } from "@/lib/utils";
import type { DominantSide } from "@/app/admin/(panel)/equipos/actions";
import type { Database } from "@/types/database.types";

type TeamGender = Database["public"]["Enums"]["team_gender"];

export type UniversityOption = {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string | null;
};
export type SportOption = { id: string; name: string; slug: string };
export type TeamRow = {
  id: string;
  universityId: string;
  sportId: string;
  gender: TeamGender;
  coachName: string | null;
  universityShort: string;
  sportName: string;
  sportSlug: string;
};
export type AthleteRow = {
  id: string;
  personId: string;
  teamId: string;
  fullName: string;
  jerseyNumber: number | null;
  position: string | null;
  photoUrl: string | null;
  birthDate: string | null;
  heightCm: number | null;
  dominantSide: string | null;
  isActive: boolean;
};

type EquiposBoardProps = {
  universities: UniversityOption[];
  sports: SportOption[];
  teams: TeamRow[];
  athletes: AthleteRow[];
  initialTeamId?: string;
};

function Crest({
  url,
  label,
  className,
}: {
  url: string | null;
  label: string;
  className?: string;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className={cn(
          "size-7 shrink-0 rounded-full bg-white object-contain p-1 ring-1 ring-zinc-200",
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full bg-zinc-100 text-[9px] font-black tracking-wider text-zinc-500 ring-1 ring-zinc-200",
        className,
      )}
    >
      {label.slice(0, 3)}
    </span>
  );
}

function AthleteAvatar({ url, name }: { url: string | null; name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt=""
        className="size-10 rounded-full object-cover ring-1 ring-zinc-200"
      />
    );
  }

  return (
    <span className="grid size-10 place-items-center rounded-full border border-dashed border-zinc-300 bg-zinc-100 text-[10px] font-bold tracking-widest text-zinc-500">
      {initials || "—"}
    </span>
  );
}

function EmptyCommand({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-white/60 px-6 py-16 text-center shadow-[0_0_30px_rgba(200,16,46,0.15)]">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red/15 blur-3xl"
      />
      <div className="relative mx-auto mb-4 grid size-16 place-items-center text-zinc-500 opacity-20">
        {icon}
      </div>
      <h3 className="relative text-lg font-semibold tracking-tight text-zinc-950">
        {title}
      </h3>
      <p className="relative mx-auto mt-2 max-w-md text-sm text-zinc-500">
        {description}
      </p>
      <Button
        type="button"
        disabled={disabled}
        onClick={onAction}
        className={cn("relative mt-6", adminLaserCtaClass)}
      >
        <PlusIcon />
        {actionLabel}
      </Button>
    </div>
  );
}

export function EquiposBoard({
  universities,
  sports,
  teams,
  athletes,
  initialTeamId,
}: EquiposBoardProps) {
  const initialTeam = teams.find((team) => team.id === initialTeamId);
  const [universityId, setUniversityId] = useState(
    initialTeam?.universityId ?? universities[0]?.id ?? "",
  );
  const [sportId, setSportId] = useState(
    initialTeam?.sportId ?? sports[0]?.id ?? "",
  );
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    initialTeam?.id ?? null,
  );
  const [teamOpen, setTeamOpen] = useState(false);
  const [athleteOpen, setAthleteOpen] = useState(false);
  const [teamGender, setTeamGender] = useState<TeamGender>("mixed");
  const [coachName, setCoachName] = useState("");
  const [editingTeamId, setEditingTeamId] = useState<string | undefined>();
  const [athleteDraft, setAthleteDraft] = useState<AthleteDraft | null>(null);
  const [pending, startTransition] = useTransition();
  const [formerOpen, setFormerOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkKey, setBulkKey] = useState(0);

  const selectedUniversity = universities.find(
    (item) => item.id === universityId,
  );

  const filteredTeams = useMemo(
    () =>
      teams.filter(
        (team) =>
          team.universityId === universityId && team.sportId === sportId,
      ),
    [sportId, teams, universityId],
  );

  const activeTeamId =
    selectedTeamId && filteredTeams.some((team) => team.id === selectedTeamId)
      ? selectedTeamId
      : (filteredTeams[0]?.id ?? null);

  const activeTeam =
    filteredTeams.find((team) => team.id === activeTeamId) ?? null;
  const teamAthletes = athletes.filter((athlete) => athlete.teamId === activeTeamId);
  const roster = teamAthletes.filter((athlete) => athlete.isActive);
  const formerAthletes = teamAthletes.filter((athlete) => !athlete.isActive);
  const showNumber = sportProfile(activeTeam?.sportSlug).number;

  const { athletesByUniversity, athletesBySport } = useMemo(() => {
    const teamById = new Map(teams.map((team) => [team.id, team]));
    const byUniversity = new Map<string, number>();
    const bySport = new Map<string, number>();
    for (const athlete of athletes) {
      const team = teamById.get(athlete.teamId);
      if (!team) continue;
      byUniversity.set(
        team.universityId,
        (byUniversity.get(team.universityId) ?? 0) + 1,
      );
      if (team.universityId === universityId)
        bySport.set(team.sportId, (bySport.get(team.sportId) ?? 0) + 1);
    }
    return { athletesByUniversity: byUniversity, athletesBySport: bySport };
  }, [athletes, teams, universityId]);

  function blankDraft(): AthleteDraft | null {
    const draftUniversity = universityId || universities[0]?.id;
    if (!draftUniversity) return null;
    return {
      universityId: draftUniversity,
      gender: activeTeam?.gender === "female" ? "female" : "male",
      fullName: "",
      photoUrl: null,
      birthDate: "",
      heightCm: "",
      isActive: true,
      entries: sportId ? [{ sportId, jerseyNumber: "", position: "", dominantSide: null }] : [],
    };
  }

  function openNewAthlete() {
    const draft = blankDraft();
    if (!draft) {
      toast.add({ type: "error", title: "Primero agrega una universidad" });
      return;
    }
    setAthleteDraft(draft);
    setAthleteOpen(true);
  }

  function removeAthlete(athlete: AthleteRow) {
    if (!confirm(`¿Eliminar a ${athlete.fullName} de este equipo?`)) return;
    startTransition(async () => {
      const result = await deleteAthlete(athlete.id);
      if (result.ok) {
        toast.add({ type: "success", title: "Atleta eliminado" });
        return;
      }
      if ("hasHistory" in result && result.hasHistory) {
        if (!athlete.isActive) {
          toast.add({ type: "error", title: "No se puede eliminar", description: result.error });
          return;
        }
        if (!confirm(`${athlete.fullName} tiene goles, tarjetas o MVP registrados. ¿Pasarlo a exjugadores para conservar su historial?`)) return;
        const retired = await setAthleteActive(athlete.id, false);
        if (!retired.ok) {
          toast.add({ type: "error", title: "No se pudo guardar", description: retired.error });
          return;
        }
        toast.add({ type: "success", title: `${athlete.fullName} pasó a exjugadores` });
        return;
      }
      toast.add({ type: "error", title: "No se pudo eliminar", description: result.error });
    });
  }

  function openEditAthlete(athlete: AthleteRow) {
    const rows = athletes.filter((item) => item.personId === athlete.personId);
    const team = teams.find((item) => item.id === athlete.teamId);
    setAthleteDraft({
      personId: athlete.personId,
      universityId: team?.universityId ?? universityId,
      gender: team?.gender === "female" ? "female" : "male",
      fullName: athlete.fullName,
      photoUrl: athlete.photoUrl,
      birthDate: athlete.birthDate ?? "",
      heightCm: athlete.heightCm?.toString() ?? "",
      isActive: athlete.isActive,
      entries: rows.flatMap((row) => {
        const rowTeam = teams.find((item) => item.id === row.teamId);
        return rowTeam
          ? [
              {
                sportId: rowTeam.sportId,
                jerseyNumber: row.jerseyNumber?.toString() ?? "",
                position: row.position ?? "",
                dominantSide: (row.dominantSide as DominantSide | null) ?? null,
              },
            ]
          : [];
      }),
    });
    setAthleteOpen(true);
  }

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const wantsNewAthlete = searchParams.get("nuevo") === "atleta";

  const [handledNewAthlete, setHandledNewAthlete] = useState(false);
  if (wantsNewAthlete !== handledNewAthlete) {
    setHandledNewAthlete(wantsNewAthlete);
    const draft = wantsNewAthlete ? blankDraft() : null;
    if (draft) {
      setAthleteDraft(draft);
      setAthleteOpen(true);
    }
  }

  useEffect(() => {
    if (wantsNewAthlete) router.replace(pathname, { scroll: false });
  }, [wantsNewAthlete, router, pathname]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Atletas
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setBulkKey((value) => value + 1);
              setBulkOpen(true);
            }}
            className="h-11 flex-1 rounded-xl border-rose-200 bg-white px-4 text-brand-red hover:bg-rose-50 hover:text-brand-red sm:flex-none"
          >
            <TableIcon />
            Carga masiva
          </Button>
          <Button type="button" onClick={openNewAthlete} className={cn(adminLaserCtaClass, "flex-1 sm:flex-none")}>
            <PlusIcon />
            Nuevo atleta
          </Button>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-[0_18px_40px_-30px_rgba(200,16,46,0.45)] ring-1 ring-rose-100 sm:p-5">
        <p className="text-[11px] font-bold tracking-[0.22em] text-zinc-400 uppercase">
          Universidad
        </p>
        <div className="-mx-4 mt-2.5 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-5 sm:scroll-px-5 sm:px-5">
          {universities.map((university) => {
            const active = university.id === universityId;
            const count = athletesByUniversity.get(university.id) ?? 0;
            return (
              <button
                key={university.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setUniversityId(university.id);
                  setSelectedTeamId(null);
                }}
                className={cn(
                  "relative flex h-[88px] w-[88px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-2xl text-center transition-all active:scale-[0.97]",
                  active
                    ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white shadow-[0_12px_24px_-14px_rgba(200,16,46,0.9)]"
                    : "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-100 hover:bg-rose-50 hover:ring-rose-200",
                )}
              >
                {count ? (
                  <span
                    className={cn(
                      "absolute top-1.5 right-1.5 grid min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold tabular-nums",
                      active
                        ? "bg-white text-brand-red"
                        : "bg-brand-red text-white",
                    )}
                  >
                    {count}
                  </span>
                ) : null}
                {university.logoUrl ? (
                  <img
                    src={university.logoUrl}
                    alt=""
                    className={cn(
                      "size-9 object-contain",
                      active && "drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]",
                    )}
                  />
                ) : (
                  <span className="grid size-9 place-items-center text-sm font-black">
                    {university.shortName.slice(0, 3)}
                  </span>
                )}
                <span className="text-[12px] leading-tight font-bold">
                  {university.shortName}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-[11px] font-bold tracking-[0.22em] text-zinc-400 uppercase">
          Deporte
        </p>
        <div className="-mx-4 mt-2.5 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-5 sm:scroll-px-5 sm:px-5">
          {sports.map((sport) => {
            const active = sport.id === sportId;
            const hasTeam = teams.some(
              (team) =>
                team.universityId === universityId && team.sportId === sport.id,
            );
            const count = athletesBySport.get(sport.id) ?? 0;
            return (
              <button
                key={sport.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSportId(sport.id);
                  setSelectedTeamId(null);
                }}
                className={cn(
                  "relative flex h-[88px] w-[88px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-2xl px-1.5 text-center transition-all active:scale-[0.97]",
                  active
                    ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white shadow-[0_12px_24px_-14px_rgba(200,16,46,0.9)]"
                    : "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-100 hover:bg-rose-50 hover:ring-rose-200",
                  !active &&
                    !hasTeam &&
                    "text-zinc-400 [&>span:first-of-type]:opacity-50",
                )}
              >
                {count ? (
                  <span
                    className={cn(
                      "absolute top-1.5 right-1.5 grid min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold tabular-nums",
                      active
                        ? "bg-white text-brand-red"
                        : "bg-brand-red text-white",
                    )}
                  >
                    {count}
                  </span>
                ) : null}
                <span className="text-2xl leading-none">
                  {SPORT_EMOJI[sport.slug] ?? "🏅"}
                </span>
                <span className="text-[12px] leading-tight font-semibold">
                  {sport.name}
                </span>
              </button>
            );
          })}
        </div>

        {filteredTeams.length > 1 ? (
          <div className="mx-auto mt-4 flex w-fit gap-1 rounded-full bg-zinc-100 p-1">
            {filteredTeams.map((team) => {
              const active = team.id === activeTeamId;
              return (
                <button
                  key={team.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-all sm:px-5",
                    active
                      ? "bg-white text-brand-red shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900",
                  )}
                >
                  {GENDER_LABELS[team.gender]}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {activeTeam ? (
        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-rose-100">
          <Crest
            url={selectedUniversity?.logoUrl ?? null}
            label={activeTeam.universityShort}
            className="size-10"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-zinc-950">
              {activeTeam.universityShort} ·{" "}
              {SPORT_EMOJI[activeTeam.sportSlug] ?? "🏅"} {activeTeam.sportName}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {GENDER_LABELS[activeTeam.gender]} · {roster.length}{" "}
              {roster.length === 1 ? "atleta" : "atletas"}
              {activeTeam.coachName ? ` · DT ${activeTeam.coachName}` : ""}
            </p>
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Editar equipo"
            className="text-zinc-500 hover:bg-rose-50 hover:text-brand-red"
            onClick={() => {
              setEditingTeamId(activeTeam.id);
              setTeamGender(activeTeam.gender);
              setCoachName(activeTeam.coachName ?? "");
              setTeamOpen(true);
            }}
          >
            <PencilIcon />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Eliminar equipo"
            className="text-zinc-500 hover:bg-rose-50 hover:text-brand-red"
            disabled={pending}
            onClick={() => {
              if (!confirm("¿Eliminar este equipo y su roster?")) return;
              startTransition(async () => {
                const result = await deleteTeam(activeTeam.id);
                if (!result.ok) {
                  toast.add({
                    type: "error",
                    title: "No se pudo eliminar",
                    description: result.error,
                  });
                }
              });
            }}
          >
            <Trash2Icon />
          </Button>
        </div>
      ) : null}

      {activeTeamId ? (
        <Card className="border-zinc-200/80 bg-white/70 shadow-none backdrop-blur-md">
          <CardContent className="grid gap-4">
            {roster.length === 0 ? (
              <EmptyCommand
                icon={<UsersIcon className="size-16" />}
                title="Sin atletas"
                description="Este equipo aún no tiene atletas activos."
                actionLabel="Nuevo atleta"
                onAction={openNewAthlete}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-200 hover:bg-transparent">
                    <TableHead className="text-[11px] tracking-[0.2em] text-zinc-500 uppercase">Atleta</TableHead>
                    {showNumber ? (
                      <>
                        <TableHead className="text-[11px] tracking-[0.2em] text-zinc-500 uppercase">Dorsal</TableHead>
                        <TableHead className="text-[11px] tracking-[0.2em] text-zinc-500 uppercase">Posición</TableHead>
                      </>
                    ) : null}
                    <TableHead className="text-right text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map((athlete) => (
                    <TableRow key={athlete.id} className="border-zinc-200/80 hover:bg-zinc-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <AthleteAvatar url={athlete.photoUrl} name={athlete.fullName} />
                          <span className="font-medium tracking-tight text-zinc-950">{athlete.fullName}</span>
                        </div>
                      </TableCell>
                      {showNumber ? (
                        <>
                          <TableCell>
                            <span className="font-mono text-lg text-zinc-700">{athlete.jerseyNumber ?? "—"}</span>
                          </TableCell>
                          <TableCell className="text-zinc-500">{athlete.position || "—"}</TableCell>
                        </>
                      ) : null}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Editar"
                            className="text-zinc-500 transition-colors hover:bg-transparent hover:text-red-500"
                            onClick={() => openEditAthlete(athlete)}
                          >
                            <PencilIcon />
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Eliminar"
                            className="text-zinc-500 transition-colors hover:bg-transparent hover:text-red-500"
                            disabled={pending}
                            onClick={() => removeAthlete(athlete)}
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {formerAthletes.length ? (
              <div className="rounded-2xl bg-zinc-50 ring-1 ring-zinc-100">
                <button
                  type="button"
                  onClick={() => setFormerOpen((value) => !value)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-zinc-700"
                >
                  Exjugadores
                  <span className="rounded-full bg-zinc-200 px-1.5 text-[11px] text-zinc-600 tabular-nums">
                    {formerAthletes.length}
                  </span>
                  <span className="ml-auto text-xs font-normal text-zinc-400">Conservan su historial</span>
                  <ChevronDownIcon className={cn("size-4 text-zinc-400 transition-transform", formerOpen && "rotate-180")} />
                </button>
                {formerOpen ? (
                  <ul className="divide-y divide-zinc-100 border-t border-zinc-100">
                    {formerAthletes.map((athlete) => (
                      <li key={athlete.id} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="opacity-60 grayscale">
                          <AthleteAvatar url={athlete.photoUrl} name={athlete.fullName} />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-600">
                          {athlete.fullName}
                          {showNumber && athlete.jerseyNumber ? (
                            <span className="ml-1.5 text-xs text-zinc-400">#{athlete.jerseyNumber}</span>
                          ) : null}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={pending}
                          className="rounded-full text-brand-red hover:bg-rose-50"
                          onClick={() =>
                            startTransition(async () => {
                              const result = await setAthleteActive(athlete.id, true);
                              if (!result.ok) {
                                toast.add({ type: "error", title: "No se pudo reactivar", description: result.error });
                                return;
                              }
                              toast.add({ type: "success", title: `${athlete.fullName} vuelve al equipo` });
                            })
                          }
                        >
                          <RotateCcwIcon />
                          Reactivar
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Eliminar"
                          disabled={pending}
                          className="text-zinc-400 hover:bg-transparent hover:text-red-500"
                          onClick={() => removeAthlete(athlete)}
                        >
                          <Trash2Icon />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={teamOpen} onOpenChange={setTeamOpen}>
        <DialogContent className="border-zinc-200 bg-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar equipo</DialogTitle>
            <DialogDescription>Categoría y entrenador.</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await upsertTeam({
                  id: editingTeamId,
                  universityId,
                  sportId,
                  gender: teamGender,
                  coachName,
                });
                if (!result.ok) {
                  toast.add({
                    type: "error",
                    title: "No se pudo guardar",
                    description: result.error,
                  });
                  return;
                }
                toast.add({ type: "success", title: "Equipo guardado" });
                setTeamOpen(false);
              });
            }}
          >
            <Field label="Género / categoría">
              <NativeSelect
                value={teamGender}
                onChange={(event) =>
                  setTeamGender(event.target.value as TeamGender)
                }
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="mixed">Mixto</option>
              </NativeSelect>
            </Field>
            <Field label="Entrenador">
              <Input
                value={coachName}
                onChange={(event) => setCoachName(event.target.value)}
                placeholder="Nombre del coach"
              />
            </Field>
            <DialogFooter>
              <Button
                type="submit"
                disabled={pending}
                className={adminLaserCtaClass}
              >
                {pending ? "Guardando..." : "Guardar equipo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AthletesBulkDialog
        key={bulkKey}
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        universities={universities}
        sports={sports}
        teams={teams}
        athletes={athletes}
        initialUniversityId={universityId || universities[0]?.id || ""}
        initialSportId={sportId || sports[0]?.id || ""}
        initialGender={activeTeam?.gender === "female" ? "female" : "male"}
        onSaved={(savedUniversityId, savedSportId) => {
          setUniversityId(savedUniversityId);
          setSportId(savedSportId);
          setSelectedTeamId(null);
          setBulkOpen(false);
        }}
      />
      <AthleteDialog
        open={athleteOpen}
        onOpenChange={setAthleteOpen}
        draft={athleteDraft}
        setDraft={setAthleteDraft}
        universities={universities}
        sports={sports}
        teams={teams}
        onSaved={(savedUniversityId, savedSportId) => {
          setUniversityId(savedUniversityId);
          setSportId(savedSportId);
          setSelectedTeamId(null);
          setAthleteOpen(false);
        }}
      />
    </div>
  );
}
