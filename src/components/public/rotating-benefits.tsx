"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Dumbbell, Laptop, Martini, Plane, Shirt, Sparkles, Ticket, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

/** Illustrative offers. Real discounts come from each partner once the pass is active. */
const SAMPLES: { icon: LucideIcon; category: string; offer: string; detail: string; tone: string }[] = [
  {
    icon: Plane,
    category: "Viajes",
    offer: "Hasta 20%",
    detail: "En boletos de aerolíneas aliadas.",
    tone: "bg-[linear-gradient(165deg,#e0233f_0%,#C8102E_45%,#8a0b20_100%)]",
  },
  {
    icon: UtensilsCrossed,
    category: "Comida",
    offer: "2x1",
    detail: "En combos de locales aliados.",
    tone: "bg-[linear-gradient(165deg,#52525b_0%,#3f3f46_45%,#27272a_100%)]",
  },
  {
    icon: Shirt,
    category: "Marcas",
    offer: "25%",
    detail: "En ropa y calzado deportivo.",
    tone: "bg-[linear-gradient(165deg,#3b5bdb_0%,#1A3FD1_45%,#102a8f_100%)]",
  },
  {
    icon: Dumbbell,
    category: "Fitness",
    offer: "30%",
    detail: "En suplementos y artículos de entrenamiento.",
    tone: "bg-[linear-gradient(165deg,#16a34a_0%,#047857_45%,#064e3b_100%)]",
  },
  {
    icon: Ticket,
    category: "Eventos",
    offer: "Preventa",
    detail: "Acceso anticipado a conciertos y partidos.",
    tone: "bg-[linear-gradient(165deg,#9333ea_0%,#6d28d9_45%,#4c1d95_100%)]",
  },
  {
    icon: Laptop,
    category: "Tecnología",
    offer: "15%",
    detail: "En equipos y accesorios para estudiar.",
    tone: "bg-[linear-gradient(165deg,#f59e0b_0%,#d97706_45%,#92400e_100%)]",
  },
  {
    icon: Sparkles,
    category: "Belleza",
    offer: "20%",
    detail: "En peluquerías, spas y cuidado personal.",
    tone: "bg-[linear-gradient(165deg,#ec4899_0%,#db2777_45%,#831843_100%)]",
  },
  {
    icon: Martini,
    category: "Vida nocturna",
    offer: "Free cover",
    detail: "Entrada sin cover en clubes y bares aliados.",
    tone: "bg-[linear-gradient(165deg,#0891b2_0%,#0e7490_45%,#083344_100%)]",
  },
];

const STEP_MS = 7000;

/** An example benefit card that slowly crossfades through the sample categories. */
export function RotatingBenefit({ start, delay = 0 }: { start: number; delay?: number }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const advance = () => {
      if (!document.hidden) setStep((value) => value + 1);
    };
    const timeout = setTimeout(() => {
      advance();
      interval = setInterval(advance, STEP_MS);
    }, STEP_MS + delay);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [delay]);

  const current = (start + step * 2) % SAMPLES.length;

  return (
    <article
      aria-live="polite"
      className="relative min-h-56 overflow-hidden rounded-[28px] text-white shadow-[0_24px_50px_-28px_rgba(39,39,42,0.8)] ring-1 ring-white/15 md:min-h-64"
    >
      {SAMPLES.map(({ icon: Icon, category, offer, detail, tone }, index) => (
        <div
          key={category}
          aria-hidden={index !== current}
          className={cn(
            "absolute inset-0 flex flex-col p-5 transition-opacity duration-[1400ms] ease-in-out md:p-6",
            tone,
            index === current ? "opacity-100" : "opacity-0",
          )}
        >
          <Icon
            aria-hidden
            className="pointer-events-none absolute -top-6 -right-5 size-36 text-white/[0.08]"
            strokeWidth={1.25}
          />
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] uppercase ring-1 ring-white/15">
              <Icon className="size-3.5" strokeWidth={2.25} />
              {category}
            </span>
            <span className="text-[10px] font-semibold tracking-[0.16em] text-white/75 uppercase">Ejemplo</span>
          </div>
          <p className="font-jersey mt-auto pt-8 text-[4.5rem] leading-none text-white">{offer}</p>
          <p className="mt-2 text-sm leading-snug text-white/80">{detail}</p>
          <p className="mt-4 border-t border-white/15 pt-3 text-[11px] font-medium tracking-wide text-white/60">
            Se desbloquea con tu U Pass
          </p>
        </div>
      ))}
    </article>
  );
}
