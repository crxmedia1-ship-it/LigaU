"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRightIcon,
  CopyIcon,
  ExternalLinkIcon,
  GiftIcon,
  GlobeIcon,
  HeartPulseIcon,
  IdCardIcon,
  InfoIcon,
  LayoutGridIcon,
  MapPinIcon,
  PlaneIcon,
  SearchIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StoreIcon,
  TagIcon,
  TicketIcon,
  UtensilsIcon,
} from "lucide-react";
import { CONTACT_COLORS, CONTACT_ICONS } from "@/components/contact-icons";
import { PASS_CATEGORIES } from "@/lib/public/pass-categories";
import { CONTACT_FIELDS, contactHref } from "@/lib/public/pass-contact";
import { toast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { LigaULogo } from "@/components/public/brand";
import type { BenefitCard } from "@/lib/public/types";
import { cn } from "@/lib/utils";

const REDEMPTION: Record<BenefitCard["redemptionType"], string> = {
  web: "Online",
  physical: "En tienda",
  carnetx_scan: "Muestra tu carnet",
  promo_code: "Código",
  external_link: "Enlace",
};

const HOW_TO: Record<BenefitCard["redemptionType"], { icon: typeof TagIcon; title: string; text: string }> = {
  carnetx_scan: {
    icon: IdCardIcon,
    title: "Muestra tu carnet",
    text: "Enseña tu carnet digital Liga U en caja antes de pagar.",
  },
  promo_code: {
    icon: TicketIcon,
    title: "Usa el código",
    text: "Copia el código y úsalo al pagar para aplicar el descuento.",
  },
  web: {
    icon: GlobeIcon,
    title: "Compra online",
    text: "Entra a la tienda online y aplica el código al pagar.",
  },
  physical: {
    icon: StoreIcon,
    title: "Ve a la tienda",
    text: "Visita la tienda y di que eres miembro Liga U Pass al pagar.",
  },
  external_link: {
    icon: ExternalLinkIcon,
    title: "Entra al enlace",
    text: "Toca el botón de abajo y sigue los pasos en la página de la marca.",
  },
};

const SECTIONS: Record<string, { icon: typeof TagIcon; color: string }> = {
  all: { icon: LayoutGridIcon, color: "#C8102E" },
  Marcas: { icon: ShoppingBagIcon, color: "#7C3AED" },
  Gastronomía: { icon: UtensilsIcon, color: "#EA580C" },
  "Fitness y salud": { icon: HeartPulseIcon, color: "#059669" },
  "Viajes y turismo": { icon: PlaneIcon, color: "#0284C7" },
};

const SECTION_FALLBACK = { icon: TagIcon, color: "#52525B" };


const STATUS: Partial<Record<BenefitCard["status"], { label: string }>> = {
  coming_soon: { label: "Próximamente" },
  raffle: { label: "Sorteo" },
};

const BRAND_PATTERNS = [
  { backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.09) 0 10px, transparent 10px 22px)" },
  { backgroundImage: "radial-gradient(rgba(255,255,255,0.22) 1.5px, transparent 1.6px)", backgroundSize: "14px 14px" },
  { backgroundImage: "repeating-radial-gradient(circle at 100% 100%, rgba(255,255,255,0.12) 0 2px, transparent 2px 20px)" },
  {
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
    backgroundSize: "18px 18px",
  },
  { backgroundImage: "repeating-linear-gradient(60deg, transparent 0 16px, rgba(255,255,255,0.1) 16px 18px)" },
];

function brandStyle(color: string | null | undefined) {
  const brand = color ?? "#C8102E";
  return {
    "--brand": brand,
    "--brand-deep": `color-mix(in srgb, ${brand} 70%, black)`,
    "--brand-light": `color-mix(in srgb, ${brand} 82%, white)`,
    "--brand-soft": `color-mix(in srgb, ${brand} 9%, white)`,
    "--brand-line": `color-mix(in srgb, ${brand} 28%, white)`,
  } as React.CSSProperties;
}


