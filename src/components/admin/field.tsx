"use client";

import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("grid gap-1.5 text-sm font-medium text-zinc-800", className)}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function NativeSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <span className={cn("relative block w-full", className)}>
      <select
        className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-input bg-white pr-9 pl-3 text-sm text-zinc-900 shadow-[0_1px_2px_rgb(24_24_27/4%)] outline-none transition-colors hover:border-rose-200 focus-visible:border-brand-red/50 focus-visible:ring-3 focus-visible:ring-brand-red/15 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-zinc-400" />
    </span>
  );
}
