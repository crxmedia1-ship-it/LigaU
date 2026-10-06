"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { ArrowLeftRightIcon, CalendarDaysIcon, CheckIcon, Clock3Icon, MapPinIcon, PlusIcon, XIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { TeamCrest } from "@/components/admin/competition-filters";
import { GENDER_LABELS, MATCH_STATUS_LABELS } from "@/lib/admin/labels";
import { SPORT_EMOJI } from "@/lib/admin/sport";
import { upsertMatch } from "@/app/admin/(panel)/partidos/actions";
import type {
  MatchStatus,
  SportOption,
  TeamGender,
  TeamOption,
  UniversityOption,
} from "@/app/admin/(panel)/partidos/types";
import { cn } from "@/lib/utils";
import { normalizeText } from "@/lib/text";

export type MatchDraft = {
  id?: string;
  sportId: string;
  gender: TeamGender;
  homeUniversityId: string;
  awayUniversityId: string;
  matchDate: string;
  location: string;
  roundName: string;
  status: MatchStatus;
};

type Slot = "home" | "away";
type Step = "date" | "time" | "place";

const GENDERS: TeamGender[] = ["male", "female", "mixed"];
export const ROUNDS = ["Fase de grupos", "Octavos", "Cuartos de final", "Semifinal", "Final", "Amistoso"];
const STATUSES: MatchStatus[] = ["scheduled", "live", "postponed", "cancelled", "finished"];
const TIMES = ["08:00", "10:00", "12:00", "14:00", "16:00", "17:00", "18:00", "19:00"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function toDateInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function nextDays(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      value: toDateInput(date),
      top:
        index === 0
          ? "Hoy"
          : index === 1
            ? "Mañana"
            : date.toLocaleDateString("es-VE", { weekday: "short" }).replace(".", ""),
      day: date.getDate(),
      month: date.toLocaleDateString("es-VE", { month: "short" }).replace(".", ""),
      weekend: date.getDay() === 0 || date.getDay() === 6,
    };
  });
}

function Section({
  step,
  title,
  hint,
  children,
  aside,
  sectionRef,
}: {
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
  sectionRef?: React.Ref<HTMLElement>;
}) {
  return (
    <section ref={sectionRef} className="grid scroll-mt-32 gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-6 place-items-center rounded-full bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-[11px] font-bold text-white shadow-[0_6px_14px_-6px_rgba(200,16,46,0.8)]">
            {step}
          </span>
          <div>
            <h3 className="text-[15px] leading-tight font-semibold text-zinc-950">{title}</h3>
            {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
          </div>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Tile({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex min-h-12 items-center justify-center rounded-2xl px-3 py-2 text-center text-sm font-semibold transition-all active:scale-[0.97]",
        active
          ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white shadow-[0_12px_24px_-12px_rgba(200,16,46,0.9)]"
          : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:text-zinc-950 hover:ring-brand-red/40",
        className,
      )}
    >
      {children}
    </button>
  );
}

function MoreToggle({ open, onClick, children }: { open: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mx-auto text-xs font-semibold underline-offset-4 hover:underline",
        open ? "text-zinc-500" : "text-brand-red",
      )}
    >
      {children}
    </button>
  );
}

