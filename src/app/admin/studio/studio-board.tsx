"use client";

import { useMemo, useState } from "react";
import { ChevronUpIcon, ClapperboardIcon, SlidersHorizontalIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, NativeSelect } from "@/components/admin/field";
import { ImageUploader } from "@/components/admin/image-uploader";
import { athleteUploadPath } from "@/lib/cloudinary-paths";
import {
  CarnetXPreview,
  CouponPreview,
  MvpPreview,
  ScoreBannerPreview,
} from "@/components/studio/previews";
import { cn } from "@/lib/utils";
import type {
  AthleteCard,
  BenefitCard,
  MatchCard,
  SportCard,
  SponsorCard,
  TeamCard,
} from "@/lib/public/types";

type StudioMode = "mvp" | "coupon" | "banner";

type StudioBoardProps = {
  athletes: AthleteCard[];
  teams: TeamCard[];
  sports: SportCard[];
  matches: MatchCard[];
  sponsors: SponsorCard[];
  benefits: BenefitCard[];
};

export function StudioBoard({
  athletes,
  teams,
  sports,
  matches,
  sponsors,
  benefits,
}: StudioBoardProps) {
  const [mode, setMode] = useState<StudioMode>("mvp");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [athleteId, setAthleteId] = useState(athletes[0]?.id ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(athletes[0]?.photoUrl ?? null);
  const [goals, setGoals] = useState(0);
  const [points, setPoints] = useState(0);
  const [mvpAwards, setMvpAwards] = useState(1);
  const [benefitId, setBenefitId] = useState(benefits[0]?.id ?? "");
  const [sponsorId, setSponsorId] = useState(sponsors[0]?.id ?? "");
  const [couponTitle, setCouponTitle] = useState(
    benefits[0]?.discountTitle ?? "20% en comercios aliados",
  );
  const [percent, setPercent] = useState(20);
  const [matchId, setMatchId] = useState(
    matches.find((match) => match.status === "finished")?.id ?? matches[0]?.id ?? "",
  );

  const athlete = athletes.find((item) => item.id === athleteId) ?? null;
  const team = athlete ? teams.find((item) => item.id === athlete.teamId) : null;
  const sport = team ? sports.find((item) => item.id === team.sportId) : null;
  const benefit = benefits.find((item) => item.id === benefitId) ?? null;
  const sponsor =
    sponsors.find((item) => item.id === (benefit?.sponsorId ?? sponsorId)) ?? null;
  const match = matches.find((item) => item.id === matchId) ?? null;
  const homeTeam = match ? teams.find((item) => item.id === match.homeTeamId) : null;
  const awayTeam = match ? teams.find((item) => item.id === match.awayTeamId) : null;

  const finishedMatches = useMemo(
    () => matches.filter((item) => item.status === "finished" || item.status === "live"),
    [matches],
  );

  const controls = (
    <div className="grid gap-4">
      <Tabs value={mode} onValueChange={(value) => setMode(value as StudioMode)}>
        <TabsList className="w-full">
          <TabsTrigger value="mvp">MVP 3D</TabsTrigger>
          <TabsTrigger value="coupon">Cupón Pass</TabsTrigger>
          <TabsTrigger value="banner">Marcador</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "mvp" ? (
        <>
          <Field label="Atleta">
            <NativeSelect
              value={athleteId}
              onChange={(event) => {
                const next = athletes.find((item) => item.id === event.target.value);
                setAthleteId(event.target.value);
                setPhotoUrl(next?.photoUrl ?? null);
              }}
            >
              {athletes.length === 0 ? (
                <option value="">Carga atletas en Equipos</option>
              ) : (
                athletes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.fullName}
                  </option>
                ))
              )}
            </NativeSelect>
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Goles">
              <Input
                type="number"
                min={0}
                value={goals}
                onChange={(event) => setGoals(Number(event.target.value))}
              />
            </Field>
            <Field label="Puntos">
              <Input
                type="number"
                min={0}
                value={points}
                onChange={(event) => setPoints(Number(event.target.value))}
              />
            </Field>
            <Field label="MVPs">
              <Input
                type="number"
                min={0}
                value={mvpAwards}
                onChange={(event) => setMvpAwards(Number(event.target.value))}
              />
            </Field>
          </div>
          <ImageUploader
            folder="jugadores"
            path={
              team && sport
                ? athleteUploadPath({
                    universityShort: team.university.shortName,
                    sportSlug: sport.slug,
                    gender: team.gender,
                  })
                : undefined
            }
            label="Foto Cloudinary"
            initialUrl={photoUrl}
            onUploaded={(asset) => setPhotoUrl(asset.secureUrl)}
          />
        </>
      ) : null}

      {mode === "coupon" ? (
        <>
          <Field label="Beneficio">
            <NativeSelect
              value={benefitId}
              onChange={(event) => {
                const next = benefits.find((item) => item.id === event.target.value);
                setBenefitId(event.target.value);
                if (next) {
                  setCouponTitle(next.discountTitle);
                  setSponsorId(next.sponsorId);
                }
              }}
            >
              {benefits.length === 0 ? (
                <option value="">Sin beneficios activos</option>
              ) : (
                benefits.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.discountTitle}
                  </option>
                ))
              )}
            </NativeSelect>
          </Field>
          <Field label="Sponsor">
            <NativeSelect
              value={sponsor?.id ?? sponsorId}
              onChange={(event) => setSponsorId(event.target.value)}
            >
              {sponsors.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Título del descuento">
            <Input
              value={couponTitle}
              onChange={(event) => setCouponTitle(event.target.value)}
            />
          </Field>
          <Field label="Porcentaje">
            <Input
              type="number"
              min={1}
              max={100}
              value={percent}
              onChange={(event) => setPercent(Number(event.target.value))}
            />
          </Field>
        </>
      ) : null}

      {mode === "banner" ? (
        <Field label="Partido">
          <NativeSelect
            value={matchId}
            onChange={(event) => setMatchId(event.target.value)}
          >
            {(finishedMatches.length > 0 ? finishedMatches : matches).map((item) => (
              <option key={item.id} value={item.id}>
                {item.homeShort} vs {item.awayShort} · {item.sportName}
              </option>
            ))}
          </NativeSelect>
        </Field>
      ) : null}
    </div>
  );

  const canvas = (
    <div className="flex min-h-[28rem] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[radial-gradient(circle_at_top,rgba(232,185,35,0.08),transparent_55%)] p-6">
      {mode === "mvp" ? (
        athlete && team ? (
          <MvpPreview
            className="w-full max-w-md"
            data={{
              name: athlete.fullName,
              teamLabel: team.label,
              sportName: sport?.name ?? "Liga U",
              photoUrl,
              accent: team.university.colors.primary,
              goals,
              points,
              mvpAwards,
            }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Crea un atleta para previsualizar la tarjeta 3D.
          </p>
        )
      ) : null}
      {mode === "coupon" ? (
        <div className="grid w-full max-w-md gap-4">
          <CouponPreview
            sponsor={sponsor?.name ?? "Liga U Pass"}
            title={couponTitle}
            percent={percent}
            logoUrl={sponsor?.logoUrl ?? benefit?.sponsorLogo ?? null}
          />
          <CarnetXPreview />
        </div>
      ) : null}
      {mode === "banner" ? (
        match ? (
          <ScoreBannerPreview
            className="w-full max-w-xl"
            home={match.homeShort}
            away={match.awayShort}
            homeScore={match.homeScore ?? 0}
            awayScore={match.awayScore ?? 0}
            sportName={match.sportName}
            roundName={match.roundName ?? "Jornada"}
            homeColor={homeTeam?.university.colors.primary ?? "#C8102E"}
            awayColor={awayTeam?.university.colors.primary ?? "#C8102E"}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Publica un partido para generar el banner de marcador.
          </p>
        )
      ) : null}
    </div>
  );

  return (
    <div className="relative pb-28 lg:pb-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Live Studio
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Constructor visual</h1>
          <p className="text-sm text-muted-foreground">
            Preview en tiempo real para stories, banners y Liga U Pass.
          </p>
        </div>
        <Badge variant="outline">
          <ClapperboardIcon />
          Canvas vivo
        </Badge>
      </div>

      <div className="hidden gap-6 lg:grid lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-card p-4">{controls}</aside>
        {canvas}
      </div>

      <div className="lg:hidden">{canvas}</div>

      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
        <div className="border-t border-border bg-background/95 backdrop-blur-xl">
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-full justify-between rounded-none px-4"
            onClick={() => setDrawerOpen((value) => !value)}
          >
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontalIcon />
              Controles
            </span>
            <ChevronUpIcon
              className={cn("transition-transform", drawerOpen ? "rotate-180" : "")}
            />
          </Button>
          {drawerOpen ? (
            <div className="max-h-[55vh] overflow-y-auto px-4 pb-4">{controls}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
