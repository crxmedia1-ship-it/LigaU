"use client";

import { useState, useTransition } from "react";
import { MicIcon, PencilIcon, PlayIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/admin/image-uploader";
import { toDatetimeLocal } from "@/lib/admin/sport";
import { youtubeThumb } from "@/lib/public/format";
import { deletePodcast, upsertPodcast } from "@/app/admin/(panel)/multimedia/actions";
import { fetchVideoTitle } from "@/app/admin/(panel)/media/actions";
import { AdminEmptyState, AdminPageHeader, adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { SpotifyLogo, YoutubeLogo } from "@/components/brand-icons";
import { cn } from "@/lib/utils";

export type PodcastRow = {
  id: string;
  title: string;
  description: string | null;
  episodeNumber: number;
  coverUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  publishedAt: string | null;
};

type PodcastDraft = {
  id?: string;
  title: string;
  episodeNumber: string;
  youtubeUrl: string;
  description: string | null;
  coverUrl: string | null;
  spotifyUrl: string | null;
  publishedAt: string;
};

function emptyDraft(nextNumber: number): PodcastDraft {
  return {
    title: "",
    episodeNumber: String(nextNumber),
    youtubeUrl: "",
    description: null,
    coverUrl: null,
    spotifyUrl: null,
    publishedAt: toDatetimeLocal(new Date().toISOString()),
  };
}

export function MultimediaBoard({ episodes }: { episodes: PodcastRow[] }) {
  const nextNumber = episodes.reduce((max, episode) => Math.max(max, episode.episodeNumber), 0) + 1;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PodcastDraft>(() => emptyDraft(nextNumber));
  const [loadingTitle, setLoadingTitle] = useState(false);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setDraft(emptyDraft(nextNumber));
    setOpen(true);
  }

  function openEdit(episode: PodcastRow) {
    setDraft({
      id: episode.id,
      title: episode.title,
      episodeNumber: String(episode.episodeNumber),
      youtubeUrl: episode.youtubeUrl ?? "",
      description: episode.description,
      coverUrl: episode.coverUrl,
      spotifyUrl: episode.spotifyUrl,
      publishedAt: episode.publishedAt ? toDatetimeLocal(episode.publishedAt) : "",
    });
    setOpen(true);
  }

  async function changeLink(url: string) {
    setDraft((current) => ({ ...current, youtubeUrl: url }));
    if (draft.title.trim() || !youtubeThumb(url)) return;
    setLoadingTitle(true);
    const title = await fetchVideoTitle(url);
    setLoadingTitle(false);
    if (title) setDraft((current) => (current.title.trim() ? current : { ...current, title }));
  }

  function remove(episode: PodcastRow) {
    if (!confirm(`¿Eliminar el episodio ${episode.episodeNumber}?`)) return;
    startTransition(async () => {
      const result = await deletePodcast(episode.id);
      if (!result.ok) toast.add({ type: "error", title: "No se pudo eliminar", description: result.error });
      else toast.add({ type: "success", title: "Episodio eliminado" });
    });
  }

  const preview = draft.coverUrl ?? youtubeThumb(draft.youtubeUrl);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        kicker="Media"
        title="Podcast"
        description="Pega el link de YouTube del episodio y listo."
        action={
          <Button type="button" className={adminLaserCtaClass} onClick={openNew}>
            <PlusIcon />
            Nuevo episodio
          </Button>
        }
      />

      {episodes.length === 0 ? (
        <AdminEmptyState
          icon={<MicIcon className="size-16" />}
          title="Sin episodios"
          description="Pega el link de YouTube del primer episodio."
          actionLabel="Nuevo episodio"
          onAction={openNew}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {episodes.map((episode) => {
            const thumb = episode.coverUrl ?? youtubeThumb(episode.youtubeUrl);
            return (
              <article key={episode.id} className="admin-surface group overflow-hidden rounded-3xl">
                <button type="button" onClick={() => openEdit(episode)} className="relative block aspect-video w-full">
                  {thumb ? (
                    <img src={thumb} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center bg-zinc-100 text-zinc-300">
                      <MicIcon className="size-10" />
                    </span>
                  )}
                  <span className="absolute inset-0 bg-linear-to-t from-zinc-950/60 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-brand-red">
                    Episodio {episode.episodeNumber}
                  </span>
                  <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-brand-red shadow-lg transition-transform group-hover:scale-110">
                    <PlayIcon className="ml-0.5 size-5 fill-current" />
                  </span>
                </button>
                <div className="flex items-start gap-2 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 leading-snug font-semibold text-zinc-950">{episode.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {episode.publishedAt
                        ? new Date(episode.publishedAt).toLocaleDateString("es-VE", { day: "numeric", month: "short" })
                        : "Borrador"}
                      {episode.youtubeUrl ? "" : " · sin link de YouTube"}
                    </p>
                    <div className="mt-2.5 flex gap-1.5">
                      {episode.youtubeUrl ? (
                        <a
                          href={episode.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Ver en YouTube"
                          className="flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 hover:ring-red-300"
                        >
                          <YoutubeLogo className="h-3.5" />
                          YouTube
                        </a>
                      ) : null}
                      {episode.spotifyUrl ? (
                        <a
                          href={episode.spotifyUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Escuchar en Spotify"
                          className="flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 hover:ring-emerald-300"
                        >
                          <SpotifyLogo className="size-4" />
                          Spotify
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Editar"
                    onClick={() => openEdit(episode)}
                    className="grid size-9 place-items-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    <PencilIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Eliminar"
                    disabled={pending}
                    onClick={() => remove(episode)}
                    className="grid size-9 place-items-center rounded-xl text-zinc-300 hover:bg-rose-50 hover:text-brand-red"
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
        <DialogContent className="flex! max-h-[94dvh] flex-col gap-0 overflow-hidden p-0! max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none! sm:max-w-lg">
          <div className="shrink-0 px-5 pt-5 pb-4 text-center sm:px-7">
            <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-zinc-200 sm:hidden" />
            <DialogTitle className="text-xl font-semibold text-zinc-950">
              {draft.id ? `Editar episodio ${draft.episodeNumber}` : "Nuevo episodio"}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm">Pega el link de YouTube; el resto sale solo.</DialogDescription>
          </div>
          <form
            id="podcast-form"
            className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto border-t border-rose-100/70 px-5 pt-5 pb-8 sm:px-7"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await upsertPodcast({
                  id: draft.id,
                  title: draft.title,
                  description: draft.description ?? "",
                  episodeNumber: Number(draft.episodeNumber),
                  coverUrl: draft.coverUrl,
                  spotifyUrl: draft.spotifyUrl ?? "",
                  youtubeUrl: draft.youtubeUrl.trim(),
                  publishedAt: draft.publishedAt || null,
                });
                if (!result.ok) {
                  toast.add({ type: "error", title: "No se pudo guardar", description: result.error });
                  return;
                }
                toast.add({ type: "success", title: draft.id ? "Episodio actualizado" : "Episodio publicado" });
                setOpen(false);
              });
            }}
          >
            <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
              <span className="flex items-center gap-2">
                <YoutubeLogo className="h-4" />
                Link de YouTube
              </span>
              <Input
                type="url"
                required
                autoFocus
                value={draft.youtubeUrl}
                onChange={(event) => void changeLink(event.target.value)}
                placeholder="https://youtube.com/watch?v=…"
                className="h-12 rounded-2xl bg-white text-base"
              />
            </label>

            {preview ? (
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-zinc-100">
                <img src={preview} alt="" className="size-full object-cover" />
                <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-brand-red">
                  <PlayIcon className="ml-0.5 size-5 fill-current" />
                </span>
              </div>
            ) : draft.youtubeUrl ? (
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-100">
                Ese link no parece de un video de YouTube.
              </p>
            ) : null}

            <ImageUploader
              key={draft.id ?? "new-episode"}
              folder="podcasts"
              label={draft.coverUrl ? "Cambiar portada" : "Portada propia (opcional)"}
              onUploaded={(asset) => setDraft({ ...draft, coverUrl: asset.secureUrl })}
            />

            <div className="grid grid-cols-[1fr_6rem] gap-3">
              <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                Título
                <Input
                  required
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  placeholder={loadingTitle ? "Leyendo título de YouTube…" : "Se llena con el del video"}
                  className="h-12 rounded-2xl bg-white"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                Nº
                <Input
                  type="number"
                  min={1}
                  required
                  value={draft.episodeNumber}
                  onChange={(event) => setDraft({ ...draft, episodeNumber: event.target.value })}
                  className="h-12 rounded-2xl bg-white text-center"
                />
              </label>
            </div>
          </form>
          <div className="shrink-0 border-t border-rose-100/70 bg-[#fbf7f7] px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 sm:py-4">
            <Button
              type="submit"
              form="podcast-form"
              disabled={pending}
              className={cn(adminLaserCtaClass, "h-12 w-full rounded-2xl text-[15px] font-semibold")}
            >
              {pending ? "Guardando..." : draft.id ? "Guardar cambios" : "Publicar episodio"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
