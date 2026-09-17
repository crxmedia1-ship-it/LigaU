"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, TrophyIcon, ShieldIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Inicio", icon: HomeIcon },
  { href: "/competicion", label: "Competición", icon: TrophyIcon },
  { href: "/universidades", label: "Universidades", icon: ShieldIcon },
  { href: "/liga-u-pass", label: "Liga U Pass", icon: SparklesIcon },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-zinc-800 bg-zinc-950/90 pb-safe backdrop-blur-xl md:hidden"
    >
      <ul className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
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
                    "text-[10px] leading-none font-medium tracking-wide",
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
