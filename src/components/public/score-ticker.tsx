import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Marquee } from "@/components/magic/marquee";
import { LivePulseRadar } from "@/components/ui/effects/LivePulseRadar";
import { UniversityCrest } from "@/components/public/university-crest";
import { formatScore, statusLabel } from "@/lib/public/format";
import type { MatchCard } from "@/lib/public/types";

function MatchCardChip({ match }: { match: MatchCard }) {
  return (
    <Link
      href={`/partidos/${match.id}`}
      className="flex w-[min(78vw,18.5rem)] shrink-0 snap-start touch-manipulation flex-col justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 min-h-11"
    >
      <div className="flex items-center justify-between gap-2">
        {match.status === "live" ? (
          <LivePulseRadar />
        ) : (
          <Badge variant="outline">{statusLabel(match.status)}</Badge>
        )}
        <span className="truncate text-[10px] font-medium tracking-wide text-zinc-400 uppercase">
          {match.sportName}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 text-sm font-semibold text-zinc-100">
        <span className="flex min-w-0 items-center gap-1.5">
          <UniversityCrest url={match.homeLogoUrl} label={match.homeShort} size="sm" glow="natural" />
          <span className="truncate">{match.homeShort}</span>
        </span>
        <span className="shrink-0 font-mono text-zinc-400">
          {formatScore(match.homeScore, match.awayScore, match.status)}
        </span>
        <span className="flex min-w-0 items-center justify-end gap-1.5">
          <span className="truncate">{match.awayShort}</span>
          <UniversityCrest url={match.awayLogoUrl} label={match.awayShort} size="sm" glow="natural" />
        </span>
      </div>
    </Link>
  );
}

function MatchTickerRow({ match }: { match: MatchCard }) {
  return (
    <Link
      href={`/partidos/${match.id}`}
      className="flex min-h-11 items-center gap-3 border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm whitespace-nowrap transition-colors duration-150 hover:border-[#BA0C2F]/50"
    >
      {match.status === "live" ? (
        <LivePulseRadar />
      ) : (
        <Badge variant="outline">{statusLabel(match.status)}</Badge>
      )}
      <span className="flex items-center gap-2 font-medium text-zinc-100">
        <UniversityCrest url={match.homeLogoUrl} label={match.homeShort} size="sm" glow="natural" />
        {match.homeShort}
        <span className="font-mono text-zinc-400">
          {formatScore(match.homeScore, match.awayScore, match.status)}
        </span>
        {match.awayShort}
        <UniversityCrest url={match.awayLogoUrl} label={match.awayShort} size="sm" glow="natural" />
      </span>
      <span className="text-zinc-400">{match.sportName}</span>
    </Link>
  );
}

export function ScoreTicker({ matches }: { matches: MatchCard[] }) {
  const items = matches.slice(0, 12);
  if (items.length === 0) {
    return (
      <div className="border-y border-zinc-800 bg-zinc-950/70 px-4 py-3 text-center text-sm text-zinc-400">
        El ticker de marcadores se activa con el primer calendario publicado.
      </div>
    );
  }

  return (
    <div className="border-y border-zinc-800 bg-zinc-950/70">
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-3 md:hidden">
        {items.map((match) => (
          <MatchCardChip key={match.id} match={match} />
        ))}
      </div>
      <div className="hidden md:block">
        <Marquee duration="40s" className="py-3">
          {items.map((match) => (
            <MatchTickerRow key={match.id} match={match} />
          ))}
        </Marquee>
      </div>
    </div>
  );
}