function BrandPanel({
  name,
  logo,
  color,
  pattern,
  className,
  logoClassName,
  children,
}: {
  name: string;
  logo: string | null;
  color: string | null | undefined;
  pattern: number;
  className?: string;
  logoClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={brandStyle(color)}
      className={cn(
        "relative isolate grid place-items-center overflow-hidden bg-linear-to-br from-[var(--brand-light)] via-[var(--brand)] to-[var(--brand-deep)]",
        className,
      )}
    >
      <span aria-hidden className="absolute inset-0 -z-10" style={BRAND_PATTERNS[pattern % BRAND_PATTERNS.length]} />
      {logo ? (
        <img
          src={logo}
          alt=""
          aria-hidden
          className="absolute -right-[18%] -bottom-[22%] -z-10 h-[95%] w-auto max-w-none -rotate-12 opacity-[0.12] brightness-0 invert"
        />
      ) : (
        <span
          aria-hidden
          className="absolute -right-3 -bottom-8 -z-10 text-[110px] leading-none font-black tracking-tighter text-white/10"
        >
          {name.slice(0, 1)}
        </span>
      )}
      <span aria-hidden className="absolute inset-x-0 top-0 -z-10 h-1/2 bg-linear-to-b from-white/15 to-transparent" />
      {logo ? (
        <img
          src={logo}
          alt={name}
          className={cn(
            "w-full object-contain brightness-0 invert drop-shadow-[0_8px_14px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-105",
            logoClassName,
          )}
        />
      ) : (
        <span className="text-2xl font-black tracking-tight text-white drop-shadow-[0_6px_12px_rgba(0,0,0,0.25)] sm:text-3xl">
          {name}
        </span>
      )}
      {children}
    </div>
  );
}

