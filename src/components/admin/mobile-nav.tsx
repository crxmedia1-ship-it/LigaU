"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ExternalLinkIcon,
  LayoutGridIcon,
  LogOutIcon,
  ShieldIcon,
  GraduationCapIcon,
  HandshakeIcon,
  DumbbellIcon,
  TicketIcon,
  UserPlusIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { signOut } from "@/app/admin/actions";
import { ICONS } from "@/components/admin/admin-sidebar";
import { isNavActive, type AdminNavItem } from "@/components/admin/nav";
import { cn } from "@/lib/utils";

const PRIMARY = [
  "/admin/partidos",
  "/admin/calendario",
  "/admin/media",
  "/admin/estadisticas",
];

const SHORT_LABELS: Record<string, string> = {
  "/admin/calendario": "Calendario",
  "/admin/partidos": "Partidos",
  "/admin/estadisticas": "Estadísticas",
  "/admin/media": "Media",
};

const QUICK_ACTIONS = [
  { href: "/admin/equipos", label: "Atletas", icon: UserPlusIcon },
  { href: "/admin/inscripciones", label: "Equipos", icon: ShieldIcon },
  {
    href: "/admin/catalogo?tab=universidades",
    label: "Universidades",
    icon: GraduationCapIcon,
  },
  {
    href: "/admin/catalogo?tab=deportes",
    label: "Deportes",
    icon: DumbbellIcon,
  },
  {
    href: "/admin/catalogo?tab=patrocinantes",
    label: "Patrocinantes",
    icon: HandshakeIcon,
    superadmin: true,
  },
  {
    href: "/admin/catalogo?tab=upass",
    label: "U Pass",
    icon: TicketIcon,
    superadmin: true,
  },
];

const MOBILE_HIDDEN = new Set(["/admin/clasificacion"]);

export function MobileNav({
  items,
  superadmin,
}: {
  items: AdminNavItem[];
  superadmin: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = PRIMARY.flatMap((href) =>
    items.filter((item) => item.href === href),
  );
  const allowed = new Set(items.map((item) => item.href));
  const quickActions = QUICK_ACTIONS.filter(
    (action) =>
      allowed.has(action.href.split("?")[0]) &&
      (superadmin || !("superadmin" in action)),
  );
  const quickHrefs = new Set(
    QUICK_ACTIONS.map((action) => action.href.split("?")[0]),
  );
  const secondary = items.filter(
    (item) =>
      !PRIMARY.includes(item.href) &&
      !quickHrefs.has(item.href) &&
      !MOBILE_HIDDEN.has(item.href),
  );
  const moreActive = items.some(
    (item) => !PRIMARY.includes(item.href) && isNavActive(item, pathname),
  );

  return (
    <>
      <nav
        aria-label="Navegación del panel"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-rose-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <ul className="grid grid-cols-5">
          {primary.map((item) => {
            const Icon = ICONS[item.icon];
            const active = isNavActive(item, pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
                    active ? "text-[#C8102E]" : "text-zinc-500",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-12 place-items-center rounded-full transition-colors",
                      active && "bg-rose-50",
                    )}
                  >
                    <Icon
                      className="size-[22px]"
                      strokeWidth={active ? 2.4 : 2}
                    />
                  </span>
                  {SHORT_LABELS[item.href] ?? item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                "flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
                moreActive ? "text-[#C8102E]" : "text-zinc-500",
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-12 place-items-center rounded-full",
                  moreActive && "bg-rose-50",
                )}
              >
                <LayoutGridIcon
                  className="size-[22px]"
                  strokeWidth={moreActive ? 2.4 : 2}
                />
              </span>
              Más
            </button>
          </li>
        </ul>
      </nav>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="top-auto bottom-0 max-w-full translate-y-0 rounded-b-none! pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:max-w-md">
          <DialogTitle className="text-base">Crear rápido</DialogTitle>
          <div
            className={cn(
              "grid gap-2",
              quickActions.length % 3 && quickActions.length % 2 === 0
                ? "grid-cols-2"
                : "grid-cols-3",
            )}
          >
            {quickActions.map((action) => {
              const Icon = action.icon;
              const [base, query] = action.href.split("?");
              const tab = query ? new URLSearchParams(query).get("tab") : null;
              const active =
                pathname === base &&
                (!tab || (searchParams.get("tab") ?? "universidades") === tab);
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex h-24 flex-col items-center justify-center gap-2 rounded-2xl p-1.5 text-center text-xs leading-tight font-semibold transition-colors",
                    active
                      ? "bg-[#C8102E] text-white shadow-[0_12px_24px_-14px_rgba(200,16,46,0.9)]"
                      : "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-100 active:bg-rose-50",
                  )}
                >
                  <Icon className="size-6" />
                  {action.label}
                </Link>
              );
            })}
          </div>
          {secondary.length ? (
            <p className="text-base font-semibold text-zinc-950">
              Más secciones
            </p>
          ) : null}
          <div
            className={cn(
              "grid grid-cols-4 gap-2",
              !secondary.length && "hidden",
            )}
          >
            {secondary.map((item) => {
              const Icon = ICONS[item.icon];
              const active = isNavActive(item, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl p-1.5 text-center text-[11px] leading-tight font-semibold transition-colors",
                    active
                      ? "bg-[#C8102E] text-white shadow-[0_12px_24px_-14px_rgba(200,16,46,0.9)]"
                      : "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-100 active:bg-rose-50",
                  )}
                >
                  <Icon className="size-6" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-50 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-100"
            >
              <ExternalLinkIcon className="size-4" />
              Ver sitio
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-50 text-sm font-semibold text-[#C8102E] ring-1 ring-zinc-100"
            >
              <LogOutIcon className="size-4" />
              Salir
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
