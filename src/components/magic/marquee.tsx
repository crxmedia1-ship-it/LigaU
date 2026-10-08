"use client";

import { cn } from "@/lib/utils";

export function Marquee({
  children,
  className,
  duration = "32s",
  pauseOnHover = true,
  reverse = false,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: string;
  pauseOnHover?: boolean;
  reverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden",
        pauseOnHover && "[&:hover_.ligau-marquee-track]:[animation-play-state:paused]",
        className,
      )}
    >
      <div
        className="ligau-marquee-track flex w-max animate-ligau-marquee gap-6"
        style={{ ["--marquee-duration" as string]: duration, animationDirection: reverse ? "reverse" : undefined }}
      >
        <div className="flex gap-6">{children}</div>
        <div className="flex gap-6" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
