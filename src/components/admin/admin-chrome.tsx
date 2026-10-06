import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const adminLaserCtaClass =
  "h-11 border-0 bg-linear-to-r from-[#e0233f] to-[#9e1b28] px-6 text-white shadow-[0_12px_28px_-12px_rgba(200,16,46,0.7)] hover:from-brand-red hover:to-[#8a0b20]";

export function AdminPageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div aria-label={kicker}>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">{title}</h1>
        {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
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
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-rose-200 bg-white/70 px-6 py-16 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4c7c5]/50 blur-3xl"
      />
      <div className="relative mx-auto mb-4 grid size-16 place-items-center text-brand-red opacity-40">
        {icon}
      </div>
      <h3 className="relative text-lg font-semibold tracking-tight text-zinc-950">{title}</h3>
      <p className="relative mx-auto mt-2 max-w-md text-sm text-zinc-500">{description}</p>
      <Button type="button" onClick={onAction} className={cn("relative mt-6", adminLaserCtaClass)}>
        <PlusIcon />
        {actionLabel}
      </Button>
    </div>
  );
}
