"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { HeaderKickBall } from "@/components/public/header-kick-ball";
import { NAV_TABS, activeTabIndex, tabTransition } from "@/components/public/nav-tabs";
import { cn } from "@/lib/utils";

function DesktopNav() {
  const current = activeTabIndex(usePathname());

  return (
    <nav className="flex items-center gap-1 rounded-full bg-zinc-100 p-1">
      {NAV_TABS.map((item, index) => {
        const active = index === current;
        return (
          <Link
            key={item.id}
            href={item.href}
            transitionTypes={tabTransition(current, index)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-zinc-500 uppercase transition-colors duration-150 hover:text-zinc-900",
              active && "text-white hover:text-white",
            )}
          >
            {active ? (
              <motion.span
                layoutId="desktop-nav-pill"
                transition={{ type: "spring", stiffness: 480, damping: 36 }}
                className="absolute inset-0 rounded-full bg-[#C8102E]"
              />
            ) : null}
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-40 border-b border-zinc-200/80 bg-[#eef1f4] pt-safe md:border-zinc-200/80 md:bg-white/80 md:pt-0 md:backdrop-blur-xl">
      <div className="flex h-12 items-center justify-between px-4 md:hidden">
        <Link href="/" className="flex min-h-11 items-center gap-2">
          <span
            className="grid size-7 place-items-center bg-[#C8102E] text-[11px] font-black text-white"
            style={{
              clipPath:
                "polygon(18% 0, 100% 0, 100% 82%, 82% 100%, 0 100%, 0 18%)",
            }}
          >
            U
          </span>
          <span className="text-sm font-semibold tracking-[0.18em] text-zinc-900 uppercase">
            Liga U
          </span>
        </Link>
        <HeaderKickBall />
      </div>
      <div className="mx-auto hidden h-14 max-w-6xl items-center justify-between px-4 md:flex">
        <Link href="/" className="flex min-h-11 items-center gap-2">
          <span
            className="grid size-8 place-items-center bg-[#C8102E] text-xs font-black text-white"
            style={{
              clipPath:
                "polygon(18% 0, 100% 0, 100% 82%, 82% 100%, 0 100%, 0 18%)",
            }}
          >
            U
          </span>
          <span className="font-semibold tracking-[0.18em] text-zinc-900 uppercase">Liga U</span>
        </Link>
        <Suspense fallback={<nav className="flex items-center gap-1" />}>
          <DesktopNav />
        </Suspense>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-zinc-200 md:mt-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>Liga U · Caracas · Torneo universitario oficial</p>
        <a
          href="https://instagram.com/ligauve"
          className="inline-flex min-h-11 items-center text-[#C8102E] hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          @ligauve
        </a>
      </div>
    </footer>
  );
}
