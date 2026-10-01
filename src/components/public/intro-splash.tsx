"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  INTRO_ENABLED,
  INTRO_KEY,
  INTRO_ONCE_PER_SESSION,
  INTRO_SEEN_CLASS,
} from "@/components/public/intro-boot";
import { cn } from "@/lib/utils";

type Phase = "load" | "cuts" | "logo" | "exit" | "done";

const LOGO = "/brand/liga-u-logo.svg";

const ATHLETES = [
  { src: "/intro/rugby.webp", width: 670, height: 636, sport: "Rugby" },
  { src: "/intro/futbol.webp", width: 632, height: 636, sport: "Fútbol" },
  { src: "/intro/voleibol.webp", width: 443, height: 636, sport: "Voleibol" },
  { src: "/intro/baloncesto.webp", width: 308, height: 636, sport: "Baloncesto" },
  { src: "/intro/tenis-mesa.webp", width: 789, height: 636, sport: "Tenis de mesa" },
  { src: "/intro/tenis.webp", width: 330, height: 636, sport: "Tenis" },
];

const CUT_MS = [760, 620, 540, 480, 440, 420];
const PRELOAD_MAX_MS = 1500;
const LOGO_HOLD_MS = 1700;
const LOGO_HOLD_REDUCED_MS = 900;
const EXIT_MS = 900;
const TOTAL_MS = CUT_MS.reduce((a, b) => a + b, 0) + LOGO_HOLD_MS;

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;
const EASE_SOFT = [0.22, 1, 0.36, 1] as const;

const noopSubscribe = () => () => {};

function readSeen() {
  if (!INTRO_ONCE_PER_SESSION) return false;
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return true;
  }
}

function markSeen() {
  if (!INTRO_ONCE_PER_SESSION) return;
  try {
    sessionStorage.setItem(INTRO_KEY, "1");
  } catch {}
  document.documentElement.classList.add(INTRO_SEEN_CLASS);
}

function preload(src: string) {
  const img = new window.Image();
  img.src = src;
  return img.decode().catch(() => undefined);
}

/** Brand entrance. Mounts nothing while `INTRO_ENABLED` is false. */
export function IntroSplash() {
  if (!INTRO_ENABLED) return null;
  return <IntroSplashSequence />;
}

