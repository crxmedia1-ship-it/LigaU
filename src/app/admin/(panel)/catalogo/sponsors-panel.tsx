"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckIcon, ImageUpIcon, Loader2Icon, PencilIcon, SparklesIcon, Trash2Icon, XIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { HomeSponsorTile, PresentedBy, SponsorFlyer, SponsorMark } from "@/components/public/sponsor-slots";
import { deleteOfficialSponsor, saveOfficialSponsor } from "@/app/admin/(panel)/catalogo/sponsors-actions";
import { dominantSvgColor } from "@/lib/public/brand-color";
import { cloudinaryLogo } from "@/lib/public/media";
import { SPONSOR_SLOTS, type SponsorSlot, type SponsorSlotFormat } from "@/lib/public/sponsor-placements";
import type { SponsorCard } from "@/lib/public/types";
import { cn } from "@/lib/utils";

export type OfficialSponsor = {
  id: string;
  name: string;
  logoUrl: string | null;
  brandColor: string | null;
  linkUrl: string | null;
  flyerUrl: string | null;
  tagline: string | null;
  startsOn: string | null;
  endsOn: string | null;
  slots: SponsorSlot[];
};

export type OfficialSponsorDraft = Omit<OfficialSponsor, "id"> & { id?: string };

export function emptyOfficialDraft(): OfficialSponsorDraft {
  return {
    name: "",
    logoUrl: null,
    brandColor: null,
    linkUrl: null,
    flyerUrl: null,
    tagline: null,
    startsOn: null,
    endsOn: null,
    slots: [],
  };
}

const PAGES = ["Inicio", "Calendario", "Clasificación"] as const;

/** Where each slot sits on a phone screen, in % of the frame. */
const SLOT_SHAPES: Record<SponsorSlot, { top: number; left: number; width: number; height: number }> = {
  home_flyer: { top: 46, left: 8, width: 52, height: 30 },
  calendar_presenter: { top: 9, left: 56, width: 36, height: 7 },
  calendar_matchday: { top: 34, left: 8, width: 40, height: 5 },
  calendar_flyer: { top: 62, left: 8, width: 84, height: 26 },
  standings_presenter: { top: 9, left: 56, width: 36, height: 7 },
  standings_flyer: { top: 66, left: 8, width: 84, height: 24 },
};

