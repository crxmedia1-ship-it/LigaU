"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  CalendarDaysIcon,
  HomeIcon,
  SparklesIcon,
  TablePropertiesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Inicio", icon: HomeIcon, id: "home" },
  { href: "/competicion", label: "Calendario", icon: CalendarDaysIcon, id: "calendario" },
  {
    href: "/competicion?tab=tabla",
    label: "Clasificación",
    icon: TablePropertiesIcon,
    id: "tabla",
  },
  { href: "/liga-u-pass", label: "U Pass", icon: SparklesIcon, id: "pass" },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("tab");

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-zinc-800 bg-zinc-950/90 pb-safe backdrop-blur-xl md:hidden"
    >
      <ul className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active =
            tab.id === "home"
              ? pathname === "/"
              : tab.id === "calendario"
                ? pathname.startsWith("/competicion") && view !== "tabla"
                : tab.id === "tabla"
                  ? pathname.startsWith("/competicion") && view === "tabla"
                  : pathname.startsWith("/liga-u-pass");
          const Icon = tab.icon;
          return (
            <li key={tab.id}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className="flex min-h-11 touch-manipulation flex-col items-center justify-center gap-1 px-1 pt-2 pb-1.5 text-zinc-400 transition-colors duration-150"
              >
                <span
                  className={cn(
                    "inline-flex h-8 min-w-11 items-center justify-center rounded-full px-3 transition-colors duration-150",
                    active && "bg-[#BA0C2F] text-white shadow-[0_0_18px_rgba(186,12,47,0.35)]",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                </span>
                <span
                  className={cn(
                    "max-w-full px-0.5 text-center text-[10px] leading-tight font-medium",
                    active && "text-[#BA0C2F]",
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
