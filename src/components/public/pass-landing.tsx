"use client";

import { useEffect, useRef, useState, type AnimationEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

/** Invented member so the card reads like a real credential on the landing. */
const DEMO_MEMBER = {
  name: "Valeria Montilla",
  role: "Atleta · Voleibol",
  university: "Universidad Católica Andrés Bello",
  mascot: "/marks/ucab/mascot.svg",
  photo: "/pass/member-demo.webp",
  jersey: 7,
  id: "LU-26-0417",
};

type Callout = { side: "left" | "right"; x: number; y: number; label: string };

/**
 * Points are percentages of the card box. The card keeps a fixed aspect ratio, so they stay
 * on target at any width; move them together with the layout of each face.
 */
const CALLOUTS: Record<"front" | "back", Callout[]> = {
  front: [
    { side: "left", x: 30, y: 27, label: "Foto verificada del titular" },
    { side: "right", x: 87, y: 8.5, label: "Tu universidad y tu equipo" },
  ],
  back: [
    { side: "left", x: 16, y: 35.4, label: "QR para validar tu carnet en los negocios aliados" },
    { side: "right", x: 71, y: 87, label: "ID único de miembro, verificado por CarnetX" },
  ],
};

const OUTSET = 20;
const DROP = 28;

const FACE =
  "absolute inset-0 overflow-hidden rounded-[26px] bg-[linear-gradient(160deg,#1d1d20_0%,#0a0a0b_50%,#18140b_100%)] text-white ring-1 ring-[#D4AF37]/45 ring-inset backface-hidden";

function CardFront() {
  return (
    <div className={FACE}>
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,#2a8ac4_0%,#0e5a85_30%,#00293f_58%,#020a12_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(120deg,rgba(255,255,255,0.05)_0_2px,transparent_2px_14px)]"
      />
      <div
        aria-hidden
        className="absolute -top-10 -left-1/4 h-[140%] w-16 rotate-[24deg] bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.14),transparent)] blur-md"
      />
      <span
        aria-hidden
        className="font-jersey absolute top-[4%] right-[-6%] text-[15rem] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.24)] select-none"
      >
        {DEMO_MEMBER.jersey}
      </span>

      <div className="absolute inset-x-0 top-[9%] h-[62%]">
        <Image
          src={DEMO_MEMBER.photo}
          alt=""
          fill
          sizes="280px"
          className="object-cover object-top [filter:drop-shadow(0_0_1px_rgba(255,255,255,0.5))_drop-shadow(0_18px_24px_rgba(0,0,0,0.55))]"
          priority
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,#020a12_26%,rgba(2,10,18,0.88)_36%,rgba(2,10,18,0)_56%)]"
      />

      <div className="absolute inset-x-4 top-4 flex items-start justify-between">
        <Image src="/brand/liga-u-logo.svg" alt="" width={22} height={24} className="h-6 w-auto drop-shadow" />
        <span className="grid size-9 place-items-center rounded-full bg-white/90 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.5)] ring-1 ring-white/40 backdrop-blur">
          <Image src={DEMO_MEMBER.mascot} alt="" width={26} height={26} className="size-6.5 object-contain" />
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-white/70 uppercase">
          <span className="font-jersey text-lg leading-none tracking-normal text-white">#{DEMO_MEMBER.jersey}</span>
          {DEMO_MEMBER.role}
        </p>
        <p className="font-jersey mt-1 text-[2.15rem] leading-[0.88] tracking-wide uppercase">{DEMO_MEMBER.name}</p>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="font-mono text-[10px] tracking-[0.16em] text-white/80">{DEMO_MEMBER.id}</span>
          <span className="text-[8px] font-semibold tracking-[0.14em] text-white/50 uppercase">
            Powered by <span className="text-white">CarnetX</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function CardBack() {
  return (
    <div className={cn(FACE, "rotate-y-180")}>
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 [background-image:repeating-linear-gradient(115deg,rgba(212,175,55,0.08)_0_1px,transparent_1px_7px)]"
      />
      <div
        aria-hidden
        className="absolute top-[10%] left-1/2 size-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.22),transparent_65%)]"
      />

      <div className="absolute inset-x-4 top-4 flex items-center justify-between">
        <Image src="/brand/liga-u-logo.svg" alt="" width={22} height={24} className="h-6 w-auto" />
        <span className="text-[9px] font-semibold tracking-[0.2em] text-white/45 uppercase">Temporada 2026</span>
      </div>

      <div className="absolute top-[14%] left-[16%] aspect-square w-[68%] rounded-2xl bg-white p-[7%] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.8)] ring-4 ring-[#D4AF37]/30">
        <QRCodeSVG
          value={`https://ligau.app/carnet/${DEMO_MEMBER.id}`}
          size={256}
          level="M"
          fgColor="#09090b"
          bgColor="#ffffff"
          title={`Código del carnet ${DEMO_MEMBER.id}`}
          className="size-full"
        />
      </div>

      <div className="absolute inset-x-0 bottom-[7%] text-center">
        <p className="font-mono text-[11px] tracking-[0.16em] text-white/85">{DEMO_MEMBER.id}</p>
        <p className="mt-1 text-[9px] text-white/45">{DEMO_MEMBER.university}</p>
      </div>
    </div>
  );
}

const DRAW = "ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

/** Elbow from the caption up the margin, then in to the point on the card. */
function CalloutLine({ side, x, y, show }: Callout & { show: boolean }) {
  const edge = side === "left" ? { left: -OUTSET } : { right: -OUTSET };
  const run = side === "left" ? `calc(${x}% + ${OUTSET}px)` : `calc(${100 - x}% + ${OUTSET}px)`;
  const outward = side === "left" ? "origin-left" : "origin-right";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <span
        className={cn(
          "absolute w-px origin-bottom bg-[#C8102E] transition-transform",
          DRAW,
          show ? "scale-y-100 delay-75 duration-500 md:duration-700" : "scale-y-0 duration-200",
        )}
        style={{ ...edge, top: `${y}%`, height: `calc(${100 - y}% + ${DROP}px)` }}
      />
      <span
        className={cn(
          "absolute h-px bg-[#C8102E] transition-transform",
          outward,
          DRAW,
          show ? "scale-x-100 delay-200 duration-450 md:delay-240 md:duration-500" : "scale-x-0 duration-180",
        )}
        style={{ ...edge, top: `${y}%`, width: run }}
      />
      <span
        className={cn(
          "absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C8102E] transition-[transform,opacity,box-shadow]",
          DRAW,
          show
            ? "scale-100 opacity-100 shadow-[0_0_0_5px_rgba(200,16,46,0.18)] delay-380 duration-300 md:delay-460"
            : "scale-50 opacity-0 shadow-none duration-150",
        )}
        style={{ left: `${x}%`, top: `${y}%` }}
      />
    </div>
  );
}

/** Vertical black & gold credential; tapping flips it to the QR on the back. */
export function PassCard() {
  const [face, setFace] = useState<"front" | "back">("front");
  const [lines, setLines] = useState(false);
  const [spin, setSpin] = useState<"to-back" | "to-front" | null>(null);
  const busy = useRef(false);
  const pending = useRef<"front" | "back" | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setLines(true);
      return;
    }
    const id = window.setTimeout(() => setLines(true), 280);
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
    later(120, () => setSpin(next === "back" ? "to-back" : "to-front"));
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
            "pointer-events-none absolute inset-x-[12%] top-[10%] -bottom-1 rounded-[26px] bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.32),rgba(9,9,11,0.16)_58%,transparent_74%)] blur-2xl transition-all duration-700 ease-out",
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
              "relative aspect-[1/1.586] w-full rounded-[26px] transform-3d group-focus-visible:ring-2 group-focus-visible:ring-[#C8102E] group-focus-visible:ring-offset-4",
              spin === "to-back" && "animate-ligau-pass-to-back",
              spin === "to-front" && "animate-ligau-pass-to-front",
              !spin && face === "back" && "rotate-y-180",
            )}
          >
            <CardFront />
            <CardBack />
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
export function ShineLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative isolate inline-flex min-h-14 items-center justify-center overflow-hidden rounded-full bg-[#C8102E] px-8 text-[15px] font-semibold tracking-[0.08em] text-white uppercase shadow-[0_18px_40px_-16px_rgba(200,16,46,0.75)] transition-[transform,background-color] duration-300 select-none hover:bg-[#a50f25] active:scale-[0.97]",
        className,
      )}
    >
      <span
        aria-hidden
        className="animate-ligau-shine absolute inset-y-0 -left-1/2 -z-10 w-1/3 skew-x-[-20deg] bg-white/30"
      />
      {children}
    </Link>
  );
}
