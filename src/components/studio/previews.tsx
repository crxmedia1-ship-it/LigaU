"use client";

import { TrophyIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/magic/tilt-card";
import { cn } from "@/lib/utils";

export type MvpPreviewData = {
  name: string;
  teamLabel: string;
  sportName: string;
  photoUrl: string | null;
  accent: string;
  goals: number;
  points: number;
  mvpAwards: number;
  jerseyNumber?: number | null;
};

export function MvpPreview({
  data,
  className,
}: {
  data: MvpPreviewData;
  className?: string;
}) {
  return (
    <TiltCard className={className}>
      <div
        className="relative overflow-hidden border border-zinc-500/40 p-6 shadow-[0_20px_80px_rgba(139,0,0,0.42)]"
        style={{
          background: `linear-gradient(145deg, ${data.accent}33 0%, #e2e8f0 6%, #71717a 22%, #27272a 48%, #08080a 100%)`,
          clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
          transform: "translateZ(24px)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-2 -bottom-6 select-none font-jersey text-[9rem] leading-none text-[#27272a]"
        >
          {data.jerseyNumber ?? "MVP"}
        </span>
        <div className="relative flex items-start gap-4">
          {data.photoUrl ? (
            <img
              src={data.photoUrl}
              alt=""
              className="size-20 object-cover ring-2 ring-brand-gold/50"
            />
          ) : (
            <div className="grid size-20 place-items-center bg-brand-crimson/40 font-jersey text-3xl">
              {data.name.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
              MVP de la semana
            </p>
            <h2 className="mt-1 truncate text-2xl font-semibold">{data.name}</h2>
            <p className="text-sm text-muted-foreground">
              {data.teamLabel} · {data.sportName}
            </p>
          </div>
          <Badge>
            <TrophyIcon />
            {data.mvpAwards}
          </Badge>
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-md border border-brand-silver/20 bg-black/35 px-2 py-3">
            <p className="text-2xl font-semibold">{data.goals}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Goles
            </p>
          </div>
          <div className="rounded-md border border-brand-silver/20 bg-black/35 px-2 py-3">
            <p className="text-2xl font-semibold">{data.points}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Puntos
            </p>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

export function ScoreBannerPreview({
  home,
  away,
  homeScore,
  awayScore,
  sportName,
  roundName,
  homeColor,
  awayColor,
  className,
}: {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  sportName: string;
  roundName: string;
  homeColor: string;
  awayColor: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-black text-white",
        className,
      )}
    >
      <div className="flex h-2">
        <div className="flex-1" style={{ backgroundColor: homeColor }} />
        <div className="flex-1" style={{ backgroundColor: awayColor }} />
      </div>
      <div className="px-6 py-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-brand-red">
          {sportName} · {roundName}
        </p>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <p className="text-2xl font-semibold sm:text-3xl">{home}</p>
          <p className="font-mono text-4xl font-bold sm:text-5xl">
            {homeScore}-{awayScore}
          </p>
          <p className="text-2xl font-semibold sm:text-3xl">{away}</p>
        </div>
        <p className="mt-4 text-xs uppercase tracking-wide text-white/60">
          Resultado final · Liga U
        </p>
      </div>
    </div>
  );
}

export function CouponPreview({
  sponsor,
  title,
  percent,
  logoUrl,
  className,
}: {
  sponsor: string;
  title: string;
  percent: number;
  logoUrl: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "carbon-fiber relative overflow-hidden border border-brand-silver/40 p-5",
        className,
      )}
      style={{
        clipPath:
          "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#e2e8f0_14%,transparent_32%,#c8102e_58%,transparent_72%)] opacity-20" />
      <div className="relative flex items-start justify-between gap-3">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="h-10 object-contain" />
        ) : (
          <p className="text-xs uppercase tracking-wide text-brand-gold">{sponsor}</p>
        )}
        <span className="rounded-sm bg-brand-red px-3 py-1 text-sm font-bold text-white">
          {percent}%
        </span>
      </div>
      <h3 className="relative mt-4 text-xl font-semibold">{title}</h3>
      <p className="relative mt-1 text-sm text-muted-foreground">{sponsor}</p>
    </div>
  );
}

export function CarnetXPreview() {
  return (
    <div className="carbon-fiber relative overflow-hidden rounded-md border border-brand-silver/30 bg-linear-to-br from-brand-crimson to-brand-dark p-5 text-white">
      <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold">
        CarnetX · Liga U
      </p>
      <p className="mt-6 text-lg font-semibold">Estudiante universitario</p>
      <p className="text-sm text-white/70">
        Presenta este carnet digital en caja para validar el beneficio físico.
      </p>
      <div className="mt-6 h-16 rounded-xl border border-white/20 bg-white/5" />
    </div>
  );
}
