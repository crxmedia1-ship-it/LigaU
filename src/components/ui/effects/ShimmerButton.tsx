import { cn } from "@/lib/utils";

export function ShimmerButton({
  className,
  children,
  variant = "red",
  ...props
}: React.ComponentProps<"button"> & { variant?: "red" | "gold" }) {
  return (
    <button
      className={cn(
        "relative inline-flex h-11 min-h-11 w-full items-center justify-center overflow-hidden rounded-xl px-3 text-sm font-medium",
        variant === "gold"
          ? "bg-linear-to-r from-[#D4AF37] to-[#F59E0B] text-zinc-950 shadow-[0_0_22px_rgba(212,175,55,0.28)]"
          : "bg-[#BA0C2F] text-white shadow-[0_0_25px_rgba(186,12,47,0.28)]",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full animate-[ligau-shimmer_1.8s_ease_infinite] bg-linear-to-r from-transparent via-white/40 to-transparent motion-reduce:animate-none" />
      <span className="relative z-10 inline-flex items-center gap-1.5">{children}</span>
    </button>
  );
}
