"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CheckIcon,
  ClipboardCopyIcon,
  PlusIcon,
  ShuffleIcon,
  TableIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { NativeSelect } from "@/components/admin/field";
import { TeamCrest } from "@/components/admin/competition-filters";
import { GENDER_LABELS } from "@/lib/admin/labels";
import { SPORT_EMOJI } from "@/lib/admin/sport";
import { createMatchesBulk, type BulkMatchInput } from "@/app/admin/(panel)/partidos/actions";
import {
  ROUNDS,
  VenueInput,
  normalize,
  toDateInput,
} from "@/app/admin/(panel)/partidos/match-form-dialog";
import type { SportOption, TeamGender, TeamOption, UniversityOption } from "@/app/admin/(panel)/partidos/types";
import { cn } from "@/lib/utils";

type Mode = "jornada" | "excel";
type Pair = { key: string; home: string; away: string; time: string; date: string; round: string };

const START_TIME = "16:00";
const GENDERS: TeamGender[] = ["male", "female", "mixed"];
const TEMPLATE = [
  "Fecha\tHora\tDeporte\tCategoría\tLocal\tVisitante\tSede\tFase",
  "18/10/2026\t16:00\tFútbol Campo\tMasculino\tUCV\tUCAB\tEstadio Olímpico UCV\tJornada 1",
  "18/10/2026\t18:00\tBaloncesto\tFemenino\tUNIMET\tUSB\tGimnasio UNIMET\tJornada 1",
].join("\n");

