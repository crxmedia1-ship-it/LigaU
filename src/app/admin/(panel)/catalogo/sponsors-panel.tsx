"use client";

import { useState, useTransition } from "react";
import { ImageUpIcon, Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { deleteOfficialSponsor, saveOfficialSponsor } from "@/app/admin/(panel)/catalogo/sponsors-actions";
import { cloudinaryLogo } from "@/lib/public/media";
import { cn } from "@/lib/utils";

export type OfficialSponsor = { id: string; name: string; logoUrl: string | null };
export type OfficialSponsorDraft = { id?: string; name: string; logoUrl: string | null };

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
  const [pending, startTransition] = useTransition();

  function close() {
    setDraft(null);
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  function pickFile(next: File | undefined) {
    if (!next) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;
    if (!draft.id && !file) {
      toast.add({ type: "error", title: "Falta el logo", description: "Sube el logo de la marca." });
      return;
    }
    const formData = new FormData();
    formData.append("name", draft.name);
    if (draft.id) formData.append("id", draft.id);
    if (file) formData.append("file", file);
    startTransition(async () => {
      const result = await saveOfficialSponsor(formData);
      if (!result.ok) {
        toast.add({ type: "error", title: "No se pudo guardar", description: result.error });
        return;
      }
      toast.add({ type: "success", title: "Patrocinante guardado", description: "Ya aparece en los carruseles del sitio." });
      close();
    });
  }

  function remove(sponsor: OfficialSponsor) {
    if (!confirm(`¿Quitar a ${sponsor.name} de los patrocinantes oficiales?`)) return;
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

  return (
    <>
      <p className="text-sm text-zinc-500">
        Aparecen en el carrusel de la portada y en los espacios de patrocinio de Calendario y Clasificación.
      </p>

      {sponsors.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sponsors.map((sponsor) => {
            const logo = cloudinaryLogo(sponsor.logoUrl, 160);
            return (
              <li key={sponsor.id} className="overflow-hidden rounded-3xl bg-white ring-1 ring-rose-100">
                <div className="grid h-24 place-items-center border-b border-rose-50 bg-zinc-50/60 px-5">
                  {logo ? (
                    <img src={logo} alt={sponsor.name} className="max-h-12 w-auto max-w-full object-contain" />
                  ) : (
                    <span className="text-xs font-bold text-zinc-400 uppercase">{sponsor.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 py-1.5 pr-1.5 pl-3.5">
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-950 capitalize">{sponsor.name}</p>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Editar ${sponsor.name}`}
                    className="text-zinc-500 hover:bg-rose-50 hover:text-brand-red"
                    onClick={() => setDraft({ id: sponsor.id, name: sponsor.name, logoUrl: sponsor.logoUrl })}
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

      <Dialog open={draft !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="flex! flex-col gap-0 overflow-hidden p-0! max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none! sm:max-w-md">
          <div className="px-5 pt-5 pb-4 text-center">
            <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-zinc-200 sm:hidden" />
            <DialogTitle className="text-xl font-semibold text-zinc-950">
              {draft?.id ? "Editar patrocinante" : "Nuevo patrocinante"}
            </DialogTitle>
            <DialogDescription className="sr-only">Nombre y logo del patrocinante oficial</DialogDescription>
          </div>
          {draft ? (
            <form
              onSubmit={save}
              className="grid gap-4 border-t border-rose-100/70 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            >
              <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                Marca
                <Input
                  required
                  autoFocus
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  placeholder="Ej. Gatorade"
                  className="h-12 rounded-2xl bg-white text-base"
                />
              </label>

              <div className="grid gap-1.5">
                <span className="text-sm font-medium text-zinc-800">Logo</span>
                <label className="group relative grid h-32 cursor-pointer place-items-center overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 transition-colors hover:border-brand-red/50 hover:bg-rose-50/40">
                  {shownLogo ? (
                    <>
                      <img src={shownLogo} alt="" className="max-h-20 w-auto max-w-full object-contain" />
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
                    onChange={(event) => pickFile(event.target.files?.[0])}
                  />
                </label>
                <p className="text-xs text-zinc-500">SVG o PNG con fondo transparente se ven mejor · máx. 8 MB</p>
              </div>

              <Button
                type="submit"
                disabled={pending}
                className={cn(adminLaserCtaClass, "mt-1 h-12 w-full rounded-2xl text-[15px] font-semibold")}
              >
                {pending ? <Loader2Icon className="animate-spin" /> : null}
                {pending ? "Guardando..." : draft.id ? "Guardar cambios" : "Agregar patrocinante"}
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
