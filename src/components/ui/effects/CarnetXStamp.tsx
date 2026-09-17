"use client";

import { motion } from "motion/react";
import { CheckIcon } from "lucide-react";

export function CarnetXStamp() {
  return (
    <motion.div
      className="absolute top-4 right-4 grid size-16 place-items-center rounded-full border-2 border-brand-gold/80 bg-brand-gold/15 text-brand-gold"
      initial={{ scale: 0, rotate: -20, opacity: 0 }}
      animate={{ scale: 1, rotate: 12, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.15 }}
    >
      <CheckIcon className="size-7" />
    </motion.div>
  );
}
