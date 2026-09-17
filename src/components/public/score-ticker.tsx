import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Marquee } from "@/components/magic/marquee";
import { UniversityCrest } from "@/components/public/university-crest";
import { formatScore, statusLabel } from "@/lib/public/format";
import { cn } from "@/lib/utils";
import type { MatchCard } from "@/lib/public/types";

function ArenaLiveBadge() {
  return (
    <span className="relative inline-flex items-center gap-1.5 overflow-visible bg-[#BA0C2F] px-2 py-0.5 text-[10px] font-bold tracking-[0.14em] text-white uppercase">
      <span className="relative flex size-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/90" />
        <span className="relative size-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
      </span>
      EN VIVO
    </span>
  );
}

function MatchCardChip({ match }: { match: MatchCard }) {
  const live = match.status === "live";
  const score = formatScore(match.homeScore, match.awayScore, match.status);

  return (
    <Link
      href={`/partidos/${match.id}`}
      className={cn(
        "relative flex w-[min(82vw,20rem)] shrink-0 snap-start touch-manipulation flex-col justify-center gap-2.5 overflow-hidden border border-zinc-800/80 bg-zinc-950/80 p-3 min-h-11 backdrop-blur-md",
        "shadow-[inset_0_1px_0_rgba(226,232,240,0.08)]",
        live && "border-[#BA0C2F]/50",
      )}
      style={{
        clipPath:
          "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
      }}
    >
      {live ? (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5 bg-[#BA0C2F] shadow-[0_0_12px_#BA0C2F]"
        />
      ) : null}
      <div className="flex items-center justify-between gap-2">
        {live ? (
          <ArenaLiveBadge />
        ) : (
          <Badge
            variant="outline"
            className="rounded-none border-zinc-700 bg-zinc-900/80 text-[10px] tracking-[0.12em] text-zinc-300"
          >
            {statusLabel(match.status)}
          </Badge>
        )}
        <span className="truncate text-[10px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
          {match.sportName}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-zinc-100">
          <UniversityCrest
            url={match.homeLogoUrl}
            label={match.homeShort}
            size="sm"
            glow="natural"
          />
          <span className="truncate">{match.homeShort}</span>
        </span>
        <span
          className={cn(
            "shrink-0 font-mono text-lg font-bold tabular-nums",
            live ? "text-white" : "text-zinc-200",
          )}
        >
          {score}
        </span>
        <span className="flex min-w-0 items-center justify-end gap-1.5 text-sm font-semibold text-zinc-100">
          <span className="truncate">{match.awayShort}</span>
          <UniversityCrest
            url={match.awayLogoUrl}
            label={match.awayShort}
            size="sm"
            glow="natural"
          />
        </span>
      </div>
    </Link>
  );
}

export function ScoreTicker({ matches }: { matches: MatchCard[] }) {
  const items = matches.slice(0, 12);
  if (items.length === 0) {
    return (
      <div className="border-y border-zinc-800 bg-zinc-950/80 px-4 py-3 text-center text-sm text-zinc-400">
        El ticker de marcadores se activa con el primer calendario publicado.
      </div>
    );
  }

  return (
    <div className="border-y border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-3 md:hidden">
        {items.map((match) => (
          <MatchCardChip key={match.id} match={match} />
        ))}
      </div>
      <div className="hidden md:block">
        <Marquee duration="40s" className="py-3">
          {items.map((match) => (
            <MatchCardChip key={match.id} match={match} />
          ))}
        </Marquee>
      </div>
    </div>
  );
}
