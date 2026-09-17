"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { LivePulseRadar } from "@/components/ui/effects/LivePulseRadar";
import { ScorePair } from "@/components/ui/effects/ScoreboardTicker";
import { UniversityCrest } from "@/components/public/university-crest";
import { formatMatchDate, formatScore, statusLabel } from "@/lib/public/format";
import type { MatchCard } from "@/lib/public/types";

export function MatchCardLink({ match }: { match: MatchCard }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <Link href={`/partidos/${match.id}`} className="glass-card block p-4 transition">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {match.sportName} · {match.roundName || "Jornada"}
          </p>
          {match.status === "live" ? (
            <LivePulseRadar />
          ) : (
            <Badge variant="outline">{statusLabel(match.status)}</Badge>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 font-semibold">
            <UniversityCrest url={match.homeLogoUrl} label={match.homeShort} size="md" glow="natural" />
            {match.homeShort}
          </span>
          <span className="rounded-lg bg-black/40 px-3 py-1 font-mono text-lg">
            {match.homeScore === null || match.awayScore === null ? (
              formatScore(match.homeScore, match.awayScore, match.status)
            ) : (
              <ScorePair home={match.homeScore} away={match.awayScore} />
            )}
          </span>
          <span className="flex min-w-0 items-center justify-end gap-2 font-semibold">
            {match.awayShort}
            <UniversityCrest url={match.awayLogoUrl} label={match.awayShort} size="md" glow="natural" />
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {formatMatchDate(match.matchDate)}
          {match.location ? ` · ${match.location}` : ""}
        </p>
      </Link>
    </motion.div>
  );
}
