"use client";

import { motion } from "motion/react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CarnetXStamp({
  label = "Beneficio Oficial Liga U",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "absolute top-4 right-4 flex max-w-[9.5rem] flex-col items-center gap-1",
        className,
      )}
      initial={{ scale: 0, rotate: -22, opacity: 0 }}
      animate={{ scale: 1, rotate: 12, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.12 }}
    >
      <span className="grid size-16 place-items-center rounded-full border-2 border-[#D4AF37]/90 bg-[#D4AF37]/15 text-[#F59E0B] shadow-[0_0_18px_rgba(212,175,55,0.35)]">
        <CheckIcon className="size-7" />
      </span>
      <span className="rounded-full border border-amber-500/40 bg-zinc-950/80 px-2 py-0.5 text-center text-[9px] font-semibold tracking-[0.14em] text-[#D4AF37] uppercase">
        {label}
      </span>
    </motion.div>
  );
}
