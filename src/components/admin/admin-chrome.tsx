import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const adminLaserCtaClass =
  "h-11 border-0 bg-linear-to-r from-red-600 to-rose-800 px-6 text-white shadow-[0_0_25px_rgba(200,16,46,0.35)] hover:from-red-500 hover:to-rose-700";

export const adminGhostIconClass =
  "text-zinc-500 transition-colors hover:bg-transparent hover:text-red-500";

export const adminPanelClass =
  "border-zinc-800/80 bg-zinc-950 shadow-none";

export function AdminPageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#C8102E]">
          {kicker}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">{title}</h1>
        <p className="mt-1 text-sm text-zinc-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function AdminEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-zinc-500/45 bg-zinc-950/40 px-6 py-16 text-center shadow-[0_0_30px_rgba(200,16,46,0.15)]">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C8102E]/15 blur-3xl"
      />
      <div className="relative mx-auto mb-4 grid size-16 place-items-center text-zinc-500 opacity-20">
        {icon}
      </div>
      <h3 className="relative text-lg font-semibold tracking-tight text-zinc-100">{title}</h3>
      <p className="relative mx-auto mt-2 max-w-md text-sm text-zinc-400">{description}</p>
      <Button type="button" onClick={onAction} className={cn("relative mt-6", adminLaserCtaClass)}>
        <PlusIcon />
        {actionLabel}
      </Button>
    </div>
  );
}
