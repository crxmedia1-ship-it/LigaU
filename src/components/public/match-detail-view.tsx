"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { GoalCelebration } from "@/components/ui/effects/GoalCelebration";
import { LivePulseRadar } from "@/components/ui/effects/LivePulseRadar";
import { RefereeCard } from "@/components/ui/effects/RefereeCard";
import { ScorePair, ScoreboardTicker } from "@/components/ui/effects/ScoreboardTicker";
import { Badge } from "@/components/ui/badge";
import { eventLabel, formatMatchDate, statusLabel } from "@/lib/public/format";
import { getSportFormKind, parseMatchDetails } from "@/lib/admin/sport";
import { JerseyMark } from "@/components/public/brand";
import { UniversityCrest } from "@/components/public/university-crest";
import type { AthleteCard, MatchCard, MatchEventCard } from "@/lib/public/types";

export function MatchDetailView({
  match,
  events,
  mvp,
  winnerColors,
}: {
  match: MatchCard;
  events: MatchEventCard[];
  mvp: AthleteCard | null;
  winnerColors: string[];
}) {
  const kind = getSportFormKind(match.sportSlug);
  const details = parseMatchDetails(kind, match.matchDetails);
  const finished = match.status === "finished";
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <GoalCelebration
        enabled={finished && hasScore}
        matchId={match.id}
        colors={winnerColors}
      />
      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-red">
        {match.sportName} · {match.roundName || "Jornada"}
      </p>
      <div className="mt-3 flex items-center gap-2">
        {match.status === "live" ? (
          <LivePulseRadar />
        ) : (
          <Badge variant="outline">{statusLabel(match.status)}</Badge>
        )}
        <span className="text-sm text-muted-foreground">
          {formatMatchDate(match.matchDate)}
          {match.location ? ` · ${match.location}` : ""}
        </span>
      </div>

      <section className="glass-card relative mt-8 px-4 py-10 text-center">
        <JerseyMark number="VS" />
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-end">
            <UniversityCrest url={match.homeLogoUrl} label={match.homeShort} size="lg" glow="natural" />
            <h1 className="text-2xl font-semibold sm:text-4xl">{match.homeShort}</h1>
          </div>
          <p className="font-mono text-4xl font-black text-brand-silver sm:text-5xl">
            {hasScore ? (
              <ScorePair home={match.homeScore ?? 0} away={match.awayScore ?? 0} />
            ) : (
              "vs"
            )}
          </p>
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <h1 className="text-2xl font-semibold sm:text-4xl">{match.awayShort}</h1>
            <UniversityCrest url={match.awayLogoUrl} label={match.awayShort} size="lg" glow="natural" />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {match.homeLabel} vs {match.awayLabel}
        </p>
      </section>

      {details.kind === "basketball" ? (
        <section className="mt-8 grid grid-cols-4 gap-2">
          {(["q1", "q2", "q3", "q4"] as const).map((quarter) => (
            <div key={quarter} className="glass-card p-3 text-center">
              <p className="text-[11px] uppercase text-muted-foreground">{quarter}</p>
              <p className="mt-1 font-mono">
                <ScoreboardTicker value={details.quarters[quarter].home} digits={1} />
                <span className="opacity-50">-</span>
                <ScoreboardTicker value={details.quarters[quarter].away} digits={1} />
              </p>
            </div>
          ))}
        </section>
      ) : null}

      {details.kind === "sets" ? (
        <section className="mt-8 grid gap-2 sm:grid-cols-3">
          {details.sets.map((set, index) => (
            <div key={index} className="glass-card p-3 text-center">
              <p className="text-[11px] uppercase text-muted-foreground">Set {index + 1}</p>
              <p className="mt-1 font-mono">
                <ScoreboardTicker value={set.home} digits={2} />
                <span className="opacity-50">-</span>
                <ScoreboardTicker value={set.away} digits={2} />
              </p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="mt-10 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card p-5">
          <h2 className="font-semibold">Eventos</h2>
          {events.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Aún no hay goles, tarjetas ni puntos cargados.
            </p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {events.map((event) => (
                <li key={event.id} className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2">
                    {event.eventType === "yellow_card" ? (
                      <RefereeCard type="yellow" />
                    ) : null}
                    {event.eventType === "red_card" ? <RefereeCard type="red" /> : null}
                    <span>
                      <span className="font-medium">{event.athleteName}</span>
                      {event.assistName ? (
                        <span className="text-muted-foreground">
                          {" "}
                          · asistencia {event.assistName}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    {eventLabel(event.eventType)}
                    {event.eventType === "points" ? ` ${event.value}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="font-semibold">MVP del encuentro</h2>
          {mvp ? (
            <Link href={`/atletas/${mvp.id}`} className="mt-4 block">
              <p className="text-xl font-semibold">{mvp.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {mvp.jerseyNumber ? `#${mvp.jerseyNumber} · ` : ""}
                {mvp.position || "Atleta"}
              </p>
            </Link>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              El MVP se asigna al marcar el partido como FINISHED.
            </p>
          )}
        </div>
      </section>
    </motion.div>
  );
}
