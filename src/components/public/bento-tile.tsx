"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** How long the shatter plays before the route actually changes. */
const SHATTER_MS = 380;

/**
 * "Shattered Pitch Mosaic" tile: an independent glass-shard clipped to a
 * unique polygon on desktop (the caller passes `md:[clip-path:...]`), and a
 * plain rectangular "tactical glass" panel with a clear alternating tilt
 * on mobile (the caller passes `max-md:rotate-[±3deg]` + a slight
 * `translate-x` nudge, reset via `md:rotate-0 md:translate-x-0`). At rest it
 * floats gently (handled by the `animate-ligau-float` class below) —
 * `rotate`, `translate` and the float's `transform` are independent CSS
 * transform properties, so the tilt and the float animation compose without
 * fighting each other. This component exposes `data-breaking` on its root
 * link so the caller's `PhotoLayer` (in `home-bento.tsx`) can crossfade in a
 * real optical-warp duplicate of the photo — that refraction is the actual
 * "cracked glass" cue, not a drawn line. On click, it intercepts the
 * navigation, snaps the warp to full strength + a bright impact flash + a
 * brief haze/blur jolt, and only then pushes the route, so clicking a tile
 * visually breaks the glass before handing off to the page.
 */
export function Tile({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [breaking, setBreaking] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    // Let modifier-key / middle clicks behave normally (new tab, etc.).
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (breaking) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    setBreaking(true);
    timeoutRef.current = setTimeout(() => {
      router.push(href);
    }, SHATTER_MS);
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-disabled={breaking}
      data-breaking={breaking}
      className={cn(
        // Panel base: near-transparent so the photo dominates.
        // backdrop-blur-[2px] creates the faintest edge-frost; no heavy fog.
        "group relative isolate block min-h-[220px] overflow-hidden border border-zinc-300/40 bg-transparent backdrop-blur-[2px] transition-[filter,border-color,rotate,translate] duration-500 ease-out md:min-h-0",
        // Clean drop-shadow that separates the panel from the white canvas
        "[filter:drop-shadow(0_10px_28px_rgba(0,0,0,0.13))_drop-shadow(0_2px_6px_rgba(0,0,0,0.08))]",
        breaking
          ? "pointer-events-none border-[#C8102E]/60 [filter:drop-shadow(0_0_30px_rgba(200,16,46,0.25))]"
          : "hover:border-[#C8102E]/55 hover:[filter:drop-shadow(0_14px_32px_rgba(0,0,0,0.16))_drop-shadow(0_0_18px_rgba(200,16,46,0.13))]",
        className,
      )}
    >
      {/* The whole pane goes hazy/distorted for an instant, as if the glass
          you're looking through just fractured, right before we navigate. */}
      <div
        className={cn(
          "h-full transition-[filter,transform] duration-150 ease-out",
          breaking && "scale-[1.03] blur-[2px] brightness-125 contrast-125",
        )}
      >
        {children}
      </div>
      {/* Crimson flash on click — Liga U burst before route */}
      {breaking ? (
        <div
          aria-hidden
          className="animate-ligau-shatter-flash pointer-events-none absolute inset-0 z-[6] bg-[#C8102E]/15"
        />
      ) : null}
      {/* 1px specular highlight — the only white layer on the panel */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </Link>
  );
}
