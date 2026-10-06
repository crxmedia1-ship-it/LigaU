"use client";

import { useState, useTransition } from "react";
import { ExternalLinkIcon, MapPinIcon, PencilIcon, PlusIcon, SparklesIcon, TicketIcon, Trash2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/image-uploader";
import { adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { deleteBenefit, deleteSponsor, upsertBenefit, upsertSponsor } from "@/app/admin/(panel)/catalogo/actions";
import { CONTACT_COLORS, CONTACT_ICONS } from "@/components/contact-icons";
import { PASS_CATEGORIES } from "@/lib/public/pass-categories";
import { CONTACT_FIELDS, type SponsorContact } from "@/lib/public/pass-contact";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";
import { cloudinaryLogo } from "@/lib/public/media";

type PassStatus = Database["public"]["Enums"]["pass_status"];
type RedemptionType = Database["public"]["Enums"]["redemption_type"];

export type BenefitDraft = {
  id?: string;
  sponsorId: string;
  discountTitle: string;
  status: PassStatus;
  redemptionType: RedemptionType;
  promoCode: string;
  instructions: string;
  externalUrl: string;
};

export type SponsorDraft = {
  id?: string;
  name: string;
  category: string;
  locationTag: string;
  logoUrl: string | null;
  isActive: boolean;
  contact: SponsorContact;
  brandColor: string | null;
};

export type Sponsor = SponsorDraft & { id: string; benefits: (BenefitDraft & { id: string })[] };

const BRAND_SWATCHES = ["#1D1D1F", "#C81327", "#1A3FD1", "#00005A", "#027A2E", "#F97316", "#7C3AED", "#0891B2", "#DB2777", "#CA8A04"];

const STATUSES: { id: PassStatus; label: string; className: string }[] = [
  { id: "active", label: "Activo", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { id: "coming_soon", label: "Próximamente", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  { id: "raffle", label: "Sorteo", className: "bg-violet-50 text-violet-700 ring-violet-200" },
  { id: "inactive", label: "Oculto", className: "bg-zinc-100 text-zinc-500 ring-zinc-200" },
];

const REDEMPTIONS: { id: RedemptionType; label: string }[] = [
  { id: "carnetx_scan", label: "Muestra tu carnet" },
  { id: "promo_code", label: "Código" },
  { id: "physical", label: "En tienda" },
  { id: "web", label: "Online" },
  { id: "external_link", label: "Enlace" },
];

const sheetClass =
  "flex! max-h-[92dvh] flex-col gap-0 overflow-hidden p-0! max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none! sm:max-w-md";
const chipClass = (active: boolean) =>
  cn(
    "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
    active
      ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white shadow-[0_8px_18px_-10px_rgba(200,16,46,0.9)]"
      : "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200 hover:bg-rose-50",
  );

function statusMeta(status: PassStatus) {
  return STATUSES.find((item) => item.id === status) ?? STATUSES[3];
}

function SheetHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-5 pt-5 pb-4 text-center">
      <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-zinc-200 sm:hidden" />
      <DialogTitle className="text-xl font-semibold text-zinc-950">{title}</DialogTitle>
      <DialogDescription className="sr-only">{description}</DialogDescription>
    </div>
  );
}

export function UpassPanel({
  sponsors,
  sponsorDraft,
  setSponsorDraft,
}: {
  sponsors: Sponsor[];
  sponsorDraft: SponsorDraft | null;
  setSponsorDraft: (draft: SponsorDraft | null) => void;
}) {
  const [benefitDraft, setBenefitDraft] = useState<BenefitDraft | null>(null);
  const [pending, startTransition] = useTransition();
  function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string, onDone?: () => void) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.add({ type: "error", title: "No se pudo completar", description: result.error });
        return;
      }
      toast.add({ type: "success", title: success });
      onDone?.();
    });
  }

  return (
    <>
      <a
        href="/upass"
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center gap-3 overflow-hidden rounded-3xl bg-linear-to-r from-white via-white to-rose-50 px-4 py-3.5 shadow-[0_16px_32px_-26px_rgba(200,16,46,0.6)] ring-1 ring-rose-100 transition-all hover:ring-[#C8102E]/30"
      >
        <span aria-hidden className="absolute -top-10 -right-6 size-28 rounded-full bg-[#C8102E]/10 blur-2xl" />
        <span className="relative grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white shadow-[0_10px_20px_-10px_rgba(200,16,46,0.8)]">
          <TicketIcon className="size-5" />
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="block text-sm font-semibold text-zinc-950">Página del carnet</span>
          <span className="block truncate text-xs text-zinc-500">/upass · lo que ven los miembros</span>
        </span>
        <ExternalLinkIcon className="relative size-4 shrink-0 text-[#C8102E] transition-transform group-hover:translate-x-0.5" />
      </a>

      {sponsors.length === 0 ? (
        <div className="rounded-3xl bg-white px-6 py-12 text-center ring-1 ring-zinc-200">
          <p className="font-semibold text-zinc-950">Aún no hay marcas</p>
          <p className="mt-1 text-sm text-zinc-500">Agrega una marca y luego sus beneficios.</p>
        </div>
      ) : (
        <ul className="grid gap-4">
          {sponsors.map((sponsor) => {
            const contactKeys = CONTACT_FIELDS.filter((field) => sponsor.contact[field.key]);
            return (
              <li
                key={sponsor.id}
                className={cn(
                  "overflow-hidden rounded-[28px] bg-white shadow-[0_20px_40px_-30px_rgba(24,24,27,0.45)] ring-1 ring-zinc-200/80",
                  !sponsor.isActive && "opacity-70",
                )}
              >
                <div className="flex items-center gap-4 px-4 py-5">
                  <span className="grid h-16 w-32 shrink-0 place-items-center sm:w-40">
                    {sponsor.logoUrl ? (
                      <img src={cloudinaryLogo(sponsor.logoUrl, 160) ?? undefined} alt="" className="h-16 w-full object-contain" />
                    ) : (
                      <span className="text-2xl font-black tracking-tight text-zinc-900">{sponsor.name}</span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2">
                      <span className="truncate text-[17px] font-bold tracking-tight text-zinc-950">{sponsor.name}</span>
                      {!sponsor.isActive ? (
                        <span className="shrink-0 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                          Oculta
                        </span>
                      ) : null}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#C8102E] uppercase">
                        {sponsor.category}
                      </span>
                      {sponsor.locationTag ? (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-zinc-500">
                          <MapPinIcon className="size-3" />
                          {sponsor.locationTag}
                        </span>
                      ) : null}
                    </div>
                    {contactKeys.length ? (
                      <div className="mt-2 flex gap-1">
                        {contactKeys.map((field) => {
                          const Icon = CONTACT_ICONS[field.key];
                          return (
                            <span
                              key={field.key}
                              title={field.label}
                              className={cn("grid size-5 place-items-center rounded-md", CONTACT_COLORS[field.key])}
                            >
                              <Icon className="size-3" />
                            </span>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1 self-start">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Editar marca"
                      className="rounded-full bg-zinc-50 text-zinc-600 hover:bg-zinc-900 hover:text-white"
                      onClick={() => setSponsorDraft(sponsor)}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Eliminar marca"
                      disabled={pending}
                      className="rounded-full bg-zinc-50 text-zinc-600 hover:bg-[#C8102E] hover:text-white"
                      onClick={() => {
                        const extra = sponsor.benefits.length
                          ? ` y sus ${sponsor.benefits.length} ${sponsor.benefits.length === 1 ? "beneficio" : "beneficios"}`
                          : "";
                        if (!confirm(`¿Eliminar ${sponsor.name}${extra}?`)) return;
                        run(() => deleteSponsor(sponsor.id), `${sponsor.name} eliminada`);
                      }}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2 border-t border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex items-center gap-2 px-1 pb-0.5">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">Beneficios</span>
                    <span className="grid h-4 min-w-4 place-items-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white tabular-nums">
                      {sponsor.benefits.length}
                    </span>
                    <span className="h-px flex-1 bg-zinc-200" />
                  </div>
                  {sponsor.benefits.map((benefit) => {
                    const status = statusMeta(benefit.status);
                    return (
                      <div
                        key={benefit.id}
                        className="relative flex items-center gap-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-3 pr-2 pl-4 transition-colors hover:border-zinc-300"
                      >
                        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-[#e0233f] to-[#9e1b28]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold tracking-tight text-zinc-950">{benefit.discountTitle}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                                status.className,
                              )}
                            >
                              <span className="size-1.5 rounded-full bg-current" />
                              {status.label}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                              <TicketIcon className="size-3" />
                              {REDEMPTIONS.find((item) => item.id === benefit.redemptionType)?.label}
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Editar beneficio"
                          className="rounded-full text-zinc-500 hover:bg-zinc-900 hover:text-white"
                          onClick={() => setBenefitDraft(benefit)}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Eliminar beneficio"
                          disabled={pending}
                          className="rounded-full text-zinc-500 hover:bg-[#C8102E] hover:text-white"
                          onClick={() => {
                            if (!confirm(`¿Eliminar "${benefit.discountTitle}"?`)) return;
                            run(() => deleteBenefit(benefit.id), "Beneficio eliminado");
                          }}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() =>
                      setBenefitDraft({
                        sponsorId: sponsor.id,
                        discountTitle: "",
                        status: "active",
                        redemptionType: "carnetx_scan",
                        promoCode: "",
                        instructions: "",
                        externalUrl: "",
                      })
                    }
                    className="group flex items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 py-2.5 text-xs font-semibold text-zinc-600 transition-all hover:border-[#C8102E]/50 hover:bg-white hover:text-[#C8102E]"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-zinc-900 text-white transition-colors group-hover:bg-[#C8102E]">
                      <PlusIcon className="size-3" />
                    </span>
                    Agregar beneficio
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={sponsorDraft !== null} onOpenChange={(open) => !open && setSponsorDraft(null)}>
        <DialogContent className={sheetClass}>
          <SheetHeader
            title={sponsorDraft?.id ? "Editar marca" : "Nueva marca"}
            description="Nombre, sección, zona y logo de la marca"
          />
          {sponsorDraft ? (
            <form
              className="grid gap-4 overflow-y-auto border-t border-rose-100/70 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
              onSubmit={(event) => {
                event.preventDefault();
                run(() => upsertSponsor(sponsorDraft), "Marca guardada", () => setSponsorDraft(null));
              }}
            >
              <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                Nombre
                <Input
                  required
                  autoFocus
                  value={sponsorDraft.name}
                  onChange={(event) => setSponsorDraft({ ...sponsorDraft, name: event.target.value })}
                  placeholder="Ej. Café Venezuela"
                  className="h-12 rounded-2xl bg-white text-base"
                />
              </label>
              <div className="grid gap-1.5">
                <span className="text-sm font-medium text-zinc-800">Sección</span>
                <div className="grid grid-cols-2 gap-2">
                  {PASS_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={sponsorDraft.category === category}
                      onClick={() => setSponsorDraft({ ...sponsorDraft, category })}
                      className={cn(chipClass(sponsorDraft.category === category), "rounded-2xl py-3 text-sm")}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                Zona <span className="text-xs font-normal text-zinc-400">opcional</span>
                <Input
                  value={sponsorDraft.locationTag}
                  onChange={(event) => setSponsorDraft({ ...sponsorDraft, locationTag: event.target.value })}
                  placeholder="Ej. Las Mercedes"
                  className="h-12 rounded-2xl bg-white"
                />
              </label>
              <ImageUploader
                key={sponsorDraft.id ?? "new-sponsor"}
                folder="passBrands"
                label="Logo"
                initialUrl={sponsorDraft.logoUrl}
                onUploaded={(asset) => setSponsorDraft({ ...sponsorDraft, logoUrl: asset.secureUrl })}
              />
              <div className="grid gap-1.5">
                <span className="text-sm font-medium text-zinc-800">
                  Color de la marca <span className="text-xs font-normal text-zinc-400">tiñe su tarjeta en U Pass</span>
                </span>
                <span className="text-xs text-zinc-500">
                  Automático toma el color del logo; si es negro o blanco, elige uno que no use otra marca.
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    aria-pressed={!sponsorDraft.brandColor}
                    onClick={() => setSponsorDraft({ ...sponsorDraft, brandColor: null })}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ring-1 transition-colors",
                      !sponsorDraft.brandColor
                        ? "bg-zinc-950 text-white ring-zinc-950"
                        : "bg-white text-zinc-700 ring-zinc-200 hover:ring-zinc-400",
                    )}
                  >
                    <SparklesIcon className="size-3.5" />
                    Automático
                  </button>
                  {BRAND_SWATCHES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={color}
                      aria-pressed={sponsorDraft.brandColor?.toLowerCase() === color.toLowerCase()}
                      onClick={() => setSponsorDraft({ ...sponsorDraft, brandColor: color })}
                      className={cn(
                        "size-9 rounded-full ring-2 ring-offset-2 transition-transform active:scale-90",
                        sponsorDraft.brandColor?.toLowerCase() === color.toLowerCase() ? "ring-zinc-900" : "ring-transparent",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <label className="relative grid size-9 cursor-pointer place-items-center overflow-hidden rounded-full bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)] ring-1 ring-zinc-200">
                    <span className="sr-only">Otro color</span>
                    <input
                      type="color"
                      value={sponsorDraft.brandColor ?? "#18181b"}
                      onChange={(event) => setSponsorDraft({ ...sponsorDraft, brandColor: event.target.value })}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </label>
                  {sponsorDraft.brandColor ? (
                    <span className="ml-1 font-mono text-xs text-zinc-500 uppercase">{sponsorDraft.brandColor}</span>
                  ) : null}
                </div>
              </div>
              <div className="grid gap-2">
                <span className="text-sm font-medium text-zinc-800">
                  Redes y contacto <span className="text-xs font-normal text-zinc-400">opcional</span>
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CONTACT_FIELDS.map((field) => {
                    const Icon = CONTACT_ICONS[field.key];
                    return (
                      <label key={field.key} className="relative block">
                        <span className="sr-only">{field.label}</span>
                        <span
                          className={cn(
                            "pointer-events-none absolute top-1/2 left-2 grid size-7 -translate-y-1/2 place-items-center rounded-lg",
                            CONTACT_COLORS[field.key],
                          )}
                        >
                          <Icon className="size-3.5" />
                        </span>
                        <Input
                          value={sponsorDraft.contact[field.key] ?? ""}
                          onChange={(event) =>
                            setSponsorDraft({
                              ...sponsorDraft,
                              contact: { ...sponsorDraft.contact, [field.key]: event.target.value },
                            })
                          }
                          type={field.key === "email" ? "email" : "text"}
                          inputMode={field.key === "whatsapp" || field.key === "phone" ? "tel" : undefined}
                          placeholder={field.label}
                          title={`${field.label} · ${field.placeholder}`}
                          className="h-11 rounded-xl bg-white pl-11"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
              <label className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-800">
                <span>
                  Mostrar en U Pass
                  <span className="block text-xs font-normal text-zinc-500">Si la desmarcas, la marca y sus beneficios se ocultan</span>
                </span>
                <input
                  type="checkbox"
                  checked={sponsorDraft.isActive}
                  onChange={(event) => setSponsorDraft({ ...sponsorDraft, isActive: event.target.checked })}
                  className="size-5 accent-[#C8102E]"
                />
              </label>
              <Button
                type="submit"
                disabled={pending}
                className={cn(adminLaserCtaClass, "mt-1 h-12 w-full rounded-2xl text-[15px] font-semibold")}
              >
                {pending ? "Guardando..." : sponsorDraft.id ? "Guardar cambios" : "Agregar marca"}
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={benefitDraft !== null} onOpenChange={(open) => !open && setBenefitDraft(null)}>
        <DialogContent className={sheetClass}>
          <SheetHeader
            title={benefitDraft?.id ? "Editar beneficio" : "Nuevo beneficio"}
            description="Descuento, estado, forma de canje e instrucciones"
          />
          {benefitDraft ? (
            <form
              className="grid gap-4 overflow-y-auto border-t border-rose-100/70 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
              onSubmit={(event) => {
                event.preventDefault();
                run(() => upsertBenefit(benefitDraft), "Beneficio guardado", () => setBenefitDraft(null));
              }}
            >
              <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                Qué da el beneficio
                <Input
                  required
                  autoFocus
                  value={benefitDraft.discountTitle}
                  onChange={(event) => setBenefitDraft({ ...benefitDraft, discountTitle: event.target.value })}
                  placeholder="Ej. 15% de descuento en calzado"
                  className="h-12 rounded-2xl bg-white text-base"
                />
              </label>
              <div className="grid gap-1.5">
                <span className="text-sm font-medium text-zinc-800">Estado</span>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((status) => (
                    <button
                      key={status.id}
                      type="button"
                      aria-pressed={benefitDraft.status === status.id}
                      onClick={() => setBenefitDraft({ ...benefitDraft, status: status.id })}
                      className={chipClass(benefitDraft.status === status.id)}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-1.5">
                <span className="text-sm font-medium text-zinc-800">Cómo se canjea</span>
                <div className="flex flex-wrap gap-1.5">
                  {REDEMPTIONS.map((redemption) => (
                    <button
                      key={redemption.id}
                      type="button"
                      aria-pressed={benefitDraft.redemptionType === redemption.id}
                      onClick={() => setBenefitDraft({ ...benefitDraft, redemptionType: redemption.id })}
                      className={chipClass(benefitDraft.redemptionType === redemption.id)}
                    >
                      {redemption.label}
                    </button>
                  ))}
                </div>
              </div>
              {benefitDraft.redemptionType === "promo_code" || benefitDraft.redemptionType === "web" ? (
                <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                  Código
                  <Input
                    value={benefitDraft.promoCode}
                    onChange={(event) => setBenefitDraft({ ...benefitDraft, promoCode: event.target.value })}
                    placeholder="LIGAU20"
                    className="h-12 rounded-2xl bg-white font-mono font-bold uppercase"
                  />
                </label>
              ) : null}
              {benefitDraft.redemptionType === "web" || benefitDraft.redemptionType === "external_link" ? (
                <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                  Enlace
                  <Input
                    type="url"
                    value={benefitDraft.externalUrl}
                    onChange={(event) => setBenefitDraft({ ...benefitDraft, externalUrl: event.target.value })}
                    placeholder="https://"
                    className="h-12 rounded-2xl bg-white"
                  />
                </label>
              ) : null}
              <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                Instrucciones <span className="text-xs font-normal text-zinc-400">opcional</span>
                <Textarea
                  value={benefitDraft.instructions}
                  onChange={(event) => setBenefitDraft({ ...benefitDraft, instructions: event.target.value })}
                  placeholder="Ej. Válido de lunes a jueves. No acumulable."
                  className="min-h-20 rounded-2xl bg-white"
                />
              </label>
              <Button
                type="submit"
                disabled={pending}
                className={cn(adminLaserCtaClass, "mt-1 h-12 w-full rounded-2xl text-[15px] font-semibold")}
              >
                {pending ? "Guardando..." : benefitDraft.id ? "Guardar cambios" : "Agregar beneficio"}
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
