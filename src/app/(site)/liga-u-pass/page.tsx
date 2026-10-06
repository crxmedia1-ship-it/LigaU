import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Gift, Lock, Plane, Smartphone, Sparkles, UtensilsCrossed } from "lucide-react";
import { Marquee } from "@/components/magic/marquee";
import { PassCard, ShineLink } from "@/components/public/pass-landing";
import { cloudinaryLogo } from "@/lib/public/media";
import { getPassBrandLogos } from "@/lib/public/sponsor-logos";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Liga U Pass",
  description:
    "El club de beneficios de la comunidad universitaria: descuentos, preventas y ventajas exclusivas en Venezuela con tu credencial CarnetX.",
};

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Sparkles,
    title: "Adquiere tu pase",
    text: "Membresía anual abierta a toda la comunidad universitaria.",
  },
  {
    icon: Smartphone,
    title: "Credencial CarnetX",
    text: "Tu carnet digital oficial en el móvil, con validación segura.",
  },
  {
    icon: Gift,
    title: "Disfruta los beneficios",
    text: "Obtén tu carnet y accede a los beneficios de todas las marcas aliadas.",
  },
];

/** Illustrative offers. Real discounts come from each partner once the pass is active. */
const SAMPLE_BENEFITS: { icon: LucideIcon; category: string; offer: string; detail: string; tone: string }[] = [
  {
    icon: Plane,
    category: "Viajes",
    offer: "Hasta 20%",
    detail: "En boletos de aerolíneas aliadas.",
    tone: "bg-[linear-gradient(165deg,#e0233f_0%,#C8102E_45%,#8a0b20_100%)] shadow-[0_24px_50px_-28px_rgba(200,16,46,0.85)]",
  },
  {
    icon: UtensilsCrossed,
    category: "Comida",
    offer: "2x1",
    detail: "En combos de locales aliados.",
    tone: "bg-[linear-gradient(165deg,#52525b_0%,#3f3f46_45%,#27272a_100%)] shadow-[0_24px_50px_-28px_rgba(39,39,42,0.8)]",
  },
];

/** A short brand list is repeated so the marquee never shows a gap on wide screens. */
const MIN_REEL = 10;

function SectionTitle({ id, eyebrow, children }: { id: string; eyebrow: string; children: string }) {
  return (
    <div className="text-center">
      <p className="text-[11px] font-bold tracking-[0.28em] text-[#C8102E] uppercase">{eyebrow}</p>
      <h2 id={id} className="mt-2 text-[28px] leading-[1.1] font-semibold tracking-[-0.022em] text-zinc-950 md:text-5xl">
        {children}
      </h2>
    </div>
  );
}

