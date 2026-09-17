"use client";

import { useMemo, useState, useTransition } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import {
  CheckIcon,
  CopyIcon,
  IdCardIcon,
  MapPinIcon,
  QrCodeIcon,
  XIcon,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { CarnetXStamp } from "@/components/ui/effects/CarnetXStamp";
import { ShimmerButton } from "@/components/ui/effects/ShimmerButton";
import { trackBenefitClick } from "@/app/(site)/liga-u-pass/actions";
import { cloudinaryThumb } from "@/lib/public/media";
import { cn } from "@/lib/utils";
import type { BenefitCard } from "@/lib/public/types";

const PASS_CATEGORIES = [
  { id: "all", label: "Todas" },
  { id: "Gastronomía", label: "Gastronomía" },
  { id: "Fitness & Salud", label: "Fitness & Salud" },
  { id: "Entretenimiento", label: "Entretenimiento" },
  { id: "Tecnología", label: "Tecnología" },
  { id: "Moda", label: "Moda" },
] as const;

const CATEGORY_ALIASES: Record<string, string> = {
  gastronomia: "Gastronomía",
  alimentos: "Gastronomía",
  restaurante: "Gastronomía",
  cafe: "Gastronomía",
  salud: "Fitness & Salud",
  fitness: "Fitness & Salud",
  gym: "Fitness & Salud",
  bienestar: "Fitness & Salud",
  wellness: "Fitness & Salud",
  entretenimiento: "Entretenimiento",
  cine: "Entretenimiento",
  tecnologia: "Tecnología",
  tech: "Tecnología",
  moda: "Moda",
  fashion: "Moda",
  ropa: "Moda",
};

function categoryBucket(value: string) {
  const key = value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
  for (const [alias, label] of Object.entries(CATEGORY_ALIASES)) {
    if (key.includes(alias)) return label;
  }
  return value;
}

function isPhysical(type: BenefitCard["redemptionType"]) {
  return type === "carnetx_scan" || type === "physical";
}

function isPromo(type: BenefitCard["redemptionType"]) {
  return type === "promo_code" || type === "web";
}

function discountBadge(title: string) {
  const match = title.match(/(\d+\s?%|2\s?x\s?1|gratis)/i);
  return match?.[0].replace(/\s+/g, "") ?? "VIP";
}

function hapticTap() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(14);
  }
}

