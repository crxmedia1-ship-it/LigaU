"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckIcon, ClipboardCopyIcon, TriangleAlertIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { TeamCrest } from "@/components/admin/competition-filters";
import { GENDER_LABELS } from "@/lib/admin/labels";
import { SPORT_EMOJI } from "@/lib/admin/sport";
import { createAthletesBulk, type BulkAthleteInput, type DominantSide } from "@/app/admin/(panel)/equipos/actions";
import { sportProfile } from "@/app/admin/(panel)/equipos/athlete-dialog";
import type {
  AthleteRow,
  SportOption,
  TeamRow,
  UniversityOption,
} from "@/app/admin/(panel)/equipos/equipos-board";
import { cn } from "@/lib/utils";

const COLUMNS = ["Nombre", "Número", "Posición", "Pie / mano", "Nacimiento", "Altura (cm)"];
const TEMPLATE = [
  COLUMNS.join("\t"),
  "Andrés Rivas\t9\tDelantero\tDerecho\t14/03/2004\t178",
  "Luis Herrera\t10\tMediocampista\tZurdo\t02/11/2003\t172",
].join("\n");

type ParsedLine = { line: number; row?: BulkAthleteInput; label?: string; error?: string; warning?: string };

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function parseSide(value: string): DominantSide | null | undefined {
  const text = normalize(value);
  if (!text) return null;
  if (/^(zurd|izq|left|l$)/.test(text)) return "left";
  if (/^(derech|diestr|right|r$|d$)/.test(text)) return "right";
  if (/^(ambo|ambi)/.test(text)) return "both";
  return undefined;
}

function parseDate(value: string): string | null | undefined {
  const text = value.trim();
  if (!text) return null;
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const latin = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  let year: number, month: number, day: number;
  if (iso) [year, month, day] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  else if (latin) {
    [day, month, year] = [Number(latin[1]), Number(latin[2]), Number(latin[3])];
    if (year < 100) year += year > 50 ? 1900 : 2000;
  } else return undefined;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined;
  return date.toISOString().slice(0, 10);
}

function parseHeight(value: string): number | null | undefined {
  const text = value.trim().replace(",", ".").replace(/\s*(cm|m)$/i, "");
  if (!text) return null;
  const number = Number(text);
  if (!Number.isFinite(number)) return undefined;
  const cm = number < 3 ? Math.round(number * 100) : Math.round(number);
  return cm >= 140 && cm <= 230 ? cm : undefined;
}

