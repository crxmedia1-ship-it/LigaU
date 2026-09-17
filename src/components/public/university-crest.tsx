import { cn } from "@/lib/utils";

const SIZE = {
  xs: "max-h-7 max-w-7",
  sm: "max-h-9 max-w-9",
  md: "max-h-12 max-w-12",
  lg: "max-h-16 max-w-16",
  podium: "max-h-24 max-w-24",
  champion: "max-h-32 max-w-32",
} as const;

const GLOW = {
  none: "drop-shadow-md",
  natural: "drop-shadow-xl dark:drop-shadow-[0_5px_15px_rgba(255,255,255,0.15)]",
  gold: "drop-shadow-[0_0_25px_rgba(234,179,8,0.6)]",
} as const;

export function UniversityCrest({
  url,
  label,
  size = "md",
  glow = "none",
  className,
}: {
  url: string | null | undefined;
  label: string;
  size?: keyof typeof SIZE;
  glow?: keyof typeof GLOW;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-visible",
        className,
      )}
    >
      {url ? (
        <img
          src={url}
          alt=""
          className={cn("h-auto w-auto object-contain", SIZE[size], GLOW[glow])}
        />
      ) : (
        <span
          className={cn(
            "inline-flex items-center justify-center text-[10px] font-black tracking-widest text-zinc-500 dark:text-zinc-300",
            SIZE[size],
          )}
        >
          {label.slice(0, 3)}
        </span>
      )}
    </span>
  );
}
