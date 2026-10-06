"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  CalendarPlusIcon,
  CornerDownLeftIcon,
  Loader2Icon,
  NewspaperIcon,
  PenSquareIcon,
  SearchIcon,
  ShieldIcon,
  TrophyIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ADMIN_NAV } from "@/components/admin/nav";
import { getAdminSearchIndex, type SearchItem } from "@/app/admin/(panel)/search-actions";
import type { UserRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import { normalizeText } from "@/lib/text";

type Entry = {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  href: string;
  icon: typeof SearchIcon;
  haystack: string;
};

const KIND = {
  match: { group: "Partidos", icon: CalendarDaysIcon },
  athlete: { group: "Atletas", icon: UserIcon },
  team: { group: "Equipos", icon: UsersIcon },
  news: { group: "Noticias", icon: NewspaperIcon },
} as const;


function actions(role: UserRole): Entry[] {
  const list = [
    { title: "Nuevo partido", href: "/admin/calendario?nuevo=1", icon: CalendarPlusIcon, words: "crear agregar juego" },
    { title: "Cargar resultado", href: "/admin/partidos", icon: TrophyIcon, words: "marcador estadisticas goles puntos" },
    { title: "Nueva noticia", href: "/admin/media?tab=noticias&nueva=1", icon: PenSquareIcon, words: "crear cronica publicar media" },
    { title: "Subir podcast", href: "/admin/media?tab=podcast", icon: PenSquareIcon, words: "episodio spotify media" },
    { title: "Subir highlight o video", href: "/admin/media?tab=highlights", icon: PenSquareIcon, words: "youtube resumen entrevista media" },
    { title: "Nuevo jugador", href: "/admin/equipos?nuevo=atleta", icon: UserPlusIcon, words: "jugador plantilla crear" },
    ...(role === "superadmin"
      ? [{ title: "Nuevo usuario del panel", href: "/admin/usuarios", icon: ShieldIcon, words: "cuenta acceso rol" }]
      : []),
  ];
  return list.map((item) => ({
    id: item.href,
    group: "Acciones",
    title: item.title,
    href: item.href,
    icon: item.icon,
    haystack: normalizeText(`${item.title} ${item.words}`),
  }));
}

export function CommandSearch({ role }: { role: UserRole }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [active, setActive] = useState(0);
  const [loading, startLoading] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openSearch(next: boolean) {
    setOpen(next);
    if (next) {
      setQuery("");
      setActive(0);
      startLoading(async () => setIndex(await getAdminSearchIndex()));
    }
  }

  const base = useMemo(() => {
    const sections: Entry[] = ADMIN_NAV.filter((item) => item.roles.includes(role)).map((item) => ({
      id: item.href,
      group: "Secciones",
      title: item.label,
      subtitle: item.description,
      href: item.href,
      icon: SearchIcon,
      haystack: normalizeText(`${item.label} ${item.description}`),
    }));
    const records: Entry[] = (index ?? []).map((item) => ({
      id: `${item.kind}-${item.id}`,
      group: KIND[item.kind].group,
      title: item.title,
      subtitle: item.subtitle,
      href: item.href,
      icon: KIND[item.kind].icon,
      haystack: normalizeText(`${item.title} ${item.subtitle} ${item.keywords}`),
    }));
    return { actions: actions(role), sections, records };
  }, [index, role]);

  const results = useMemo(() => {
    const terms = normalizeText(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return [...base.actions, ...base.records.filter((item) => item.group === "Partidos").slice(0, 5)];
    const match = (entry: Entry) => terms.every((term) => entry.haystack.includes(term));
    return [
      ...base.actions.filter(match),
      ...base.records.filter(match).slice(0, 30),
      ...base.sections.filter(match),
    ];
  }, [base, query]);

  function go(entry: Entry | undefined) {
    if (!entry) return;
    setOpen(false);
    router.push(entry.href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.max(0, Math.min(results.length - 1, active + (event.key === "ArrowDown" ? 1 : -1)));
      setActive(next);
      listRef.current?.querySelector(`[data-index="${next}"]`)?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[active]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => openSearch(true)}
        aria-label="Buscar"
        className="flex size-11 items-center justify-center gap-2 rounded-full bg-white text-sm sm:h-10 sm:w-64 sm:justify-start sm:px-4 text-zinc-500 ring-1 ring-rose-100 transition-colors hover:text-zinc-900 hover:ring-rose-200 sm:w-64 sm:px-4"
      >
        <SearchIcon className="size-5 sm:size-4" />
        <span className="hidden flex-1 text-left sm:block">Buscar o crear…</span>
        <kbd className="hidden rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 sm:block">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={openSearch}>
        <DialogContent
          showCloseButton={false}
          className="top-[12vh] translate-y-0 gap-0 overflow-hidden p-0! sm:max-w-xl"
        >
          <DialogTitle className="sr-only">Buscar en el panel</DialogTitle>
          <div className="flex items-center gap-3 border-b border-zinc-100 px-5">
            {loading ? (
              <Loader2Icon className="size-5 shrink-0 animate-spin text-brand-red" />
            ) : (
              <SearchIcon className="size-5 shrink-0 text-zinc-400" />
            )}
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Partido, atleta, equipo, noticia o acción…"
              className="h-14 flex-1 bg-transparent text-base text-zinc-900 outline-none placeholder:text-zinc-400"
            />
          </div>
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-zinc-500">
                {loading ? "Cargando…" : `Nada encontrado para “${query}”.`}
              </p>
            ) : (
              results.map((entry, position) => {
                const header =
                  position === 0 || results[position - 1].group !== entry.group ? entry.group : null;
                const Icon = entry.icon;
                return (
                  <div key={entry.id}>
                    {header ? (
                      <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                        {header}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      data-index={position}
                      onMouseMove={() => setActive(position)}
                      onClick={() => go(entry)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        position === active ? "bg-rose-50" : "",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-lg",
                          position === active ? "bg-brand-red text-white" : "bg-zinc-100 text-zinc-500",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-zinc-900">{entry.title}</span>
                        {entry.subtitle ? (
                          <span className="block truncate text-xs text-zinc-500">{entry.subtitle}</span>
                        ) : null}
                      </span>
                      {position === active ? (
                        <CornerDownLeftIcon className="size-4 shrink-0 text-brand-red" />
                      ) : null}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
