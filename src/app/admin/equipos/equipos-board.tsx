"use client";

import { useMemo, useState, useTransition } from "react";
import {
  PencilIcon,
  PlusIcon,
  ShieldAlertIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Field, NativeSelect } from "@/components/admin/field";
import { ImageUploader } from "@/components/admin/image-uploader";
import { GENDER_LABELS } from "@/lib/admin/labels";
import { athleteUploadPath } from "@/lib/cloudinary-paths";
import {
  deleteAthlete,
  deleteTeam,
  upsertAthlete,
  upsertTeam,
} from "@/app/admin/equipos/actions";
import { cn } from "@/lib/utils";
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
  teamId: string;
  fullName: string;
  jerseyNumber: number | null;
  position: string | null;
  photoUrl: string | null;
  isActive: boolean;
};

type EquiposBoardProps = {
  universities: UniversityOption[];
  sports: SportOption[];
  teams: TeamRow[];
  athletes: AthleteRow[];
};

type AthleteDraft = {
  id?: string;
  teamId: string;
  fullName: string;
  jerseyNumber: string;
  position: string;
  photoUrl: string | null;
  isActive: boolean;
};

const laserCtaClass =
  "h-11 border-0 bg-linear-to-r from-red-600 to-rose-800 px-6 text-white shadow-[0_0_25px_rgba(200,16,46,0.35)] hover:from-red-500 hover:to-rose-700";

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
          "size-7 shrink-0 rounded-full bg-zinc-900 object-contain ring-1 ring-zinc-700",
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full bg-zinc-900 text-[9px] font-black tracking-wider text-zinc-400 ring-1 ring-zinc-700",
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
        className="size-10 rounded-full object-cover ring-1 ring-zinc-700"
      />
    );
  }

  return (
    <span className="grid size-10 place-items-center rounded-full border border-dashed border-zinc-600 bg-zinc-900 text-[10px] font-bold tracking-widest text-zinc-500">
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
    <div className="relative overflow-hidden rounded-xl border border-dashed border-zinc-500/45 bg-zinc-950/40 px-6 py-16 text-center shadow-[0_0_30px_rgba(200,16,46,0.15)]">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C8102E]/15 blur-3xl"
      />
      <div className="relative mx-auto mb-4 grid size-16 place-items-center text-zinc-500 opacity-20">
        {icon}
      </div>
      <h3 className="relative text-lg font-semibold tracking-tight text-zinc-100">
        {title}
      </h3>
      <p className="relative mx-auto mt-2 max-w-md text-sm text-zinc-400">
        {description}
      </p>
      <Button
        type="button"
        disabled={disabled}
        onClick={onAction}
        className={cn("relative mt-6", laserCtaClass)}
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
}: EquiposBoardProps) {
  const [universityId, setUniversityId] = useState(universities[0]?.id ?? "");
  const [sportId, setSportId] = useState(sports[0]?.id ?? "");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teamOpen, setTeamOpen] = useState(false);
  const [athleteOpen, setAthleteOpen] = useState(false);
  const [teamGender, setTeamGender] = useState<TeamGender>("mixed");
  const [coachName, setCoachName] = useState("");
  const [editingTeamId, setEditingTeamId] = useState<string | undefined>();
  const [athleteDraft, setAthleteDraft] = useState<AthleteDraft | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedUniversity = universities.find((item) => item.id === universityId);
  const selectedSport = sports.find((item) => item.id === sportId);

  const filteredTeams = useMemo(
    () =>
      teams.filter(
        (team) => team.universityId === universityId && team.sportId === sportId,
      ),
    [sportId, teams, universityId],
  );

  const activeTeamId =
    selectedTeamId && filteredTeams.some((team) => team.id === selectedTeamId)
      ? selectedTeamId
      : (filteredTeams[0]?.id ?? null);

  const roster = athletes.filter((athlete) => athlete.teamId === activeTeamId);
  const athleteTeam = athleteDraft
    ? teams.find((team) => team.id === athleteDraft.teamId)
    : null;

  function openNewTeam() {
    setEditingTeamId(undefined);
    setTeamGender("mixed");
    setCoachName("");
    setTeamOpen(true);
  }

  function openNewAthlete() {
    if (!activeTeamId) return;
    setAthleteDraft({
      teamId: activeTeamId,
      fullName: "",
      jerseyNumber: "",
      position: "",
      photoUrl: null,
      isActive: true,
    });
    setAthleteOpen(true);
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#C8102E]">
            Centro de mando
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">
            Equipos y atletas
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Vista por universidad y disciplina. Fotos de atletas van a Cloudinary.
          </p>
        </div>
        <Button type="button" onClick={openNewTeam} className={laserCtaClass}>
          <PlusIcon />
          Nuevo equipo
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-5 shadow-[0_0_30px_rgba(200,16,46,0.08)] backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
              Filtro en cascada
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Primero universidad, después deporte. El roster solo muestra atletas
              de esa combinación.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Universidad" className="text-zinc-300">
            <Select
              value={universityId}
              onValueChange={(value) => {
                if (typeof value !== "string" || !value) return;
                setUniversityId(value);
                setSelectedTeamId(null);
              }}
            >
              <SelectTrigger className="h-11 w-full rounded-lg border-zinc-800 bg-zinc-950/80 px-2.5 text-zinc-100">
                <SelectValue>
                  {selectedUniversity ? (
                    <span className="flex min-w-0 items-center gap-2">
                      <Crest
                        url={selectedUniversity.logoUrl}
                        label={selectedUniversity.shortName}
                      />
                      <span className="truncate">
                        {selectedUniversity.shortName} · {selectedUniversity.name}
                      </span>
                    </span>
                  ) : (
                    "Universidad"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent
                align="start"
                alignItemWithTrigger={false}
                className="border border-zinc-800 bg-zinc-950 text-zinc-100"
              >
                {universities.map((university) => (
                  <SelectItem
                    key={university.id}
                    value={university.id}
                    className="focus:bg-zinc-900 focus:text-zinc-100"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Crest url={university.logoUrl} label={university.shortName} />
                      <span className="truncate">
                        {university.shortName} · {university.name}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Deporte" className="text-zinc-300">
            <Select
              value={sportId}
              onValueChange={(value) => {
                if (typeof value !== "string" || !value) return;
                setSportId(value);
                setSelectedTeamId(null);
              }}
            >
              <SelectTrigger className="h-11 w-full rounded-lg border-zinc-800 bg-zinc-950/80 text-zinc-100">
                <SelectValue>{selectedSport?.name ?? "Deporte"}</SelectValue>
              </SelectTrigger>
              <SelectContent
                align="start"
                alignItemWithTrigger={false}
                className="border border-zinc-800 bg-zinc-950 text-zinc-100"
              >
                {sports.map((sport) => (
                  <SelectItem
                    key={sport.id}
                    value={sport.id}
                    className="focus:bg-zinc-900 focus:text-zinc-100"
                  >
                    {sport.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="mt-5">
            <EmptyCommand
              icon={<ShieldAlertIcon className="size-16" />}
              title="Sin plantilla en esta combinación"
              description={`No hay equipos para ${selectedUniversity?.shortName ?? "esta universidad"} en ${selectedSport?.name ?? "este deporte"}. Crea la plantilla para cargar el roster.`}
              actionLabel="Crear Plantilla / Equipo"
              onAction={openNewTeam}
            />
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {filteredTeams.map((team) => (
              <Button
                key={team.id}
                type="button"
                variant={team.id === activeTeamId ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTeamId(team.id)}
                className={
                  team.id === activeTeamId
                    ? "border-0 bg-linear-to-r from-red-600 to-rose-800 text-white"
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-[#C8102E]/50 hover:text-zinc-100"
                }
              >
                {GENDER_LABELS[team.gender]}
                {team.coachName ? ` · ${team.coachName}` : ""}
              </Button>
            ))}
            {activeTeamId ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-zinc-500 transition-colors hover:bg-transparent hover:text-red-500"
                  onClick={() => {
                    const team = filteredTeams.find((item) => item.id === activeTeamId);
                    if (!team) return;
                    setEditingTeamId(team.id);
                    setTeamGender(team.gender);
                    setCoachName(team.coachName ?? "");
                    setTeamOpen(true);
                  }}
                >
                  <PencilIcon />
                  Editar equipo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-zinc-500 transition-colors hover:bg-transparent hover:text-red-500"
                  onClick={() => {
                    if (!confirm("¿Eliminar este equipo y su roster?")) return;
                    startTransition(async () => {
                      const result = await deleteTeam(activeTeamId);
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
                  Eliminar equipo
                </Button>
              </>
            ) : null}
          </div>
        )}
      </div>

      <Card className="border-zinc-800/80 bg-zinc-950/50 shadow-none backdrop-blur-md">
        <CardHeader className="border-b border-zinc-800/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-zinc-100">Roster Pro</CardTitle>
              <CardDescription className="text-zinc-400">
                Nombre, dorsal, posición y foto. Solo atletas activos entran al
                selector de MVP.
              </CardDescription>
            </div>
            <Button
              type="button"
              disabled={!activeTeamId}
              onClick={openNewAthlete}
              className={laserCtaClass}
            >
              <PlusIcon />
              Nuevo atleta
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!activeTeamId ? (
            <EmptyCommand
              icon={<UsersIcon className="size-16" />}
              title="Sin equipo seleccionado"
              description="Selecciona o crea un equipo para cargar el roster."
              actionLabel="Crear Plantilla / Equipo"
              onAction={openNewTeam}
            />
          ) : roster.length === 0 ? (
            <EmptyCommand
              icon={<UsersIcon className="size-16" />}
              title="Plantilla vacía"
              description="Esta plantilla aún no tiene atletas. Súbelos para armar el roster de la jornada."
              actionLabel="Nuevo atleta"
              onAction={openNewAthlete}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                    Atleta
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                    Dorsal
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                    Posición
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                    Estado
                  </TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roster.map((athlete) => (
                  <TableRow
                    key={athlete.id}
                    className="border-zinc-800/80 hover:bg-zinc-900/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AthleteAvatar url={athlete.photoUrl} name={athlete.fullName} />
                        <span className="font-medium tracking-tight text-zinc-100">
                          {athlete.fullName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-lg text-zinc-300">
                        {athlete.jerseyNumber ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {athlete.position || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={athlete.isActive ? "default" : "outline"}
                        className={
                          athlete.isActive
                            ? "border-0 bg-linear-to-r from-red-600 to-rose-800 text-white"
                            : "border-zinc-700 text-zinc-400"
                        }
                      >
                        {athlete.isActive ? "Activo" : "Inactivo"}
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
                            setAthleteDraft({
                              id: athlete.id,
                              teamId: athlete.teamId,
                              fullName: athlete.fullName,
                              jerseyNumber: athlete.jerseyNumber?.toString() ?? "",
                              position: athlete.position ?? "",
                              photoUrl: athlete.photoUrl,
                              isActive: athlete.isActive,
                            });
                            setAthleteOpen(true);
                          }}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className="text-zinc-500 transition-colors hover:bg-transparent hover:text-red-500"
                          onClick={() => {
                            if (!confirm("¿Eliminar este atleta?")) return;
                            startTransition(async () => {
                              const result = await deleteAthlete(athlete.id);
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={teamOpen} onOpenChange={setTeamOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTeamId ? "Editar equipo" : "Nuevo equipo"}</DialogTitle>
            <DialogDescription>
              El equipo queda anclado a la universidad y deporte del filtro actual.
            </DialogDescription>
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
                onChange={(event) => setTeamGender(event.target.value as TeamGender)}
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
              <Button type="submit" disabled={pending} className={laserCtaClass}>
                {pending ? "Guardando..." : "Guardar equipo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={athleteOpen} onOpenChange={setAthleteOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-zinc-800 bg-zinc-950 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {athleteDraft?.id ? "Editar atleta" : "Nuevo atleta"}
            </DialogTitle>
            <DialogDescription>
              La foto se guarda en jugadores / universidad / deporte / género, lista
              para el MVP y las fichas públicas.
            </DialogDescription>
          </DialogHeader>
          {athleteDraft ? (
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                startTransition(async () => {
                  const result = await upsertAthlete({
                    id: athleteDraft.id,
                    teamId: athleteDraft.teamId,
                    fullName: athleteDraft.fullName,
                    jerseyNumber: athleteDraft.jerseyNumber
                      ? Number(athleteDraft.jerseyNumber)
                      : null,
                    position: athleteDraft.position,
                    photoUrl: athleteDraft.photoUrl,
                    isActive: athleteDraft.isActive,
                  });
                  if (!result.ok) {
                    toast.add({
                      type: "error",
                      title: "No se pudo guardar",
                      description: result.error,
                    });
                    return;
                  }
                  toast.add({ type: "success", title: "Atleta guardado" });
                  setAthleteOpen(false);
                });
              }}
            >
              <Field label="Nombre completo">
                <Input
                  value={athleteDraft.fullName}
                  onChange={(event) =>
                    setAthleteDraft({ ...athleteDraft, fullName: event.target.value })
                  }
                  required
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Dorsal">
                  <Input
                    type="number"
                    min={0}
                    value={athleteDraft.jerseyNumber}
                    onChange={(event) =>
                      setAthleteDraft({
                        ...athleteDraft,
                        jerseyNumber: event.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Posición">
                  <Input
                    value={athleteDraft.position}
                    onChange={(event) =>
                      setAthleteDraft({
                        ...athleteDraft,
                        position: event.target.value,
                      })
                    }
                    placeholder="Base, delantero..."
                  />
                </Field>
              </div>
              <Field label="Estado">
                <NativeSelect
                  value={athleteDraft.isActive ? "active" : "inactive"}
                  onChange={(event) =>
                    setAthleteDraft({
                      ...athleteDraft,
                      isActive: event.target.value === "active",
                    })
                  }
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </NativeSelect>
              </Field>
              <ImageUploader
                key={athleteDraft.id ?? "new-athlete"}
                folder="jugadores"
                path={
                  athleteTeam
                    ? athleteUploadPath({
                        universityShort: athleteTeam.universityShort,
                        sportSlug: athleteTeam.sportSlug,
                        gender: athleteTeam.gender,
                      })
                    : undefined
                }
                label="Foto del atleta"
                initialUrl={athleteDraft.photoUrl}
                onUploaded={(asset) =>
                  setAthleteDraft({ ...athleteDraft, photoUrl: asset.secureUrl })
                }
              />
              <DialogFooter>
                <Button type="submit" disabled={pending} className={laserCtaClass}>
                  {pending ? "Guardando..." : "Guardar atleta"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
