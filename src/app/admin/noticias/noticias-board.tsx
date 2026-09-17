"use client";

import { useState, useTransition } from "react";
import { NewspaperIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
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
import { Field, NativeSelect } from "@/components/admin/field";
import { ImageUploader } from "@/components/admin/image-uploader";
import { slugify, toDatetimeLocal } from "@/lib/admin/sport";
import { deleteNews, upsertNews } from "@/app/admin/noticias/actions";
import {
  AdminEmptyState,
  AdminPageHeader,
  adminGhostIconClass,
  adminLaserCtaClass,
  adminPanelClass,
} from "@/components/admin/admin-chrome";

export type CatalogOption = { id: string; name: string };
export type NewsRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImageUrl: string | null;
  sportId: string | null;
  universityId: string | null;
  isFeatured: boolean;
  publishedAt: string | null;
  sportName: string | null;
  universityName: string | null;
};

type NewsDraft = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  sportId: string;
  universityId: string;
  isFeatured: boolean;
  publishedAt: string;
};

function emptyDraft(): NewsDraft {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImageUrl: null,
    sportId: "",
    universityId: "",
    isFeatured: false,
    publishedAt: toDatetimeLocal(new Date().toISOString()),
  };
}

export function NoticiasBoard({
  sports,
  universities,
  news,
}: {
  sports: CatalogOption[];
  universities: CatalogOption[];
  news: NewsRow[];
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<NewsDraft>(emptyDraft);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <AdminPageHeader
        kicker="Editorial"
        title="Noticias"
        description="Crónicas con portada Cloudinary y vínculo a deporte o universidad."
        action={
          <Button
            type="button"
            className={adminLaserCtaClass}
            onClick={() => {
              setDraft(emptyDraft());
              setOpen(true);
            }}
          >
            <PlusIcon />
            Nueva crónica
          </Button>
        }
      />

      <Card className={adminPanelClass}>
        <CardHeader className="border-b border-zinc-800/80">
          <CardTitle className="text-zinc-100">Publicaciones</CardTitle>
          <CardDescription className="text-zinc-400">
            Las crónicas destacadas alimentan el home público.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {news.length === 0 ? (
            <AdminEmptyState
              icon={<NewspaperIcon className="size-16" />}
              title="Sin crónicas"
              description="Aún no hay publicaciones. Lanza la primera del torneo para llenar el bento de la Home."
              actionLabel="Nueva crónica"
              onAction={() => {
                setDraft(emptyDraft());
                setOpen(true);
              }}
            />
          ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  Título
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  Deporte
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  Universidad
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  Estado
                </TableHead>
                <TableHead className="text-right text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news.map((item) => (
                  <TableRow key={item.id} className="border-zinc-800/80 hover:bg-zinc-900/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.coverImageUrl ? (
                          <img
                            src={item.coverImageUrl}
                            alt=""
                            className="size-10 rounded-sm object-cover ring-1 ring-zinc-700"
                          />
                        ) : (
                          <span className="grid size-10 place-items-center rounded-sm border border-dashed border-zinc-600 bg-zinc-900 text-[10px] text-zinc-500">
                            IMG
                          </span>
                        )}
                        <div>
                          <div className="font-medium text-zinc-100">{item.title}</div>
                          <div className="text-xs text-zinc-500">{item.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-400">{item.sportName || "—"}</TableCell>
                    <TableCell className="text-zinc-400">{item.universityName || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.isFeatured ? (
                          <Badge className="border-0 bg-linear-to-r from-red-600 to-rose-800 text-white">
                            Destacada
                          </Badge>
                        ) : null}
                        <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                          {item.publishedAt ? "Publicada" : "Borrador"}
                        </Badge>
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
                              id: item.id,
                              title: item.title,
                              slug: item.slug,
                              excerpt: item.excerpt ?? "",
                              content: item.content ?? "",
                              coverImageUrl: item.coverImageUrl,
                              sportId: item.sportId ?? "",
                              universityId: item.universityId ?? "",
                              isFeatured: item.isFeatured,
                              publishedAt: item.publishedAt
                                ? toDatetimeLocal(item.publishedAt)
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
                            if (!confirm("¿Eliminar esta crónica?")) return;
                            startTransition(async () => {
                              const result = await deleteNews(item.id);
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
        <DialogContent className="max-h-[90vh] overflow-y-auto border-zinc-800 bg-zinc-950 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Editar crónica" : "Nueva crónica"}</DialogTitle>
            <DialogDescription>
              Portada en Cloudinary y vínculo opcional a disciplina o casa de estudios.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await upsertNews({
                  id: draft.id,
                  title: draft.title,
                  slug: draft.slug || slugify(draft.title),
                  excerpt: draft.excerpt,
                  content: draft.content,
                  coverImageUrl: draft.coverImageUrl,
                  sportId: draft.sportId || null,
                  universityId: draft.universityId || null,
                  isFeatured: draft.isFeatured,
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
                toast.add({ type: "success", title: "Crónica guardada" });
                setOpen(false);
              });
            }}
          >
            <Field label="Título">
              <Input
                value={draft.title}
                onChange={(event) => {
                  const title = event.target.value;
                  setDraft({
                    ...draft,
                    title,
                    slug: draft.id ? draft.slug : slugify(title),
                  });
                }}
                required
              />
            </Field>
            <Field label="Slug">
              <Input
                value={draft.slug}
                onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
              />
            </Field>
            <Field label="Extracto">
              <Textarea
                value={draft.excerpt}
                onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })}
              />
            </Field>
            <Field label="Cuerpo">
              <Textarea
                className="min-h-40"
                value={draft.content}
                onChange={(event) => setDraft({ ...draft, content: event.target.value })}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Deporte">
                <NativeSelect
                  value={draft.sportId}
                  onChange={(event) =>
                    setDraft({ ...draft, sportId: event.target.value })
                  }
                >
                  <option value="">Sin deporte</option>
                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Universidad">
                <NativeSelect
                  value={draft.universityId}
                  onChange={(event) =>
                    setDraft({ ...draft, universityId: event.target.value })
                  }
                >
                  <option value="">Sin universidad</option>
                  {universities.map((university) => (
                    <option key={university.id} value={university.id}>
                      {university.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>
            <Field label="Publicación">
              <Input
                type="datetime-local"
                value={draft.publishedAt}
                onChange={(event) =>
                  setDraft({ ...draft, publishedAt: event.target.value })
                }
              />
            </Field>
            <Field label="Destacada">
              <NativeSelect
                value={draft.isFeatured ? "yes" : "no"}
                onChange={(event) =>
                  setDraft({ ...draft, isFeatured: event.target.value === "yes" })
                }
              >
                <option value="no">No</option>
                <option value="yes">Sí</option>
              </NativeSelect>
            </Field>
            <ImageUploader
              key={draft.id ?? "new-news"}
              folder="news"
              label="Imagen de portada"
              initialUrl={draft.coverImageUrl}
              onUploaded={(asset) =>
                setDraft({ ...draft, coverImageUrl: asset.secureUrl })
              }
            />
            <DialogFooter>
              <Button type="submit" disabled={pending} className={adminLaserCtaClass}>
                {pending ? "Guardando..." : "Guardar crónica"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
