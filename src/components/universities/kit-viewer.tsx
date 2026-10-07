"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RotateCw, Shirt, XIcon } from "lucide-react";
import { SafeLogo } from "@/components/public/safe-logo";
import type { UniversityKit } from "@/lib/public/university-kits";
import type { UniversityPalette } from "@/lib/public/university-palette";

type OrientationPermission = { requestPermission?: () => Promise<"granted" | "denied"> };

/** Two-sided jersey you spin by dragging; only mounts its images once opened. */
export function KitViewer({
  kit,
  palette,
  shortName,
  logoUrl,
}: {
  kit: UniversityKit;
  palette: UniversityPalette;
  shortName: string;
  logoUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);

  const openViewer = () => {
    setOpen(true);
    // iOS only exposes device tilt after a permission prompt tied to a tap.
    const request = (globalThis.DeviceOrientationEvent as OrientationPermission | undefined)?.requestPermission;
    if (typeof request === "function") request().catch(() => undefined);
  };

  return (
    <>
      <button
        type="button"
        onClick={openViewer}
        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black tracking-wide text-zinc-950 uppercase shadow-lg transition hover:-translate-y-0.5"
      >
        <Shirt className="size-4" strokeWidth={2.5} />
        Ver equipación
      </button>
      {open
        ? createPortal(
            <KitDialog
              kit={kit}
              palette={palette}
              shortName={shortName}
              logoUrl={logoUrl}
              onClose={() => setOpen(false)}
            />,
            document.querySelector(".ligau-public") ?? document.body,
          )
        : null}
    </>
  );
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function maskOf(url: string): React.CSSProperties {
  return {
    maskImage: `url(${url})`,
    WebkitMaskImage: `url(${url})`,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
  };
}

function KitDialog({
  kit,
  palette,
  shortName,
  logoUrl,
  onClose,
}: {
  kit: UniversityKit;
  palette: UniversityPalette;
  shortName: string;
  logoUrl?: string | null;
  onClose: () => void;
}) {
  const [showingBack, setShowingBack] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const motion = useRef({ target: 0, current: 0, tilt: 0, tiltTarget: 0, gyroX: 0, gyroY: 0, gyro: false });
  const drag = useRef<{ x: number; y: number; angle: number } | null>(null);

  const settle = (angle: number) => {
    const snapped = Math.round(angle / 180) * 180;
    motion.current.target = snapped;
    setShowingBack(Math.abs(Math.round(snapped / 180)) % 2 === 1);
  };

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") settle(motion.current.target - 180);
      if (event.key === "ArrowRight") settle(motion.current.target + 180);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = motion.current;

    let baseBeta: number | null = null;
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta == null || event.gamma == null) return;
      baseBeta ??= event.beta;
      state.gyro = true;
      state.gyroX = clamp((baseBeta - event.beta) * 0.5, -14, 14);
      state.gyroY = clamp(event.gamma * 1.1, -32, 32);
    };
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch && !reduce) window.addEventListener("deviceorientation", onOrientation);

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const dragging = drag.current !== null;
      state.current += (state.target - state.current) * (dragging ? 1 : 0.1);
      state.tilt += (state.tiltTarget - state.tilt) * 0.15;
      const idle = !dragging && !state.gyro && !reduce;
      const phase = ((now - start) / 6000) * Math.PI * 2;
      const sway = idle ? Math.sin(phase) * 14 : 0;
      const bob = idle ? Math.sin(phase * 2) * -4 : 0;
      const spin = state.current + sway + (dragging ? 0 : state.gyroY);
      const tilt = state.tilt + (dragging ? 0 : state.gyroX);

      if (body.current) {
        body.current.style.transform = `translateY(${bob}px) rotateX(${tilt}deg) rotateY(${spin}deg)`;
      }
      if (stage.current) {
        const radians = (spin * Math.PI) / 180;
        stage.current.style.setProperty("--shade", (1 - Math.abs(Math.cos(radians))) * 0.6 + "");
        stage.current.style.setProperty("--sheen", `${50 - Math.sin(radians) * 120}%`);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, []);

  const glow = "drop-shadow(0 0 0.6px rgba(255,255,255,0.55)) drop-shadow(0 18px 16px rgba(0,0,0,0.55))";
  const edge = "#001018";

  const face = (src: string, alt: string, back: boolean) => (
    <div
      className="absolute inset-0 [backface-visibility:hidden]"
      style={{ transform: back ? "rotateY(180deg) translateZ(4px)" : "translateZ(4px)" }}
    >
      <img src={src} alt={alt} draggable={false} className="absolute inset-0 size-full object-contain" style={{ filter: glow }} />
      <span
        aria-hidden
        className="absolute inset-0 mix-blend-overlay"
        style={{
          ...maskOf(src),
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.42) 50%, transparent 60%)",
          backgroundSize: "300% 100%",
          backgroundPosition: "var(--sheen) 0",
        }}
      />
      <span aria-hidden className="absolute inset-0 bg-black" style={{ ...maskOf(src), opacity: "var(--shade)" }} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Equipación ${shortName} ${kit.name}`}
        className="relative isolate w-full max-w-md overflow-hidden rounded-[1.75rem] text-white shadow-[0_30px_80px_-24px_rgba(0,0,0,0.65)] ring-1 ring-white/10"
        style={{
          background: kit.stage
            ? `radial-gradient(120% 70% at 50% 42%, color-mix(in srgb, ${kit.stage} 80%, #ff2a2a) 0%, ${kit.stage} 45%, #120204 100%)`
            : `linear-gradient(180deg, color-mix(in srgb, ${palette.base} 55%, #123044) 0%, ${palette.base} 38%, #01080d 100%)`,
          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${palette.accent} 28%, transparent), 0 30px 80px -24px rgba(0,0,0,0.65)`,
        }}
      >
        <span
          aria-hidden
          className="absolute inset-x-8 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${palette.accent}, transparent)` }}
        />
        <span
          aria-hidden
          className="absolute inset-0 -z-10 opacity-30 [background-image:repeating-linear-gradient(115deg,rgba(255,255,255,0.05)_0_1px,transparent_1px_28px)]"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full bg-black/30 ring-1 ring-white/20 backdrop-blur-md"
        >
          <XIcon className="size-4" />
        </button>

        <div className="px-6 pt-7 pr-14">
          <p className="flex items-center gap-2 text-[10px] font-black tracking-[0.24em] text-white/70 uppercase">
            <span className="h-px w-6" style={{ background: palette.accent }} />
            Equipación
          </p>
          <h2 className="font-jersey mt-2 flex items-center gap-3 text-4xl leading-none uppercase sm:text-5xl">
            {logoUrl ? (
              <SafeLogo
                url={logoUrl}
                label={shortName}
                fallback={false}
                className="h-11 w-auto shrink-0 drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)] sm:h-12"
              />
            ) : null}
            {shortName}
          </h2>
        </div>

        <div
          ref={stage}
          className="relative mx-auto mt-2 aspect-square w-full max-w-sm cursor-grab touch-pan-y select-none active:cursor-grabbing [perspective:1100px]"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { x: event.clientX, y: event.clientY, angle: motion.current.current };
          }}
          onPointerMove={(event) => {
            if (!drag.current) return;
            motion.current.target = drag.current.angle + (event.clientX - drag.current.x) * 0.7;
            motion.current.tiltTarget = clamp(-(event.clientY - drag.current.y) * 0.15, -12, 12);
          }}
          onPointerUp={() => {
            drag.current = null;
            motion.current.tiltTarget = 0;
            settle(motion.current.target);
          }}
          onPointerCancel={() => {
            drag.current = null;
            motion.current.tiltTarget = 0;
            settle(motion.current.target);
          }}
        >
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 58% 42% at 50% 32%, rgba(255,255,255,0.16) 0%, transparent 70%)`,
            }}
          />
          <span
            aria-hidden
            className="absolute bottom-[9%] left-1/2 h-5 w-[46%] -translate-x-1/2 rounded-[50%] bg-black/55 blur-lg"
          />
          <div ref={body} className="absolute inset-[6%] [transform-style:preserve-3d] will-change-transform">
            {[-2.5, 0, 2.5].map((depth) => (
              <span
                key={depth}
                aria-hidden
                className="absolute inset-0"
                style={{ ...maskOf(kit.front), background: edge, transform: `translateZ(${depth}px)` }}
              />
            ))}
            {face(kit.front, `Frente de la equipación ${shortName}`, false)}
            {face(kit.back, `Espalda de la equipación ${shortName}`, true)}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 pb-6">
          <p className="text-xs font-medium text-white/60">Arrastra para girarla</p>
          <button
            type="button"
            onClick={() => settle(motion.current.target + 180)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black tracking-wide text-zinc-950 uppercase shadow-lg"
          >
            <RotateCw className="size-4" strokeWidth={2.5} />
            {showingBack ? "Ver frente" : "Ver espalda"}
          </button>
        </div>
      </div>
    </div>
  );
}
