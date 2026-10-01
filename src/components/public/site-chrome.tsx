"use client";

import Link from "next/link";
import { Suspense, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LigaULogo } from "@/components/public/brand";
import { NAV_TABS, activeTabIndex, tabTransition } from "@/components/public/nav-tabs";
import { cn } from "@/lib/utils";

function DesktopNav({ overlay }: { overlay: boolean }) {
  const current = activeTabIndex(usePathname());

  return (
    <nav
      className={cn(
        "flex items-center gap-1 rounded-full p-1 transition-colors duration-300",
        overlay ? "bg-white/55 ring-1 ring-zinc-900/10 backdrop-blur-md" : "bg-zinc-100",
      )}
    >
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

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/**
 * Mobile has no top bar (the tab bar lives at the bottom), only the logo, which scrolls with the page.
 * On desktop the home hero runs under the header, so it floats transparent until the page scrolls past the top.
 */
export function SiteHeader() {
  const home = usePathname() === "/";
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 24,
    () => false,
  );
  const overlay = home && !scrolled;

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className={cn(
        "top-0 z-40 pt-safe transition-colors duration-300 md:pt-0",
        home ? "absolute inset-x-0 md:fixed" : "relative md:sticky",
        !overlay && "md:border-b md:border-zinc-200/80 md:bg-white/80 md:backdrop-blur-xl",
      )}
    >
      <div className="flex px-4 pt-3 md:hidden">
        <Link href="/" aria-label="Liga U — inicio" className="flex min-h-11 items-center">
          <LigaULogo preload className="h-14 drop-shadow-[0_4px_10px_rgba(9,9,11,0.18)]" />
        </Link>
      </div>
      <div className="mx-auto hidden h-14 max-w-6xl items-center justify-between px-4 md:flex">
        <Link href="/" aria-label="Liga U — inicio" className="flex min-h-11 items-center">
          <LigaULogo className="h-10" />
        </Link>
        <Suspense fallback={<nav className="flex items-center gap-1" />}>
          <DesktopNav overlay={overlay} />
        </Suspense>
      </div>
    </header>
  );
}

/** Replace the WhatsApp number with the league's official line (international format, digits only). */
const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://instagram.com/ligauve",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z",
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@ligauve",
    path: "M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z",
  },
  {
    name: "Facebook",
    href: "https://facebook.com/ligauve",
    path: "M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07Z",
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/584120000000",
    path: "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.89-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.43 9.88-9.88 9.88m8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.94L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.17-1.24-6.16-3.48-8.41",
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-zinc-200 md:mt-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex flex-col items-center gap-2.5 md:flex-row md:gap-3">
          <LigaULogo className="h-12 w-auto md:h-10" />
          <div>
            <p className="font-jersey text-2xl leading-none tracking-wide text-zinc-950 uppercase md:text-xl">Liga U</p>
            <p className="mt-1 text-[13px] text-zinc-500">Venezuela · Torneo universitario oficial</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 md:items-end">
          <ul className="flex items-center gap-2.5">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.name}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Liga U en ${social.name}`}
                  className="grid size-11 place-items-center rounded-full bg-white text-zinc-700 shadow-[0_6px_16px_-10px_rgba(9,9,11,0.4)] ring-1 ring-zinc-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#C8102E] hover:text-white hover:shadow-[0_12px_24px_-12px_rgba(200,16,46,0.8)] hover:ring-[#C8102E]"
                >
                  <svg viewBox="0 0 24 24" aria-hidden className="size-[18px] fill-current">
                    <path d={social.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
          <span className="text-xs tracking-wide text-zinc-400">@ligauve</span>
        </div>
      </div>
    </footer>
  );
}
