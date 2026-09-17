"use client";

import { cn } from "@/lib/utils";

export function RefereeCard({
  type,
  className,
}: {
  type: "yellow" | "red";
  className?: string;
}) {
  return (
    <span className={cn("inline-grid size-6 [perspective:600px]", className)}>
      <span className="relative size-6 transition-transform duration-400 [transform-style:preserve-3d] hover:[transform:rotateY(180deg)] active:[transform:rotateY(180deg)] motion-reduce:transition-none">
        <span
          className={cn(
            "absolute inset-0 rounded-[3px] shadow-md [backface-visibility:hidden]",
            type === "yellow" ? "bg-[#F5D76E]" : "bg-[#E74C3C]",
          )}
        />
        <span
          className={cn(
            "absolute inset-0 rounded-[3px] [backface-visibility:hidden] [transform:rotateY(180deg)]",
            type === "yellow" ? "bg-[#C9A227]" : "bg-[#922B21]",
          )}
        />
      </span>
    </span>
  );
}
