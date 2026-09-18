"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/public/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Inicio", id: "home" },
  { href: "/competicion?tab=tabla", label: "Clasificación", id: "tabla" },
  { href: "/competicion", label: "Calendario", id: "calendario" },
  { href: "/liga-u-pass", label: "U Pass", id: "pass" },
] as const;

function DesktopNav() {
  const pathname = usePathname();
  const view = useSearchParams().get("tab");

  return (
    <nav className="flex items-center gap-1">
      {NAV.map((item) => {
        const active =
          item.id === "home"
            ? pathname === "/"
            : item.id === "calendario"
              ? pathname.startsWith("/competicion") && view !== "tabla"
              : item.id === "tabla"
                ? pathname.startsWith("/competicion") && view === "tabla"
                : pathname.startsWith("/liga-u-pass");
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "rounded-sm px-3 py-1.5 text-xs font-semibold tracking-[0.16em] text-zinc-400 uppercase transition-colors duration-150 hover:text-zinc-100",
              active &&
                "border border-[#BA0C2F]/50 bg-[#BA0C2F]/10 text-zinc-100",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-zinc-800 bg-[#09090B]/80 backdrop-blur-xl md:block dark:border-zinc-800 dark:bg-[#09090B]/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex min-h-11 items-center gap-2">
          <span
            className="grid size-8 place-items-center bg-[#BA0C2F] text-xs font-black text-white"
            style={{
              clipPath:
                "polygon(18% 0, 100% 0, 100% 82%, 82% 100%, 0 100%, 0 18%)",
            }}
          >
            U
          </span>
          <span className="font-semibold tracking-[0.18em] uppercase">Liga U</span>
        </Link>
        <Suspense fallback={<nav className="flex items-center gap-1" />}>
          <DesktopNav />
        </Suspense>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-zinc-800 md:mt-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <p>Liga U · Caracas · Torneo universitario oficial</p>
        <a
          href="https://instagram.com/ligauve"
          className="inline-flex min-h-11 items-center text-[#BA0C2F] hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          @ligauve
        </a>
      </div>
    </footer>
  );
}