export function PassCatalog({ benefits }: { benefits: BenefitCard[] }) {
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<BenefitCard | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      benefits.filter((item) =>
        category === "all" ? true : categoryBucket(item.sponsorCategory) === category,
      ),
    [benefits, category],
  );

  function openBenefit(benefit: BenefitCard) {
    hapticTap();
    setSelected(benefit);
    setCopied(false);
    startTransition(async () => {
      await trackBenefitClick(benefit.id);
    });
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    hapticTap();
    setCopied(true);
    toast.add({ type: "success", title: "¡Código Copiado!" });
  }

  return (
    <div className="space-y-5">
      <div className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2">
        {PASS_CATEGORIES.map((item) => {
          const active = category === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={cn(
                "inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-full border px-4 text-xs font-semibold tracking-wide whitespace-nowrap transition-colors duration-150",
                active
                  ? "border-amber-500/50 bg-[#D4AF37] text-zinc-950"
                  : "border-amber-500/20 bg-zinc-950/80 text-zinc-400 backdrop-blur-xl",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  active ? "bg-zinc-950" : "bg-[#D4AF37]",
                )}
              />
              {item.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-amber-500/20 border-dashed bg-zinc-950/80 px-6 py-12 text-center backdrop-blur-xl">
          <p className="font-medium text-zinc-100">Aún no hay beneficios en esta categoría</p>
          <p className="mt-2 text-sm text-zinc-400">
            El Superadmin publica descuentos en el Hub Comercial. Los datos salen de
            pass_sponsors y pass_benefits.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((benefit) => {
            const logo = cloudinaryThumb(benefit.sponsorLogo, 128);
            return (
              <article
                key={benefit.id}
                className="flex flex-col rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-4 shadow-[inset_0_1px_0_rgba(253,230,138,0.08)] backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex min-h-8 items-center rounded-full border border-[#BA0C2F]/40 bg-[#BA0C2F]/15 px-2.5 text-[11px] font-bold tracking-wide text-[#F59E0B] uppercase">
                    {discountBadge(benefit.discountTitle)}
                  </span>
                  {logo ? (
                    <img
                      src={logo}
                      alt=""
                      className="size-12 rounded-lg border border-amber-500/20 bg-zinc-900 object-contain p-1"
                    />
                  ) : (
                    <span className="grid size-12 place-items-center rounded-lg border border-amber-500/20 bg-zinc-900 text-[10px] font-black tracking-widest text-[#D4AF37]">
                      {benefit.sponsorName.slice(0, 3).toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[11px] tracking-[0.18em] text-[#D4AF37] uppercase">
                  {benefit.sponsorName}
                </p>
                <h3 className="mt-1 text-base leading-snug font-semibold text-zinc-100">
                  {benefit.discountTitle}
                </h3>
                {benefit.locationTag ? (
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-400">
                    <MapPinIcon className="size-3.5" />
                    {benefit.locationTag}
                  </p>
                ) : null}
                <ShimmerButton
                  type="button"
                  variant="gold"
                  className="mt-4"
                  onClick={() => openBenefit(benefit)}
                >
                  Canjear ahora
                </ShimmerButton>
              </article>
            );
          })}
        </div>
      )}

      {selected ? (
      <Dialog open onOpenChange={(open) => !open && setSelected(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[70] bg-black/70 backdrop-blur-sm" />
          <BaseDialog.Popup
            className={cn(
              "fixed z-[80] w-full outline-none",
              "right-0 bottom-0 left-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl border border-amber-500/30 bg-zinc-950/95 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl",
              "data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-8 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-8",
              "md:top-1/2 md:right-auto md:bottom-auto md:left-1/2 md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:pb-5 md:data-open:slide-in-from-bottom-0 md:data-open:zoom-in-95",
            )}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-700 md:hidden" />
            {selected ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <DialogTitle className="text-lg text-zinc-100">
                      {selected.discountTitle}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-zinc-400">
                      {selected.sponsorName}
                      {selected.locationTag ? ` · ${selected.locationTag}` : ""}
                    </DialogDescription>
                  </div>
                  <DialogClose className="grid size-11 min-h-11 place-items-center rounded-full border border-zinc-800 text-zinc-400">
                    <XIcon className="size-4" />
                    <span className="sr-only">Cerrar</span>
                  </DialogClose>
                </div>

                {isPhysical(selected.redemptionType) ? (
                  <div className="space-y-4">
                    <div className="carbon-fiber relative overflow-hidden rounded-2xl border border-amber-500/30 p-5 text-white">
                      <CarnetXStamp />
                      <p className="text-[10px] tracking-[0.3em] text-[#D4AF37] uppercase">
                        CarnetX · Liga U
                      </p>
                      <p className="mt-8 text-xl font-semibold">Estudiante universitario</p>
                      <p className="mt-2 max-w-[16rem] text-sm text-zinc-300">
                        Presenta tu carnet digital CarnetX en caja para validar el beneficio
                      </p>
                      <div className="mt-6 flex items-center justify-between">
                        <IdCardIcon className="size-8 text-[#D4AF37]" />
                        <QrCodeIcon className="size-12 text-zinc-200 opacity-80" />
                      </div>
                    </div>
                    {selected.instructions ? (
                      <p className="text-sm text-zinc-400">{selected.instructions}</p>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-400">
                      {selected.instructions ||
                        (isPromo(selected.redemptionType)
                          ? "Toca una vez para copiar el código promocional."
                          : "Abre el beneficio y completa el canje en el sitio del aliado.")}
                    </p>
                    {selected.promoCode ? (
                      <ShimmerButton
                        type="button"
                        variant="gold"
                        disabled={pending}
                        onClick={() => copyCode(selected.promoCode ?? "")}
                      >
                        {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                        {copied ? "¡Código Copiado!" : selected.promoCode}
                      </ShimmerButton>
                    ) : (
                      <p className="rounded-xl border border-zinc-800 px-3 py-3 text-center text-sm text-zinc-500">
                        Sin código promocional
                      </p>
                    )}
                    {selected.externalUrl ? (
                      <a
                        href={selected.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-amber-500/30 text-sm font-medium text-[#D4AF37]"
                      >
                        Abrir beneficio web
                      </a>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}
          </BaseDialog.Popup>
        </DialogPortal>
      </Dialog>
      ) : null}
    </div>
  );
}
