"use client";

import { useState, useTransition } from "react";
import { ChevronDownIcon, NewspaperIcon, PencilIcon, PlusIcon, StarIcon, Trash2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/admin/field";
import { ImageUploader } from "@/components/admin/image-uploader";
import { SPORT_EMOJI, slugify, toDatetimeLocal } from "@/lib/admin/sport";
import { deleteNews, upsertNews } from "@/app/admin/(panel)/noticias/actions";
import { AdminEmptyState, AdminPageHeader, adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { cn } from "@/lib/utils";

type CatalogOption = { id: string; name: string; slug?: string };
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

function draftFromRow(item: NewsRow): NewsDraft {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt ?? "",
    content: item.content ?? "",
    coverImageUrl: item.coverImageUrl,
    sportId: item.sportId ?? "",
    universityId: item.universityId ?? "",
    isFeatured: item.isFeatured,
    publishedAt: item.publishedAt ? toDatetimeLocal(item.publishedAt) : "",
  };
}

function autoExcerpt(content: string) {
  const text = content.replace(/\s+/g, " ").trim();
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

export function NoticiasBoard({
  sports,
  universities,
  news,
  startOpen = false,
  editId,
}: {
  sports: CatalogOption[];
  universities: CatalogOption[];
  news: NewsRow[];
  startOpen?: boolean;
  editId?: string;
}) {
  const editing = news.find((item) => item.id === editId);
  const [open, setOpen] = useState(startOpen || Boolean(editing));
  const [draft, setDraft] = useState<NewsDraft>(() => (editing ? draftFromRow(editing) : emptyDraft()));
  const [moreOpen, setMoreOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setDraft(emptyDraft());
    setMoreOpen(false);
    setOpen(true);
  }

  function openEdit(item: NewsRow) {
    setDraft(draftFromRow(item));
    setMoreOpen(false);
    setOpen(true);
  }

  function remove(item: NewsRow) {
    if (!confirm(`¿Eliminar "${item.title}"?`)) return;
    startTransition(async () => {
      const result = await deleteNews(item.id);
      if (!result.ok) toast.add({ type: "error", title: "No se pudo eliminar", description: result.error });
      else toast.add({ type: "success", title: "Noticia eliminada" });
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        kicker="Media"
        title="Noticias"
        action={
          <Button type="button" className={adminLaserCtaClass} onClick={openNew}>
            <PlusIcon />
            Nueva noticia
          </Button>
        }
      />

      {news.length === 0 ? (
        <AdminEmptyState
          icon={<NewspaperIcon className="size-16" />}
          title="Sin noticias"
          description="Publica la primera noticia del torneo."
          actionLabel="Nueva noticia"
          onAction={openNew}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {news.map((item) => (
            <article key={item.id} className="admin-surface overflow-hidden rounded-3xl">
              <button type="button" onClick={() => openEdit(item)} className="relative block aspect-video w-full">
                {item.coverImageUrl ? (
                  <img src={item.coverImageUrl} alt="" className="size-full object-cover" />
                ) : (
                  <span className="grid size-full place-items-center bg-zinc-100 text-zinc-300">
                    <NewspaperIcon className="size-10" />
                  </span>
                )}
                <span className="absolute top-3 left-3 flex gap-1.5">
                  {item.isFeatured ? (
                    <span className="flex items-center gap-1 rounded-full bg-brand-red px-2.5 py-1 text-[11px] font-bold text-white">
                      <StarIcon className="size-3 fill-current" /> Destacada
                    </span>
                  ) : null}
                  {!item.publishedAt ? (
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-zinc-700">Borrador</span>
                  ) : null}
                </span>
              </button>
              <div className="flex items-start gap-2 p-4">
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 leading-snug font-semibold text-zinc-950">{item.title}</p>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {[item.sportName, item.universityName].filter(Boolean).join(" · ") || "Liga U"}
                    {item.publishedAt
                      ? ` · ${new Date(item.publishedAt).toLocaleDateString("es-VE", { day: "numeric", month: "short" })}`
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Editar"
                  onClick={() => openEdit(item)}
                  className="grid size-9 place-items-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                >
                  <PencilIcon className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Eliminar"
                  disabled={pending}
                  onClick={() => remove(item)}
                  className="grid size-9 place-items-center rounded-xl text-zinc-300 hover:bg-rose-50 hover:text-brand-red"
                >
                  <Trash2Icon className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex! max-h-[94dvh] flex-col gap-0 overflow-hidden p-0! max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none! sm:max-w-xl">
          <div className="shrink-0 px-5 pt-5 pb-4 text-center sm:px-7">
            <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-zinc-200 sm:hidden" />
            <DialogTitle className="text-xl font-semibold text-zinc-950">
              {draft.id ? "Editar noticia" : "Nueva noticia"}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm">Foto, título y texto. Lo demás es opcional.</DialogDescription>
          </div>
          <form
            id="news-form"
            className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto border-t border-rose-100/70 px-5 pt-5 pb-8 sm:px-7"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await upsertNews({
                  id: draft.id,
                  title: draft.title,
                  slug: draft.slug || slugify(draft.title),
                  excerpt: draft.excerpt.trim() || autoExcerpt(draft.content),
                  content: draft.content,
                  coverImageUrl: draft.coverImageUrl,
                  sportId: draft.sportId || null,
                  universityId: draft.universityId || null,
                  isFeatured: draft.isFeatured,
                  publishedAt: draft.publishedAt || null,
                });
                if (!result.ok) {
                  toast.add({ type: "error", title: "No se pudo guardar", description: result.error });
                  return;
                }
                toast.add({ type: "success", title: draft.id ? "Noticia actualizada" : "Noticia publicada" });
                setOpen(false);
              });
            }}
          >
            <ImageUploader
              key={draft.id ?? "new-news"}
              folder="noticias"
              label="Foto de portada"
              initialUrl={draft.coverImageUrl}
              onUploaded={(asset) => setDraft({ ...draft, coverImageUrl: asset.secureUrl })}
            />

            <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
              Título
              <Input
                required
                value={draft.title}
                onChange={(event) => {
                  const title = event.target.value;
                  setDraft({ ...draft, title, slug: draft.id ? draft.slug : slugify(title) });
                }}
                placeholder="Ej. UCV vence a UCAB en el clásico"
                className="h-12 rounded-2xl bg-white text-base"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
              Texto
              <Textarea
                value={draft.content}
                onChange={(event) => setDraft({ ...draft, content: event.target.value })}
                placeholder="Cuenta lo que pasó…"
                className="min-h-44 rounded-2xl bg-white"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
              Universidad
              <NativeSelect
                value={draft.universityId}
                onChange={(event) => setDraft({ ...draft, universityId: event.target.value })}
              >
                <option value="">Ninguna</option>
                {universities.map((university) => (
                  <option key={university.id} value={university.id}>
                    {university.name}
                  </option>
                ))}
              </NativeSelect>
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-zinc-800">Sección</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, sportId: "" })}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-all",
                    !draft.sportId
                      ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white"
                      : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:ring-brand-red/40",
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
                      onClick={() => setDraft({ ...draft, sportId: active ? "" : sport.id })}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-all",
                        active
                          ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white"
                          : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:ring-brand-red/40",
                      )}
                    >
                      <span>{SPORT_EMOJI[sport.slug ?? ""] ?? "🏅"}</span>
                      <span className="truncate">{sport.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={draft.isFeatured}
              onClick={() => setDraft({ ...draft, isFeatured: !draft.isFeatured })}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left ring-1 ring-zinc-200"
            >
              <StarIcon className={cn("size-5 shrink-0", draft.isFeatured ? "fill-amber-400 text-amber-400" : "text-zinc-300")} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-zinc-900">Destacar en el inicio</span>
                <span className="block text-xs text-zinc-500">Sale grande en la portada del sitio.</span>
              </span>
              <span
                className={cn(
                  "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                  draft.isFeatured ? "bg-brand-red" : "bg-zinc-200",
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 size-5 rounded-full bg-white shadow transition-all",
                    draft.isFeatured ? "left-6" : "left-1",
                  )}
                />
              </span>
            </button>

            <div className="grid gap-4">
              <button
                type="button"
                onClick={() => setMoreOpen((value) => !value)}
                className="flex items-center justify-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-900"
              >
                Cambiar fecha de publicación
                <ChevronDownIcon className={cn("size-4 transition-transform", moreOpen && "rotate-180")} />
              </button>
              {moreOpen ? (
                <div className="grid gap-4 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                  <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                    Fecha de publicación
                    <Input
                      type="datetime-local"
                      value={draft.publishedAt}
                      onChange={(event) => setDraft({ ...draft, publishedAt: event.target.value })}
                      className="h-12 rounded-2xl bg-white"
                    />
                    <span className="text-xs font-normal text-zinc-500">Vacía = se guarda como borrador.</span>
                  </label>
                </div>
              ) : null}
            </div>
          </form>
          <div className="shrink-0 border-t border-rose-100/70 bg-[#fbf7f7] px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 sm:py-4">
            <Button
              type="submit"
              form="news-form"
              disabled={pending}
              className={cn(adminLaserCtaClass, "h-12 w-full rounded-2xl text-[15px] font-semibold")}
            >
              {pending ? "Guardando..." : draft.id ? "Guardar cambios" : "Publicar noticia"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