function IntroSplashSequence() {
  const seen = useSyncExternalStore(noopSubscribe, readSeen, () => false);
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("load");
  const [cut, setCut] = useState(0);
  const active = !seen && phase !== "done";

  const skip = useCallback(
    () => setPhase((p) => (p === "exit" || p === "done" ? p : "exit")),
    [],
  );

  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    window.addEventListener("keydown", skip);
    return () => {
      root.style.overflow = prevOverflow;
      window.removeEventListener("keydown", skip);
    };
  }, [active, skip]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let timer = 0;
    const after = (ms: number, fn: () => void) => {
      timer = window.setTimeout(() => !cancelled && fn(), ms);
    };

    if (phase === "load") {
      Promise.race([
        Promise.all([LOGO, ...ATHLETES.map((a) => a.src)].map(preload)),
        new Promise((resolve) => window.setTimeout(resolve, PRELOAD_MAX_MS)),
      ]).then(() => !cancelled && setPhase(reduced ? "logo" : "cuts"));
    } else if (phase === "cuts") {
      after(CUT_MS[cut], () =>
        cut < ATHLETES.length - 1 ? setCut(cut + 1) : setPhase("logo"),
      );
    } else if (phase === "logo") {
      after(reduced ? LOGO_HOLD_REDUCED_MS : LOGO_HOLD_MS, () => setPhase("exit"));
    } else if (phase === "exit") {
      after(EXIT_MS, () => {
        markSeen();
        setPhase("done");
      });
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [active, phase, cut, reduced]);

  if (!active) return null;

  const cutting = phase === "cuts";
  const showLogo = phase === "logo" || phase === "exit";
  const athlete = ATHLETES[cut];

  return (
    <motion.div
      aria-hidden
      onPointerDown={skip}
      initial={false}
      animate={{ y: phase === "exit" ? "-100%" : "0%" }}
      transition={{ duration: EXIT_MS / 1000, ease: EASE_IN_OUT }}
      className="ligau-intro fixed inset-0 z-[100] touch-none select-none"
    >
      <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#f4f5f7_55%,#e6e9ee_100%)]">
        <div className="absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(115deg,transparent_0_46px,rgba(148,163,184,0.12)_46px_47px)]" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[min(60svh,640px)] w-[min(92vw,720px)]">

            <motion.div
              className="absolute top-[8%] left-1/2 h-[86%] w-[44%] -translate-x-1/2 origin-bottom bg-linear-to-b from-[#e3283f] via-[#c8102e] to-[#8f0b20] shadow-[0_30px_60px_-20px_rgba(200,16,46,0.55)] [clip-path:polygon(22%_0,100%_0,78%_100%,0_100%)]"
              initial={{ scaleY: 0, rotate: 0 }}
              animate={
                cutting
                  ? { scaleY: 1, rotate: cut % 2 ? 5 : -5, x: cut % 2 ? 10 : -10 }
                  : { scaleY: 0, rotate: 0, x: 0 }
              }
              transition={{
                scaleY: { duration: cutting ? 0.6 : 0.45, ease: cutting ? EASE_SOFT : EASE_IN_OUT },
                default: { type: "spring", stiffness: 140, damping: 22 },
              }}
            />

            <AnimatePresence>
              {cutting ? (
                <motion.span
                  key={athlete.sport}
                  className="font-jersey absolute inset-x-0 top-[22%] text-center leading-none whitespace-nowrap text-zinc-300 uppercase mix-blend-multiply"
                  style={{
                    fontSize: `min(${215 / athlete.sport.length}vw, ${1350 / athlete.sport.length}px)`,
                  }}
                  initial={{ opacity: 0, x: 90, filter: "blur(6px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{
                    opacity: 0,
                    x: -70,
                    filter: "blur(6px)",
                    transition: { duration: 0.3, ease: EASE_IN_OUT },
                  }}
                  transition={{ duration: 0.55, ease: EASE_SOFT }}
                >
                  {athlete.sport}
                </motion.span>
              ) : null}
            </AnimatePresence>

            {ATHLETES.map((a, i) => (
              <motion.div
                key={a.src}
                className="absolute inset-0 flex items-end justify-center"
                initial="next"
                animate={!cutting ? (showLogo ? "gone" : "next") : i === cut ? "on" : i < cut ? "gone" : "next"}
                variants={{
                  next: { opacity: 0, x: 80, scale: 1.05, filter: "blur(8px)" },
                  on: {
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    transition: { duration: 0.5, ease: EASE_SOFT },
                  },
                  gone: {
                    opacity: 0,
                    x: -60,
                    scale: 0.97,
                    filter: "blur(8px)",
                    transition: { duration: 0.3, ease: EASE_IN_OUT },
                  },
                }}
              >
                <motion.div
                  className="flex h-[88%] items-end justify-center"
                  animate={cutting && i === cut ? { scale: 1.05 } : { scale: 1 }}
                  transition={
                    cutting && i === cut
                      ? { duration: CUT_MS[i] / 1000 + 0.4, ease: "linear" }
                      : { duration: 0 }
                  }
                >
                  <Image
                    src={a.src}
                    alt=""
                    width={a.width}
                    height={a.height}
                    unoptimized
                    loading="eager"
                    draggable={false}
                    className="h-full w-auto max-w-full object-contain drop-shadow-[0_26px_28px_rgba(15,23,42,0.28)]"
                  />
                </motion.div>
              </motion.div>
            ))}

            <AnimatePresence>
              {cutting ? (
                <motion.div
                  className="font-jersey absolute bottom-0 left-0 flex items-baseline gap-2 text-zinc-900"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                >
                  <span className="relative inline-flex h-[1em] overflow-hidden text-3xl leading-none text-[#c8102e] tabular-nums md:text-4xl">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={cut}
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "-100%" }}
                        transition={{ duration: 0.4, ease: EASE_SOFT }}
                      >
                        {String(cut + 1).padStart(2, "0")}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className="text-sm tracking-[0.3em] text-zinc-400">
                    / {String(ATHLETES.length).padStart(2, "0")}
                  </span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showLogo && !reduced
            ? [0, 0.12].map((d) => (
                <motion.span
                  key={d}
                  className={cn(
                    "absolute size-48 rounded-full border-2",
                    d ? "border-zinc-300" : "border-[#c8102e]",
                  )}
                  initial={{ opacity: 0.8, scale: 0.4 }}
                  animate={{ opacity: 0, scale: 2.6 }}
                  transition={{ duration: 1.4, delay: 0.2 + d * 1.5, ease: EASE_OUT }}
                />
              ))
            : null}

          <AnimatePresence>
            {showLogo ? (
              <motion.div
                className="relative"
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.35, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={
                  reduced
                    ? { duration: 0.35 }
                    : {
                        scale: { type: "spring", stiffness: 170, damping: 22 },
                        opacity: { duration: 0.35 },
                        filter: { duration: 0.5 },
                      }
                }
              >
                <Image
                  src={LOGO}
                  alt=""
                  width={868}
                  height={950}
                  preload
                  draggable={false}
                  className="h-[26svh] max-h-[300px] w-auto drop-shadow-[0_24px_40px_rgba(15,23,42,0.22)]"
                />
                {reduced ? null : (
                  <motion.span
                    className="absolute inset-0 bg-no-repeat"
                    style={{
                      maskImage: `url(${LOGO})`,
                      WebkitMaskImage: `url(${LOGO})`,
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      backgroundImage:
                        "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.9) 50%, transparent 65%)",
                      backgroundSize: "250% 100%",
                    }}
                    initial={{ backgroundPosition: "130% 0%" }}
                    animate={{ backgroundPosition: "-30% 0%" }}
                    transition={{ duration: 1.1, delay: 0.55, ease: "easeInOut" }}
                  />
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {showLogo ? (
            <div className="mt-5 flex flex-col items-center gap-2">
              <motion.p
                className="font-jersey text-base whitespace-nowrap text-zinc-500 uppercase md:text-xl"
                initial={{ opacity: 0, letterSpacing: "0.7em" }}
                animate={{ opacity: 1, letterSpacing: "0.32em" }}
                transition={{ duration: 0.9, delay: reduced ? 0.1 : 0.5, ease: EASE_SOFT }}
              >
                Temporada 2026 · Caracas
              </motion.p>
              <motion.span
                className="h-[3px] w-16 origin-center rounded-full bg-[#c8102e]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: reduced ? 0.1 : 0.7, ease: EASE_SOFT }}
              />
            </div>
          ) : null}
        </div>

        {reduced ? null : (
          <motion.span
            className="absolute inset-x-0 top-0 h-[3px] origin-left bg-[#c8102e]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: phase === "load" ? 0 : 1 }}
            transition={{ duration: TOTAL_MS / 1000, ease: "linear" }}
          />
        )}

        <p className="absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] text-center text-[10px] font-semibold tracking-[0.3em] text-zinc-400 uppercase">
          Toca para saltar
        </p>
      </div>

      <div className="absolute inset-x-0 top-full h-2 bg-[#c8102e]" />
      <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] h-1 bg-zinc-300" />
    </motion.div>
  );
}
