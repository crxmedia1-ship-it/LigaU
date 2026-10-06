"use client";

import { useState, useTransition } from "react";
import { FilmIcon, PencilIcon, PlayIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminEmptyState, AdminPageHeader, adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { ImageUploader } from "@/components/admin/image-uploader";
import { SPORT_EMOJI, toDatetimeLocal } from "@/lib/admin/sport";
import { youtubeThumb } from "@/lib/public/format";
import { deleteVideo, fetchVideoTitle, upsertVideo, type VideoKind } from "@/app/admin/(panel)/media/actions";
import { cn } from "@/lib/utils";

export type VideoRow = {
  id: string;
  title: string;
  kind: VideoKind;
  videoUrl: string;
  thumbnailUrl: string | null;
  sportId: string | null;
  sportName: string | null;
  description: string | null;
  publishedAt: string;
};

type Draft = Omit<VideoRow, "id" | "sportName" | "description"> & { id?: string; description: string };

/** `section` mirrors the grouping on the public Multimedia page. */
const KINDS: { id: VideoKind; label: string; section: string }[] = [
  { id: "highlight", label: "Highlight", section: "Highlights" },
  { id: "resumen", label: "Resumen", section: "Resúmenes" },
  { id: "entrevista", label: "Entrevista", section: "Entrevistas" },
  { id: "video", label: "Video", section: "Highlights" },
];

const KIND_LABEL = Object.fromEntries(KINDS.map((kind) => [kind.id, kind.label])) as Record<VideoKind, string>;

function emptyDraft(): Draft {
  return {
    title: "",
    kind: "highlight",
    videoUrl: "",
    thumbnailUrl: null,
    sportId: null,
    description: "",
    publishedAt: toDatetimeLocal(new Date().toISOString()),
  };
}

export function HighlightsBoard({
  videos,
  sports,
}: {
  videos: VideoRow[];
  sports: { id: string; name: string; slug: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setDraft(emptyDraft());
    setOpen(true);
  }

  function openEdit(video: VideoRow) {
    setDraft({
      id: video.id,
      title: video.title,
      kind: video.kind,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      sportId: video.sportId,
      description: video.description ?? "",
      publishedAt: toDatetimeLocal(video.publishedAt),
    });
    setOpen(true);
  }

  function remove(video: VideoRow) {
    if (!confirm(`¿Eliminar "${video.title}"?`)) return;
    startTransition(async () => {
      const result = await deleteVideo(video.id);
      if (!result.ok) toast.add({ type: "error", title: "No se pudo eliminar", description: result.error });
      else toast.add({ type: "success", title: "Video eliminado" });
    });
  }

  const preview = draft.thumbnailUrl ?? youtubeThumb(draft.videoUrl);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        kicker="Media"
        title="Videos"
        description="Pega el enlace de YouTube, Instagram o TikTok. Si es de YouTube, la miniatura sale sola."
        action={
          <Button type="button" onClick={openNew} className={adminLaserCtaClass}>
            <PlusIcon />
            Subir video
          </Button>
        }
      />

      {videos.length === 0 ? (
        <AdminEmptyState
          icon={<FilmIcon className="size-16" />}
          title="Sin videos"
          description="Sube el primer video para que aparezca en Multimedia."
          actionLabel="Subir video"
          onAction={openNew}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => {
            const thumb = video.thumbnailUrl ?? youtubeThumb(video.videoUrl);
            return (
              <article key={video.id} className="admin-surface group overflow-hidden rounded-3xl">
                <button type="button" onClick={() => openEdit(video)} className="relative block aspect-video w-full">
                  {thumb ? (
                    <img src={thumb} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center bg-zinc-100 text-zinc-300">
                      <FilmIcon className="size-10" />
                    </span>
                  )}
                  <span className="absolute inset-0 bg-linear-to-t from-zinc-950/60 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#C8102E]">
                    {KIND_LABEL[video.kind] ?? "Video"}
                  </span>
                  <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#C8102E] shadow-lg transition-transform group-hover:scale-110">
                    <PlayIcon className="ml-0.5 size-5 fill-current" />
                  </span>
                </button>
                <div className="flex items-start gap-2 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-semibold leading-snug text-zinc-950">{video.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {video.sportName ?? "Liga U"} ·{" "}
                      {new Date(video.publishedAt).toLocaleDateString("es-VE", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Editar"
                    onClick={() => openEdit(video)}
                    className="grid size-9 place-items-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    <PencilIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Eliminar"
                    disabled={pending}
                    onClick={() => remove(video)}
                    className="grid size-9 place-items-center rounded-xl text-zinc-300 hover:bg-rose-50 hover:text-[#C8102E]"
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex! max-h-[94dvh] flex-col gap-0 overflow-hidden p-0! max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none! sm:max-w-xl">
          <div className="shrink-0 px-5 pt-5 pb-4 text-center sm:px-7">
            <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-zinc-200 sm:hidden" />
            <DialogTitle className="text-xl font-semibold text-zinc-950">
              {draft.id ? "Editar video" : "Subir video"}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm">Pega el enlace y completa lo básico.</DialogDescription>
          </div>
          <form
            id="video-form"
            className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto border-t border-rose-100/70 px-5 pt-5 pb-8 sm:px-7"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await upsertVideo({ ...draft, sportId: draft.sportId });
                if (!result.ok) {
                  toast.add({ type: "error", title: "No se pudo guardar", description: result.error });
                  return;
                }
                toast.add({ type: "success", title: draft.id ? "Video actualizado" : "Video publicado" });
                setOpen(false);
              });
            }}
          >
            <div className="grid grid-cols-4 gap-1 rounded-2xl bg-zinc-100 p-1">
              {KINDS.map((kind) => (
                <button
                  key={kind.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, kind: kind.id })}
                  className={cn(
                    "rounded-xl py-2 text-xs font-semibold transition-all sm:text-sm",
                    draft.kind === kind.id ? "bg-white text-[#9e1b28] shadow-sm" : "text-zinc-500 hover:text-zinc-800",
                  )}
                >
                  {kind.label}
                </button>
              ))}
            </div>
            <p className="-mt-2 text-xs text-zinc-500">
              Se publica en Multimedia → {KINDS.find((kind) => kind.id === draft.kind)?.section}
            </p>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
              Enlace del video
              <Input
                type="url"
                required
                value={draft.videoUrl}
                onChange={async (event) => {
                  const url = event.target.value;
                  setDraft((current) => ({ ...current, videoUrl: url }));
                  if (draft.title.trim() || !youtubeThumb(url)) return;
                  const title = await fetchVideoTitle(url);
                  if (title) setDraft((current) => (current.title.trim() ? current : { ...current, title }));
                }}
                placeholder="https://youtube.com/watch?v=…"
                className="h-12 rounded-2xl bg-white"
              />
            </label>

            {preview ? (
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-zinc-100">
                <img src={preview} alt="" className="size-full object-cover" />
                <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#C8102E]">
                  <PlayIcon className="ml-0.5 size-5 fill-current" />
                </span>
              </div>
            ) : null}

            <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
              Título
              <Input
                required
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                placeholder="Se llena solo con links de YouTube"
                className="h-12 rounded-2xl bg-white"
              />
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-zinc-800">Sección</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, sportId: null })}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-all",
                    !draft.sportId
                      ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white"
                      : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:ring-[#C8102E]/40",
                  )}
                >
                  <img
                    src="/brand/liga-u-logo.svg"
                    alt=""
                    className={cn("h-3.5 w-auto", !draft.sportId && "brightness-0 invert")}
                  />
                  Liga U
                </button>
                {sports.map((sport) => {
                  const active = draft.sportId === sport.id;
                  return (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => setDraft({ ...draft, sportId: active ? null : sport.id })}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-all",
                        active
                          ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white"
                          : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:ring-[#C8102E]/40",
                      )}
                    >
                      <span>{SPORT_EMOJI[sport.slug] ?? "🏅"}</span>
                      <span className="truncate">{sport.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
              Descripción (opcional)
              <Textarea
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                className="min-h-20 rounded-2xl bg-white"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
              Fecha de publicación
              <Input
                type="datetime-local"
                value={draft.publishedAt}
                onChange={(event) => setDraft({ ...draft, publishedAt: event.target.value })}
                className="h-12 rounded-2xl bg-white"
              />
            </label>

            <ImageUploader
              key={draft.id ?? "new-video"}
              folder="noticias"
              label="Miniatura propia (opcional)"
              initialUrl={draft.thumbnailUrl}
              onUploaded={(asset) => setDraft({ ...draft, thumbnailUrl: asset.secureUrl })}
            />
          </form>
          <div className="shrink-0 border-t border-rose-100/70 bg-[#fbf7f7] px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 sm:py-4">
            <Button
              type="submit"
              form="video-form"
              disabled={pending}
              className={cn(adminLaserCtaClass, "h-12 w-full rounded-2xl text-[15px] font-semibold")}
            >
              {pending ? "Guardando..." : draft.id ? "Guardar cambios" : "Publicar video"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
