"use client";

import { LaserBadge } from "@/components/public/brand";
import { MatchCountdown } from "@/components/public/match-countdown";
import { cn } from "@/lib/utils";
import type { MatchCard, MvpHighlight, NewsCard, SponsorCard } from "@/lib/public/types";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, type MotionValue } from "motion/react";
import Link from "next/link";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const OnPlane = createContext(true);

type Stop = {
  id: string;
  label: string;
  t: number;
  x: number;
  y: number;
  scale: number;
};

/** Camera stops, as fractions of the 300vw × 300vh plane. */
const STOPS: Stop[] = [
  { id: "origen", label: "Liga U", t: 0, x: 0.18, y: 0.14, scale: 1 },
  { id: "duelo", label: "Duelo", t: 0.18, x: 0.58, y: 0.22, scale: 1.14 },
  { id: "universidades", label: "Universidades", t: 0.36, x: 0.78, y: 0.48, scale: 1.04 },
  { id: "noticias", label: "Noticias", t: 0.52, x: 0.36, y: 0.64, scale: 1 },
  { id: "mvp", label: "MVP", t: 0.68, x: 0.2, y: 0.78, scale: 1.1 },
  { id: "pass", label: "U Pass", t: 0.84, x: 0.58, y: 0.88, scale: 1.04 },
  { id: "marcas", label: "Marcas", t: 1, x: 0.32, y: 0.96, scale: 0.92 },
];

function sample(t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  let index = 0;
  while (index < STOPS.length - 1 && STOPS[index + 1].t < clamped) index += 1;
  const from = STOPS[index];
  const to = STOPS[Math.min(index + 1, STOPS.length - 1)];
  const span = to.t - from.t || 1;
  const linear = from === to ? 0 : (clamped - from.t) / span;
  const eased = linear * linear * (3 - 2 * linear);
  return {
    x: from.x + (to.x - from.x) * eased,
    y: from.y + (to.y - from.y) * eased,
    scale: from.scale + (to.scale - from.scale) * eased,
  };
}

function nearestStop(t: number) {
  return STOPS.reduce((best, stop) =>
    Math.abs(stop.t - t) < Math.abs(best.t - t) ? stop : best,
  );
}

function fitScale(width: number, raw: number) {
  return width < 768 ? Math.min(raw, 1) * 0.9 : raw;
}

function aimPoint(width: number, height: number) {
  const phone = width < 768;
  const header = phone ? 68 : 72;
  const nav = phone ? 76 : 0;
  const map = phone ? 92 : 0;
  return {
    x: width / 2,
    y: header + (height - header - nav - map) / 2,
  };
}

