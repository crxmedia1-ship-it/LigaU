"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDaysIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ClapperboardIcon,
  LogOutIcon,
  NewspaperIcon,
  RadioIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/app/admin/actions";
import { ADMIN_NAV } from "@/components/admin/nav";
import { roleLabel, type UserRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

const ICONS = {
  calendar: CalendarDaysIcon,
  users: UsersIcon,
  newspaper: NewspaperIcon,
  radio: RadioIcon,
  store: StoreIcon,
  studio: ClapperboardIcon,
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

  function toggleCollapsed() {
    const next = !collapsed;
    persistCollapsed(next);
    onCollapsedChange(next);
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-zinc-800 bg-[#09090b] text-zinc-100 transition-[width] duration-200",
        collapsed ? "w-[4.5rem]" : "w-72",
      )}
    >
      <div className="flex items-center gap-3 px-3 py-4">
        <div
          className="grid size-8 shrink-0 place-items-center bg-linear-to-br from-red-600 to-rose-800 text-xs font-black text-white shadow-[0_0_25px_rgba(200,16,46,0.35)]"
          style={{
            clipPath:
              "polygon(18% 0, 100% 0, 100% 82%, 82% 100%, 0 100%, 0 18%)",
          }}
        >
          U
        </div>
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-[0.18em] uppercase">
              Liga U
            </p>
            <p className="truncate text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              Command Center
            </p>
          </div>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <ChevronsRightIcon /> : <ChevronsLeftIcon />}
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-sm px-2.5 py-2 text-sm uppercase tracking-[0.12em] transition-colors",
                active
                  ? "bg-[#C8102E]/15 text-zinc-100 shadow-[0_0_18px_rgba(200,16,46,0.18)]"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed ? (
                <span className="min-w-0 truncate font-medium">{item.label}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex w-full items-center gap-3 rounded-sm px-2.5 py-2 text-left text-sm hover:bg-zinc-900",
              collapsed && "justify-center px-0",
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#C8102E]/15 text-xs font-semibold text-[#C8102E]">
              {profile.fullName.slice(0, 1).toUpperCase() || "A"}
            </span>
            {!collapsed ? (
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{profile.fullName}</span>
                <Badge variant="secondary" className="mt-1">
                  {roleLabel(profile.role)}
                </Badge>
              </span>
            ) : null}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {profile.email}
            </div>
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
