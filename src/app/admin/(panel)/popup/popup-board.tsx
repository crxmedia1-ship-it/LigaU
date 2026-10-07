"use client";

import { useState, useTransition } from "react";
import { ImageUpIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { deletePopup, savePopup } from "@/app/admin/(panel)/popup/actions";
import { uploadImageAction } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

export type PopupDraft = {
  id?: string;
  imageUrl: string;
  title: string;
  linkUrl: string;
  isActive: boolean;
  startsOn: string;
  endsOn: string;
};

const EMPTY: PopupDraft = { imageUrl: "", title: "", linkUrl: "", isActive: true, startsOn: "", endsOn: "" };

function statusOf(popup: PopupDraft | null) {
  if (!popup) return { label: "Sin pop-up", tone: "bg-zinc-100 text-zinc-500 ring-zinc-200" };
  if (!popup.isActive) return { label: "Apagado", tone: "bg-zinc-100 text-zinc-500 ring-zinc-200" };
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Caracas" });
  if (popup.startsOn && today < popup.startsOn) return { label: "Programado", tone: "bg-amber-50 text-amber-700 ring-amber-200" };
  if (popup.endsOn && today > popup.endsOn) return { label: "Vencido", tone: "bg-zinc-100 text-zinc-500 ring-zinc-200" };
  return { label: "Visible en el sitio", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
}

export function PopupBoard({ popup }: { popup: PopupDraft | null }) {
  const [draft, setDraft] = useState<PopupDraft>(popup ?? EMPTY);
  const [uploading, startUpload] = useTransition();
  const [pending, startTransition] = useTransition();
  const status = statusOf(popup);

  function pickImage(file: File | undefined) {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "banners");
    formData.append("path", "popup");
    startUpload(async () => {
      const result = await uploadImageAction(formData);
      if (!result.ok) {
        toast.add({ type: "error", title: "No se pudo subir la imagen", description: result.error });
        return;
      }
      setDraft((current) => ({ ...current, imageUrl: result.secureUrl }));
    });
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await savePopup({ ...draft, id: popup?.id });
      if (!result.ok) {
        toast.add({ type: "error", title: "No se pudo guardar", description: result.error });
        return;
      }
      toast.add({
        type: "success",
        title: "Pop-up guardado",
        description: draft.isActive ? "Aparece al abrir el sitio, una vez por visitante." : "Quedó apagado.",
      });
    });
  }

  function remove() {
    if (!popup?.id || !confirm("¿Eliminar el pop-up? Dejará de aparecer en el sitio.")) return;
    startTransition(async () => {
      const result = await deletePopup(popup.id!);
      if (!result.ok) {
        toast.add({ type: "error", title: "No se pudo eliminar", description: result.error });
        return;
      }
      setDraft(EMPTY);
      toast.add({ type: "success", title: "Pop-up eliminado" });
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Pop-up</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Una imagen que aparece al abrir el sitio. Cada visitante la ve una vez; si la cambias, la vuelven a ver.
          </p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1", status.tone)}>{status.label}</span>
      </div>

      <form onSubmit={save} className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="space-y-4 rounded-3xl bg-white p-5 ring-1 ring-rose-100">
          <div className="grid gap-1.5 text-sm font-medium text-zinc-800">
            Imagen
            <label
              className={cn(
                "relative grid min-h-36 cursor-pointer place-items-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center transition-colors hover:border-rose-300 hover:bg-rose-50/40",
                uploading && "pointer-events-none opacity-60",
              )}
            >
              <span className="flex flex-col items-center gap-2 text-zinc-500">
                {uploading ? <Loader2Icon className="size-6 animate-spin" /> : <ImageUpIcon className="size-6" />}
                <span className="text-sm font-semibold text-zinc-800">
                  {uploading ? "Subiendo…" : draft.imageUrl ? "Cambiar imagen" : "Subir imagen"}
                </span>
                <span className="text-xs font-normal">Vertical o cuadrada · JPG, PNG, WEBP o GIF · máx. 8 MB</span>
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(event) => pickImage(event.target.files?.[0])}
              />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
            Título (opcional)
            <Input
              value={draft.title}
              maxLength={80}
              placeholder="Ej. Gran final de fútbol"
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              className="h-11 rounded-2xl bg-white"
            />
            <span className="text-xs font-normal text-zinc-500">No se muestra; lo leen los lectores de pantalla.</span>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
            Link al tocar la imagen (opcional)
            <Input
              value={draft.linkUrl}
              placeholder="/calendario o instagram.com/ligauve"
              onChange={(event) => setDraft({ ...draft, linkUrl: event.target.value })}
              className="h-11 rounded-2xl bg-white"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
              Desde
              <Input
                type="date"
                value={draft.startsOn}
                onChange={(event) => setDraft({ ...draft, startsOn: event.target.value })}
                className="h-11 rounded-2xl bg-white"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
              Hasta
              <Input
                type="date"
                min={draft.startsOn || undefined}
                value={draft.endsOn}
                onChange={(event) => setDraft({ ...draft, endsOn: event.target.value })}
                className="h-11 rounded-2xl bg-white"
              />
            </label>
          </div>
          <p className="-mt-2 text-xs text-zinc-500">Vacío = sin límite. Fuera de estas fechas no aparece.</p>

          <button
            type="button"
            role="switch"
            aria-checked={draft.isActive}
            onClick={() => setDraft({ ...draft, isActive: !draft.isActive })}
            className="flex w-full items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 text-left ring-1 ring-zinc-100"
          >
            <span>
              <span className="block text-sm font-semibold text-zinc-900">Mostrar en el sitio</span>
              <span className="block text-xs text-zinc-500">Apágalo para ocultarlo sin borrarlo.</span>
            </span>
            <span
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                draft.isActive ? "bg-brand-red" : "bg-zinc-300",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
                  draft.isActive ? "left-[1.375rem]" : "left-0.5",
                )}
              />
            </span>
          </button>

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="submit"
              disabled={pending || uploading || !draft.imageUrl}
              className={cn(adminLaserCtaClass, "h-11 flex-1 rounded-full")}
            >
              {pending ? "Guardando…" : popup ? "Guardar cambios" : "Publicar pop-up"}
            </Button>
            {popup ? (
              <Button
                type="button"
                variant="ghost"
                aria-label="Eliminar pop-up"
                disabled={pending}
                onClick={remove}
                className="h-11 rounded-full text-zinc-500 hover:bg-rose-50 hover:text-brand-red"
              >
                <Trash2Icon />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Vista previa</p>
          <div className="relative grid min-h-[26rem] place-items-center overflow-hidden rounded-3xl bg-zinc-950/70 p-6">
            <div aria-hidden className="absolute inset-0 -z-10 bg-[url('/intro/futbol.webp')] bg-cover bg-center opacity-30 blur-sm" />
            {draft.imageUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={draft.imageUrl}
                  alt=""
                  className="max-h-[22rem] w-auto max-w-full rounded-[1.4rem] object-contain shadow-[0_30px_60px_-24px_rgba(0,0,0,0.8)]"
                />
                <span className="absolute -top-3 -right-3 grid size-9 place-items-center rounded-full bg-white text-sm font-bold text-zinc-900 shadow">
                  ✕
                </span>
              </div>
            ) : (
              <p className="max-w-[14rem] text-center text-sm text-white/70">Sube una imagen para ver cómo se verá al abrir el sitio.</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