function formatKickoff(value: string) {
  return new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function Acrylic({
  href,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const classes = cn(
    "block bg-white/80 backdrop-blur-xl border border-zinc-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-[border-color,box-shadow] duration-300 hover:border-[#C8102E] hover:shadow-[0_0_0_1px_#C8102E,0_18px_44px_rgba(200,16,46,0.16)]",
    className,
  );
  if (!href) return <div className={classes}>{children}</div>;
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

function Island({
  stop,
  className,
  children,
}: {
  stop: Stop;
  className?: string;
  children: React.ReactNode;
}) {
  const onPlane = useContext(OnPlane);
  if (!onPlane) {
    return <div className={cn("relative w-full", className)}>{children}</div>;
  }
  return (
    <div
      className={cn("absolute w-[min(84vw,420px)] -translate-x-1/2 -translate-y-1/2", className)}
      style={{ left: `${stop.x * 100}%`, top: `${stop.y * 100}%` }}
    >
      {children}
    </div>
  );
}

function PitchPlane() {
  const pitches = [
    [80, 70],
    [1240, 70],
    [80, 860],
    [1240, 860],
    [660, 460],
    [80, 1640],
    [1240, 1640],
  ];
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full text-zinc-300/50"
      viewBox="0 0 2400 2400"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {Array.from({ length: 24 }, (_, index) => (
        <line
          key={`v-${index}`}
          x1={index * 100}
          y1="0"
          x2={index * 100}
          y2="2400"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {Array.from({ length: 24 }, (_, index) => (
        <line
          key={`h-${index}`}
          x1="0"
          y1={index * 100}
          x2="2400"
          y2={index * 100}
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {pitches.map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} stroke="currentColor" strokeWidth="1">
          <rect width="900" height="540" vectorEffect="non-scaling-stroke" />
          <line x1="450" y1="0" x2="450" y2="540" vectorEffect="non-scaling-stroke" />
          <circle cx="450" cy="270" r="72" vectorEffect="non-scaling-stroke" />
          <circle cx="450" cy="270" r="2" fill="currentColor" />
          <rect x="0" y="160" width="130" height="220" vectorEffect="non-scaling-stroke" />
          <rect x="770" y="160" width="130" height="220" vectorEffect="non-scaling-stroke" />
          <rect x="0" y="210" width="52" height="120" vectorEffect="non-scaling-stroke" />
          <rect x="848" y="210" width="52" height="120" vectorEffect="non-scaling-stroke" />
        </g>
      ))}
    </svg>
  );
}

function PlaneStations({
  nextMatch,
  mvp,
  featured,
  sponsors,
  kickoff,
  venue,
}: {
  nextMatch: MatchCard | null;
  mvp: MvpHighlight | null;
  featured: NewsCard | null;
  sponsors: SponsorCard[];
  kickoff: string | null;
  venue: string | null;
}) {
  const origen = STOPS[0];
  const duelo = STOPS[1];
  const universidades = STOPS[2];
  const noticias = STOPS[3];
  const mvpStop = STOPS[4];
  const pass = STOPS[5];
  const marcas = STOPS[6];

  return (
    <>
      <Island stop={origen} className="w-[min(88vw,640px)]">
        <Acrylic className="px-5 py-5 sm:px-8 sm:py-9">
          <LaserBadge>Caracas · 8 universidades · 9 deportes</LaserBadge>
          <h1 className="font-jersey mt-3 text-[2.15rem] leading-[0.88] font-black tracking-tight text-zinc-950 uppercase sm:mt-4 sm:text-6xl">
            El <span className="text-[#C8102E]">epicentro</span> del talento universitario.
          </h1>
          <p className="mt-4 max-w-md text-sm text-zinc-600 sm:text-base">
            Resultados en vivo, fichas de atletas, noticias y el club de beneficios Liga U Pass.
          </p>
        </Acrylic>
      </Island>

      <Island stop={duelo} className="w-[min(88vw,520px)]">
        <Acrylic href="/competicion" className="overflow-hidden">
          <div
            className="h-24 bg-cover bg-center sm:h-44"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80')`,
            }}
          />
          <div className="px-5 py-4 sm:px-6 sm:py-5">
            <span className="mb-2 inline-block bg-[#C8102E] px-2.5 py-1 text-[10px] font-black tracking-wider text-white uppercase sm:mb-3">
              Próximo duelo
            </span>
            <h2 className="font-jersey text-4xl leading-none text-zinc-950 sm:text-6xl">
              {nextMatch ? (
                <>
                  {nextMatch.homeShort}{" "}
                  <span className="text-[#C8102E]">VS</span> {nextMatch.awayShort}
                </>
              ) : (
                "Match Center"
              )}
            </h2>
            {nextMatch ? (
              <>
                {venue || kickoff ? (
                  <p className="mt-2 font-mono text-xs text-zinc-500">
                    {[venue, kickoff].filter(Boolean).join(" • ")}
                  </p>
                ) : null}
                <div className="mt-3">
                  <MatchCountdown date={nextMatch.matchDate} className="text-zinc-700" />
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">Aún no hay un partido programado.</p>
            )}
          </div>
        </Acrylic>
      </Island>

      <Island stop={universidades}>
        <Acrylic href="/universidades" className="px-6 py-6">
          <p className="text-[10px] font-black tracking-[0.22em] text-[#C8102E] uppercase">Rosters</p>
          <h2 className="font-jersey mt-2 text-4xl leading-none text-zinc-950">Universidades</h2>
          <p className="mt-3 text-sm text-zinc-600">
            Las 8 plantillas oficiales. Entra a una isla y abre el roster.
          </p>
        </Acrylic>
      </Island>

      <Island stop={noticias}>
        <Acrylic href={featured ? `/noticias/${featured.slug}` : "/multimedia"} className="px-6 py-6">
          <p className="text-[10px] font-black tracking-[0.22em] text-[#C8102E] uppercase">Noticias</p>
          <h2 className="mt-2 text-2xl font-black text-zinc-950 uppercase">
            {featured?.title ?? "La jornada en cancha"}
          </h2>
          {featured?.excerpt ? (
            <p className="mt-2 line-clamp-3 text-sm text-zinc-600">{featured.excerpt}</p>
          ) : null}
        </Acrylic>
      </Island>

      <Island stop={mvpStop}>
        <Acrylic href="/competicion?tab=tabla" className="overflow-hidden">
          {mvp?.athlete.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mvp.athlete.photoUrl} alt="" className="h-28 w-full object-cover object-top sm:h-40" />
          ) : (
            <div className="grid h-24 place-items-center bg-zinc-950 sm:h-36">
              <span className="font-jersey text-7xl text-[#C8102E]">
                {mvp ? mvp.athlete.fullName.slice(0, 1) : "?"}
              </span>
            </div>
          )}
          <div className="px-6 py-5">
            <p className="text-[10px] font-black tracking-[0.22em] text-[#C8102E] uppercase">MVP</p>
            <h2 className="font-jersey mt-2 text-4xl leading-none text-zinc-950">
              {mvp?.athlete.fullName ?? "De la semana"}
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              {mvp ? `${mvp.team.label} · ${mvp.sportName}` : "Se revela al cerrar la jornada."}
            </p>
          </div>
        </Acrylic>
      </Island>

      <Island stop={pass}>
        <Acrylic href="/liga-u-pass" className="px-6 py-6">
          <p className="text-[10px] font-black tracking-[0.22em] text-[#C8102E] uppercase">Beneficios</p>
          <h2 className="font-jersey mt-2 text-5xl leading-none text-zinc-950">U Pass</h2>
          <p className="mt-3 text-sm text-zinc-600">
            El club de beneficios de Liga U. Descuentos, accesos y marcas.
          </p>
        </Acrylic>
      </Island>

      <Island stop={marcas} className="w-[min(88vw,560px)]">
        <Acrylic className="px-6 py-5">
          <p className="text-[10px] font-black tracking-[0.22em] text-zinc-400 uppercase">Marcas</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {sponsors.slice(0, 6).map((sponsor) =>
              sponsor.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={sponsor.id} src={sponsor.logoUrl} alt={sponsor.name} className="h-8 w-auto object-contain" />
              ) : (
                <span key={sponsor.id} className="text-sm font-semibold text-zinc-500">
                  {sponsor.name}
                </span>
              ),
            )}
            {sponsors.length === 0 ? (
              <span className="text-sm text-zinc-500">Próximamente</span>
            ) : null}
          </div>
        </Acrylic>
      </Island>
    </>
  );
}

