import { cn } from "@/lib/utils";

export function LivePulseRadar({
  className,
  label = "EN VIVO",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-emerald-300",
        className,
      )}
    >
      <span className="relative flex size-2.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-80" />
        <span className="relative size-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.95)]" />
      </span>
      {label}
    </span>
  );
}
