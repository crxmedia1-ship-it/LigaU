"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar, type AdminProfile } from "@/components/admin/admin-sidebar";
import { CommandSearch } from "@/components/admin/command-search";
import { MobileNav } from "@/components/admin/mobile-nav";
import { ADMIN_NAV, isNavActive } from "@/components/admin/nav";
import { isSuperadmin } from "@/lib/auth/roles";
import { LigaULogo } from "@/components/public/brand";

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
  const current = items.find((item) => isNavActive(item, pathname));

  return (
    <div className="ligau-admin relative flex min-h-screen bg-transparent text-zinc-900">
      <div className="sticky top-0 hidden h-screen shrink-0 md:block">
        <AdminSidebar
          profile={profile}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-rose-100/80 bg-white/80 px-4 backdrop-blur-xl md:px-8">
          <LigaULogo className="h-8 shrink-0 md:hidden" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-zinc-900">
              {current?.label ?? "Panel de control"}
            </p>
            <p className="hidden truncate text-xs text-zinc-500 md:block">
              {current?.description ?? "Administración de Liga U"}
            </p>
          </div>
          <CommandSearch role={profile.role} />
        </header>
        <main className="min-w-0 flex-1 p-4 pb-28 sm:p-6 sm:pb-28 md:pb-8 lg:p-8">{children}</main>
      </div>
      <MobileNav items={items} superadmin={isSuperadmin(profile.role)} />
    </div>
  );
}
