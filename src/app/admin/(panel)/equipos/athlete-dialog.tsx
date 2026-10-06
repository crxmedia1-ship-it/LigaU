"use client";

import { useTransition } from "react";
import { CheckIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/admin/image-uploader";
import { adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { TeamCrest } from "@/components/admin/competition-filters";
import { GENDER_LABELS } from "@/lib/admin/labels";
import { SPORT_EMOJI } from "@/lib/admin/sport";
import { athleteUploadPath } from "@/lib/cloudinary-paths";
import { saveAthleteProfile, type DominantSide } from "@/app/admin/(panel)/equipos/actions";
import type { SportOption, TeamRow, UniversityOption } from "@/app/admin/(panel)/equipos/equipos-board";
import { cn } from "@/lib/utils";

export type AthleteEntry = { sportId: string; jerseyNumber: string; position: string; dominantSide: DominantSide | null };

export type AthleteDraft = {
  personId?: string;
  universityId: string;
  gender: "male" | "female";
  fullName: string;
  photoUrl: string | null;
  birthDate: string;
  heightCm: string;
  isActive: boolean;
  entries: AthleteEntry[];
};

type SportProfile = { number: boolean; positions: string[]; side: "foot" | "hand" | null };

const PROFILES: Record<string, SportProfile> = {
  "futbol-campo": { number: true, positions: ["Portero", "Defensa", "Mediocampista", "Delantero"], side: "foot" },
  futsal: { number: true, positions: ["Portero", "Cierre", "Ala", "Pívot"], side: "foot" },
  rugby: {
    number: true,
    positions: ["Pilar", "Hooker", "Segunda línea", "Tercera línea", "Medio scrum", "Apertura", "Centro", "Wing", "Fullback"],
    side: "foot",
  },
  baloncesto: { number: true, positions: ["Base", "Escolta", "Alero", "Ala-pívot", "Pívot"], side: "hand" },
  "voleibol-cancha": { number: true, positions: ["Armador", "Opuesto", "Central", "Punta", "Líbero"], side: "hand" },
  "voley-playa": { number: true, positions: ["Bloqueador", "Defensor"], side: "hand" },
  "tenis-campo": { number: false, positions: [], side: "hand" },
  "tenis-de-mesa": { number: false, positions: [], side: "hand" },
  ajedrez: { number: false, positions: [], side: null },
};

export function sportProfile(slug: string | undefined): SportProfile {
  return (slug && PROFILES[slug]) || { number: true, positions: [], side: "hand" };
}

const SIDES: { id: DominantSide; label: string }[] = [
  { id: "right", label: "Derecho" },
  { id: "left", label: "Zurdo" },
  { id: "both", label: "Ambos" },
];

function ageFrom(birthDate: string) {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 100 ? age : null;
}

function SectionTitle({ step, title, hint }: { step: number; title: string; hint?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#C8102E] text-xs font-bold text-white">
        {step}
      </span>
      <span className="text-[15px] font-semibold text-zinc-950">{title}</span>
      {hint ? <span className="ml-auto text-xs text-zinc-400">{hint}</span> : null}
    </div>
  );
}

export function AthleteDialog({
  open,
  onOpenChange,
  draft,
  setDraft,
  universities,
  sports,
  teams,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: AthleteDraft | null;
  setDraft: (draft: AthleteDraft) => void;
  universities: UniversityOption[];
  sports: SportOption[];
  teams: TeamRow[];
  onSaved: (universityId: string, sportId: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const university = draft ? universities.find((item) => item.id === draft.universityId) : undefined;
  const selectedSports = draft
    ? draft.entries.flatMap((entry) => {
        const sport = sports.find((item) => item.id === entry.sportId);
        return sport ? [{ entry, sport }] : [];
      })
    : [];

  function teamFor(sportId: string) {
    if (!draft) return undefined;
    return (
      teams.find((team) => team.universityId === draft.universityId && team.sportId === sportId && team.gender === draft.gender) ??
      teams.find((team) => team.universityId === draft.universityId && team.sportId === sportId && team.gender === "mixed")
    );
  }

  const age = draft ? ageFrom(draft.birthDate) : null;
  const detailed = selectedSports.filter(({ sport }) => {
    const profile = sportProfile(sport.slug);
    return profile.number || profile.side;
  });
  const uploadSport = selectedSports[0]?.sport;

  function toggleSport(sportId: string) {
    if (!draft) return;
    const has = draft.entries.some((entry) => entry.sportId === sportId);
    setDraft({
      ...draft,
      entries: has
        ? draft.entries.filter((entry) => entry.sportId !== sportId)
        : [...draft.entries, { sportId, jerseyNumber: "", position: "", dominantSide: null }],
    });
  }

  function updateEntry(sportId: string, patch: Partial<AthleteEntry>) {
    if (!draft) return;
    setDraft({
      ...draft,
      entries: draft.entries.map((entry) => (entry.sportId === sportId ? { ...entry, ...patch } : entry)),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex! max-h-[94dvh] flex-col gap-0 overflow-hidden p-0! max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none! sm:max-w-xl">
        <div className="shrink-0 px-5 pt-5 pb-4 text-center sm:px-7">
          <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-zinc-200 sm:hidden" />
          <DialogTitle className="text-xl font-semibold text-zinc-950">
            {draft?.personId ? "Editar atleta" : "Nuevo atleta"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm">Universidad, deportes y datos del jugador.</DialogDescription>
        </div>
        {draft ? (
          <form
            id="athlete-form"
            className="grid min-h-0 flex-1 content-start gap-6 overflow-y-auto border-t border-rose-100/70 bg-[#fbf9f9] px-5 pt-5 pb-8 sm:px-7"
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.entries.length) {
                toast.add({ type: "error", title: "Elige al menos un deporte" });
                return;
              }
              startTransition(async () => {
                const result = await saveAthleteProfile({
                  personId: draft.personId,
                  universityId: draft.universityId,
                  gender: draft.gender,
                  fullName: draft.fullName,
                  photoUrl: draft.photoUrl,
                  birthDate: draft.birthDate || null,
                  heightCm: draft.heightCm ? Number(draft.heightCm) : null,
                  isActive: draft.isActive,
                  entries: draft.entries.map((entry) => {
                    const sport = sports.find((item) => item.id === entry.sportId);
                    const profile = sportProfile(sport?.slug);
                    return {
                      sportId: entry.sportId,
                      jerseyNumber: profile.number && entry.jerseyNumber ? Number(entry.jerseyNumber) : null,
                      position: profile.number ? entry.position.trim() : "",
                      dominantSide: profile.side ? entry.dominantSide : null,
                    };
                  }),
                });
                if (!result.ok) {
                  toast.add({ type: "error", title: "No se pudo guardar", description: result.error });
                  return;
                }
                toast.add({ type: "success", title: draft.personId ? "Atleta actualizado" : "Atleta agregado" });
                onSaved(draft.universityId, draft.entries[0].sportId);
              });
            }}
          >
            <section className="grid gap-3">
              <SectionTitle step={1} title="Universidad" />
              <div className="grid grid-cols-4 gap-2">
                {universities.map((university) => {
                    const active = draft.universityId === university.id;
                    return (
                      <button
                        key={university.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          if (active) return;
                          setDraft({ ...draft, universityId: university.id });
                        }}
                        className={cn(
                          "flex min-w-0 flex-col items-center gap-2 rounded-2xl px-1.5 pt-3 pb-2.5 transition-all active:scale-[0.97]",
                          active
                            ? "bg-white shadow-[0_10px_24px_-14px_rgba(200,16,46,0.7)] ring-2 ring-[#C8102E]"
                            : "bg-white ring-1 ring-zinc-200 hover:ring-[#C8102E]/40",
                        )}
                      >
                        <TeamCrest logoUrl={university.logoUrl} label={university.shortName} bare className="size-11" />
                        <span className="w-full truncate text-center text-xs font-semibold text-zinc-800">
                          {university.shortName}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </section>

            <section className="grid gap-3">
              <SectionTitle step={2} title="Rama" />
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-zinc-100 p-1">
                {(["male", "female"] as const).map((gender) => {
                  const active = draft.gender === gender;
                  return (
                    <button
                      key={gender}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setDraft({ ...draft, gender })}
                      className={cn(
                        "rounded-xl py-2.5 text-sm font-semibold transition-all",
                        active ? "bg-white text-[#C8102E] shadow-sm" : "text-zinc-500 hover:text-zinc-800",
                      )}
                    >
                      {GENDER_LABELS[gender]}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-3">
              <SectionTitle step={3} title="Deportes" hint="Puede jugar en varios" />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {sports.map((sport) => {
                  const active = draft.entries.some((entry) => entry.sportId === sport.id);
                  const team = teamFor(sport.id);
                  return (
                    <button
                      key={sport.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleSport(sport.id)}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-2xl px-3 py-3 text-left transition-all active:scale-[0.98]",
                        active
                          ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white shadow-[0_12px_24px_-14px_rgba(200,16,46,0.9)]"
                          : "bg-white text-zinc-800 ring-1 ring-zinc-200 hover:ring-[#C8102E]/40",
                      )}
                    >
                      <span className="text-xl leading-none">{SPORT_EMOJI[sport.slug] ?? "🏅"}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm leading-tight font-semibold">{sport.name}</span>
                        <span className={cn("block text-[11px]", active ? "text-white/75" : "text-zinc-500")}>
                          {team ? GENDER_LABELS[team.gender] : "Equipo nuevo"}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-full",
                          active ? "bg-white text-[#C8102E]" : "ring-1 ring-zinc-300",
                        )}
                      >
                        {active ? <CheckIcon className="size-3.5" strokeWidth={3} /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedSports.some(({ sport }) => !teamFor(sport.id)) ? (
                <p className="text-xs text-zinc-500">
                  Los deportes marcados como &ldquo;Equipo nuevo&rdquo; crean el equipo {GENDER_LABELS[draft.gender].toLowerCase()} de{" "}
                  {university?.shortName ?? "la universidad"} al guardar.
                </p>
              ) : null}
            </section>

            {detailed.length ? (
              <section className="grid gap-3">
                <SectionTitle step={4} title="Por deporte" />
                {detailed.map(({ entry, sport }) => {
                  const profile = sportProfile(sport.slug);
                  return (
                    <div key={sport.id} className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                      <p className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                        <span className="text-lg leading-none">{SPORT_EMOJI[sport.slug] ?? "🏅"}</span>
                        {sport.name}
                        <span className="text-xs font-normal text-zinc-500">· {GENDER_LABELS[draft.gender]}</span>
                      </p>
                      {profile.number ? (
                        <div className="grid grid-cols-[5.5rem_1fr] gap-3">
                          <label className="grid gap-1.5 text-xs font-medium text-zinc-600">
                            Número
                            <Input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              value={entry.jerseyNumber}
                              onChange={(event) => updateEntry(sport.id, { jerseyNumber: event.target.value })}
                              placeholder="10"
                              className="h-12 rounded-2xl bg-white text-center text-lg font-bold"
                            />
                          </label>
                          <label className="grid gap-1.5 text-xs font-medium text-zinc-600">
                            Posición
                            <Input
                              value={entry.position}
                              onChange={(event) => updateEntry(sport.id, { position: event.target.value })}
                              placeholder="Opcional"
                              className="h-12 rounded-2xl bg-white"
                            />
                          </label>
                        </div>
                      ) : null}
                      {profile.number && profile.positions.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {profile.positions.map((position) => {
                            const active = entry.position === position;
                            return (
                              <button
                                key={position}
                                type="button"
                                onClick={() => updateEntry(sport.id, { position: active ? "" : position })}
                                className={cn(
                                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                                  active
                                    ? "bg-[#C8102E] text-white"
                                    : "bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200 hover:text-zinc-950",
                                )}
                              >
                                {position}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                      {profile.side ? (
                        <div className="grid gap-1.5">
                          <span className="text-xs font-medium text-zinc-600">
                            {profile.side === "foot" ? "Pie hábil" : "Mano hábil"}
                          </span>
                          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-zinc-100 p-1">
                            {SIDES.map((side) => {
                              const active = entry.dominantSide === side.id;
                              return (
                                <button
                                  key={side.id}
                                  type="button"
                                  aria-pressed={active}
                                  onClick={() => updateEntry(sport.id, { dominantSide: active ? null : side.id })}
                                  className={cn(
                                    "rounded-xl py-2 text-sm font-semibold transition-all",
                                    active ? "bg-white text-[#C8102E] shadow-sm" : "text-zinc-500 hover:text-zinc-800",
                                  )}
                                >
                                  {side.id === "left" ? "Zurdo" : side.id === "right" ? (profile.side === "foot" ? "Derecho" : "Diestro") : "Ambos"}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </section>
            ) : null}

            <section className="grid gap-4">
              <SectionTitle step={detailed.length ? 5 : 4} title="Datos personales" />
              <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                Nombre completo
                <Input
                  required
                  value={draft.fullName}
                  onChange={(event) => setDraft({ ...draft, fullName: event.target.value })}
                  placeholder="Ej. Andrés Rivas"
                  className="h-12 rounded-2xl bg-white text-base"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                  <span className="flex items-center justify-between">
                    Nacimiento
                    {age != null ? (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-[#C8102E]">
                        {age} años
                      </span>
                    ) : null}
                  </span>
                  <Input
                    type="date"
                    value={draft.birthDate}
                    onChange={(event) => setDraft({ ...draft, birthDate: event.target.value })}
                    className="h-12 rounded-2xl bg-white"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                  Altura
                  <div className="relative">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={140}
                      max={230}
                      value={draft.heightCm}
                      onChange={(event) => setDraft({ ...draft, heightCm: event.target.value })}
                      placeholder="178"
                      className="h-12 rounded-2xl bg-white pr-10"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-zinc-400">
                      cm
                    </span>
                  </div>
                </label>
              </div>
              <ImageUploader
                key={draft.personId ?? "new-athlete"}
                folder="jugadores"
                path={
                  university && uploadSport
                    ? athleteUploadPath({
                        universityShort: university.shortName,
                        sportSlug: uploadSport.slug,
                        gender: draft.gender,
                      })
                    : undefined
                }
                label="Foto del jugador"
                initialUrl={draft.photoUrl}
                onUploaded={(asset) => setDraft({ ...draft, photoUrl: asset.secureUrl })}
              />
              <button
                type="button"
                role="switch"
                aria-checked={draft.isActive}
                onClick={() => setDraft({ ...draft, isActive: !draft.isActive })}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 text-left ring-1 ring-zinc-200"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-zinc-900">Jugador activo</span>
                  <span className="block text-xs text-zinc-500">Solo los activos aparecen al cargar resultados.</span>
                </span>
                <span
                  className={cn(
                    "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                    draft.isActive ? "bg-[#C8102E]" : "bg-zinc-200",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 size-5 rounded-full bg-white shadow transition-all",
                      draft.isActive ? "left-6" : "left-1",
                    )}
                  />
                </span>
              </button>
            </section>

          </form>
        ) : null}
        <div className="shrink-0 border-t border-rose-100/70 bg-white px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 sm:py-4">
          <Button
            type="submit"
            form="athlete-form"
            disabled={pending}
            className={cn(adminLaserCtaClass, "h-12 w-full rounded-2xl text-[15px] font-semibold")}
          >
            {pending ? "Guardando..." : draft?.personId ? "Guardar cambios" : "Agregar atleta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
