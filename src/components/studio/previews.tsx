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
  const clip =
    "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)";

  return (
    <TiltCard className={className} tone="gold">
      <div className="relative h-full min-h-[22rem]" style={{ transform: "translateZ(24px)" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            clipPath: clip,
            background:
              "conic-gradient(from 130deg, #D4AF37, #BA0C2F, #F59E0B, #9E1B28, #D4AF37)",
          }}
        />
        <div
          className="carbon-fiber relative m-px overflow-hidden p-6 shadow-[0_20px_80px_rgba(139,0,0,0.45)]"
          style={{ clipPath: clip }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at 20% 0%, ${data.accent}55, transparent 42%), radial-gradient(circle at 80% 100%, rgba(186,12,47,0.28), transparent 46%)`,
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-2 -bottom-6 select-none font-jersey text-[9rem] leading-none text-white/10"
          >
            {data.jerseyNumber ?? "MVP"}
          </span>
          <div className="relative flex items-start gap-4">
            {data.photoUrl ? (
              <img
                src={data.photoUrl}
                alt=""
                className="size-20 object-cover object-top ring-2 ring-[#D4AF37]/50"
              />
            ) : (
              <div className="grid size-20 place-items-center bg-[#BA0C2F]/40 font-jersey text-3xl">
                {data.name.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold tracking-[0.22em] text-[#D4AF37] uppercase">
                MVP de la semana
              </p>
              <h2 className="mt-1 truncate text-2xl font-semibold text-zinc-100">{data.name}</h2>
              <p className="text-sm text-zinc-400">
                {data.teamLabel} · {data.sportName}
              </p>
            </div>
            <Badge className="bg-[#BA0C2F] text-white">
              <TrophyIcon />
              {data.mvpAwards}
            </Badge>
          </div>
          <div className="relative mt-6 grid grid-cols-2 gap-3 text-center">
            <div className="border border-zinc-700/80 bg-black/45 px-2 py-3">
              <p className="font-mono text-2xl font-bold text-zinc-100">{data.goals}</p>
              <p className="text-[11px] tracking-wide text-zinc-400 uppercase">Goles</p>
            </div>
            <div className="border border-zinc-700/80 bg-black/45 px-2 py-3">
              <p className="font-mono text-2xl font-bold text-zinc-100">{data.points}</p>
              <p className="text-[11px] tracking-wide text-zinc-400 uppercase">Puntos</p>
            </div>
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