function BenefitTile({ benefit, pattern }: { benefit: BenefitCard; pattern: number }) {
  const status = STATUS[benefit.status];
  return (
    <div
      style={brandStyle(benefit.sponsorColor)}
      className={cn(
        "relative flex min-h-40 overflow-hidden rounded-3xl shadow-[0_18px_34px_-24px_rgba(24,24,27,0.35)] ring-1 ring-zinc-200 transition-all group-hover:shadow-[0_24px_44px_-22px_var(--brand)] group-hover:ring-[var(--brand)]/40 bg-[radial-gradient(120%_140%_at_0%_0%,var(--brand-line),var(--brand-soft)_55%,white)]",
      )}
    >
      <BrandPanel
        name={benefit.sponsorName}
        logo={benefit.sponsorLogo}
        color={benefit.sponsorColor}
        pattern={pattern}
        className="w-[44%] shrink-0 px-5 sm:w-64"
        logoClassName="max-h-16 sm:max-h-20"
      >
        {status ? (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-white px-2 py-0.5 text-[9px] font-black tracking-wide text-[var(--brand)] uppercase shadow-sm">
            {status.label}
          </span>
        ) : null}
      </BrandPanel>
      <div className="upass-glass-card m-2 flex min-w-0 flex-1 flex-col rounded-[20px] p-4 sm:p-5">
        <p className="truncate text-[10px] font-bold tracking-[0.2em] text-[var(--brand)] uppercase">
          {benefit.sponsorName}
        </p>
        <p className="mt-1.5 line-clamp-3 text-lg leading-[1.1] font-black tracking-tight text-zinc-950 sm:text-2xl">
          {benefit.discountTitle}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="inline-flex min-w-0 items-center gap-1 text-[11px] font-semibold text-zinc-500">
            <InfoIcon className="size-3.5 shrink-0" />
            <span className="truncate">Instrucciones</span>
          </span>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-white shadow-[0_8px_16px_-8px_var(--brand)] transition-transform group-hover:scale-110">
            <ArrowUpRightIcon className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function UpassBoard({ benefits }: { benefits: BenefitCard[] }) {
  const [section, setSection] = useState("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<BenefitCard | null>(null);

  const sections = useMemo(() => {
    const counts = new Map<string, number>(PASS_CATEGORIES.map((name) => [name, 0]));
    for (const benefit of benefits) counts.set(benefit.sponsorCategory, (counts.get(benefit.sponsorCategory) ?? 0) + 1);
    return [...counts.entries()];
  }, [benefits]);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return benefits.filter(
      (benefit) =>
        (section === "all" || benefit.sponsorCategory === section) &&
        (!text ||
          benefit.sponsorName.toLowerCase().includes(text) ||
          benefit.discountTitle.toLowerCase().includes(text) ||
          benefit.locationTag?.toLowerCase().includes(text)),
    );
  }, [benefits, section, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, BenefitCard[]>();
    for (const benefit of visible) {
      const list = map.get(benefit.sponsorCategory) ?? [];
      list.push(benefit);
      map.set(benefit.sponsorCategory, list);
    }
    return sections.map(([name]) => [name, map.get(name) ?? []] as const).filter(([, list]) => list.length);
  }, [visible, sections]);

  const brands = useMemo(() => {
    const map = new Map<string, { name: string; logo: string | null; color: string | null }>();
    for (const benefit of benefits) {
      if (!map.has(benefit.sponsorId)) {
        map.set(benefit.sponsorId, {
          name: benefit.sponsorName,
          logo: benefit.sponsorLogo,
          color: benefit.sponsorColor ?? null,
        });
      }
    }
    return [...map.values()];
  }, [benefits]);

  const patterns = useMemo(() => {
    const ids = [...new Set(benefits.map((benefit) => benefit.sponsorId))];
    return new Map(ids.map((id, index) => [id, index]));
  }, [benefits]);

  const marquee = useMemo(() => {
    if (!brands.length) return [];
    const half = Array.from({ length: Math.max(1, Math.ceil(8 / brands.length)) }, () => brands).flat();
    return [...half, ...half];
  }, [brands]);

  return (
    <div className="upass-page relative min-h-screen overflow-hidden bg-[#ececef] text-zinc-950">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-[#C8102E]/10 blur-[120px]" />
        <div className="absolute top-[38rem] -right-40 size-[26rem] rounded-full bg-[#ff4d67]/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      </div>

      <header className="sticky top-0 z-20 border-t-[3px] border-b border-t-[#C8102E] border-b-black/[0.06] bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          <LigaULogo className="h-8 shrink-0" />
          <span className="rounded-full bg-linear-to-r from-[#e0233f] to-[#9e1b28] px-2.5 py-1 text-[11px] font-bold tracking-[0.16em] text-white uppercase shadow-[0_0_24px_-4px_rgba(224,35,63,0.8)]">
            U Pass
          </span>
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl space-y-7 px-4 pt-8 pb-20">
        <section>
          <p className="text-[11px] font-bold tracking-[0.32em] text-[#C8102E] uppercase">Liga U Pass</p>
          <h1 className="mt-2 text-[40px] leading-[0.95] font-black tracking-tight sm:text-5xl">
            Beneficios
            <br />
            <span className="bg-linear-to-r from-[#9e1b28] via-[#C8102E] to-[#ff4d67] bg-clip-text text-transparent">
              exclusivos
            </span>
          </h1>
          <p className="mt-3 max-w-sm text-sm text-zinc-500">
            Descuentos y experiencias con marcas aliadas por ser parte de la Liga U.
          </p>
        </section>

        {brands.length ? (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-[11px] font-bold tracking-[0.26em] text-zinc-500 uppercase">
              Marcas aliadas
              <span className="h-px flex-1 bg-linear-to-r from-[#C8102E]/40 via-zinc-300 to-transparent" />
            </h2>
            <div className="-mx-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
              <div className="animate-ligau-marquee flex w-max gap-3 px-4 [--marquee-duration:28s] hover:[animation-play-state:paused]">
                {marquee.map((brand, index) => (
                  <button
                    key={`${brand.name}-${index}`}
                    type="button"
                    aria-label={`Ver beneficios de ${brand.name}`}
                    aria-hidden={index >= marquee.length / 2}
                    tabIndex={index >= marquee.length / 2 ? -1 : 0}
                    onClick={() => {
                      setSection("all");
                      setQuery(brand.name);
                    }}
                    className="upass-glass grid h-20 w-36 shrink-0 place-items-center rounded-2xl px-5 transition-transform hover:-translate-y-1"
                    style={{ "--glow": `color-mix(in srgb, ${brand.color ?? "#C8102E"} 28%, transparent)` } as React.CSSProperties}
                  >
                    {brand.logo ? (
                      <img src={brand.logo} alt="" className="max-h-10 w-full object-contain" />
                    ) : (
                      <span className="text-lg font-black tracking-tight text-zinc-900">{brand.name}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <label className="relative block">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar marca, descuento o zona"
            className="h-12 w-full rounded-2xl bg-white pr-4 pl-11 text-[15px] text-zinc-900 ring-1 ring-zinc-200 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[#C8102E]/40"
          />
        </label>

        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full gap-1 rounded-full bg-white p-1.5 shadow-[0_10px_24px_-18px_rgba(24,24,27,0.4)] ring-1 ring-zinc-200">
            {[["all", benefits.length] as const, ...sections].map(([name, count]) => {
              const active = section === name;
              const theme = SECTIONS[name] ?? SECTION_FALLBACK;
              const Icon = theme.icon;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSection(name)}
                  style={
                    {
                      "--chip": theme.color,
                      "--chip-light": `color-mix(in srgb, ${theme.color} 80%, white)`,
                      "--chip-deep": `color-mix(in srgb, ${theme.color} 78%, black)`,
                    } as React.CSSProperties
                  }
                  className={cn(
                    "flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold whitespace-nowrap transition-all active:scale-95 sm:flex-1",
                    active
                      ? "bg-linear-to-br from-[var(--chip-light)] to-[var(--chip-deep)] text-white shadow-[0_8px_18px_-8px_var(--chip)]"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                  )}
                >
                  <Icon className={cn("size-4", !active && "text-[var(--chip)]")} />
                  {name === "all" ? "Todos" : name}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px] font-bold tabular-nums",
                      active ? "bg-white/25 text-white" : "bg-zinc-100 text-zinc-400",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {grouped.length ? (
          grouped.map(([name, list]) => (
            <section key={name} className="space-y-3">
              <h2 className="flex items-center gap-2 text-[11px] font-bold tracking-[0.26em] text-zinc-500 uppercase">
                {name}
                <span className="h-px flex-1 bg-linear-to-r from-[#C8102E]/40 via-zinc-300 to-transparent" />
              </h2>
              <div className="grid gap-3">
                {list.map((benefit) => (
                  <button
                    key={benefit.id}
                    type="button"
                    onClick={() => setOpen(benefit)}
                    className="group block text-left transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
                  >
<BenefitTile benefit={benefit} pattern={patterns.get(benefit.sponsorId) ?? 0} />
                  </button>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="grid place-items-center gap-2 rounded-3xl bg-white px-6 py-14 text-center ring-1 ring-zinc-200">
            <GiftIcon className="size-8 text-zinc-300" />
            <p className="font-semibold">
              {benefits.length ? "No hay beneficios con esa búsqueda" : "Pronto habrá beneficios aquí"}
            </p>
            <p className="text-sm text-zinc-500">
              {benefits.length ? "Prueba con otra palabra o sección." : "Estamos sumando marcas aliadas."}
            </p>
          </div>
        )}
      </main>

      <Dialog open={open !== null} onOpenChange={(value) => !value && setOpen(null)}>
        <DialogContent className="flex! flex-col gap-0 overflow-hidden p-0! max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none! sm:max-w-md">
          {open ? (
            <div style={brandStyle(open.sponsorColor)} className="contents">
              <div className="px-5 pt-5 pb-5">
                <span aria-hidden className="mx-auto mb-4 block h-1 w-10 rounded-full bg-zinc-200 sm:hidden" />
                <DialogTitle className="sr-only">
                  {open.sponsorName}: {open.discountTitle}
                </DialogTitle>
                <DialogDescription className="sr-only">Cómo usar este beneficio</DialogDescription>
                <BrandPanel
                  name={open.sponsorName}
                  logo={open.sponsorLogo}
                  color={open.sponsorColor}
                  pattern={patterns.get(open.sponsorId) ?? 0}
                  className="h-40 rounded-3xl px-12"
                  logoClassName="max-h-20"
                />
                <p className="mt-4 text-center text-[11px] font-bold tracking-[0.22em] text-zinc-400 uppercase">
                  {open.sponsorName}
                </p>
                <p className="mt-1 text-center text-2xl leading-tight font-black tracking-tight text-zinc-950">
                  {open.discountTitle}
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {STATUS[open.status] ? (
                    <span className="rounded-full bg-[var(--brand)] px-2.5 py-1 text-[10px] font-black tracking-wide text-white uppercase">
                      {STATUS[open.status]!.label}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">
                    <TicketIcon className="size-3" />
                    {REDEMPTION[open.redemptionType]}
                  </span>
                  {open.locationTag ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">
                      <MapPinIcon className="size-3" />
                      {open.locationTag}
                    </span>
                  ) : null}
                </div>
                {open.sponsorContact && Object.keys(open.sponsorContact).length ? (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {CONTACT_FIELDS.filter((field) => open.sponsorContact?.[field.key]).map((field) => {
                      const Icon = CONTACT_ICONS[field.key];
                      const value = open.sponsorContact![field.key]!;
                      return (
                        <a
                          key={field.key}
                          href={contactHref(field.key, value)}
                          target={field.key === "phone" || field.key === "email" ? undefined : "_blank"}
                          rel="noopener noreferrer"
                          aria-label={`${field.label}: ${value}`}
                          title={field.label}
                          className={cn(
                            "grid size-11 place-items-center rounded-full shadow-[0_10px_20px_-12px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-0.5 active:scale-95",
                            CONTACT_COLORS[field.key],
                          )}
                        >
                          <Icon className="size-5" />
                        </a>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3 border-t border-[var(--brand-line)] bg-[var(--brand-soft)] px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                {open.status === "coming_soon" ? (
                  <p className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[var(--brand)] ring-1 ring-[var(--brand-line)]">
                    <SparklesIcon className="size-4 shrink-0" />
                    Este beneficio estará disponible muy pronto.
                  </p>
                ) : null}
                {(() => {
                  const how = HOW_TO[open.redemptionType];
                  const HowIcon = how.icon;
                  return (
                    <div className="relative flex items-start gap-3 overflow-hidden rounded-2xl bg-white px-4 py-3.5 ring-1 ring-[var(--brand-line)]">
                      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-[var(--brand)]" />
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-white shadow-[0_8px_16px_-8px_var(--brand)]">
                        <HowIcon className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] font-semibold tracking-[0.16em] text-[var(--brand)] uppercase">
                          Qué hacer
                        </span>
                        <span className="block font-semibold text-zinc-950">{how.title}</span>
                        <span className="mt-0.5 block text-sm text-zinc-600">{how.text}</span>
                      </span>
                    </div>
                  );
                })()}
                {open.promoCode ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(open.promoCode ?? "");
                      toast.add({ type: "success", title: "Código copiado" });
                    }}
                    className="flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-[var(--brand-line)] bg-white px-4 py-3 text-left"
                  >
                    <span>
                      <span className="block text-[11px] font-semibold tracking-[0.16em] text-zinc-400 uppercase">
                        Tu código
                      </span>
                      <span className="font-mono text-xl font-bold tracking-wider text-zinc-950">{open.promoCode}</span>
                    </span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-[var(--brand)]">
                      <CopyIcon className="size-4" />
                      Copiar
                    </span>
                  </button>
                ) : null}
                {open.instructions ? (
                  <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-[var(--brand-line)]">
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--brand)] uppercase">Cómo usarlo</p>
                    <p className="mt-1 text-sm whitespace-pre-line text-zinc-700">{open.instructions}</p>
                  </div>
                ) : null}
                {open.externalUrl ? (
                  <a
                    href={open.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[var(--brand-light)] to-[var(--brand-deep)] text-[15px] font-semibold text-white shadow-[0_12px_28px_-12px_var(--brand)]"
                  >
                    Ir al beneficio
                    <ExternalLinkIcon className="size-4" />
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