export default async function LigaUPassPage() {
  const brands = (await getPassBrandLogos()).flatMap((brand) => {
    const logo = cloudinaryLogo(brand.logoUrl);
    return logo ? [{ id: brand.id, name: brand.name, logo }] : [];
  });
  const reel = brands.length && brands.length < MIN_REEL ? Array(Math.ceil(MIN_REEL / brands.length)).fill(brands).flat() : brands;

  return (
    <>
      <style>{`.ligau-canvas{visibility:hidden}`}</style>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-white" />
      <main className="overflow-x-hidden bg-white pb-12 md:pb-20">
        <section aria-labelledby="pass-title" className="relative isolate px-5 pt-4 pb-14 md:pt-16 md:pb-24">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 [background-image:linear-gradient(rgba(9,9,11,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(9,9,11,0.045)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_50%_35%,black_20%,transparent_72%)]"
          />
          <div
            aria-hidden
            className="absolute top-[38%] left-1/2 -z-10 h-80 w-[min(56rem,140%)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(212,175,55,0.22),rgba(200,16,46,0.12)_45%,transparent_70%)] blur-2xl"
          />

          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-[10px] font-bold tracking-[0.14em] whitespace-nowrap text-zinc-900 uppercase md:tracking-[0.22em] shadow-[0_8px_24px_-12px_rgba(9,9,11,0.3)] ring-1 ring-zinc-900/10 backdrop-blur-md md:text-[11px]">
              <span aria-hidden className="size-1.5 rounded-full bg-[#D4AF37]" />
              Membresía exclusiva · Temporada 2026
            </p>
            <h1
              id="pass-title"
              className="font-jersey mt-5 text-[3.1rem] leading-[0.88] text-zinc-950 uppercase sm:text-7xl md:text-[6.5rem]"
            >
              El club de <span className="text-[#C8102E]">beneficios</span> de la comunidad universitaria
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[16px] leading-[1.5] tracking-[-0.01em] text-zinc-500 md:text-lg">
              Descuentos exclusivos, preventas y ventajas en los mejores comercios de Venezuela para estudiantes,
              profesores y atletas de las 8 universidades.
            </p>
          </div>

          <div className="mt-10 md:mt-14">
            <PassCard />
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 md:mt-12">
            <ShineLink href="/liga-u-pass/obtener" className="w-full max-w-xs md:w-auto">
              Obtener mi U Pass
            </ShineLink>
            <p className="text-xs text-zinc-400">Membresía anual · Activación inmediata</p>
          </div>
        </section>

        <section aria-labelledby="como-funciona" className="mx-auto max-w-6xl px-4">
          <SectionTitle id="como-funciona" eyebrow="Cómo funciona">
            Tres pasos. Cero complicaciones.
          </SectionTitle>
          <ol className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className="relative isolate overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#fbfbfd_0%,#f2f2f5_100%)] p-6 ring-1 ring-zinc-200/70 md:p-8"
              >
                <span
                  aria-hidden
                  className="absolute -top-5 right-3 -z-10 bg-[linear-gradient(180deg,rgba(200,16,46,0.16),rgba(212,175,55,0.04))] bg-clip-text text-[8.5rem] leading-none font-semibold tracking-[-0.06em] text-transparent select-none"
                >
                  {index + 1}
                </span>
                <span className="grid size-12 place-items-center rounded-2xl bg-white text-[#C8102E] shadow-[0_10px_24px_-12px_rgba(200,16,46,0.45)] ring-1 ring-zinc-200/80">
                  <Icon className="size-[22px]" strokeWidth={1.75} />
                </span>
                <p className="mt-8 text-xs font-semibold tracking-[0.08em] text-[#C8102E] uppercase">Paso {index + 1}</p>
                <h3 className="mt-1 text-[22px] leading-tight font-semibold tracking-[-0.022em] text-zinc-950 md:text-2xl">
                  {title}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.5] tracking-[-0.01em] text-zinc-500">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="beneficios" className="mt-20 md:mt-28">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle id="beneficios" eyebrow="Beneficios">
              Las marcas que te esperan.
            </SectionTitle>
          </div>

          {reel.length ? (
            <div className="mt-8 py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] md:mt-10">
              <Marquee duration="30s">
                {reel.map((brand, index) => (
                  <div key={`${brand.id}-${index}`} className="flex h-16 min-w-32 items-center justify-center px-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={brand.logo} alt={index < brands.length ? brand.name : ""} className="h-10 max-w-28 object-contain" />
                  </div>
                ))}
              </Marquee>
            </div>
          ) : null}

          <p className="mx-auto mt-8 max-w-lg px-4 text-center text-[15px] leading-relaxed text-zinc-500 md:mt-10">
            Así pueden verse los descuentos cuando activas tu membresía. Cada marca define el suyo.
          </p>

          <div className="mx-auto mt-5 grid max-w-6xl gap-3 px-4 md:mt-6 md:grid-cols-3 md:gap-5">
            {SAMPLE_BENEFITS.map(({ icon: Icon, category, offer, detail, tone }) => (
              <article
                key={category}
                className={cn(
                  "relative flex min-h-56 flex-col overflow-hidden rounded-[28px] p-5 text-white ring-1 ring-white/15 md:min-h-64 md:p-6",
                  tone,
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
              </article>
            ))}

            <Link
              href="/liga-u-pass/obtener"
              aria-label="Beneficios bloqueados: obtén tu U Pass para desbloquearlos"
              className="group relative flex min-h-56 flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(165deg,#fafafa_0%,#e4e4e7_48%,#d4d4d8_100%)] p-5 text-zinc-950 shadow-[0_24px_50px_-28px_rgba(9,9,11,0.35)] ring-1 ring-zinc-200 md:min-h-64 md:p-6"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-50 [background-image:repeating-linear-gradient(115deg,rgba(255,255,255,0.7)_0_1px,transparent_1px_8px)]"
              />
              <div className="relative flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-zinc-700 uppercase ring-1 ring-zinc-200">
                  <Sparkles className="size-3.5" strokeWidth={2.25} />
                  Temporada
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-950 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-white uppercase">
                  <Lock className="size-3" strokeWidth={2.5} />
                  Bloqueado
                </span>
              </div>

              <span
                aria-hidden
                className="absolute top-1/2 left-1/2 z-10 grid size-16 -translate-1/2 place-items-center rounded-full bg-white shadow-[0_14px_30px_-12px_rgba(9,9,11,0.45)] ring-1 ring-zinc-200 transition-transform duration-300 group-hover:scale-110"
              >
                <Lock className="size-7 text-[#C8102E]" strokeWidth={2.25} />
              </span>

              <div aria-hidden className="relative mt-auto pt-8 opacity-60 blur-[3px] select-none">
                <p className="font-jersey text-[4.5rem] leading-none">Más</p>
                <p className="mt-2 text-sm leading-snug text-zinc-600">Nuevas marcas se suman durante la temporada.</p>
              </div>
              <p className="relative mt-4 flex items-center justify-between gap-2 border-t border-zinc-900/10 pt-3 text-[11px] font-semibold tracking-wide text-zinc-700">
                Desbloquéalo con tu U Pass
                <ArrowUpRight className="size-4 text-[#C8102E] transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </p>
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
