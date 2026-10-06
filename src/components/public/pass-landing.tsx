"use client";

import { useEffect, useRef, useState, type AnimationEvent, type ReactNode } from "react";
import { RotateCw } from "lucide-react";
import { CarnetFace, type CarnetData, type CarnetDesign } from "@/components/public/carnet/carnet-face";
import membershipDesign from "@/components/public/carnet/membership-design.json";
import { cn } from "@/lib/utils";

/** Invented member, drawn with the real CarnetX design of the membership carnet. */
const DEMO_MEMBER: CarnetData = {
  nombre: "Valeria Montilla",
  tipo_miembro: "Membresía",
  tipo_universidad: "UCAB",
  cedula: "V-28.417.903",
  tipo_carrera: "Comunicación",
  miembro_desde: "2026",
};
const DEMO_PHOTO = "/pass/member-demo.webp";
const DEMO_QR = "https://ligauve.com/carnet/LU-26-0417";
const DESIGN = membershipDesign as unknown as CarnetDesign;

type Callout = { side: "left" | "right"; x: number; y: number; label: string };

/**
 * Points are percentages of the card box, which keeps the 3:5 CarnetX canvas, so they stay
 * on target at any width; move them together with the layers of the design.
 */
const CALLOUTS: Record<"front" | "back", Callout[]> = {
  front: [
    { side: "left", x: 30, y: 34, label: "Foto verificada del titular" },
    { side: "right", x: 80, y: 75.7, label: "Tu universidad y tu carrera" },
  ],
  back: [
    { side: "left", x: 30, y: 21, label: "QR para validar tu carnet en los negocios aliados" },
    { side: "right", x: 82, y: 80.4, label: "Las marcas aliadas de U Pass" },
  ],
};

const OUTSET = 20;
const DROP = 28;

const FACE = "absolute inset-0 overflow-hidden rounded-[26px] backface-hidden";

/**
 * One continuous stroke: the rise eases in and the run eases out with matching end slopes,
 * and each leg lasts in proportion to its length, so the tip turns the corner without slowing.
 */
const STROKE_MS = 1000;
const START_MS = 60;
const RISE_EASE = "cubic-bezier(0.4, 0, 1, 1)";
const RUN_EASE = "cubic-bezier(0, 0, 0.6, 1)";
const CARD_PX = 256;

type Leg = { delay: number; duration: number };

function strokeTiming(side: Callout["side"], x: number, y: number) {
  const rise = ((100 - y) / 100) * CARD_PX * (5 / 3) + DROP;
  const run = ((side === "left" ? x : 100 - x) / 100) * CARD_PX + OUTSET;
  const riseMs = Math.round((STROKE_MS * rise) / (rise + run));
  const runLeg = { delay: START_MS + riseMs, duration: STROKE_MS - riseMs };
  return { rise: { delay: START_MS, duration: riseMs }, run: runLeg, land: runLeg.delay + runLeg.duration - 40 };
}

function flow(show: boolean, property: string, enter: Leg, ease: string, exitDelay: number) {
  return show
    ? `${property} ${enter.duration}ms ${ease} ${enter.delay}ms`
    : `${property} 220ms cubic-bezier(0.4, 0, 1, 1) ${exitDelay}ms`;
}

/** Glowing drop riding the tip: it appears on the rise and hands over to the run at the corner. */
function Bead({ show, leg, part, className }: { show: boolean; leg: Leg; part: "rise" | "run"; className: string }) {
  return (
    <span
      className={cn(
        "absolute size-[7px] rounded-full bg-brand-red opacity-0 shadow-[0_0_10px_3px_rgba(200,16,46,0.45)]",
        show && (part === "rise" ? "animate-ligau-bead-rise" : "animate-ligau-bead-run"),
        className,
      )}
      style={{ animationDelay: `${leg.delay}ms`, animationDuration: `${leg.duration}ms` }}
    />
  );
}

/** Elbow that flows from the caption up the margin, then in to the point, landing in ripples. */
function CalloutLine({ side, x, y, show }: Callout & { show: boolean }) {
  const edge = side === "left" ? { left: -OUTSET } : { right: -OUTSET };
  const run = side === "left" ? `calc(${x}% + ${OUTSET}px)` : `calc(${100 - x}% + ${OUTSET}px)`;
  const timing = strokeTiming(side, x, y);
  return (
    <div aria-hidden className="ligau-callout pointer-events-none absolute inset-0 z-20">
      <span
        className="absolute w-px bg-[linear-gradient(to_top,rgba(200,16,46,0.35),#C8102E_40%)]"
        style={{
          ...edge,
          bottom: -DROP,
          height: show ? `calc(${100 - y}% + ${DROP}px)` : 0,
          transition: flow(show, "height", timing.rise, RISE_EASE, 120),
        }}
      >
        <Bead show={show} leg={timing.rise} part="rise" className="-top-[3px] left-1/2 -translate-x-1/2" />
      </span>
      <span
        className="absolute h-px bg-brand-red"
        style={{ ...edge, top: `${y}%`, width: show ? run : 0, transition: flow(show, "width", timing.run, RUN_EASE, 0) }}
      >
        <Bead
          show={show}
          leg={timing.run}
          part="run"
          className={cn("top-1/2 -translate-y-1/2", side === "left" ? "-right-[3px]" : "-left-[3px]")}
        />
      </span>
      <span className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
        {show
          ? [0, 260].map((offset) => (
              <span
                key={offset}
                className="animate-ligau-ripple absolute inset-0 rounded-full border border-brand-red opacity-0"
                style={{ animationDelay: `${timing.land + offset}ms` }}
              />
            ))
          : null}
        <span
          className={cn(
            "block size-2 rounded-full bg-brand-red",
            show ? "scale-100 opacity-100 shadow-[0_0_0_5px_rgba(200,16,46,0.16)]" : "scale-0 opacity-0",
          )}
          style={{
            transition: show
              ? `transform 420ms cubic-bezier(0.34, 1.7, 0.64, 1) ${timing.land}ms, opacity 160ms ease-out ${timing.land}ms, box-shadow 600ms ease-out ${timing.land + 120}ms`
              : "transform 150ms ease-in, opacity 150ms ease-in, box-shadow 150ms ease-in",
          }}
        />
      </span>
    </div>
  );
}

