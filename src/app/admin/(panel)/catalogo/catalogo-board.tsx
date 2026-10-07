"use client";

import { useState, useTransition } from "react";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/admin/image-uploader";
import { adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { SPORT_EMOJI } from "@/lib/admin/sport";
import {
  deleteSport,
  deleteUniversity,
  upsertSport,
  upsertUniversity,
} from "@/app/admin/(panel)/catalogo/actions";
import {
  UpassPanel,
  type Sponsor,
  type SponsorDraft,
} from "@/app/admin/(panel)/catalogo/upass-panel";
import {
  SponsorsPanel,
  emptyOfficialDraft,
  type OfficialSponsor,
  type OfficialSponsorDraft,
} from "@/app/admin/(panel)/catalogo/sponsors-panel";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type SportCategory = Database["public"]["Enums"]["sport_category"];
export type CatalogoTab =
  "universidades" | "deportes" | "upass" | "patrocinantes";

type University = {
  id: string;
  name: string;
  shortName: string;
  uploadedLogo: string | null;
  logoUrl: string | null;
  teams: number;
};
type Sport = {
  id: string;
  name: string;
  slug: string;
  category: SportCategory;
  teams: number;
};

type UniversityDraft = {
  id?: string;
  name: string;
  shortName: string;
  logoUrl: string | null;
};
type SportDraft = { id?: string; name: string; category: SportCategory };

const CATEGORIES: { id: SportCategory; label: string; hint: string }[] = [
  { id: "colectivo", label: "Colectivo", hint: "Equipos con plantilla" },
  { id: "individual", label: "Individual", hint: "Tenis, ajedrez…" },
];

export function CatalogoBoard({
  tabs,
  initialTab,
  universities,
  sports,
  sponsors,
  officialSponsors,
}: {
  tabs: CatalogoTab[];
  initialTab: CatalogoTab;
  universities: University[];
  sports: Sport[];
  sponsors: Sponsor[];
  officialSponsors: OfficialSponsor[];
}) {
  const [tab, setTab] = useState<CatalogoTab>(initialTab);
  const [universityDraft, setUniversityDraft] =
    useState<UniversityDraft | null>(null);
  const [sportDraft, setSportDraft] = useState<SportDraft | null>(null);
  const [sponsorDraft, setSponsorDraft] = useState<SponsorDraft | null>(null);
  const [officialDraft, setOfficialDraft] =
    useState<OfficialSponsorDraft | null>(null);
  const [pending, startTransition] = useTransition();

  function create() {
    if (tab === "universidades")
      setUniversityDraft({ name: "", shortName: "", logoUrl: null });
    else if (tab === "deportes")
      setSportDraft({ name: "", category: "colectivo" });
    else if (tab === "patrocinantes")
      setOfficialDraft(emptyOfficialDraft());
    else
      setSponsorDraft({
        name: "",
        category: "Marcas",
        locationTag: "",
        logoUrl: null,
        isActive: true,
        contact: {},
        brandColor: null,
      });
  }

  function remove(
    kind: "universidades" | "deportes",
    id: string,
    label: string,
    teams: number,
  ) {
    if (teams) {
      toast.add({
        type: "error",
        title: `${label} tiene ${teams} ${teams === 1 ? "equipo" : "equipos"}`,
        description: "Quítalos primero en Equipos.",
      });
      return;
    }
    if (!confirm(`¿Eliminar ${label}?`)) return;
    startTransition(async () => {
      const result =
        kind === "universidades"
          ? await deleteUniversity(id)
          : await deleteSport(id);
      if (!result.ok) {
        toast.add({
          type: "error",
          title: "No se pudo eliminar",
          description: result.error,
        });
        return;
      }
      toast.add({ type: "success", title: `${label} eliminado` });
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
          Catálogo
        </h1>
        <Button
          type="button"
          onClick={create}
          className={cn(adminLaserCtaClass, "h-11 rounded-full px-5")}
        >
          <PlusIcon />
          {tab === "universidades"
            ? "Universidad"
            : tab === "deportes"
              ? "Deporte"
              : tab === "patrocinantes"
                ? "Patrocinante"
                : "Marca"}
        </Button>
      </div>

      <div
        className={cn(
          "grid grid-cols-2 gap-1 rounded-2xl bg-zinc-100 p-1",
          tabs.length > 2 && "sm:grid-cols-4",
        )}
      >
        {(
          [
            ["universidades", "Universidades", universities.length],
            ["deportes", "Deportes", sports.length],
            ["patrocinantes", "Patrocinantes", officialSponsors.length],
            ["upass", "U Pass", sponsors.length],
          ] as const
        )
          .filter(([id]) => tabs.includes(id))
          .map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all",
                tab === id
                  ? "bg-white text-brand-red shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900",
              )}
            >
              {label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px] tabular-nums",
                  tab === id
                    ? "bg-rose-50 text-brand-red"
                    : "bg-zinc-200 text-zinc-500",
                )}
              >
                {count}
              </span>
            </button>
          ))}
      </div>

      {tab === "upass" ? (
        <UpassPanel
          sponsors={sponsors}
          sponsorDraft={sponsorDraft}
          setSponsorDraft={setSponsorDraft}
        />
      ) : null}

      {tab === "patrocinantes" ? (
        <SponsorsPanel
          sponsors={officialSponsors}
          draft={officialDraft}
          setDraft={setOfficialDraft}
        />
      ) : null}

      <ul
        className={cn(
          "overflow-hidden rounded-3xl bg-white ring-1 ring-rose-100",
          (tab === "upass" || tab === "patrocinantes") && "hidden",
        )}
      >
        {tab === "universidades"
          ? universities.map((university) => (
              <li
                key={university.id}
                className="flex items-center gap-3 border-b border-rose-50 px-4 py-3 last:border-0"
              >
                {university.logoUrl ? (
                  <img
                    src={university.logoUrl}
                    alt=""
                    className="size-11 shrink-0 object-contain"
                  />
                ) : (
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-zinc-50 text-xs font-black text-zinc-400">
                    {university.shortName.slice(0, 3)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-950">
                    {university.shortName}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {university.name}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-zinc-400 tabular-nums">
                  {university.teams}{" "}
                  {university.teams === 1 ? "equipo" : "equipos"}
                </span>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Editar"
                  className="text-zinc-500 hover:bg-rose-50 hover:text-brand-red"
                  onClick={() =>
                    setUniversityDraft({
                      id: university.id,
                      name: university.name,
                      shortName: university.shortName,
                      logoUrl: university.uploadedLogo,
                    })
                  }
                >
                  <PencilIcon />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Eliminar"
                  disabled={pending}
                  className="text-zinc-500 hover:bg-rose-50 hover:text-brand-red"
                  onClick={() =>
                    remove(
                      "universidades",
                      university.id,
                      university.shortName,
                      university.teams,
                    )
                  }
                >
                  <Trash2Icon />
                </Button>
              </li>
            ))
          : sports.map((sport) => (
              <li
                key={sport.id}
                className="flex items-center gap-3 border-b border-rose-50 px-4 py-3 last:border-0"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-zinc-50 text-2xl">
                  {SPORT_EMOJI[sport.slug] ?? "🏅"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-zinc-950">
                    {sport.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {sport.category === "colectivo"
                      ? "Colectivo"
                      : "Individual"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-zinc-400 tabular-nums">
                  {sport.teams} {sport.teams === 1 ? "equipo" : "equipos"}
                </span>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Editar"
                  className="text-zinc-500 hover:bg-rose-50 hover:text-brand-red"
                  onClick={() =>
                    setSportDraft({
                      id: sport.id,
                      name: sport.name,
                      category: sport.category,
                    })
                  }
                >
                  <PencilIcon />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Eliminar"
                  disabled={pending}
                  className="text-zinc-500 hover:bg-rose-50 hover:text-brand-red"
                  onClick={() =>
                    remove("deportes", sport.id, sport.name, sport.teams)
                  }
                >
                  <Trash2Icon />
                </Button>
              </li>
            ))}
      </ul>

      <Dialog
        open={universityDraft !== null}
        onOpenChange={(open) => !open && setUniversityDraft(null)}
      >
        <DialogContent className="flex! flex-col gap-0 overflow-hidden p-0! max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none! sm:max-w-md">
          <div className="px-5 pt-5 pb-4 text-center">
            <span
              aria-hidden
              className="mx-auto mb-3 block h-1 w-10 rounded-full bg-zinc-200 sm:hidden"
            />
            <DialogTitle className="text-xl font-semibold text-zinc-950">
              {universityDraft?.id ? "Editar universidad" : "Nueva universidad"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Siglas, nombre y logo
            </DialogDescription>
          </div>
          {universityDraft ? (
            <form
              className="grid gap-4 border-t border-rose-100/70 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
              onSubmit={(event) => {
                event.preventDefault();
                startTransition(async () => {
                  const result = await upsertUniversity(universityDraft);
                  if (!result.ok) {
                    toast.add({
                      type: "error",
                      title: "No se pudo guardar",
                      description: result.error,
                    });
                    return;
                  }
                  toast.add({ type: "success", title: "Universidad guardada" });
                  setUniversityDraft(null);
                });
              }}
            >
              <div className="grid grid-cols-[6.5rem_1fr] gap-3">
                <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                  Siglas
                  <Input
                    required
                    autoFocus
                    value={universityDraft.shortName}
                    onChange={(event) =>
                      setUniversityDraft({
                        ...universityDraft,
                        shortName: event.target.value,
                      })
                    }
                    placeholder="UCV"
                    className="h-12 rounded-2xl bg-white text-center font-bold uppercase"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                  Nombre completo
                  <Input
                    required
                    value={universityDraft.name}
                    onChange={(event) =>
                      setUniversityDraft({
                        ...universityDraft,
                        name: event.target.value,
                      })
                    }
                    placeholder="Universidad Central de Venezuela"
                    className="h-12 rounded-2xl bg-white"
                  />
                </label>
              </div>
              <ImageUploader
                key={universityDraft.id ?? "new-university"}
                folder="banners"
                path="universidades"
                label="Logo o escudo"
                initialUrl={universityDraft.logoUrl}
                onUploaded={(asset) =>
                  setUniversityDraft({
                    ...universityDraft,
                    logoUrl: asset.secureUrl,
                  })
                }
              />
              <Button
                type="submit"
                disabled={pending}
                className={cn(
                  adminLaserCtaClass,
                  "mt-1 h-12 w-full rounded-2xl text-[15px] font-semibold",
                )}
              >
                {pending
                  ? "Guardando..."
                  : universityDraft.id
                    ? "Guardar cambios"
                    : "Agregar universidad"}
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={sportDraft !== null}
        onOpenChange={(open) => !open && setSportDraft(null)}
      >
        <DialogContent className="flex! flex-col gap-0 overflow-hidden p-0! max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none! sm:max-w-md">
          <div className="px-5 pt-5 pb-4 text-center">
            <span
              aria-hidden
              className="mx-auto mb-3 block h-1 w-10 rounded-full bg-zinc-200 sm:hidden"
            />
            <DialogTitle className="text-xl font-semibold text-zinc-950">
              {sportDraft?.id ? "Editar deporte" : "Nuevo deporte"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Nombre y tipo de deporte
            </DialogDescription>
          </div>
          {sportDraft ? (
            <form
              className="grid gap-4 border-t border-rose-100/70 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
              onSubmit={(event) => {
                event.preventDefault();
                startTransition(async () => {
                  const result = await upsertSport(sportDraft);
                  if (!result.ok) {
                    toast.add({
                      type: "error",
                      title: "No se pudo guardar",
                      description: result.error,
                    });
                    return;
                  }
                  toast.add({ type: "success", title: "Deporte guardado" });
                  setSportDraft(null);
                });
              }}
            >
              <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                Nombre
                <Input
                  required
                  autoFocus
                  value={sportDraft.name}
                  onChange={(event) =>
                    setSportDraft({ ...sportDraft, name: event.target.value })
                  }
                  placeholder="Ej. Natación"
                  className="h-12 rounded-2xl bg-white text-base"
                />
              </label>
              <div className="grid gap-1.5">
                <span className="text-sm font-medium text-zinc-800">Tipo</span>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((category) => {
                    const active = sportDraft.category === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          setSportDraft({
                            ...sportDraft,
                            category: category.id,
                          })
                        }
                        className={cn(
                          "rounded-2xl px-3 py-3 text-left transition-all",
                          active
                            ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white shadow-[0_12px_24px_-14px_rgba(200,16,46,0.9)]"
                            : "bg-zinc-50 text-zinc-800 ring-1 ring-zinc-100 hover:bg-rose-50",
                        )}
                      >
                        <span className="block text-sm font-semibold">
                          {category.label}
                        </span>
                        <span
                          className={cn(
                            "block text-[11px]",
                            active ? "text-white/75" : "text-zinc-500",
                          )}
                        >
                          {category.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button
                type="submit"
                disabled={pending}
                className={cn(
                  adminLaserCtaClass,
                  "mt-1 h-12 w-full rounded-2xl text-[15px] font-semibold",
                )}
              >
                {pending
                  ? "Guardando..."
                  : sportDraft.id
                    ? "Guardar cambios"
                    : "Agregar deporte"}
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