export function AthletesBulkDialog({
  open,
  onOpenChange,
  universities,
  sports,
  teams,
  athletes,
  initialUniversityId,
  initialSportId,
  initialGender,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  universities: UniversityOption[];
  sports: SportOption[];
  teams: TeamRow[];
  athletes: AthleteRow[];
  initialUniversityId: string;
  initialSportId: string;
  initialGender: "male" | "female";
  onSaved: (universityId: string, sportId: string) => void;
}) {
  const [universityId, setUniversityId] = useState(initialUniversityId);
  const [sportId, setSportId] = useState(initialSportId);
  const [gender, setGender] = useState<"male" | "female">(initialGender);
  const [paste, setPaste] = useState("");
  const [pending, startTransition] = useTransition();

  const sport = sports.find((item) => item.id === sportId);
  const university = universities.find((item) => item.id === universityId);
  const profile = sportProfile(sport?.slug);
  const team =
    teams.find((item) => item.universityId === universityId && item.sportId === sportId && item.gender === gender) ??
    teams.find((item) => item.universityId === universityId && item.sportId === sportId && item.gender === "mixed");

  const parsed = useMemo<ParsedLine[]>(() => {
    const existing = new Set(
      athletes.filter((athlete) => athlete.teamId === team?.id).map((athlete) => normalize(athlete.fullName)),
    );
    const seen = new Set<string>();
    return paste
      .split(/\r?\n/)
      .map((text, index) => ({ text, line: index + 1 }))
      .filter(({ text }) => text.trim())
      .filter(({ text, line }) => !(line === 1 && /^nombre/i.test(text.trim())))
      .map(({ text, line }) => {
        const cells = (text.includes("\t") ? text.split("\t") : text.split(/[;,]/)).map((cell) => cell.trim());
        const [name = "", number = "", position = "", side = "", birth = "", height = ""] = cells;
        if (!name) return { line, error: "Falta el nombre." };
        const jersey = profile.number && number ? Number(number) : null;
        if (jersey != null && (!Number.isInteger(jersey) || jersey <= 0)) {
          return { line, error: `Número inválido: "${number}".` };
        }
        const dominantSide = profile.side ? parseSide(side) : null;
        if (dominantSide === undefined) return { line, error: `Pie/mano no reconocido: "${side}" (usa Derecho, Zurdo o Ambos).` };
        const birthDate = parseDate(birth);
        if (birthDate === undefined) return { line, error: `Fecha inválida: "${birth}" (usa dd/mm/aaaa).` };
        if (birthDate && birthDate > new Date().toISOString().slice(0, 10)) {
          return { line, error: "La fecha de nacimiento es futura." };
        }
        const heightCm = parseHeight(height);
        if (heightCm === undefined) return { line, error: `Altura inválida: "${height}" (entre 140 y 230 cm).` };
        const key = normalize(name);
        const warning = existing.has(key)
          ? "Ya está en este equipo."
          : seen.has(key)
            ? "Repetido en la lista."
            : undefined;
        seen.add(key);
        const label = [
          name,
          jersey != null ? `#${jersey}` : null,
          profile.number && position ? position : null,
          dominantSide ? { left: "Zurdo", right: "Derecho", both: "Ambos" }[dominantSide] : null,
          heightCm ? `${heightCm} cm` : null,
        ]
          .filter(Boolean)
          .join(" · ");
        return {
          line,
          label,
          warning,
          row: {
            fullName: name,
            jerseyNumber: jersey,
            position: profile.number ? position : "",
            dominantSide,
            birthDate,
            heightCm,
          },
        };
      });
  }, [paste, profile.number, profile.side, athletes, team?.id]);

  const valid = parsed.filter((line) => line.row);
  const errors = parsed.length - valid.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex! max-h-[94dvh] flex-col gap-0 overflow-hidden p-0! max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none! sm:max-w-2xl">
        <div className="shrink-0 px-5 pt-5 pb-4 text-center sm:px-7">
          <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-zinc-200 sm:hidden" />
          <DialogTitle className="text-xl font-semibold text-zinc-950">Carga masiva de atletas</DialogTitle>
          <DialogDescription className="mt-1 text-sm">Elige el equipo y pega la lista desde Excel o Sheets.</DialogDescription>
        </div>

        <div className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto border-t border-rose-100/70 bg-[#fbf9f9] px-5 pt-5 pb-8 sm:px-7">
          <section className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-950">Universidad</span>
            <div className="grid grid-cols-4 gap-2">
              {universities.map((item) => {
                const active = item.id === universityId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setUniversityId(item.id)}
                    className={cn(
                      "flex min-w-0 flex-col items-center gap-1.5 rounded-2xl px-1.5 pt-2.5 pb-2 transition-all",
                      active
                        ? "bg-white shadow-[0_10px_24px_-14px_rgba(200,16,46,0.7)] ring-2 ring-[#C8102E]"
                        : "bg-white ring-1 ring-zinc-200 hover:ring-[#C8102E]/40",
                    )}
                  >
                    <TeamCrest logoUrl={item.logoUrl} label={item.shortName} bare className="size-9" />
                    <span className="w-full truncate text-center text-xs font-semibold text-zinc-800">{item.shortName}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-950">Deporte</span>
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-1 sm:-mx-7 sm:px-7">
              {sports.map((item) => {
                const active = item.id === sportId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSportId(item.id)}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-all",
                      active
                        ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white shadow-[0_10px_20px_-12px_rgba(200,16,46,0.9)]"
                        : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:ring-[#C8102E]/40",
                    )}
                  >
                    <span className="text-base leading-none">{SPORT_EMOJI[item.slug] ?? "🏅"}</span>
                    {item.name}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-950">Rama</span>
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-zinc-100 p-1">
              {(["male", "female"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={gender === item}
                  onClick={() => setGender(item)}
                  className={cn(
                    "rounded-xl py-2.5 text-sm font-semibold transition-all",
                    gender === item ? "bg-white text-[#C8102E] shadow-sm" : "text-zinc-500 hover:text-zinc-800",
                  )}
                >
                  {GENDER_LABELS[item]}
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-500">
              {team
                ? `Se agregan a ${university?.shortName} · ${sport?.name} ${GENDER_LABELS[team.gender].toLowerCase()}.`
                : `${university?.shortName ?? "La universidad"} aún no tiene equipo ${GENDER_LABELS[gender].toLowerCase()} de ${sport?.name ?? "este deporte"}: se crea al guardar.`}
            </p>
          </section>

          <section className="grid gap-3">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
              <p className="text-sm font-semibold text-zinc-950">Columnas en este orden</p>
              <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto">
                {COLUMNS.map((column, index) => {
                  const ignored =
                    (!profile.number && (index === 1 || index === 2)) || (!profile.side && index === 3);
                  return (
                    <span
                      key={column}
                      className={cn(
                        "shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold",
                        index === 0
                          ? "bg-[#C8102E] text-white"
                          : ignored
                            ? "bg-zinc-100 text-zinc-400 line-through"
                            : "bg-white text-zinc-800 ring-1 ring-zinc-200",
                      )}
                    >
                      {column}
                    </span>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Solo el nombre es obligatorio. Copia las celdas en Excel o Google Sheets y pégalas abajo, una fila por
                atleta.
                {!profile.number ? ` En ${sport?.name ?? "este deporte"} no se usan número ni posición.` : ""}
              </p>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(TEMPLATE);
                  toast.add({ type: "success", title: "Plantilla copiada", description: "Pégala en Excel o Sheets." });
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#C8102E] ring-1 ring-rose-200 hover:bg-rose-50"
              >
                <ClipboardCopyIcon className="size-3.5" />
                Copiar plantilla
              </button>
            </div>
            <Textarea
              value={paste}
              onChange={(event) => setPaste(event.target.value)}
              placeholder={"Andrés Rivas\t9\tDelantero\tDerecho\t14/03/2004\t178"}
              className="min-h-40 rounded-2xl bg-white font-mono text-xs leading-relaxed"
            />
            {parsed.length ? (
              <div className="grid gap-1.5">
                {parsed.map((line) => (
                  <div
                    key={line.line}
                    className={cn(
                      "flex items-start gap-2 rounded-xl px-3 py-2 text-xs",
                      !line.row
                        ? "bg-red-50 text-red-900"
                        : line.warning
                          ? "bg-amber-50 text-amber-900"
                          : "bg-emerald-50 text-emerald-900",
                    )}
                  >
                    {line.row && !line.warning ? (
                      <CheckIcon className="mt-0.5 size-3.5 shrink-0" />
                    ) : (
                      <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
                    )}
                    <span className="min-w-0">
                      <span className="font-semibold">Fila {line.line}:</span> {line.row ? line.label : line.error}
                      {line.warning ? <span className="ml-1 font-semibold">({line.warning})</span> : null}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>

        <div className="shrink-0 border-t border-rose-100/70 bg-white px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 sm:py-4">
          {errors ? (
            <p className="mb-2 text-center text-xs font-medium text-red-700">
              {errors} {errors === 1 ? "fila tiene" : "filas tienen"} errores. Corrígelas o se omitirán.
            </p>
          ) : null}
          <Button
            type="button"
            disabled={pending || !valid.length}
            onClick={() =>
              startTransition(async () => {
                const result = await createAthletesBulk({
                  universityId,
                  sportId,
                  gender,
                  rows: valid.map((line) => line.row!),
                });
                if (!result.ok) {
                  toast.add({ type: "error", title: "No se pudo guardar", description: result.error });
                  return;
                }
                toast.add({
                  type: "success",
                  title: `${result.count} ${result.count === 1 ? "atleta agregado" : "atletas agregados"}`,
                });
                setPaste("");
                onSaved(universityId, sportId);
              })
            }
            className={cn(adminLaserCtaClass, "h-12 w-full rounded-2xl text-[15px] font-semibold")}
          >
            {pending
              ? "Guardando..."
              : valid.length
                ? `Agregar ${valid.length} ${valid.length === 1 ? "atleta" : "atletas"}`
                : "Pega la lista para continuar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
