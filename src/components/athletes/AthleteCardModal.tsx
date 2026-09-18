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
              className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-t-3xl border border-zinc-800 bg-zinc-950 shadow-[0_-12px_60px_rgba(0,0,0,0.55)] md:rounded-3xl md:shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
            >
              <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-zinc-700 md:hidden" />
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
    <div className="relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 z-20 grid size-9 place-items-center rounded-full border border-zinc-700 bg-zinc-950/80 text-zinc-300"
        aria-label="Cerrar"
      >
        <XIcon className="size-4" />
      </button>

      <div
        className="relative h-64 overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${athlete.universityPrimary} 0%, #09090B 62%)`,
        }}
      >
        <span
          aria-hidden
          className="font-mono pointer-events-none absolute right-3 bottom-0 text-[7.5rem] leading-none font-black text-white/10 select-none"
        >
          {dorsal}
        </span>
        {photo ? (
          <img
            src={photo}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-jersey text-8xl text-white/80">
              {athlete.fullName.slice(0, 1)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
      </div>

      <div className="space-y-4 px-5 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
        <div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-zinc-500 uppercase">
            {athlete.universityShort} · {athlete.sportName}
          </p>
          <h2 id="athlete-sheet-title" className="mt-1 text-2xl font-black tracking-tight text-white uppercase">
            {athlete.fullName}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {athlete.universityName}
            {athlete.position ? ` · ${athlete.position}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="Goles" value={athlete.goals} />
          <Stat label="Puntos" value={athlete.points} />
          <Stat label="MVP" value={athlete.mvpAwards} />
        </div>

        <p className="text-sm leading-relaxed text-zinc-400">{athlete.bio}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-center">
      <p className="font-mono text-xl text-zinc-200">{value}</p>
      <p className="text-[10px] tracking-[0.18em] text-zinc-500 uppercase">{label}</p>
    </div>
  );
}