function MiniMap({
  progress,
  onJump,
  activeId,
}: {
  progress: MotionValue<number>;
  onJump: (t: number) => void;
  activeId: string;
}) {
  const left = useMotionValue("8%");
  const top = useMotionValue("8%");
  const width = useMotionValue("28%");
  const height = useMotionValue("28%");

  useEffect(() => {
    const apply = () => {
      const widthPx = window.innerWidth;
      const heightPx = window.innerHeight;
      const aim = aimPoint(widthPx, heightPx);
      const camera = sample(progress.get());
      const fitted = fitScale(widthPx, camera.scale);
      const viewW = 1 / (3 * fitted);
      const viewH = 1 / (3 * fitted);
      const viewX = camera.x - aim.x / (widthPx * 3 * fitted);
      const viewY = camera.y - aim.y / (heightPx * 3 * fitted);
      left.set(`${Math.max(0, viewX) * 100}%`);
      top.set(`${Math.max(0, viewY) * 100}%`);
      width.set(`${Math.min(viewW, 1) * 100}%`);
      height.set(`${Math.min(viewH, 1) * 100}%`);
    };
    apply();
    const unsubscribe = progress.on("change", apply);
    window.addEventListener("resize", apply);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", apply);
    };
  }, [height, left, progress, top, width]);

  const active = STOPS.find((stop) => stop.id === activeId) ?? STOPS[0];

  return (
    <div className="pointer-events-auto absolute right-3 bottom-[calc(4.85rem+env(safe-area-inset-bottom,0px))] left-3 z-20 border border-zinc-200/80 bg-white p-2 shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:right-auto md:bottom-5 md:left-5 md:w-44 md:bg-white/90 md:backdrop-blur-xl">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[9px] font-black tracking-[0.18em] text-zinc-400 uppercase">Plano</span>
        <span className="truncate text-[10px] font-semibold text-[#C8102E]">{active.label}</span>
      </div>
      <div className="relative h-14 w-full bg-[#F8FAFC] md:h-28">
        <motion.div
          className="absolute border border-[#C8102E]/80 bg-[#C8102E]/10"
          style={{ left, top, width, height }}
        />
        {STOPS.map((stop) => (
          <button
            key={stop.id}
            type="button"
            aria-label={stop.label}
            onClick={() => onJump(stop.t)}
            className="absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center"
            style={{ left: `${stop.x * 100}%`, top: `${stop.y * 100}%` }}
          >
            <span
              className={cn(
                "size-2 rounded-full border border-zinc-400 bg-white",
                stop.id === activeId && "border-[#C8102E] bg-[#C8102E]",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function TacticalPlane({
  news = [],
  nextMatch,
  mvp,
  sponsors = [],
}: {
  news?: NewsCard[];
  nextMatch: MatchCard | null;
  mvp: MvpHighlight | null;
  sponsors?: SponsorCard[];
}) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 54,
    damping: 18,
    mass: 0.45,
    restDelta: 0.0005,
  });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const [activeId, setActiveId] = useState(STOPS[0].id);

  const featured = news.find((item) => item.isFeatured) ?? news[0] ?? null;
  const kickoff = nextMatch ? formatKickoff(nextMatch.matchDate) : null;
  const venue = nextMatch?.location?.trim() || null;

  useEffect(() => {
    const apply = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aim = aimPoint(width, height);
      const camera = sample(progress.get());
      const fitted = fitScale(width, camera.scale);
      x.set(aim.x - camera.x * width * 3 * fitted);
      y.set(aim.y - camera.y * height * 3 * fitted);
      scale.set(fitted);
      const next = nearestStop(progress.get()).id;
      setActiveId((current) => (current === next ? current : next));
    };
    apply();
    const unsubscribe = progress.on("change", apply);
    window.addEventListener("resize", apply);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", apply);
    };
  }, [progress, scale, x, y]);

  function jump(t: number) {
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const distance = Math.max(0, track.offsetHeight - window.innerHeight);
    window.scrollTo({ top: top + t * distance, behavior: "smooth" });
  }

  const stations = (
    <PlaneStations
      nextMatch={nextMatch}
      mvp={mvp}
      featured={featured}
      sponsors={sponsors}
      kickoff={kickoff}
      venue={venue}
    />
  );

  if (reduce) {
    return (
      <OnPlane.Provider value={false}>
        <div className="relative bg-[#F8FAFC] px-4 py-8 sm:px-6">
          <div id="home-grids" className="mx-auto flex max-w-xl flex-col gap-4 [&_.absolute]:static">
            {stations}
          </div>
        </div>
      </OnPlane.Provider>
    );
  }

  return (
    <section ref={trackRef} className="relative h-[420vh] bg-[#F8FAFC] md:h-[520vh]">
      {STOPS.map((stop) => (
        <div
          key={stop.id}
          id={stop.id === "duelo" ? "home-grids" : undefined}
          className="absolute h-px w-px"
          style={{ top: `calc(${stop.t} * (100% - 100svh))` }}
        />
      ))}
      <div className="sticky top-0 h-svh overflow-hidden bg-[#F8FAFC]">
        <motion.div
          className="absolute top-0 left-0 h-[300vh] w-[300vw] origin-top-left will-change-transform"
          style={{ x, y, scale }}
        >
          <PitchPlane />
          {stations}
        </motion.div>
        <p className="pointer-events-none absolute top-5 right-5 z-20 hidden text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase md:block">
          Desliza el plano
        </p>
        <MiniMap progress={progress} onJump={jump} activeId={activeId} />
      </div>
    </section>
  );
}
