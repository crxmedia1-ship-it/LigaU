"use client";

import { useState, useTransition } from "react";
import { PencilIcon, PlusIcon, RadioIcon, Trash2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Field } from "@/components/admin/field";
import { ImageUploader } from "@/components/admin/image-uploader";
import { toDatetimeLocal } from "@/lib/admin/sport";
import { deletePodcast, upsertPodcast } from "@/app/admin/multimedia/actions";
import {
  AdminEmptyState,
  AdminPageHeader,
  adminGhostIconClass,
  adminLaserCtaClass,
  adminPanelClass,
} from "@/components/admin/admin-chrome";

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
  description: string;
  episodeNumber: string;
  coverUrl: string | null;
  spotifyUrl: string;
  youtubeUrl: string;
  publishedAt: string;
};

function emptyDraft(nextNumber: number): PodcastDraft {
  return {
    title: "",
    description: "",
    episodeNumber: String(nextNumber),
    coverUrl: null,
    spotifyUrl: "",
    youtubeUrl: "",
    publishedAt: toDatetimeLocal(new Date().toISOString()),
  };
}

export function MultimediaBoard({ episodes }: { episodes: PodcastRow[] }) {
  const nextNumber =
    episodes.reduce((max, episode) => Math.max(max, episode.episodeNumber), 0) + 1;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PodcastDraft>(() => emptyDraft(nextNumber));
  const [pending, startTransition] = useTransition();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <AdminPageHeader
        kicker="Multimedia"
        title="Podcasts"
        description="Episodios oficiales con thumbnail Cloudinary y enlaces a Spotify o YouTube."
        action={
          <Button
            type="button"
            className={adminLaserCtaClass}
            onClick={() => {
              setDraft(emptyDraft(nextNumber));
              setOpen(true);
            }}
          >
            <PlusIcon />
            Nuevo episodio
          </Button>
        }
      />

      <Card className={adminPanelClass}>
        <CardHeader className="border-b border-zinc-800/80">
          <CardTitle className="text-zinc-100">Episodios</CardTitle>
          <CardDescription className="text-zinc-400">
            El número de episodio debe ser único. Las portadas se firman en servidor.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {episodes.length === 0 ? (
            <AdminEmptyState
              icon={<RadioIcon className="size-16" />}
              title="Sin episodios"
              description="No hay episodios cargados. Publica el primero para llenar el hub multimedia."
              actionLabel="Nuevo episodio"
              onAction={() => {
                setDraft(emptyDraft(nextNumber));
                setOpen(true);
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                    #
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                    Episodio
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                    Enlaces
                  </TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {episodes.map((episode) => (
                  <TableRow
                    key={episode.id}
                    className="border-zinc-800/80 hover:bg-zinc-900/50"
                  >
                    <TableCell>
                      <span className="font-mono text-lg text-zinc-300">
                        E{episode.episodeNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {episode.coverUrl ? (
                          <img
                            src={episode.coverUrl}
                            alt=""
                            className="size-10 rounded-sm object-cover ring-1 ring-zinc-700"
                          />
                        ) : (
                          <span className="grid size-10 place-items-center rounded-sm border border-dashed border-zinc-600 bg-zinc-900 text-[10px] text-zinc-500">
                            IMG
                          </span>
                        )}
                        <div>
                          <div className="font-medium text-zinc-100">{episode.title}</div>
                          <div className="line-clamp-1 text-xs text-zinc-500">
                            {episode.description || "Sin descripción"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {episode.spotifyUrl ? (
                          <Badge className="border-0 bg-linear-to-r from-red-600 to-rose-800 text-white">
                            Spotify
                          </Badge>
                        ) : null}
                        {episode.youtubeUrl ? (
                          <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                            YouTube
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className={adminGhostIconClass}
                          onClick={() => {
                            setDraft({
                              id: episode.id,
                              title: episode.title,
                              description: episode.description ?? "",
                              episodeNumber: String(episode.episodeNumber),
                              coverUrl: episode.coverUrl,
                              spotifyUrl: episode.spotifyUrl ?? "",
                              youtubeUrl: episode.youtubeUrl ?? "",
                              publishedAt: episode.publishedAt
                                ? toDatetimeLocal(episode.publishedAt)
                                : "",
                            });
                            setOpen(true);
                          }}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className={adminGhostIconClass}
                          onClick={() => {
                            if (!confirm("¿Eliminar este episodio?")) return;
                            startTransition(async () => {
                              const result = await deletePodcast(episode.id);
                              if (!result.ok) {
                                toast.add({
                                  type: "error",
                                  title: "No se pudo eliminar",
                                  description: result.error,
                                });
                              }
                            });
                          }}
                          disabled={pending}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-zinc-800 bg-zinc-950 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {draft.id ? "Editar episodio" : "Nuevo episodio"}
            </DialogTitle>
            <DialogDescription>
              Thumbnail Cloudinary y enlaces de reproducción.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await upsertPodcast({
                  id: draft.id,
                  title: draft.title,
                  description: draft.description,
                  episodeNumber: Number(draft.episodeNumber),
                  coverUrl: draft.coverUrl,
                  spotifyUrl: draft.spotifyUrl,
                  youtubeUrl: draft.youtubeUrl,
                  publishedAt: draft.publishedAt || null,
                });
                if (!result.ok) {
                  toast.add({
                    type: "error",
                    title: "No se pudo guardar",
                    description: result.error,
                  });
                  return;
                }
                toast.add({ type: "success", title: "Episodio guardado" });
                setOpen(false);
              });
            }}
          >
            <Field label="Título">
              <Input
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                required
              />
            </Field>
            <Field label="Número de episodio">
              <Input
                type="number"
                min={1}
                value={draft.episodeNumber}
                onChange={(event) =>
                  setDraft({ ...draft, episodeNumber: event.target.value })
                }
                required
              />
            </Field>
            <Field label="Descripción">
              <Textarea
                value={draft.description}
                onChange={(event) =>
                  setDraft({ ...draft, description: event.target.value })
                }
              />
            </Field>
            <Field label="Spotify">
              <Input
                type="url"
                value={draft.spotifyUrl}
                onChange={(event) =>
                  setDraft({ ...draft, spotifyUrl: event.target.value })
                }
                placeholder="https://open.spotify.com/..."
              />
            </Field>
            <Field label="YouTube">
              <Input
                type="url"
                value={draft.youtubeUrl}
                onChange={(event) =>
                  setDraft({ ...draft, youtubeUrl: event.target.value })
                }
                placeholder="https://youtube.com/..."
              />
            </Field>
            <Field label="Publicación">
              <Input
                type="datetime-local"
                value={draft.publishedAt}
                onChange={(event) =>
                  setDraft({ ...draft, publishedAt: event.target.value })
                }
              />
            </Field>
            <ImageUploader
              key={draft.id ?? "new-podcast"}
              folder="podcasts"
              label="Thumbnail"
              initialUrl={draft.coverUrl}
              onUploaded={(asset) => setDraft({ ...draft, coverUrl: asset.secureUrl })}
            />
            <DialogFooter>
              <Button type="submit" disabled={pending} className={adminLaserCtaClass}>
                {pending ? "Guardando..." : "Guardar episodio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
