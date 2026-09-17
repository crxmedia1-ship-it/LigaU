"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckIcon, CopyIcon, IdCardIcon, QrCodeIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NativeSelect } from "@/components/admin/field";
import { GlowBorder } from "@/components/magic/glow-border";
import { CarnetXStamp } from "@/components/ui/effects/CarnetXStamp";
import { ShimmerButton } from "@/components/ui/effects/ShimmerButton";
import { trackBenefitClick } from "@/app/(site)/liga-u-pass/actions";
import { REDEMPTION_LABELS } from "@/lib/admin/labels";
import type { BenefitCard } from "@/lib/public/types";

const CATEGORY_ALIASES: Record<string, string> = {
  gastronomia: "Gastronomía",
  alimentos: "Gastronomía",
  salud: "Salud",
  entretenimiento: "Entretenimiento",
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

export function PassCatalog({ benefits }: { benefits: BenefitCard[] }) {
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [selected, setSelected] = useState<BenefitCard | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const categories = useMemo(
    () => [...new Set(benefits.map((item) => categoryBucket(item.sponsorCategory)))],
    [benefits],
  );
  const locations = useMemo(
    () => [...new Set(benefits.map((item) => item.locationTag).filter(Boolean))] as string[],
    [benefits],
  );

  const filtered = benefits.filter((item) => {
    const categoryOk =
      category === "all" ? true : categoryBucket(item.sponsorCategory) === category;
    const locationOk = location === "all" ? true : item.locationTag === location;
    return categoryOk && locationOk;
  });

  function openBenefit(benefit: BenefitCard) {
    setSelected(benefit);
    setCopied(false);
    startTransition(async () => {
      await trackBenefitClick(benefit.id);
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <NativeSelect value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">Todas las categorías</option>
          {["Gastronomía", "Salud", "Entretenimiento", ...categories.filter((item) => !["Gastronomía", "Salud", "Entretenimiento"].includes(item))].map(
            (item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ),
          )}
        </NativeSelect>
        <NativeSelect value={location} onChange={(event) => setLocation(event.target.value)}>
          <option value="all">Todas las ubicaciones</option>
          {locations.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </NativeSelect>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card border-dashed p-8 text-center">
          <p className="font-medium">Aún no hay beneficios activos</p>
          <p className="mt-2 text-sm text-muted-foreground">
            El Superadmin publica descuentos en el Hub Comercial. Los filtros de
            Gastronomía, Salud y Entretenimiento quedan listos.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((benefit) => (
            <button
              key={benefit.id}
              type="button"
              className="text-left"
              onClick={() => openBenefit(benefit)}
            >
              <GlowBorder>
                <div className="carbon-fiber p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-brand-gold">
                        {benefit.sponsorName}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold">{benefit.discountTitle}</h3>
                    </div>
                    <Badge variant="outline">
                      {REDEMPTION_LABELS[benefit.redemptionType]}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {categoryBucket(benefit.sponsorCategory)}
                    {benefit.locationTag ? ` · ${benefit.locationTag}` : ""}
                  </p>
                </div>
              </GlowBorder>
            </button>
          ))}
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.discountTitle}</DialogTitle>
                <DialogDescription>
                  {selected.sponsorName} · canje Liga U Pass + CarnetX
                </DialogDescription>
              </DialogHeader>
              {isPhysical(selected.redemptionType) ? (
                <div className="space-y-4">
                  <div className="carbon-fiber relative overflow-hidden border border-brand-silver/40 p-5 text-white shadow-xl">
                    <CarnetXStamp />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold">
                      CarnetX · Liga U
                    </p>
                    <p className="mt-6 text-xl font-semibold">Estudiante universitario</p>
                    <p className="text-sm text-white/70">Presenta este carnet digital en caja</p>
                    <div className="mt-6 flex items-center justify-between">
                      <IdCardIcon className="size-8 text-brand-gold" />
                      <QrCodeIcon className="size-12 opacity-80" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selected.instructions ||
                      "Muestra tu carnet digital CarnetX en el establecimiento. El comercio valida el beneficio de forma presencial, sin webhooks externos."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {selected.instructions || "Copia el código y úsalo en el checkout web."}
                  </p>
                  {selected.promoCode ? (
                    <ShimmerButton
                      type="button"
                      disabled={pending}
                      onClick={async () => {
                        await navigator.clipboard.writeText(selected.promoCode ?? "");
                        setCopied(true);
                        toast.add({ type: "success", title: "Código copiado" });
                      }}
                    >
                      {copied ? <CheckIcon /> : <CopyIcon />}
                      {copied ? "Copiado" : selected.promoCode}
                    </ShimmerButton>
                  ) : (
                    <Button type="button" className="w-full" disabled>
                      Sin código
                    </Button>
                  )}
                  {selected.externalUrl ? (
                    <a
                      href={selected.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center text-sm text-brand-gold underline"
                    >
                      Abrir beneficio web
                    </a>
                  ) : null}
                </div>
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
