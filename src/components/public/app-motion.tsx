import { cn } from "@/lib/utils";

/** The final number. A counting animation kept the main thread busy right after a tab change. */
export function CountUp({ value, className }: { value: number; className?: string }) {
  return <span className={cn("tabular-nums", className)}>{value}</span>;
}

type Option = { id: string; label: string; badge?: number };

/** iOS-style segmented control. */
export function Segmented({
  options,
  value,
  onChange,
  className,
}: {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("grid auto-cols-fr grid-flow-col rounded-full bg-zinc-200/70 p-1", className)}
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "relative h-9 touch-manipulation rounded-full px-3 text-[13px] font-semibold whitespace-nowrap",
              active ? "bg-white text-zinc-950 shadow-[0_4px_14px_-6px_rgba(15,23,42,0.35)]" : "text-zinc-500 hover:text-zinc-800",
            )}
          >
            <span className="relative inline-flex items-center gap-1.5">
              {option.label}
              {option.badge ? (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#C8102E] px-1 text-[10px] text-white tabular-nums">
                  {option.badge}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