function contractStatus(sponsor: Pick<OfficialSponsor, "startsOn" | "endsOn">) {
  const today = new Date().toISOString().slice(0, 10);
  if (sponsor.startsOn && sponsor.startsOn > today) return { label: "Programado", tone: "bg-amber-50 text-amber-700 ring-amber-200" };
  if (sponsor.endsOn && sponsor.endsOn < today) return { label: "Vencido", tone: "bg-zinc-100 text-zinc-500 ring-zinc-200" };
  return { label: "En el sitio", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric" });
}

function SlotDiagram({ slot, active, className }: { slot: SponsorSlot; active: boolean; className?: string }) {
  const shape = SLOT_SHAPES[slot];
  return (
    <span
      aria-hidden
      className={cn("relative block h-16 w-10 shrink-0 overflow-hidden rounded-[7px] bg-white ring-1 ring-zinc-300", className)}
    >
      <span className="absolute top-[9%] left-[8%] h-[7%] w-[40%] rounded-sm bg-zinc-200" />
      <span className="absolute top-[22%] left-[8%] h-[8%] w-[84%] rounded-sm bg-zinc-100" />
      <span className="absolute top-[42%] left-[8%] h-[16%] w-[84%] rounded-sm bg-zinc-100" />
      <span className="absolute top-[92%] left-0 h-[8%] w-full bg-zinc-100" />
      <span
        className={cn("absolute rounded-[3px]", active ? "bg-brand-red" : "bg-zinc-400")}
        style={{ top: `${shape.top}%`, left: `${shape.left}%`, width: `${shape.width}%`, height: `${shape.height}%` }}
      />
    </span>
  );
}

function SlotPreview({ format, sponsor }: { format: SponsorSlotFormat; sponsor: SponsorCard }) {
  if (format === "home") {
    return (
      <div className="flex justify-center">
        <HomeSponsorTile sponsor={sponsor} className="h-[360px] w-full max-w-[300px]" />
      </div>
    );
  }
  if (format === "flyer") return <SponsorFlyer sponsor={sponsor} context="Calendario" />;
  if (format === "pill") {
    return (
      <div className="grid place-items-center rounded-2xl bg-[#eef1f4] px-4 py-6">
        <PresentedBy sponsor={sponsor} />
      </div>
    );
  }
  return (
    <div className="grid place-items-center rounded-2xl bg-[#eef1f4] px-4 py-6">
      <p className="flex items-center gap-2 text-[9px] font-semibold tracking-[0.22em] text-zinc-400 uppercase">
        Jornada presentada por
        <SponsorMark sponsor={sponsor} className="h-5 max-w-16" />
      </p>
    </div>
  );
}

const FORMAT_LABELS: Record<SponsorSlotFormat, string> = {
  home: "Panel de Inicio",
  flyer: "Panel grande",
  pill: "Presentado por",
  mark: "Sello",
};

export function SponsorsPanel({
  sponsors,
  draft,
  setDraft,
}: {
  sponsors: OfficialSponsor[];
  draft: OfficialSponsorDraft | null;
  setDraft: (draft: OfficialSponsorDraft | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null);
  const [removeFlyer, setRemoveFlyer] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<SponsorSlotFormat | null>(null);
  const [pending, startTransition] = useTransition();

  const holders = useMemo(() => {
    const map = new Map<SponsorSlot, OfficialSponsor>();
    for (const sponsor of sponsors) for (const slot of sponsor.slots) map.set(slot, sponsor);
    return map;
  }, [sponsors]);

  function open(next: OfficialSponsorDraft) {
    setDraft(next);
    setPreviewFormat(null);
  }

  function close() {
    setDraft(null);
    setFile(null);
    setFlyerFile(null);
    setRemoveFlyer(false);
    if (preview) URL.revokeObjectURL(preview);
    if (flyerPreview) URL.revokeObjectURL(flyerPreview);
    setPreview(null);
    setFlyerPreview(null);
  }

  async function pickLogo(next: File | undefined) {
    if (!next || !draft) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(URL.createObjectURL(next));
    if (next.type === "image/svg+xml") {
      const detected = dominantSvgColor(await next.text());
      if (detected) setDraft({ ...draft, brandColor: detected });
    } else {
      setDraft({ ...draft, brandColor: null });
    }
  }

  function pickFlyer(next: File | undefined) {
    if (!next) return;
    if (flyerPreview) URL.revokeObjectURL(flyerPreview);
    setFlyerFile(next);
    setFlyerPreview(URL.createObjectURL(next));
    setRemoveFlyer(false);
  }

  function toggleSlot(slot: SponsorSlot) {
    if (!draft) return;
    const has = draft.slots.includes(slot);
    setDraft({ ...draft, slots: has ? draft.slots.filter((item) => item !== slot) : [...draft.slots, slot] });
    if (!has) setPreviewFormat(SPONSOR_SLOTS.find((item) => item.id === slot)!.format);
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;
    if (!draft.id && !file) {
      toast.add({ type: "error", title: "Falta el logo", description: "Sube el logo de la marca." });
      return;
    }
    const takenFrom = draft.slots
      .map((slot) => holders.get(slot))
      .filter((holder): holder is OfficialSponsor => Boolean(holder) && holder!.id !== draft.id);
    if (takenFrom.length) {
      const names = [...new Set(takenFrom.map((holder) => holder.name))].join(", ");
      if (!confirm(`Algunos espacios son de ${names}. Al guardar pasarán a ${draft.name || "esta marca"}. ¿Continuar?`)) return;
    }

    const formData = new FormData();
    if (draft.id) formData.append("id", draft.id);
    formData.append("name", draft.name);
    formData.append("tagline", draft.tagline ?? "");
    formData.append("linkUrl", draft.linkUrl ?? "");
    formData.append("brandColor", draft.brandColor ?? "");
    formData.append("startsOn", draft.startsOn ?? "");
    formData.append("endsOn", draft.endsOn ?? "");
    formData.append("slots", JSON.stringify(draft.slots));
    if (file) formData.append("file", file);
    if (flyerFile) formData.append("flyer", flyerFile);
    if (removeFlyer) formData.append("removeFlyer", "1");

    startTransition(async () => {
      const result = await saveOfficialSponsor(formData);
      if (!result.ok) {
        toast.add({ type: "error", title: "No se pudo guardar", description: result.error });
        return;
      }
      toast.add({
        type: "success",
        title: "Patrocinante guardado",
        description: draft.slots.length
          ? `Aparece en ${draft.slots.length} ${draft.slots.length === 1 ? "espacio" : "espacios"} y en la cinta de logos.`
          : "Aparece en la cinta de logos del Inicio.",
      });
      close();
    });
  }

  function remove(sponsor: OfficialSponsor) {
    const freed = sponsor.slots.length ? ` Sus ${sponsor.slots.length} espacios quedarán libres.` : "";
    if (!confirm(`¿Quitar a ${sponsor.name} de los patrocinantes oficiales?${freed}`)) return;
    startTransition(async () => {
      const result = await deleteOfficialSponsor(sponsor.id);
      if (!result.ok) {
        toast.add({ type: "error", title: "No se pudo eliminar", description: result.error });
        return;
      }
      toast.add({ type: "success", title: `${sponsor.name} eliminado` });
    });
  }

  const shownLogo = preview ?? cloudinaryLogo(draft?.logoUrl, 200);
  const shownFlyer = removeFlyer ? null : (flyerPreview ?? draft?.flyerUrl ?? null);
  const previewSponsor: SponsorCard | null = draft
    ? {
        id: draft.id ?? "draft",
        name: draft.name || "Tu marca",
        category: "Patrocinador",
        locationTag: null,
        logoUrl: preview ?? draft.logoUrl,
        brandColor: draft.brandColor,
        linkUrl: draft.linkUrl,
        flyerUrl: shownFlyer,
        tagline: draft.tagline,
      }
    : null;
  const draftFormats = draft
    ? [...new Set(SPONSOR_SLOTS.filter((slot) => draft.slots.includes(slot.id)).map((slot) => slot.format))]
    : [];
  const activeFormat = previewFormat && (draftFormats.includes(previewFormat) || !draftFormats.length)
    ? previewFormat
    : (draftFormats[0] ?? "flyer");

  return (
    <>
      <p className="text-sm text-zinc-500">
        Todos aparecen en la cinta de logos del Inicio. Cada espacio del sitio es exclusivo de una marca: elígelos al editar el
        patrocinante.
      </p>

      <section aria-label="Mapa de espacios" className="rounded-3xl bg-white p-4 ring-1 ring-rose-100">
        <h2 className="text-sm font-semibold text-zinc-950">Espacios del sitio</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {PAGES.map((page) => (
            <div key={page}>
              <p className="mb-2 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">{page}</p>
              <ul className="space-y-2">
                {SPONSOR_SLOTS.filter((slot) => slot.page === page).map((slot) => {
                  const holder = holders.get(slot.id);
                  return (
                    <li key={slot.id}>
                      <button
                        type="button"
                        onClick={() =>
                          holder
                            ? open({ ...holder })
                            : open({ ...emptyOfficialDraft(), slots: [slot.id] })
                        }
                        className="flex w-full items-center gap-3 rounded-2xl bg-zinc-50 p-2 pr-3 text-left ring-1 ring-zinc-100 transition-colors hover:bg-rose-50/60 hover:ring-rose-100"
                      >
                        <SlotDiagram slot={slot.id} active={Boolean(holder)} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold text-zinc-900">{slot.label}</span>
                          {holder ? (
                            <span className="mt-1 flex h-5 items-center">
                              <SponsorMark
                                sponsor={{ ...holder, category: "Patrocinador", locationTag: null }}
                                className="h-5 w-auto max-w-24"
                              />
                            </span>
                          ) : (
                            <span className="mt-1 block text-xs font-medium text-brand-red">Libre · asignar</span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {sponsors.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {sponsors.map((sponsor) => {
            const logo = cloudinaryLogo(sponsor.logoUrl, 160);
            const status = contractStatus(sponsor);
            return (
              <li key={sponsor.id} className="overflow-hidden rounded-3xl bg-white ring-1 ring-rose-100">
                <div
                  className="relative grid h-24 place-items-center px-5"
                  style={{ background: `linear-gradient(135deg, ${sponsor.brandColor ?? "#18181b"}22, ${sponsor.brandColor ?? "#18181b"}55)` }}
                >
                  <span
                    aria-hidden
                    className="absolute top-3 left-3 size-3 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: sponsor.brandColor ?? "#18181b" }}
                  />
                  <span className={cn("absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1", status.tone)}>
                    {status.label}
                  </span>
                  {logo ? (
                    <img src={logo} alt={sponsor.name} className="max-h-12 w-auto max-w-[70%] object-contain" />
                  ) : (
                    <span className="text-xs font-bold text-zinc-500 uppercase">{sponsor.name}</span>
                  )}
                </div>
                <div className="px-3.5 pt-2.5 pb-1">
                  <p className="truncate text-sm font-semibold text-zinc-950">{sponsor.name}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {sponsor.tagline || "Patrocinador oficial"}
                    {sponsor.endsOn ? ` · hasta ${formatDate(sponsor.endsOn)}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {sponsor.slots.length ? (
                      SPONSOR_SLOTS.filter((slot) => sponsor.slots.includes(slot.id)).map((slot) => (
                        <span key={slot.id} className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-brand-red">
                          {slot.page} · {slot.label}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                        Solo cinta de logos
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 px-1.5 pb-1.5">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Editar ${sponsor.name}`}
                    className="text-zinc-500 hover:bg-rose-50 hover:text-brand-red"
                    onClick={() => open({ ...sponsor })}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Eliminar ${sponsor.name}`}
                    disabled={pending}
                    className="text-zinc-500 hover:bg-rose-50 hover:text-brand-red"
                    onClick={() => remove(sponsor)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-3xl bg-white px-5 py-10 text-center text-sm text-zinc-500 ring-1 ring-rose-100">
          Aún no hay patrocinantes. Agrega el primero con el botón de arriba.
        </p>
      )}

      <Dialog open={draft !== null} onOpenChange={(isOpen) => !isOpen && close()}>
        <DialogContent className="flex! max-h-[92svh] flex-col gap-0 overflow-hidden p-0! max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none! sm:max-w-4xl">
          <div className="px-5 pt-5 pb-4 text-center">
            <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-zinc-200 sm:hidden" />
            <DialogTitle className="text-xl font-semibold text-zinc-950">
              {draft?.id ? "Editar patrocinante" : "Nuevo patrocinante"}
            </DialogTitle>
            <DialogDescription className="sr-only">Datos, diseño y espacios del patrocinante oficial</DialogDescription>
          </div>
          {draft && previewSponsor ? (
            <form
              onSubmit={save}
              className="grid min-h-0 flex-1 overflow-y-auto border-t border-rose-100/70 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]"
            >
              <div className="grid content-start gap-4 px-5 pt-5 pb-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                    Marca
                    <Input
                      required
                      autoFocus
                      value={draft.name}
                      onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                      placeholder="Ej. Gatorade"
                      className="h-11 rounded-2xl bg-white text-base"
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                    Frase
                    <Input
                      maxLength={40}
                      value={draft.tagline ?? ""}
                      onChange={(event) => setDraft({ ...draft, tagline: event.target.value || null })}
                      placeholder="Ej. Hidratación oficial"
                      className="h-11 rounded-2xl bg-white text-base"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="grid gap-1.5">
                    <span className="text-sm font-medium text-zinc-800">Logo</span>
                    <label className="group relative grid h-24 cursor-pointer place-items-center overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 transition-colors hover:border-brand-red/50 hover:bg-rose-50/40">
                      {shownLogo ? (
                        <>
                          <img src={shownLogo} alt="" className="max-h-14 w-auto max-w-full object-contain" />
                          <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm ring-1 ring-zinc-200 group-hover:text-brand-red">
                            <ImageUpIcon className="size-3.5" />
                            Cambiar
                          </span>
                        </>
                      ) : (
                        <span className="flex flex-col items-center gap-1.5 text-sm font-medium text-zinc-500">
                          <ImageUpIcon className="size-6 text-zinc-400" />
                          Toca para subir el logo
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/svg+xml,image/png,image/webp,image/jpeg"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={(event) => pickLogo(event.target.files?.[0])}
                      />
                    </label>
                    <p className="text-xs text-zinc-500">SVG o PNG con fondo transparente · máx. 8 MB</p>
                  </div>

                  <div className="grid content-start gap-1.5">
                    <span className="text-sm font-medium text-zinc-800">Color</span>
                    <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-zinc-50 px-4 ring-1 ring-zinc-200">
                      <label className="relative size-10 cursor-pointer overflow-hidden rounded-full ring-2 ring-white shadow-sm">
                        <span className="absolute inset-0" style={{ backgroundColor: draft.brandColor ?? "#e4e4e7" }} />
                        <input
                          type="color"
                          value={draft.brandColor ?? "#888888"}
                          onChange={(event) => setDraft({ ...draft, brandColor: event.target.value.toUpperCase() })}
                          className="absolute inset-0 cursor-pointer opacity-0"
                          aria-label="Color de la marca"
                        />
                      </label>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500">
                        <SparklesIcon className="size-3" />
                        {draft.brandColor ?? "Auto al guardar"}
                      </span>
                    </div>
                  </div>
                </div>

                <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                  Link (opcional)
                  <Input
                    inputMode="url"
                    value={draft.linkUrl ?? ""}
                    onChange={(event) => setDraft({ ...draft, linkUrl: event.target.value || null })}
                    placeholder="gatorade.com o instagram.com/marca"
                    className="h-11 rounded-2xl bg-white text-base"
                  />
                </label>

                <div className="grid gap-1.5">
                  <span className="text-sm font-medium text-zinc-800">Arte propio de la marca (opcional)</span>
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-200 hover:text-brand-red">
                      <ImageUpIcon className="size-4" />
                      {shownFlyer ? "Cambiar arte" : "Subir arte"}
                      <input
                        type="file"
                        accept="image/png,image/webp,image/jpeg"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={(event) => pickFlyer(event.target.files?.[0])}
                      />
                    </label>
                    {shownFlyer ? (
                      <button
                        type="button"
                        onClick={() => {
                          setRemoveFlyer(true);
                          setFlyerFile(null);
                        }}
                        className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm font-medium text-zinc-500 hover:text-brand-red"
                      >
                        <XIcon className="size-4" />
                        Usar diseño automático
                      </button>
                    ) : null}
                  </div>
                  <p className="text-xs text-zinc-500">
                    Sin arte, el sistema diseña los paneles con el logo y el color. Si la marca envía su flyer, reemplaza el
                    diseño en los paneles grandes.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                    Desde
                    <Input
                      type="date"
                      value={draft.startsOn ?? ""}
                      onChange={(event) => setDraft({ ...draft, startsOn: event.target.value || null })}
                      className="h-11 rounded-2xl bg-white"
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                    Hasta
                    <Input
                      type="date"
                      min={draft.startsOn ?? undefined}
                      value={draft.endsOn ?? ""}
                      onChange={(event) => setDraft({ ...draft, endsOn: event.target.value || null })}
                      className="h-11 rounded-2xl bg-white"
                    />
                  </label>
                  <p className="col-span-2 -mt-2 text-xs text-zinc-500">
                    Vacío = sin límite. Fuera de estas fechas la marca desaparece sola del sitio.
                  </p>
                </div>

                <fieldset className="grid gap-2">
                  <legend className="mb-1.5 text-sm font-medium text-zinc-800">Dónde aparece</legend>
                  {SPONSOR_SLOTS.map((slot) => {
                    const checked = draft.slots.includes(slot.id);
                    const holder = holders.get(slot.id);
                    const takenByOther = holder && holder.id !== draft.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        aria-pressed={checked}
                        onClick={() => toggleSlot(slot.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl p-2 pr-3 text-left ring-1 transition-colors",
                          checked ? "bg-rose-50 ring-brand-red/40" : "bg-white ring-zinc-200 hover:bg-zinc-50",
                        )}
                      >
                        <SlotDiagram slot={slot.id} active={checked} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold text-zinc-900">
                            {slot.page} · {slot.label}
                          </span>
                          <span className="block text-xs text-zinc-500">{slot.hint}</span>
                          {takenByOther ? (
                            <span className={cn("mt-0.5 block text-[11px] font-semibold", checked ? "text-brand-red" : "text-amber-600")}>
                              {checked ? `Se le quitará a ${holder.name}` : `Ahora: ${holder.name}`}
                            </span>
                          ) : null}
                        </span>
                        <span
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded-full ring-1",
                            checked ? "bg-brand-red text-white ring-brand-red" : "bg-white text-transparent ring-zinc-300",
                          )}
                        >
                          <CheckIcon className="size-3.5" strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </fieldset>
              </div>

              <aside className="grid content-start gap-3 border-t border-rose-100/70 bg-zinc-50/80 px-5 pt-5 pb-5 md:sticky md:top-0 md:border-t-0 md:border-l">
                <p className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Vista previa</p>
                <div className="flex flex-wrap gap-1">
                  {(["home", "flyer", "pill", "mark"] as const).map((format) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setPreviewFormat(format)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition-colors",
                        activeFormat === format
                          ? "bg-zinc-950 text-white ring-zinc-950"
                          : draftFormats.includes(format)
                            ? "bg-white text-zinc-800 ring-zinc-300"
                            : "bg-white text-zinc-400 ring-zinc-200",
                      )}
                    >
                      {FORMAT_LABELS[format]}
                    </button>
                  ))}
                </div>
                <SlotPreview format={activeFormat} sponsor={previewSponsor} />
                <p className="text-xs text-zinc-500">Así se verá en el sitio, con los mismos componentes que usa la web.</p>

                <Button
                  type="submit"
                  disabled={pending}
                  className={cn(adminLaserCtaClass, "mt-2 h-12 w-full rounded-2xl text-[15px] font-semibold")}
                >
                  {pending ? <Loader2Icon className="animate-spin" /> : null}
                  {pending ? "Guardando..." : draft.id ? "Guardar cambios" : "Agregar patrocinante"}
                </Button>
              </aside>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
