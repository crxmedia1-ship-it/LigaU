"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3Icon,
  CalendarDaysIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ExternalLinkIcon,
  ListOrderedIcon,
  LogOutIcon,
  MegaphoneIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  ShieldIcon,
  LibraryIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/app/admin/actions";
import { ADMIN_NAV, isNavActive, type AdminNavItem } from "@/components/admin/nav";
import { LigaULogo } from "@/components/public/brand";
import { roleLabel, type UserRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

export const ICONS = {
  calendar: CalendarDaysIcon,
  trophy: TrophyIcon,
  standings: ListOrderedIcon,
  stats: BarChart3Icon,
  users: UsersIcon,
  newspaper: NewspaperIcon,
  shield: ShieldCheckIcon,
  teams: ShieldIcon,
  catalog: LibraryIcon,
  popup: MegaphoneIcon,
} as const;

const SIDEBAR_COOKIE = "ligau-admin-sidebar";

export type AdminProfile = {
  fullName: string;
  email: string;
  role: UserRole;
};

type AdminSidebarProps = {
  profile: AdminProfile;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

function persistCollapsed(collapsed: boolean) {
  document.cookie = `${SIDEBAR_COOKIE}=${collapsed ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
}

export function AdminSidebar({
  profile,
  collapsed,
  onCollapsedChange,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const items = ADMIN_NAV.filter((item) => item.roles.includes(profile.role));
  const groups = new Map<AdminNavItem["group"], AdminNavItem[]>();
  for (const item of items) groups.set(item.group, [...(groups.get(item.group) ?? []), item]);

  function toggleCollapsed() {
    const next = !collapsed;
    persistCollapsed(next);
    onCollapsedChange(next);
  }

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col overflow-hidden border-r border-rose-100 bg-white/85 text-zinc-900 backdrop-blur-xl transition-[width] duration-200",
        collapsed ? "w-[4.5rem]" : "w-72",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-[#f4c7c5]/60 blur-3xl"
      />
      <div className="relative flex items-center gap-3 px-3 py-5">
        <LigaULogo className="h-10 shrink-0" />
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold tracking-[0.18em] uppercase">Liga U</p>
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.22em] text-brand-red/80">
              Panel de control
            </p>
          </div>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-zinc-400 hover:bg-rose-50 hover:text-brand-red"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <ChevronsRightIcon /> : <ChevronsLeftIcon />}
        </Button>
      </div>

      <nav className="relative flex flex-1 flex-col gap-5 overflow-y-auto px-2 pb-4">
        {[...groups].map(([group, groupItems]) => (
          <div key={group} className="grid gap-1">
            {!collapsed ? (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-zinc-400">
                {group}
              </p>
            ) : null}
            {groupItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isNavActive(item, pathname)}
                collapsed={collapsed}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="relative grid gap-1 border-t border-rose-100 p-2">
        <Link
          href="/"
          target="_blank"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-rose-50 hover:text-brand-red",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? "Ver sitio público" : undefined}
        >
          <ExternalLinkIcon className="size-4 shrink-0" />
          {!collapsed ? "Ver sitio público" : null}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm hover:bg-rose-50",
              collapsed && "justify-center px-0",
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#e0233f] to-[#8a0b20] text-xs font-bold text-white shadow-[0_6px_16px_-6px_rgba(200,16,46,0.6)]">
              {profile.fullName.slice(0, 1).toUpperCase() || "A"}
            </span>
            {!collapsed ? (
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{profile.fullName}</span>
                <span className="block truncate text-xs text-zinc-500">
                  {roleLabel(profile.role)}
                </span>
              </span>
            ) : null}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">{profile.email}</div>
            <DropdownMenuItem onClick={() => void signOut()}>
              <LogOutIcon />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: AdminNavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = ICONS[item.icon];
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
        collapsed && "justify-center px-0",
        active
          ? "bg-linear-to-r from-[#fde4e3] to-white text-[#9e1b28] shadow-[inset_0_0_0_1px_rgba(200,16,46,0.14),0_10px_24px_-16px_rgba(200,16,46,0.55)]"
          : "text-zinc-600 hover:bg-rose-50/70 hover:text-zinc-950",
      )}
    >
      <Icon
        className={cn(
          "size-[18px] shrink-0 transition-colors",
          active ? "text-brand-red" : "text-zinc-400 group-hover:text-brand-red",
        )}
      />
      {!collapsed ? <span className="min-w-0 truncate">{item.label}</span> : null}
    </Link>
  );
}