/** The real CarnetX carnet; tapping flips it to the QR on the back. */
export function PassCard({ logos }: { logos: string[] }) {
  const [face, setFace] = useState<"front" | "back">("front");
  const [lines, setLines] = useState(false);
  const [spin, setSpin] = useState<"to-back" | "to-front" | null>(null);
  const busy = useRef(false);
  const pending = useRef<"front" | "back" | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(() => setLines(true), reduced ? 0 : 280);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => {
      for (const id of pendingTimers) window.clearTimeout(id);
    };
  }, []);

  function later(ms: number, run: () => void) {
    const id = window.setTimeout(run, ms);
    timers.current.push(id);
  }

  function flip() {
    if (busy.current) return;
    const next = face === "front" ? "back" : "front";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFace(next);
      setLines(true);
      return;
    }
    busy.current = true;
    pending.current = next;
    setLines(false);
    later(40, () => setSpin(next === "back" ? "to-back" : "to-front"));
  }

  function onFlipEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (!event.animationName.startsWith("ligau-pass")) return;
    const next = pending.current;
    if (!next) return;
    pending.current = null;
    setFace(next);
    setSpin(null);
    later(30, () => {
      setLines(true);
      busy.current = false;
    });
  }

  return (
    <div className="mx-auto w-full max-w-[16rem]">
      <div className="relative">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-[12%] top-[10%] -bottom-1 rounded-[26px] bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.38),rgba(31,26,16,0.16)_58%,transparent_74%)] blur-2xl transition-all duration-700 ease-out",
            spin ? "top-[4%] -bottom-6 scale-105 opacity-70" : "opacity-100",
          )}
        />
        <button
          type="button"
          onClick={flip}
          aria-pressed={face === "back"}
          aria-label={face === "back" ? "Ver el frente del carnet" : "Girar el carnet para ver el código QR"}
          className="group relative z-10 block w-full touch-manipulation [perspective:1100px] [-webkit-tap-highlight-color:transparent] focus-visible:outline-none"
        >
          <div
            onAnimationEnd={onFlipEnd}
            className={cn(
              "relative aspect-[3/5] w-full rounded-[26px] transform-3d group-focus-visible:ring-2 group-focus-visible:ring-brand-red group-focus-visible:ring-offset-4",
              spin === "to-back" && "animate-ligau-pass-to-back",
              spin === "to-front" && "animate-ligau-pass-to-front",
              !spin && face === "back" && "rotate-y-180",
            )}
          >
            {(["front", "back"] as const).map((side) => (
              <div key={side} className={cn(FACE, side === "back" && "rotate-y-180")}>
                <CarnetFace
                  design={DESIGN}
                  side={side}
                  data={DEMO_MEMBER}
                  photoUrl={DEMO_PHOTO}
                  qrValue={DEMO_QR}
                  logos={side === "back" ? logos : undefined}
                />
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-[linear-gradient(100deg,transparent_20%,rgba(255,255,255,0.42)_50%,transparent_80%)] opacity-0 mix-blend-overlay",
                    spin && "animate-ligau-pass-glint",
                  )}
                />
              </div>
            ))}
          </div>
        </button>
        {(["front", "back"] as const).flatMap((side) =>
          CALLOUTS[side].map((callout) => (
            <CalloutLine key={`${side}-${callout.side}`} {...callout} show={lines && face === side} />
          )),
        )}
      </div>

      <div className="relative mt-8 h-14" style={{ marginInline: -OUTSET }}>
        {(["front", "back"] as const).map((side) => (
          <div
            key={side}
            aria-hidden={!(lines && face === side)}
            className={cn(
              "absolute inset-0 grid grid-cols-2 gap-6 transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none",
              lines && face === side ? "translate-y-0 opacity-100 delay-150" : "translate-y-1.5 opacity-0 duration-200",
            )}
          >
            {CALLOUTS[side].map((callout) => (
              <p
                key={callout.side}
                className={cn(
                  "text-[12px] leading-snug font-medium text-zinc-600",
                  callout.side === "right" && "text-right",
                )}
              >
                {callout.label}
              </p>
            ))}
          </div>
        ))}
      </div>

      <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-400">
        <RotateCw
          aria-hidden
          className={cn("size-3.5 transition-transform duration-700 ease-out", face === "back" && "rotate-180")}
          strokeWidth={2.25}
        />
        {face === "back" ? "Toca para ver el frente" : "Toca el carnet para ver tu QR"}
      </p>
    </div>
  );
}

/** Red pill with a periodic light sweep. */
export function ShineButton({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      className={cn(
        "relative isolate inline-flex min-h-14 items-center justify-center overflow-hidden rounded-full bg-brand-red px-8 text-[15px] font-semibold tracking-[0.08em] text-white uppercase shadow-[0_18px_40px_-16px_rgba(200,16,46,0.75)] transition-[transform,background-color] duration-300 select-none hover:bg-brand-red-dark active:scale-[0.97]",
        className,
      )}
    >
      <span
        aria-hidden
        className="animate-ligau-shine absolute inset-y-0 -left-1/2 -z-10 w-1/3 skew-x-[-20deg] bg-white/30"
      />
      {children}
    </button>
  );
}
