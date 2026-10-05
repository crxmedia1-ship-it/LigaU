"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import { cloudinaryThumb } from "@/lib/public/media";
import type { AthleteSheet } from "@/lib/public/athlete-sheet";

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
              className="pointer-events-auto relative max-h-[calc(100svh-1.5rem)] w-full max-w-md overflow-hidden rounded-t-[1.75rem] border border-white/80 bg-[linear-gradient(165deg,#fafafa_0%,#e6e6ea_100%)] text-zinc-950 shadow-[0_-18px_50px_rgba(0,0,0,0.32)] md:max-h-[calc(100svh-3rem)] md:max-w-2xl md:rounded-[1.75rem] md:shadow-[0_28px_70px_rgba(0,0,0,0.32)]"
            >
              <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-zinc-400/80 md:hidden" />
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

  return (
    <div className="relative md:grid md:min-h-[24rem] md:grid-cols-[15rem_1fr] md:gap-2 md:p-3">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2.5 right-3 z-20 grid size-8 place-items-center rounded-full border border-black/10 bg-white/75 text-zinc-800 shadow-sm backdrop-blur-md md:top-5 md:right-5"
        aria-label="Cerrar"
      >
        <XIcon className="size-4" />
      </button>

      <div className="relative mx-4 mt-3 h-44 overflow-hidden rounded-[1.25rem] bg-[linear-gradient(165deg,#ffffff_0%,#d4d4d8_55%,#b9b9c0_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/5 md:mx-0 md:mt-0 md:h-full md:min-h-[22rem]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70 [background-image:repeating-linear-gradient(90deg,rgba(255,255,255,0.55)_0_1px,transparent_1px_3px)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -left-8 size-40 rounded-full bg-[radial-gradient(circle,rgba(200,16,46,0.22),transparent_70%)]"
        />
        <span aria-hidden className="absolute inset-y-4 left-0 w-[3px] rounded-r-full bg-[#C8102E]" />
        <span
          aria-hidden
          className="font-jersey pointer-events-none absolute right-3 bottom-0 text-[5.5rem] leading-none text-[#C8102E]/25 select-none md:right-4 md:bottom-3 md:text-[7.5rem]"
        >
          {dorsal}
        </span>
        {photo ? (
          <img
            src={photo}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : null}
      </div>

      <div className="flex flex-col justify-center gap-4 px-5 pt-4 pb-[calc(1.15rem+env(safe-area-inset-bottom,0px))] md:px-5 md:py-4 md:pr-6">
        <div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-[#C8102E] uppercase">
            {athlete.universityShort} · {athlete.sportName}
          </p>
          <h2 id="athlete-sheet-title" className="mt-1 text-[1.65rem] leading-none font-black tracking-tight text-zinc-950 uppercase md:text-4xl">
            {athlete.fullName}
          </h2>
          <p className="mt-1.5 text-sm text-zinc-600">
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

const glassTile =
  "relative overflow-hidden rounded-2xl border border-white/80 bg-white/55 px-2 py-2.5 text-center shadow-[inset_0_1px_0_#fff,0_8px_16px_rgba(0,0,0,0.05)] backdrop-blur-md before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1/2 before:bg-gradient-to-b before:from-white/70 before:to-transparent";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className={glassTile}>
      <p className="relative z-10 text-xl leading-none font-semibold tracking-tight whitespace-nowrap text-zinc-950 tabular-nums">{value}</p>
      <p className="relative z-10 mt-1 text-[10px] font-semibold tracking-[0.16em] text-[#C8102E] uppercase">{label}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={glassTile}>
      <p className="font-jersey relative z-10 text-2xl leading-none text-[#C8102E]">{value}</p>
      <p className="relative z-10 mt-1 text-[10px] font-semibold tracking-[0.14em] text-zinc-600 uppercase">{label}</p>
    </div>
  );
}