let pairSeq = 0;
function newPair(time: string): Pair {
  pairSeq += 1;
  return { key: `p${pairSeq}`, home: "", away: "", time, date: "", round: "" };
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00`);
  value.setDate(value.getDate() + days);
  return toDateInput(value);
}

function addHours(time: string, hours: number) {
  const [h = 16, m = 0] = time.split(":").map(Number);
  return `${String(Math.min(23, h + hours)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function shortDate(date: string) {
  return new Date(`${date}T12:00`).toLocaleDateString("es-VE", { weekday: "short", day: "numeric", month: "short" });
}

function roundRobin(ids: string[], twoLegs: boolean) {
  const list = ids.length % 2 ? [...ids, ""] : [...ids];
  const rounds: Array<Array<[string, string]>> = [];
  for (let round = 0; round < list.length - 1; round += 1) {
    const pairs: Array<[string, string]> = [];
    for (let index = 0; index < list.length / 2; index += 1) {
      const a = list[index];
      const b = list[list.length - 1 - index];
      if (a && b) pairs.push(round % 2 ? [b, a] : [a, b]);
    }
    rounds.push(pairs);
    list.splice(1, 0, list.pop() as string);
  }
  return twoLegs ? [...rounds, ...rounds.map((pairs) => pairs.map(([a, b]) => [b, a] as [string, string]))] : rounds;
}

function toIso(date: string, time: string) {
  return new Date(`${date}T${time}`).toISOString();
}

type ParsedLine = { line: number; text: string; row?: BulkMatchInput; label?: string; error?: string };

function parseDate(value: string) {
  const dmy = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (dmy) {
    const year = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
    return `${year}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  const ymd = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  return ymd ? `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}` : null;
}

function parseTime(value: string) {
  const match = normalize(value)
    .replace(/\./g, "")
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a m|p m)?$/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const suffix = match[3]?.replace(" ", "");
  if (suffix === "pm" && hours < 12) hours += 12;
  if (suffix === "am" && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function parseGender(value: string): TeamGender | null {
  const key = normalize(value);
  if (key.startsWith("mix") || key === "x") return "mixed";
  if (key.startsWith("f")) return "female";
  if (key.startsWith("m")) return "male";
  return null;
}

function parsePaste(text: string, sports: SportOption[], universities: UniversityOption[]): ParsedLine[] {
  const findSport = (value: string) => {
    const key = normalize(value);
    return (
      sports.find((sport) => normalize(sport.name) === key || sport.slug === key) ??
      sports.find((sport) => normalize(sport.name).startsWith(key))
    );
  };
  const findUniversity = (value: string) => {
    const key = normalize(value);
    return universities.find(
      (university) => normalize(university.shortName) === key || normalize(university.name) === key,
    );
  };

  return text
    .split(/\r?\n/)
    .map((text, index) => ({ text: text.trim(), line: index + 1 }))
    .filter(({ text }) => text && !normalize(text).startsWith("fecha"))
    .map(({ text, line }) => {
      const separator = text.includes("\t") ? "\t" : text.includes(";") ? ";" : ",";
      const [date = "", time = "", sportName = "", category = "", local = "", visitor = "", place = "", round = ""] =
        text.split(separator).map((cell) => cell.trim());
      const day = parseDate(date);
      const hour = parseTime(time);
      const sport = findSport(sportName);
      const gender = parseGender(category);
      const home = findUniversity(local);
      const away = findUniversity(visitor);
      const problems = [
        !day && `fecha "${date}"`,
        !hour && `hora "${time}"`,
        !sport && `deporte "${sportName}"`,
        !gender && `categoría "${category}"`,
        !home && `local "${local}"`,
        !away && `visitante "${visitor}"`,
      ].filter(Boolean);
      if (problems.length) return { line, text, error: `No reconozco ${problems.join(", ")}` };
      if (home!.id === away!.id) return { line, text, error: "Local y visitante son el mismo" };
      return {
        line,
        text,
        label: `${home!.shortName} vs ${away!.shortName} · ${sport!.name} ${GENDER_LABELS[gender!].toLowerCase()} · ${shortDate(day!)} ${hour}`,
        row: {
          sportId: sport!.id,
          gender: gender!,
          homeUniversityId: home!.id,
          awayUniversityId: away!.id,
          matchDate: toIso(day!, hour!),
          location: place,
          roundName: round,
        },
      };
    });
}

export function BulkMatchDialog({
  open,
  onOpenChange,
  sports,
  teams,
  universities,
  locations,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sports: SportOption[];
  teams: TeamOption[];
  universities: UniversityOption[];
  locations: string[];
}) {
  const [mode, setMode] = useState<Mode>("jornada");
  const [sportId, setSportId] = useState("");
  const [gender, setGender] = useState<TeamGender>("male");
  const [date, setDate] = useState(() => toDateInput(new Date()));
  const [location, setLocation] = useState("");
  const [round, setRound] = useState("Fase de grupos");
  const [pairs, setPairs] = useState<Pair[]>(() => [newPair("16:00"), newPair("18:00")]);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [twoLegs, setTwoLegs] = useState(false);
  const [gapDays, setGapDays] = useState(7);
  const [paste, setPaste] = useState("");
  const [pending, startTransition] = useTransition();

  const enrolled = useMemo(
    () =>
      new Set(teams.filter((team) => team.sportId === sportId && team.gender === gender).map((team) => team.universityId)),
    [teams, sportId, gender],
  );
  const parsed = useMemo(() => parsePaste(paste, sports, universities), [paste, sports, universities]);

  const filledPairs = pairs.filter((pair) => pair.home || pair.away);
  const pairProblems = filledPairs.filter((pair) => !pair.home || !pair.away || pair.home === pair.away || !pair.time);
  const jornadaRows: BulkMatchInput[] =
    sportId && pairProblems.length === 0
      ? filledPairs.map((pair) => ({
          sportId,
          gender,
          homeUniversityId: pair.home,
          awayUniversityId: pair.away,
          matchDate: toIso(pair.date || date, pair.time),
          location,
          roundName: pair.round || round,
        }))
      : [];
  const pasteRows = parsed.flatMap((line) => (line.row ? [line.row] : []));
  const rows = mode === "jornada" ? jornadaRows : pasteRows;

  const generatedCount = useMemo(() => {
    const n = picked.length;
    return n < 2 ? 0 : ((n * (n - 1)) / 2) * (twoLegs ? 2 : 1);
  }, [picked, twoLegs]);

  function updatePair(key: string, patch: Partial<Pair>) {
    setPairs((current) => current.map((pair) => (pair.key === key ? { ...pair, ...patch } : pair)));
  }

  function addPair() {
    setPairs((current) => [...current, newPair(current.length ? addHours(current[current.length - 1].time, 2) : START_TIME)]);
  }

  function generate() {
    const schedule = roundRobin(picked, twoLegs);
    const next: Pair[] = schedule.flatMap((matches, roundIndex) =>
      matches.map(([home, away], matchIndex) => ({
        ...newPair(addHours(START_TIME, matchIndex * 2)),
        home,
        away,
        date: addDays(date, roundIndex * gapDays),
        round: `Jornada ${roundIndex + 1}`,
      })),
    );
    setPairs(next);
    setGeneratorOpen(false);
    toast.add({ type: "success", title: `${next.length} partidos generados`, description: "Revísalos y carga." });
  }

  function submit() {
    if (!rows.length) return;
    startTransition(async () => {
      const result = await createMatchesBulk(rows);
      if (!result.ok) {
        toast.add({ type: "error", title: "No se pudo cargar", description: result.error });
        return;
      }
      toast.add({ type: "success", title: `${result.count} partidos cargados` });
      setPairs([newPair(START_TIME), newPair(addHours(START_TIME, 2))]);
      setPaste("");
      onOpenChange(false);
    });
  }

  const hint =
    mode === "jornada"
      ? !sportId
        ? "Elige un deporte"
        : pairProblems.length
          ? `Revisa ${pairProblems.length} ${pairProblems.length === 1 ? "partido incompleto" : "partidos incompletos"}`
          : rows.length
            ? `${rows.length} listos para cargar`
            : "Agrega al menos un partido"
      : parsed.length
        ? `${pasteRows.length} de ${parsed.length} filas listas`
        : "Pega las filas desde Excel";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex! max-h-[94dvh] flex-col gap-0 overflow-hidden p-0! max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none! sm:max-h-[90dvh] sm:max-w-2xl">
        <div className="shrink-0 px-5 pt-5 pb-4 text-center sm:px-7 sm:pt-6">
          <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-zinc-200 sm:hidden" />
          <DialogTitle className="text-xl font-semibold tracking-tight text-zinc-950">Carga masiva</DialogTitle>
          <DialogDescription className="mt-1 text-sm">Sube varios partidos de una sola vez.</DialogDescription>
          <div className="mx-auto mt-4 grid max-w-sm grid-cols-2 gap-1 rounded-2xl bg-zinc-100 p-1">
            {(
              [
                ["jornada", "Armar jornada", UsersIcon],
                ["excel", "Pegar de Excel", TableIcon],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all",
                  mode === value ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-800",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-rose-100/70 px-5 pt-5 pb-8 sm:px-7">
          {mode === "jornada" ? (
            <div className="grid gap-7">
              <section className="grid gap-3">
                <Label>Para todos los partidos</Label>
                <div className="grid grid-cols-3 gap-2">
                  {sports.map((sport) => (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => setSportId(sport.id)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-2xl px-1 py-2.5 text-center transition-all active:scale-[0.97]",
                        sportId === sport.id
                          ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white shadow-[0_12px_24px_-12px_rgba(200,16,46,0.9)]"
                          : "bg-white text-zinc-800 ring-1 ring-zinc-200 hover:ring-[#C8102E]/40",
                      )}
                    >
                      <span className="text-xl leading-none">{SPORT_EMOJI[sport.slug] ?? "🏅"}</span>
                      <span className="text-[12px] leading-tight font-semibold">{sport.name}</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1 rounded-2xl bg-zinc-100 p-1">
                  {GENDERS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setGender(item)}
                      className={cn(
                        "rounded-xl py-2 text-sm font-semibold transition-all",
                        gender === item ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-800",
                      )}
                    >
                      {GENDER_LABELS[item]}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <MiniField label="Fecha">
                    <Input
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className="h-11 rounded-xl bg-white"
                    />
                  </MiniField>
                  <MiniField label="Fase">
                    <NativeSelect
                      value={ROUNDS.includes(round) ? round : "__custom"}
                      onChange={(event) => setRound(event.target.value === "__custom" ? "" : event.target.value)}
                      className="[&>select]:h-11"
                    >
                      {ROUNDS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                      <option value="__custom">Otra…</option>
                    </NativeSelect>
                  </MiniField>
                </div>
                {!ROUNDS.includes(round) ? (
                  <Input
                    value={round}
                    onChange={(event) => setRound(event.target.value)}
                    placeholder="Ej. Jornada 3"
                    className="h-11 rounded-xl bg-white"
                  />
                ) : null}
                <VenueInput value={location} options={locations} onChange={setLocation} />
              </section>

              <section className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <Label>Partidos ({filledPairs.length})</Label>
                  <button
                    type="button"
                    onClick={() => setGeneratorOpen((value) => !value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                      generatorOpen ? "bg-zinc-900 text-white" : "bg-rose-50 text-[#C8102E] hover:bg-rose-100",
                    )}
                  >
                    <ShuffleIcon className="size-3.5" />
                    Todos contra todos
                  </button>
                </div>

                {generatorOpen ? (
                  <div className="grid gap-3 rounded-3xl border border-rose-100 bg-linear-to-br from-[#fde4e3]/70 via-white to-white p-4">
                    <p className="text-sm text-zinc-600">
                      Elige las universidades y se arma el calendario completo, una jornada cada{" "}
                      <select
                        value={gapDays}
                        onChange={(event) => setGapDays(Number(event.target.value))}
                        className="rounded-md bg-white px-1 font-semibold text-zinc-900 ring-1 ring-zinc-200"
                      >
                        {[1, 2, 3, 7, 14].map((days) => (
                          <option key={days} value={days}>
                            {days === 1 ? "día" : days === 7 ? "semana" : days === 14 ? "2 semanas" : `${days} días`}
                          </option>
                        ))}
                      </select>{" "}
                      desde el {shortDate(date)}.
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {universities.map((university) => {
                        const on = picked.includes(university.id);
                        return (
                          <button
                            key={university.id}
                            type="button"
                            onClick={() =>
                              setPicked((current) =>
                                on ? current.filter((id) => id !== university.id) : [...current, university.id],
                              )
                            }
                            className={cn(
                              "relative flex flex-col items-center gap-1 rounded-2xl border-2 py-2.5 transition-all active:scale-[0.96]",
                              on ? "border-[#C8102E] bg-rose-50" : "border-transparent bg-white ring-1 ring-zinc-200",
                            )}
                          >
                            {on ? (
                              <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-[#C8102E] text-white">
                                <CheckIcon className="size-2.5" strokeWidth={3} />
                              </span>
                            ) : null}
                            <TeamCrest bare logoUrl={university.logoUrl} label={university.shortName} className="size-9" />
                            <span className="text-[11px] font-bold text-zinc-900">{university.shortName}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex gap-1 rounded-full bg-zinc-100 p-1">
                        {[false, true].map((value) => (
                          <button
                            key={String(value)}
                            type="button"
                            onClick={() => setTwoLegs(value)}
                            className={cn(
                              "rounded-full px-3 py-1.5 text-xs font-semibold",
                              twoLegs === value ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500",
                            )}
                          >
                            {value ? "Ida y vuelta" : "Solo ida"}
                          </button>
                        ))}
                      </div>
                      <Button
                        type="button"
                        disabled={generatedCount === 0}
                        onClick={generate}
                        className={cn(adminLaserCtaClass, "h-10 rounded-xl px-4")}
                      >
                        {generatedCount ? `Generar ${generatedCount} partidos` : "Elige 2 o más"}
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-2.5">
                  {pairs.map((pair, index) => {
                    const bad = (pair.home || pair.away) && (!pair.home || !pair.away || pair.home === pair.away);
                    return (
                      <div
                        key={pair.key}
                        className={cn(
                          "grid gap-2 rounded-2xl bg-white p-3 ring-1",
                          bad ? "ring-amber-300" : "ring-zinc-200",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-zinc-100 text-[11px] font-bold text-zinc-500">
                            {index + 1}
                          </span>
                          <TeamSelect
                            value={pair.home}
                            placeholder="Local"
                            universities={universities}
                            disabledId={pair.away}
                            enrolled={enrolled}
                            onChange={(home) => updatePair(pair.key, { home })}
                          />
                          <span className="shrink-0 text-[11px] font-black text-[#C8102E]">VS</span>
                          <TeamSelect
                            value={pair.away}
                            placeholder="Visitante"
                            universities={universities}
                            disabledId={pair.home}
                            enrolled={enrolled}
                            onChange={(away) => updatePair(pair.key, { away })}
                          />
                        </div>
                        <div className="flex items-center gap-2 pl-8">
                          <Input
                            type="time"
                            aria-label="Hora"
                            value={pair.time}
                            onChange={(event) => updatePair(pair.key, { time: event.target.value })}
                            className="h-9 w-28 rounded-lg bg-white text-sm"
                          />
                          {pair.date ? (
                            <span className="truncate rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-[#9e1b28] capitalize">
                              {shortDate(pair.date)}
                              {pair.round ? ` · ${pair.round}` : ""}
                            </span>
                          ) : null}
                          <button
                            type="button"
                            aria-label="Quitar partido"
                            onClick={() => setPairs((current) => current.filter((item) => item.key !== pair.key))}
                            className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-zinc-300 hover:bg-rose-50 hover:text-[#C8102E]"
                          >
                            <Trash2Icon className="size-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={addPair}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-200 text-sm font-semibold text-[#C8102E] transition-colors hover:bg-rose-50"
                  >
                    <PlusIcon className="size-4" />
                    Agregar partido
                  </button>
                </div>
                {sportId && filledPairs.some((pair) => (pair.home && !enrolled.has(pair.home)) || (pair.away && !enrolled.has(pair.away))) ? (
                  <p className="text-center text-[11px] text-amber-700">
                    Las universidades sin equipo en {sports.find((sport) => sport.id === sportId)?.name}{" "}
                    {GENDER_LABELS[gender].toLowerCase()} se inscriben solas al cargar.
                  </p>
                ) : null}
              </section>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="rounded-3xl border border-rose-100 bg-linear-to-br from-[#fde4e3]/60 via-white to-white p-4">
                <p className="text-sm font-semibold text-zinc-900">Una fila por partido, en este orden:</p>
                <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-1">
                  {["Fecha", "Hora", "Deporte", "Categoría", "Local", "Visitante", "Sede", "Fase"].map((column, index) => (
                    <span
                      key={column}
                      className={cn(
                        "shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold",
                        index < 6 ? "bg-white text-zinc-800 ring-1 ring-zinc-200" : "bg-zinc-100 text-zinc-500",
                      )}
                    >
                      {column}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Copia las celdas en Excel o Google Sheets y pégalas abajo. Sede y Fase son opcionales. Local y
                  visitante con las siglas (UCV, UCAB…).
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
                placeholder={"18/10/2026\t16:00\tFútbol Campo\tMasculino\tUCV\tUCAB"}
                className="min-h-40 rounded-2xl bg-white font-mono text-xs leading-relaxed"
              />
              {parsed.length ? (
                <div className="grid gap-1.5">
                  {parsed.map((line) => (
                    <div
                      key={line.line}
                      className={cn(
                        "flex items-start gap-2 rounded-xl px-3 py-2 text-xs",
                        line.row ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900",
                      )}
                    >
                      {line.row ? (
                        <CheckIcon className="mt-0.5 size-3.5 shrink-0" />
                      ) : (
                        <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
                      )}
                      <span className="min-w-0">
                        <span className="font-semibold">Fila {line.line}:</span> {line.row ? line.label : line.error}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-rose-100/70 bg-[#fbf7f7] px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 sm:py-4">
          <div className="mx-auto flex max-w-md flex-col items-center gap-2 sm:max-w-none sm:flex-row sm:justify-between">
            <p className={cn("text-xs", rows.length ? "font-medium text-emerald-700" : "text-zinc-500")}>{hint}</p>
            <Button
              type="button"
              onClick={submit}
              disabled={!rows.length || pending}
              className={cn(adminLaserCtaClass, "h-12 w-full rounded-2xl px-8 text-[15px] font-semibold sm:w-auto")}
            >
              {pending ? "Cargando..." : rows.length ? `Cargar ${rows.length} partidos` : "Cargar partidos"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[15px] font-semibold text-zinc-950">{children}</h3>;
}

function MiniField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-xs font-medium text-zinc-500">
      {label}
      {children}
    </label>
  );
}

function TeamSelect({
  value,
  placeholder,
  universities,
  disabledId,
  enrolled,
  onChange,
}: {
  value: string;
  placeholder: string;
  universities: UniversityOption[];
  disabledId: string;
  enrolled: Set<string>;
  onChange: (value: string) => void;
}) {
  const selected = universities.find((university) => university.id === value);
  return (
    <span className="relative flex min-w-0 flex-1 items-center">
      {selected ? (
        <TeamCrest
          bare
          logoUrl={selected.logoUrl}
          label={selected.shortName}
          className="pointer-events-none absolute left-2 size-6"
        />
      ) : null}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={placeholder}
        className={cn(
          "h-11 w-full min-w-0 cursor-pointer appearance-none truncate rounded-xl border bg-white pr-2 text-sm font-semibold outline-none transition-colors focus-visible:border-[#C8102E]/50 focus-visible:ring-3 focus-visible:ring-[#C8102E]/15",
          selected ? "border-zinc-200 pl-9 text-zinc-950" : "border-dashed border-zinc-300 pl-3 text-zinc-400",
        )}
      >
        <option value="">{placeholder}</option>
        {universities.map((university) => (
          <option key={university.id} value={university.id} disabled={university.id === disabledId}>
            {university.shortName}
            {enrolled.size && !enrolled.has(university.id) ? " (nuevo)" : ""}
          </option>
        ))}
      </select>
    </span>
  );
}
