"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/admin/actions";
import { AdminSidebar, type AdminProfile } from "@/components/admin/admin-sidebar";
import { ADMIN_NAV } from "@/components/admin/nav";
import { roleLabel } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  profile: AdminProfile;
  collapsed: boolean;
  children: React.ReactNode;
};

export function AdminShell({
  profile,
  collapsed: initialCollapsed,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const items = ADMIN_NAV.filter((item) => item.roles.includes(profile.role));
  const current = items.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <div className="ligau-admin dark relative flex min-h-screen bg-transparent text-zinc-100">
      <div className="sticky top-0 hidden h-screen shrink-0 md:block">
        <AdminSidebar
          profile={profile}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-zinc-800 bg-[#09090b]/90 px-4 py-3 backdrop-blur-xl">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C8102E]">
              {current?.label ?? "Backoffice"}
            </p>
            <p className="hidden truncate text-xs text-zinc-400 sm:block">
              {current?.description ?? "Panel operativo de Liga U"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {roleLabel(profile.role)}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-[#C8102E]/50 hover:text-white"
              onClick={() => void signOut()}
            >
              <LogOutIcon />
              Cerrar sesión
            </Button>
          </div>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-zinc-800 px-3 py-2 md:hidden">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-md px-2 py-1 text-xs font-medium",
                  active
                    ? "bg-[#C8102E]/15 text-zinc-100"
                    : "text-zinc-400",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="min-w-0 flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
