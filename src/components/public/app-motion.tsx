"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/** Counts from 0 to `value` the first time it scrolls into view. */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, {
      duration: Math.min(1.4, 0.5 + value / 60),
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [count, inView, reduce, value]);

  return (
    <motion.span ref={ref} className={cn("tabular-nums", className)}>
      {rounded}
    </motion.span>
  );
}

type Option = { id: string; label: string; badge?: number };

const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

/** iOS-style segmented control. */
export function Segmented({
  options,
  value,
  onChange,
  layoutId,
  className,
}: {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  layoutId: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("grid auto-cols-fr grid-flow-col rounded-full bg-zinc-200/70 p-1", className)}
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "relative h-9 touch-manipulation rounded-full px-3 text-[13px] font-semibold whitespace-nowrap transition-colors duration-200",
              active ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-800",
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                transition={SPRING}
                className="absolute inset-0 rounded-full bg-white shadow-[0_4px_14px_-6px_rgba(15,23,42,0.35)]"
              />
            ) : null}
            <span className="relative inline-flex items-center gap-1.5">
              {option.label}
              {option.badge ? (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#C8102E] px-1 text-[10px] text-white tabular-nums">
                  {option.badge}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
