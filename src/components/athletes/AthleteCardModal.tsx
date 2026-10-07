"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import { cloudinaryThumb } from "@/lib/public/media";
import type { AthleteSheet } from "@/lib/public/athlete-sheet";
import { MASCOT_OUTLINE, paletteBackground } from "@/lib/public/university-palette";
import { cn } from "@/lib/utils";

export function AthleteCardModal({
  athlete,
  onClose,
}: {
  athlete: AthleteSheet | null;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const open = Boolean(athlete);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {athlete ? (
        <div className="fixed inset-0 z-[80]">
          <motion.button
            type="button"
            aria-label="Cerrar ficha"
            className="absolute inset-0 bg-black/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center md:items-center">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="athlete-sheet-title"
              drag={reduce || !isMobile ? false : "y"}
              dragConstraints={{ top: 0, bottom: 180 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                if (info.offset.y > 110 || info.velocity.y > 700) onClose();
              }}
              initial={reduce ? { opacity: 1 } : { y: 80, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { y: 80, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="pointer-events-auto relative max-h-[calc(100svh-1.5rem)] w-full max-w-md overflow-hidden rounded-t-[1.75rem] border border-white/10 text-white shadow-[0_-18px_50px_rgba(0,0,0,0.4)] md:max-h-[calc(100svh-3rem)] md:max-w-2xl md:rounded-[1.75rem] md:shadow-[0_28px_70px_-20px_var(--glow)]"
              style={
                {
                  "--glow": athlete.palette.glow,
                  "--accent": athlete.palette.accent,
                  background: `linear-gradient(165deg, color-mix(in srgb, ${athlete.palette.base} 85%, #fff) 0%, ${athlete.palette.base} 55%, color-mix(in srgb, ${athlete.palette.base} 70%, #000) 100%)`,
                } as React.CSSProperties
              }
            >
              <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/30 md:hidden" />
              <AthleteSheetBody athlete={athlete} onClose={onClose} />
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function AthleteSheetBody({
  athlete,
  onClose,
}: {
  athlete: AthleteSheet;
  onClose: () => void;
}) {
  const photo = cloudinaryThumb(athlete.photoUrl, 640);
  const dorsal = athlete.jerseyNumber?.toString() ?? "U";
  const { palette } = athlete;

  return (
    <div className="relative md:grid md:min-h-[24rem] md:grid-cols-[15rem_1fr] md:gap-2 md:p-3">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2.5 right-3 z-20 grid size-8 place-items-center rounded-full bg-black/30 text-white ring-1 ring-white/20 backdrop-blur-md md:top-5 md:right-5"
        aria-label="Cerrar"
      >
        <XIcon className="size-4" />
      </button>

      <div
        className="relative isolate mx-4 mt-3 h-44 overflow-hidden rounded-[1.25rem] ring-1 ring-white/10 md:mx-0 md:mt-0 md:h-full md:min-h-[22rem]"
        style={{ background: paletteBackground(palette, "30% 50%") }}
      >
        <span
          aria-hidden
          className="absolute inset-0 -z-10 opacity-50 [background-image:repeating-linear-gradient(115deg,rgba(255,255,255,0.06)_0_2px,transparent_2px_22px)]"
        />
        <span
          aria-hidden
          className="absolute -top-1/4 left-[55%] -z-10 h-[150%] w-[16%] rotate-[18deg] opacity-25"
          style={{ background: `linear-gradient(to bottom, transparent, ${palette.accent}, transparent)` }}
        />
        <span
          aria-hidden
          className="font-jersey pointer-events-none absolute right-3 -bottom-2 -z-10 text-[7rem] leading-none text-transparent opacity-60 select-none [-webkit-text-stroke:2px_var(--accent)] md:right-4 md:bottom-2 md:text-[9rem]"
        >
          {dorsal}
        </span>
        {photo ? (
          <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
        ) : athlete.universityMascotUrl ? (
          <img
            src={athlete.universityMascotUrl}
            alt=""
            className={cn(
              "absolute top-1/2 left-[8%] h-[80%] w-auto max-w-[60%] -translate-y-1/2 object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.5)] md:top-[42%] md:left-1/2 md:h-auto md:w-[78%] md:max-w-none md:-translate-x-1/2",
              palette.outline && MASCOT_OUTLINE,
            )}
          />
        ) : null}
      </div>

      <div className="flex flex-col justify-center gap-4 px-5 pt-4 pb-[calc(1.15rem+env(safe-area-inset-bottom,0px))] md:px-5 md:py-4 md:pr-6">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-black tracking-[0.22em] text-[var(--accent)] uppercase">
            <span className="h-1 w-5 rounded-full bg-[var(--accent)]" />
            {athlete.universityShort} · {athlete.sportName}
          </p>
          <h2 id="athlete-sheet-title" className="font-jersey mt-2 text-[2.4rem] leading-[0.9] uppercase md:text-5xl">
            {athlete.fullName}
          </h2>
          <p className="mt-1.5 text-sm text-white/65">
            {athlete.position || "Atleta"}
            {athlete.genderLabel ? ` · ${athlete.genderLabel}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Fact label="Edad" value={athlete.ageLabel} />
          <Fact label="Altura" value={athlete.heightLabel} />
          <Fact label="Dorsal" value={athlete.jerseyNumber?.toString() ?? "—"} />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Stat label="PJ" value={athlete.matchesPlayed} />
          <Stat label={athlete.scoringLabel} value={athlete.scoringValue} />
          <Stat label="Asist." value={athlete.assists} />
          <Stat label="MVP" value={athlete.mvpAwards} />
        </div>
      </div>
    </div>
  );
}

const tile =
  "rounded-2xl bg-white/[0.07] px-2 py-2.5 text-center ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className={tile}>
      <p className="text-xl leading-none font-semibold tracking-tight whitespace-nowrap tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] font-semibold tracking-[0.16em] text-[var(--accent)] uppercase">{label}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={tile}>
      <p className="font-jersey text-3xl leading-none text-[var(--accent)]">{value}</p>
      <p className="mt-1 text-[10px] font-semibold tracking-[0.14em] text-white/60 uppercase">{label}</p>
    </div>
  );
}

