import { cn } from "@/lib/utils";

export function GlowBorder({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-md p-px", className)}>
      <div className="pointer-events-none absolute inset-[-40%] animate-ligau-glow bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#e2e8f0_14%,transparent_28%,#c8102e_52%,transparent_70%)] opacity-80" />
      <div className="relative h-full carbon-fiber [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]">
        {children}
      </div>
    </div>
  );
}
