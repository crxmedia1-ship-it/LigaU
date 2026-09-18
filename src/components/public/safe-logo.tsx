"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function SafeLogo({
  url,
  label,
  className,
  fallback = true,
}: {
  url: string | null | undefined;
  label: string;
  className?: string;
  fallback?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    if (!fallback) return null;
    return (
      <span
        className={cn(
          "grid place-items-center font-mono text-[10px] font-black tracking-widest text-zinc-500",
          className,
        )}
      >
        {label.slice(0, 3)}
      </span>
    );
  }
  return (
    <img
      src={url}
      alt=""
      className={cn("object-contain", className)}
      onError={() => setFailed(true)}
    />
  );
}
