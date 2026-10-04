import { MatchCountdown } from "@/components/public/match-countdown";
import type { MatchCard } from "@/lib/public/types";
import { cn } from "@/lib/utils";

const TZ = "America/Caracas";

export function kickoff(value: string) {
  const parts = new Intl.DateTimeFormat("es-VE", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(value));
  const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { clock: `${pick("hour")}:${pick("minute")}`, period: pick("dayPeriod").replace(/[\s.]/g, "").toUpperCase() };
}

export function matchDay(value: string) {
  return new Intl.DateTimeFormat("es-VE", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" })
    .format(new Date(value))
    .replace(/\./g, "");
}

/** Calendar day in Caracas, used to group matches: `2026-09-20`. */
export function dayKey(value: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(value));
}

export function dayParts(value: string) {
  const date = new Date(value);
  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("es-VE", { timeZone: TZ, ...options }).format(date).replace(/\./g, "");
  return {
    weekday: fmt({ weekday: "short" }),
    day: fmt({ day: "numeric" }),
    month: fmt({ month: "short" }),
    long: fmt({ weekday: "long", day: "numeric", month: "long" }),
  };
}

export const hasScore = (m: MatchCard) => m.status === "finished" && m.homeScore !== null && m.awayScore !== null;

const CREST_SIZE = {
  sm: "size-7 text-[10px]",
  md: "size-10 text-xs",
  lg: "size-16 text-xl",
  xl: "size-20 text-2xl",
  poster: "size-28 text-3xl md:size-32",
} as const;

/** ~15% inset keeps the square corners of a mark inside the circle. */
const CREST_INSET = {
  sm: "p-1",
  md: "p-1.5",
  lg: "p-2.5",
  xl: "p-3",
  poster: "p-3.5 md:p-4",
} as const;

export function Crest({
  label,
  logo,
  size = "sm",
  className,
}: {
  label: string;
  logo: string | null;
  size?: keyof typeof CREST_SIZE;
  className?: string;
}) {
  if (logo) {
    return (
      <span
        aria-hidden
        className={cn(
          "block shrink-0 rounded-full bg-white bg-contain bg-center bg-no-repeat bg-origin-content ring-1 ring-zinc-200",
          CREST_SIZE[size],
          CREST_INSET[size],
          className,
        )}
        style={{ backgroundImage: `url('${logo}')` }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "font-jersey grid shrink-0 place-items-center rounded-full bg-zinc-950 leading-none text-white",
        CREST_SIZE[size],
        className,
      )}
    >
      {label.slice(0, 3)}
    </span>
  );
}

/** Live coverage isn't offered yet, so a match marked live shows as upcoming. */
export function StatusPill({ match }: { match: MatchCard }) {
  if (match.status === "finished") {
    return (
      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-zinc-600">
        FINAL
      </span>
    );
  }
  if (match.status === "postponed" || match.status === "cancelled") {
    return (
      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-zinc-500 uppercase">
        {match.status === "postponed" ? "Aplazado" : "Cancelado"}
      </span>
    );
  }
  return (
    <MatchCountdown
      date={match.matchDate}
      className="rounded-full bg-zinc-950 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-white"
    />
  );
}
