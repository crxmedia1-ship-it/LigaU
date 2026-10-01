import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { Gift, Lock, Plane, Smartphone, Sparkles, UtensilsCrossed } from "lucide-react";
import { Marquee } from "@/components/magic/marquee";
import { PassCard, ShineLink } from "@/components/public/pass-landing";
import { sponsorLogo } from "@/components/public/sponsor-marquee";
import { TabTransition } from "@/components/public/tab-transition";
import { getPassBrandLogos } from "@/lib/public/home-sponsors";

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

const SAMPLE_BENEFITS: { icon: LucideIcon; category: string; offer: string; detail: string; tone: string }[] = [
  {
    icon: Plane,
    category: "Avior Airlines",
    offer: "20% OFF",
    detail: "En boletos nacionales para viajar con tu equipo.",
    tone: "bg-[linear-gradient(160deg,#0c4a6e,#09090b_70%)]",
  },
  {
    icon: UtensilsCrossed,
    category: "Gastronomía",
    offer: "2x1",
    detail: "En combos seleccionados después de cada jornada.",
    tone: "bg-[linear-gradient(160deg,#7f1d1d,#09090b_70%)]",
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
    const logo = sponsorLogo(brand.logoUrl);
    return logo ? [{ id: brand.id, name: brand.name, logo }] : [];
  });
  const reel = brands.length && brands.length < MIN_REEL ? Array(Math.ceil(MIN_REEL / brands.length)).fill(brands).flat() : brands;

  return (
    <TabTransition>
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

          <div className="mx-auto mt-8 grid max-w-6xl gap-3 px-4 md:mt-10 md:grid-cols-3 md:gap-5">
            {SAMPLE_BENEFITS.map(({ icon: Icon, category, offer, detail, tone }) => (
              <article
                key={category}
                className={`relative isolate flex min-h-60 flex-col justify-end overflow-hidden rounded-2xl p-5 text-white shadow-[0_24px_50px_-24px_rgba(9,9,11,0.6)] ${tone}`}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(9,9,11,0.92)_0%,rgba(9,9,11,0.45)_55%,rgba(9,9,11,0.15)_100%)]"
                />
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] uppercase ring-1 ring-white/25 backdrop-blur">
                  <Icon className="size-3.5" strokeWidth={2.25} />
                  {category}
                </span>
                <p className="font-jersey mt-3 text-6xl leading-none text-[#D4AF37]">{offer}</p>
                <p className="mt-1 text-sm text-white/75">{detail}</p>
              </article>
            ))}

            <article className="relative isolate flex min-h-60 flex-col items-center justify-center overflow-hidden rounded-2xl border border-zinc-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.9),rgba(228,228,231,0.75))] p-6 text-center backdrop-blur-xl">
              <div
                aria-hidden
                className="absolute inset-0 -z-10 opacity-60 [background-image:repeating-linear-gradient(135deg,rgba(9,9,11,0.04)_0_10px,transparent_10px_20px)]"
              />
              <span className="grid size-16 place-items-center rounded-full bg-[linear-gradient(145deg,#fafafa,#a1a1aa_55%,#52525b)] shadow-[0_14px_30px_-12px_rgba(9,9,11,0.55),inset_0_1px_1px_rgba(255,255,255,0.9)] ring-1 ring-white/70">
                <Lock className="size-7 text-zinc-800" strokeWidth={2} />
              </span>
              <p className="font-jersey mt-4 text-5xl leading-none text-zinc-950">+30</p>
              <p className="mt-2 max-w-[15rem] text-[15px] leading-snug font-medium text-zinc-600">
                beneficios exclusivos. Obtén tu carnet y desbloquéalos todos.
              </p>
            </article>
          </div>
        </section>

      </main>
    </TabTransition>
  );
}
