"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

function SoccerBall({ className }: { className?: string }) {
  const clipId = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <circle cx="16" cy="16" r="13.4" />
        </clipPath>
      </defs>
      <circle cx="16" cy="16" r="14.2" fill="#F8FAFC" stroke="#18181B" strokeWidth="1.5" />
      <g clipPath={`url(#${clipId})`} fill="#18181B">
        <polygon points="16,8.2 20.6,11.5 18.8,16.8 13.2,16.8 11.4,11.5" />
        <polygon points="16,1.2 12.4,6.6 19.6,6.6" />
        <polygon points="28.8,8.4 22.2,10.6 24.6,5.2" />
        <polygon points="3.2,8.4 9.8,10.6 7.4,5.2" />
        <polygon points="26.4,25.6 19.6,18.6 23.8,15.2" />
        <polygon points="5.6,25.6 12.4,18.6 8.2,15.2" />
        <polygon points="16,30.4 11.2,23.2 20.8,23.2" />
      </g>
    </svg>
  );
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function HeaderKickBall() {
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const flightRef = useRef<{
    scrollStart: number;
    scrollTarget: number;
    duration: number;
    startX: number;
    startY: number;
    landX: number;
    landY: number;
  } | null>(null);
  const [flying, setFlying] = useState(false);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  useEffect(() => {
    if (!flying) return;
    const flight = flightRef.current;
    if (!flight) return;

    const started = performance.now();
    const frame = (now: number) => {
      const t = Math.min(1, (now - started) / flight.duration);
      const scrollT = easeInOut(t);
      window.scrollTo(0, flight.scrollStart + (flight.scrollTarget - flight.scrollStart) * scrollT);

      const drop = t < 0.82 ? (t / 0.82) ** 2 : 1;
      const bounce =
        t < 0.82 ? 0 : Math.sin(((t - 0.82) / 0.18) * Math.PI) * 22 * (1 - (t - 0.82) / 0.18);
      const drift = Math.sin(t * Math.PI * 2) * 14 * (1 - t);
      const x = flight.startX + (flight.landX - flight.startX) * Math.min(1, t / 0.82) + drift;
      const y = flight.startY + (flight.landY - flight.startY) * drop - bounce;
      const squash = t >= 0.82 && t < 0.94 ? Math.sin(((t - 0.82) / 0.12) * Math.PI) : 0;
      const opacity = t < 0.9 ? 1 : 1 - (t - 0.9) / 0.1;
      const el = flyerRef.current;
      if (el) {
        el.style.opacity = String(opacity);
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${t * 720}deg) scale(${1 + squash * 0.14}, ${1 - squash * 0.2})`;
      }

      if (t < 1) {
        frameRef.current = requestAnimationFrame(frame);
      } else {
        setFlying(false);
      }
    };

    frameRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameRef.current);
  }, [flying]);

  if (pathname !== "/") return null;

  function kick() {
    if (flying) return;
    const button = buttonRef.current;
    const target = document.getElementById("home-grids");
    if (!button || !target) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const start = button.getBoundingClientRect();
    const header = button.closest("header");
    const headerHeight = header?.getBoundingClientRect().height ?? 48;
    const scrollTarget = Math.max(
      0,
      target.getBoundingClientRect().top + window.scrollY - headerHeight - 8,
    );
    const scrollStart = window.scrollY;
    const distance = Math.abs(scrollTarget - scrollStart);
    if (distance < 24) return;

    const duration = Math.min(2100, Math.max(1400, distance * 1.2));
    const size = start.width;
    flightRef.current = {
      scrollStart,
      scrollTarget,
      duration,
      startX: start.left,
      startY: start.top,
      landX: window.innerWidth / 2 - size / 2,
      landY: Math.min(window.innerHeight * 0.58, window.innerHeight - 140),
    };
    setFlying(true);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={kick}
        disabled={flying}
        aria-label="Bajar a los grids"
        className="grid size-11 place-items-center rounded-full touch-manipulation active:scale-95"
      >
        <SoccerBall
          className={
            flying
              ? "size-8 opacity-0"
              : "size-8 animate-ligau-ball-bob drop-shadow-[0_3px_0_rgba(24,24,27,0.14)]"
          }
        />
      </button>
      {flying
        ? createPortal(
            <div
              ref={flyerRef}
              aria-hidden
              className="pointer-events-none fixed top-0 left-0 z-[70] grid size-11 place-items-center"
            >
              <SoccerBall className="size-8 drop-shadow-[0_8px_10px_rgba(15,23,42,0.28)]" />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
