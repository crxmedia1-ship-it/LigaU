"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/admin/field";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MatchCardLink } from "@/components/public/match-card-link";
import { UniversityCrest } from "@/components/public/university-crest";
import { GENDER_LABELS } from "@/lib/admin/labels";
import { computeStandings } from "@/lib/public/standings";
import { computeMedalTally } from "@/lib/public/medals";
import type { MatchCard, SportCard, TeamCard, UniversityCard } from "@/lib/public/types";

export function CompetitionBoard({
  sports,
  universities,
  teams,
  matches,
}: {
  sports: SportCard[];
  universities: UniversityCard[];
  teams: TeamCard[];
  matches: MatchCard[];
}) {
  const [sportId, setSportId] = useState(sports[0]?.id ?? "all");
  const [universityId, setUniversityId] = useState("all");
  const [roundName, setRoundName] = useState("all");
  const [tab, setTab] = useState("fixture");

  const rounds = useMemo(
    () =>
      [...new Set(matches.map((match) => match.roundName).filter(Boolean))] as string[],
    [matches],
  );

  const filteredMatches = useMemo(
    () =>
      matches.filter((match) => {
        const sportOk = sportId === "all" ? true : match.sportId === sportId;
        const uniOk =
          universityId === "all"
            ? true
            : match.homeUniversityId === universityId ||
              match.awayUniversityId === universityId;
        const roundOk = roundName === "all" ? true : match.roundName === roundName;
        return sportOk && uniOk && roundOk;
      }),
    [matches, roundName, sportId, universityId],
  );

  const sportTeams = teams.filter((team) =>
    sportId === "all" ? true : team.sportId === sportId,
  );
  const standings = computeStandings(
    matches.filter((match) => (sportId === "all" ? true : match.sportId === sportId)),
    sportTeams,
  );
  const medals = computeMedalTally(
    matches.filter((match) => (sportId === "all" ? true : match.sportId === sportId)),
    sportTeams,
    universities,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <NativeSelect value={sportId} onChange={(event) => setSportId(event.target.value)}>
          <option value="all">Todas las disciplinas</option>
          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.name}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={universityId}
          onChange={(event) => setUniversityId(event.target.value)}
        >
          <option value="all">Las 8 universidades</option>
          {universities.map((university) => (
            <option key={university.id} value={university.id}>
              {university.shortName}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={roundName}
          onChange={(event) => setRoundName(event.target.value)}
        >
          <option value="all">Todas las fases</option>
          {rounds.map((round) => (
            <option key={round} value={round}>
              {round}
            </option>
          ))}
        </NativeSelect>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="fixture">Fixture</TabsTrigger>
          <TabsTrigger value="tabla">Clasificación</TabsTrigger>
          <TabsTrigger value="medallero">Medallero</TabsTrigger>
        </TabsList>
      </Tabs>

      <motion.div
        key={`${tab}-${sportId}-${universityId}-${roundName}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
      {tab === "fixture" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredMatches.length === 0 ? (
            <p className="text-sm text-muted-foreground md:col-span-2">
              No hay encuentros para este filtro.
            </p>
          ) : (
            filteredMatches.map((match) => (
              <MatchCardLink key={match.id} match={match} />
            ))
          )}
        </div>
      ) : null}

      {tab === "tabla" ? (
        <div className="overflow-hidden border border-brand-silver/25 bg-black/45 backdrop-blur-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>PJ</TableHead>
                <TableHead>G</TableHead>
                <TableHead>E</TableHead>
                <TableHead>P</TableHead>
                <TableHead>DG</TableHead>
                <TableHead>Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    La tabla se calcula sola cuando hay partidos FINISHED con marcador.
                  </TableCell>
                </TableRow>
              ) : (
                standings.map((row, index) => (
                  <TableRow key={row.teamId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UniversityCrest
                          url={row.logoUrl}
                          label={row.universityShort}
                          size="sm"
                        />
                        <span className="font-medium">{row.universityShort}</span>
                        <Badge variant="outline">{GENDER_LABELS[row.gender]}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{row.played}</TableCell>
                    <TableCell>{row.won}</TableCell>
                    <TableCell>{row.drawn}</TableCell>
                    <TableCell>{row.lost}</TableCell>
                    <TableCell>{row.goalDiff}</TableCell>
                    <TableCell className="font-semibold">{row.points}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {tab === "medallero" ? (
        <div className="overflow-hidden border border-brand-silver/25 bg-black/45 backdrop-blur-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Universidad</TableHead>
                <TableHead>Oro</TableHead>
                <TableHead>Plata</TableHead>
                <TableHead>Bronce</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medals.map((row, index) => (
                  <TableRow key={row.universityId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UniversityCrest
                          url={row.logoUrl}
                          label={row.universityShort}
                          size="sm"
                        />
                        <span
                          className="inline-block size-2 rounded-full"
                          style={{ backgroundColor: row.colors.primary }}
                        />
                        {row.universityShort}
                      </div>
                    </TableCell>
                    <TableCell>{row.gold}</TableCell>
                    <TableCell>{row.silver}</TableCell>
                    <TableCell>{row.bronze}</TableCell>
                    <TableCell className="font-semibold">{row.total}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
      </motion.div>
    </div>
  );
}
