"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { NAV_TABS, activeTabIndex, tabTransition } from "@/components/public/nav-tabs";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const current = activeTabIndex(pathname);

  return (
    <nav
      aria-label="Navegación principal"
      style={{ viewTransitionName: "bottom-nav" }}
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-zinc-200/80 bg-[#eef1f4]/90 pb-safe backdrop-blur-xl md:hidden"
    >
      <ul className="grid grid-cols-4">
        {NAV_TABS.map((tab, index) => {
          const active = index === current;
          const Icon = tab.icon;
          return (
            <li key={tab.id}>
              <Link
                href={tab.href}
                transitionTypes={tabTransition(current, index)}
                aria-current={active ? "page" : undefined}
                className="flex min-h-11 touch-manipulation flex-col items-center justify-center gap-1 px-1 pt-2 pb-1.5 text-zinc-400 transition-colors duration-150 hover:text-zinc-700 active:scale-95"
              >
                <span className="relative inline-flex h-8 min-w-11 items-center justify-center px-3">
                  {active ? (
                    <motion.span
                      layoutId="bottom-nav-pill"
                      transition={{ type: "spring", stiffness: 480, damping: 36 }}
                      className="absolute inset-0 rounded-full bg-[#BA0C2F] shadow-[0_0_18px_rgba(186,12,47,0.35)]"
                    />
                  ) : null}
                  <Icon className={cn("relative size-5", active && "text-white")} strokeWidth={active ? 2.4 : 1.8} />
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