export function MatchFormDialog({
  open,
  onOpenChange,
  initial,
  sports,
  teams,
  universities,
  locations,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: MatchDraft;
  sports: SportOption[];
  teams: TeamOption[];
  universities: UniversityOption[];
  locations: string[];
}) {
  const [draft, setDraft] = useState(initial);
  const [shownInitial, setShownInitial] = useState(initial);
  const [picker, setPicker] = useState<Slot | null>(null);
  const [customDate, setCustomDate] = useState(false);
  const [customTime, setCustomTime] = useState(false);
  const [pending, startTransition] = useTransition();
  const refs = useRef<Partial<Record<Step, HTMLElement | null>>>({});

  const days = useMemo(() => nextDays(14), []);
  const [datePart = "", timePart = ""] = draft.matchDate.split("T");

  if (initial !== shownInitial) {
    const [initialDate = "", initialTime = ""] = initial.matchDate.split("T");
    setShownInitial(initial);
    setDraft(initial);
    setPicker(null);
    setCustomDate(Boolean(initialDate) && !days.some((day) => day.value === initialDate));
    setCustomTime(Boolean(initialTime) && !TIMES.includes(initialTime));
  }

  const teamCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const team of teams) counts.set(team.sportId, (counts.get(team.sportId) ?? 0) + 1);
    return counts;
  }, [teams]);

  const enrolled = new Set(
    teams
      .filter((team) => team.sportId === draft.sportId && team.gender === draft.gender)
      .map((team) => team.universityId),
  );
  const sport = sports.find((item) => item.id === draft.sportId);
  const home = universities.find((university) => university.id === draft.homeUniversityId);
  const away = universities.find((university) => university.id === draft.awayUniversityId);
  const newTeams = [home, away].filter((university) => university && !enrolled.has(university.id));

  function goTo(step: Step) {
    requestAnimationFrame(() =>
      refs.current[step]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      }),
    );
  }

  function pickSport(sportId: string) {
    if (draft.homeUniversityId || draft.awayUniversityId) {
      setDraft({ ...draft, sportId });
      return;
    }
    const pool = teams.filter((team) => team.sportId === sportId);
    const pair = pool.length === 2 && pool[0].gender === pool[1].gender;
    setDraft({
      ...draft,
      sportId,
      gender: pair ? pool[0].gender : draft.gender,
      homeUniversityId: pair ? pool[0].universityId : "",
      awayUniversityId: pair ? pool[1].universityId : "",
    });
  }

  function pickUniversity(universityId: string) {
    if (!picker) return;
    const other: Slot = picker === "home" ? "away" : "home";
    const current = picker === "home" ? draft.homeUniversityId : draft.awayUniversityId;
    const otherId = picker === "home" ? draft.awayUniversityId : draft.homeUniversityId;
    const nextOther = otherId === universityId ? current : otherId;
    const homeUniversityId = picker === "home" ? universityId : nextOther;
    const awayUniversityId = picker === "away" ? universityId : nextOther;
    setDraft({ ...draft, homeUniversityId, awayUniversityId });
    setPicker(nextOther ? null : other);
  }

  function swapTeams() {
    setDraft({
      ...draft,
      homeUniversityId: draft.awayUniversityId,
      awayUniversityId: draft.homeUniversityId,
    });
  }

  function setDatePart(next: string) {
    setDraft({ ...draft, matchDate: `${next}T${timePart}` });
    if (!timePart) goTo("time");
  }

  function setTimePart(next: string) {
    setDraft({
      ...draft,
      matchDate: `${datePart || toDateInput(new Date())}T${next}`,
    });
    if (!draft.location) goTo("place");
  }

  const ready = draft.sportId && draft.homeUniversityId && draft.awayUniversityId && datePart && timePart;
  const missing = [
    !draft.sportId && "deporte",
    (!draft.homeUniversityId || !draft.awayUniversityId) && "equipos",
    !datePart && "fecha",
    !timePart && "hora",
  ].filter(Boolean);
  const whenLabel = datePart
    ? `${new Date(`${datePart}T00:00`).toLocaleDateString("es-VE", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })}${timePart ? ` · ${timePart}` : ""}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex! max-h-[94dvh] flex-col gap-0 overflow-hidden p-0! max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none! sm:max-h-[90dvh] sm:max-w-2xl">
        <div className="shrink-0 px-5 pt-5 pb-3 text-center sm:px-7 sm:pt-6">
          <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-zinc-200 sm:hidden" />
          <DialogTitle className="text-xl font-semibold tracking-tight text-zinc-950">
            {draft.id ? "Editar partido" : "Nuevo partido"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm">
            Toca para elegir. Todo se puede cambiar después.
          </DialogDescription>
        </div>

        <div className="relative shrink-0 border-y border-rose-100/80 bg-linear-to-br from-[#fde4e3] via-white to-[#fdf1f0] px-5 py-3 sm:px-7">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <SlotButton
              label="Local"
              team={home}
              active={picker === "home"}
              onClick={() => setPicker(picker === "home" ? null : "home")}
            />
            <button
              type="button"
              onClick={swapTeams}
              disabled={!home && !away}
              title="Intercambiar local y visitante"
              className="group grid size-10 place-items-center rounded-full bg-white text-brand-red shadow-[0_10px_24px_-12px_rgba(200,16,46,0.7)] ring-1 ring-rose-100 transition-transform enabled:hover:rotate-180 disabled:opacity-60"
            >
              {home || away ? (
                <ArrowLeftRightIcon className="size-4" />
              ) : (
                <span className="text-[11px] font-black tracking-wider">VS</span>
              )}
            </button>
            <SlotButton
              label="Visitante"
              team={away}
              active={picker === "away"}
              onClick={() => setPicker(picker === "away" ? null : "away")}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
            <PreviewPill>
              {sport
                ? `${SPORT_EMOJI[sport.slug] ?? "🏅"} ${sport.name} · ${GENDER_LABELS[draft.gender]}`
                : "Elige un deporte"}
            </PreviewPill>
            {whenLabel ? <PreviewPill>{whenLabel}</PreviewPill> : null}
            {draft.location ? <PreviewPill>{draft.location}</PreviewPill> : null}
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
          {picker ? (
            <div className="absolute inset-0 z-20 overflow-y-auto overscroll-contain bg-white/95 px-5 pt-4 pb-6 backdrop-blur-md animate-in fade-in-0 slide-in-from-top-2 duration-150 sm:px-7">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-zinc-950">
                    Elige el {picker === "home" ? "local" : "visitante"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {sport ? `${sport.name} · ${GENDER_LABELS[draft.gender]}` : "Toca una universidad"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPicker(null)}
                  className="rounded-full bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-200"
                >
                  Cerrar
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {universities.map((university) => {
                  const role =
                    university.id === draft.homeUniversityId
                      ? "Local"
                      : university.id === draft.awayUniversityId
                        ? "Visitante"
                        : null;
                  const mine = role === (picker === "home" ? "Local" : "Visitante");
                  const isEnrolled = enrolled.has(university.id);
                  return (
                    <button
                      key={university.id}
                      type="button"
                      title={university.name}
                      aria-pressed={mine}
                      onClick={() => pickUniversity(university.id)}
                      className={cn(
                        "relative flex flex-col items-center gap-1.5 rounded-2xl border-2 px-1.5 pt-4 pb-3 text-center transition-all active:scale-[0.96]",
                        mine
                          ? "border-brand-red bg-rose-50 shadow-[0_14px_28px_-18px_rgba(200,16,46,0.9)]"
                          : role
                            ? "border-zinc-200 bg-zinc-50 opacity-70"
                            : "border-zinc-100 bg-white hover:border-brand-red/40",
                      )}
                    >
                      <TeamCrest bare logoUrl={university.logoUrl} label={university.shortName} className="size-14" />
                      <span className="w-full min-w-0">
                        <span className="block truncate text-sm font-bold text-zinc-950">{university.shortName}</span>
                        <span
                          className={cn(
                            "block truncate text-[10px] font-medium",
                            role ? "text-brand-red" : isEnrolled || !draft.sportId ? "text-zinc-400" : "text-amber-600",
                          )}
                        >
                          {role ?? (!draft.sportId ? "\u00a0" : isEnrolled ? "Inscrito" : "Nuevo equipo")}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-6 pb-8 sm:px-7">
            <form
              id="match-form"
              className="grid gap-9"
              onSubmit={(event) => {
                event.preventDefault();
                if (!ready) return;
                startTransition(async () => {
                  const result = await upsertMatch({
                    ...draft,
                    matchDate: new Date(draft.matchDate).toISOString(),
                  });
                  if (!result.ok) {
                    toast.add({
                      type: "error",
                      title: "No se pudo guardar",
                      description: result.error,
                    });
                    return;
                  }
                  toast.add({
                    type: "success",
                    title: draft.id ? "Partido actualizado" : "Partido creado",
                  });
                  onOpenChange(false);
                });
              }}
            >
              <Section step={1} title="Deporte">
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {sports.map((item) => {
                    const active = draft.sportId === item.id;
                    const count = teamCount.get(item.id) ?? 0;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => pickSport(item.id)}
                        className={cn(
                          "relative flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-3 text-center transition-all active:scale-[0.97] sm:py-4",
                          active
                            ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white shadow-[0_14px_28px_-14px_rgba(200,16,46,0.9)]"
                            : "bg-white text-zinc-800 ring-1 ring-zinc-200 hover:ring-brand-red/40",
                        )}
                      >
                        {active ? <CheckBadge /> : null}
                        <span className="text-2xl leading-none sm:text-3xl">{SPORT_EMOJI[item.slug] ?? "🏅"}</span>
                        <span className="text-[13px] leading-tight font-semibold sm:text-sm">{item.name}</span>
                        <span className={cn("text-[10px] sm:text-[11px]", active ? "text-white/80" : "text-zinc-400")}>
                          {count ? `${count} ${count === 1 ? "equipo" : "equipos"}` : "Sin equipos aún"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section step={2} title="Categoría">
                <div className="grid grid-cols-3 gap-2">
                  {GENDERS.map((item) => (
                    <Tile
                      key={item}
                      active={draft.gender === item}
                      onClick={() => setDraft({ ...draft, gender: item })}
                    >
                      {GENDER_LABELS[item]}
                    </Tile>
                  ))}
                </div>
              </Section>

              <Section
                step={3}
                title="Fecha"
                sectionRef={(node) => {
                  refs.current.date = node;
                }}
              >
                <div className="no-scrollbar -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pt-1 pb-1 sm:-mx-7 sm:px-7">
                  {days.map((day) => {
                    const active = datePart === day.value;
                    return (
                      <button
                        key={day.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setCustomDate(false);
                          setDatePart(day.value);
                        }}
                        className={cn(
                          "flex w-[4.25rem] shrink-0 snap-start flex-col items-center rounded-2xl py-2.5 transition-all active:scale-[0.96]",
                          active
                            ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white shadow-[0_12px_24px_-12px_rgba(200,16,46,0.9)]"
                            : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:ring-brand-red/40",
                        )}
                      >
                        <span
                          className={cn(
                            "text-[11px] font-semibold capitalize",
                            active ? "text-white/85" : day.weekend ? "text-brand-red" : "text-zinc-400",
                          )}
                        >
                          {day.top}
                        </span>
                        <span className="text-xl leading-tight font-bold tabular-nums">{day.day}</span>
                        <span className={cn("text-[10px] capitalize", active ? "text-white/80" : "text-zinc-400")}>
                          {day.month}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {customDate ? (
                  <label className="relative">
                    <CalendarDaysIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      type="date"
                      aria-label="Otra fecha"
                      value={datePart}
                      onChange={(event) => setDatePart(event.target.value)}
                      className="h-12 rounded-2xl bg-white pl-10 text-sm"
                      autoFocus
                    />
                  </label>
                ) : null}
                <MoreToggle open={customDate} onClick={() => setCustomDate(!customDate)}>
                  {customDate ? "Ocultar calendario" : "Otra fecha"}
                </MoreToggle>
              </Section>

              <Section
                step={4}
                title="Hora"
                sectionRef={(node) => {
                  refs.current.time = node;
                }}
              >
                <div className="grid grid-cols-4 gap-2">
                  {TIMES.map((time) => (
                    <Tile
                      key={time}
                      active={timePart === time}
                      onClick={() => {
                        setCustomTime(false);
                        setTimePart(time);
                      }}
                      className="tabular-nums"
                    >
                      {time}
                    </Tile>
                  ))}
                </div>
                {customTime ? (
                  <label className="relative">
                    <Clock3Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      type="time"
                      aria-label="Otra hora"
                      value={timePart}
                      onChange={(event) => setTimePart(event.target.value)}
                      className="h-12 rounded-2xl bg-white pl-10 text-sm"
                      autoFocus
                    />
                  </label>
                ) : null}
                <MoreToggle open={customTime} onClick={() => setCustomTime(!customTime)}>
                  {customTime ? "Ocultar" : "Otra hora"}
                </MoreToggle>
              </Section>

              <Section
                step={5}
                title="Sede"
                hint="Opcional"
                sectionRef={(node) => {
                  refs.current.place = node;
                }}
              >
                <VenueInput
                  value={draft.location}
                  options={locations}
                  onChange={(location) => setDraft({ ...draft, location })}
                />
              </Section>

              <Section step={6} title="Fase" hint="Opcional">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {ROUNDS.map((round) => (
                    <Tile
                      key={round}
                      active={draft.roundName === round}
                      onClick={() => setDraft({ ...draft, roundName: round })}
                    >
                      {round}
                    </Tile>
                  ))}
                  <Tile
                    active={!ROUNDS.includes(draft.roundName)}
                    onClick={() => setDraft({ ...draft, roundName: "" })}
                  >
                    Otra
                  </Tile>
                </div>
                {!ROUNDS.includes(draft.roundName) ? (
                  <Input
                    value={draft.roundName}
                    onChange={(event) => setDraft({ ...draft, roundName: event.target.value })}
                    placeholder="Otra fase (ej. Jornada 3)"
                    className="h-12 rounded-2xl bg-white text-sm"
                  />
                ) : null}
              </Section>

              {draft.id ? (
                <Section step={7} title="Estado">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {STATUSES.map((status) => (
                      <Tile
                        key={status}
                        active={draft.status === status}
                        onClick={() => setDraft({ ...draft, status })}
                      >
                        {MATCH_STATUS_LABELS[status]}
                      </Tile>
                    ))}
                  </div>
                </Section>
              ) : null}
            </form>
          </div>
        </div>

        <div className="shrink-0 border-t border-rose-100/70 bg-[#fbf7f7] px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 sm:py-4">
          <div className="mx-auto flex max-w-md flex-col items-center gap-2 sm:max-w-none sm:flex-row sm:justify-between">
            <p className="text-xs text-zinc-500">
              {ready ? (
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  <CheckIcon className="size-3.5" /> Listo para guardar
                  {newTeams.length
                    ? ` · se inscribe ${newTeams.map((university) => university?.shortName).join(" y ")}`
                    : ""}
                </span>
              ) : (
                `Falta: ${missing.join(", ")}`
              )}
            </p>
            <Button
              type="submit"
              form="match-form"
              disabled={!ready || pending}
              className={cn(adminLaserCtaClass, "h-12 w-full rounded-2xl px-8 text-[15px] font-semibold sm:w-auto")}
            >
              {pending ? "Guardando..." : draft.id ? "Guardar cambios" : "Crear partido"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export function VenueInput({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const needle = normalizeText(value);
  const matches = options.filter((option) => !needle || normalizeText(option).includes(needle));
  const isNew = needle.length > 0 && !options.some((option) => normalizeText(option) === needle);

  return (
    <div className="relative">
      <MapPinIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
      <Input
        value={value}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            setOpen(false);
          }
        }}
        placeholder={options.length ? "Elige o escribe una sede" : "Cancha, gimnasio o estadio"}
        className="h-12 rounded-2xl bg-white pr-10 pl-10 text-sm"
      />
      {value ? (
        <button
          type="button"
          aria-label="Borrar sede"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onChange("")}
          className="absolute top-1/2 right-3 grid size-6 -translate-y-1/2 place-items-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <XIcon className="size-3.5" />
        </button>
      ) : null}
      {open && (matches.length > 0 || isNew) ? (
        <div
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-56 overflow-y-auto rounded-2xl bg-white p-1.5 shadow-[0_24px_48px_-20px_rgba(158,27,40,0.45)] ring-1 ring-zinc-200"
        >
          {matches.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                option === value ? "bg-rose-50 font-semibold text-[#9e1b28]" : "text-zinc-700 hover:bg-zinc-50",
              )}
            >
              <MapPinIcon className="size-4 shrink-0 opacity-60" />
              <span className="truncate">{option}</span>
              {option === value ? <CheckIcon className="ml-auto size-4 shrink-0" /> : null}
            </button>
          ))}
          {isNew ? (
            <p className="px-3 py-2 text-xs text-zinc-500">
              <span className="font-semibold text-emerald-700">“{value.trim()}”</span> es nueva · se guarda con el
              partido
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CheckBadge() {
  return (
    <span className="absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-white text-brand-red">
      <CheckIcon className="size-3" strokeWidth={3} />
    </span>
  );
}

function PreviewPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="max-w-full truncate rounded-full bg-white/80 px-2.5 py-0.5 font-medium text-zinc-600 ring-1 ring-rose-100">
      {children}
    </span>
  );
}

function SlotButton({
  label,
  team,
  active,
  onClick,
}: {
  label: string;
  team: UniversityOption | undefined;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-0 items-center justify-center gap-2.5 rounded-2xl px-2 py-2 transition-all",
        active ? "bg-white shadow-[0_10px_24px_-14px_rgba(200,16,46,0.8)] ring-2 ring-brand-red" : "hover:bg-white/60",
      )}
    >
      {team ? (
        <TeamCrest bare logoUrl={team.logoUrl} label={team.shortName} className="size-11" />
      ) : (
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full border-2 border-dashed bg-white/60 text-brand-red",
            active ? "border-brand-red/60" : "border-rose-200",
          )}
        >
          <PlusIcon className="size-4" />
        </span>
      )}
      <span className="min-w-0 text-left">
        <span className="block text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">{label}</span>
        <span className={cn("block truncate text-sm font-bold", team ? "text-zinc-950" : "text-zinc-400")}>
          {team?.shortName ?? "Elegir"}
        </span>
      </span>
    </button>
  );
}
