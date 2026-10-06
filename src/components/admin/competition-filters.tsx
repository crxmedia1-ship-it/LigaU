"use client";

import type { SportOption } from "@/app/admin/(panel)/partidos/types";
import type { GenderFilter } from "@/lib/admin/stats";
import { SPORT_EMOJI } from "@/lib/admin/sport";
import { cn } from "@/lib/utils";

const GENDERS: { id: GenderFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "male", label: "Masculino" },
  { id: "female", label: "Femenino" },
  { id: "mixed", label: "Mixto" },
];

export function CompetitionFilters({
  sports,
  sportId,
  onSportChange,
  gender,
  onGenderChange,
  availableGenders,
  counts,
  withAll = false,
}: {
  sports: SportOption[];
  sportId: string;
  onSportChange: (id: string) => void;
  gender: GenderFilter;
  onGenderChange: (gender: GenderFilter) => void;
  availableGenders: Set<string>;
  counts?: Map<string, number>;
  withAll?: boolean;
}) {
  const genders = GENDERS.filter((item) => item.id === "all" || availableGenders.has(item.id));
  const options = withAll ? [{ id: "all", name: "Todos", slug: "" }, ...sports] : sports;

  return (
    <div className="rounded-3xl bg-white p-3 shadow-[0_18px_40px_-30px_rgba(200,16,46,0.45)] ring-1 ring-rose-100 sm:p-4">
      <div
        className={cn(
          "grid grid-cols-3 gap-2",
          withAll ? "sm:grid-cols-5 lg:grid-cols-10" : "lg:grid-cols-9",
        )}
      >
        {options.map((sport) => {
          const active = sport.id === sportId;
          const isAll = sport.id === "all";
          const count = counts ? (isAll ? [...counts.values()].reduce((a, b) => a + b, 0) : (counts.get(sport.id) ?? 0)) : null;
          return (
            <button
              key={sport.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSportChange(sport.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1.5 rounded-2xl px-1.5 py-3 text-center transition-all active:scale-[0.97]",
                isAll && "col-span-3 flex-row gap-2 py-2.5 sm:col-span-1 sm:flex-col sm:gap-1.5 sm:py-3",
                active
                  ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white shadow-[0_12px_24px_-14px_rgba(200,16,46,0.9)]"
                  : "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-100 hover:bg-rose-50 hover:ring-rose-200",
              )}
            >
              {count ? (
                <span
                  className={cn(
                    "absolute top-1.5 right-1.5 grid min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold tabular-nums",
                    active ? "bg-white text-brand-red" : "bg-brand-red text-white",
                  )}
                >
                  {count}
                </span>
              ) : null}
              <span className="text-2xl leading-none">{isAll ? "🏆" : (SPORT_EMOJI[sport.slug] ?? "🏅")}</span>
              <span className="text-[12px] leading-tight font-semibold sm:text-[13px]">{sport.name}</span>
            </button>
          );
        })}
      </div>
      {genders.length > 2 ? (
        <div className="mx-auto mt-3 flex w-fit gap-1 rounded-full bg-zinc-100 p-1">
          {genders.map((item) => {
            const active = item.id === gender;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => onGenderChange(item.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-all sm:px-5",
                  active ? "bg-white text-brand-red shadow-sm" : "text-zinc-500 hover:text-zinc-900",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : genders.length === 2 ? (
        <p className="mt-3 text-center text-xs font-semibold tracking-wide text-zinc-500">Categoría {genders[1].label}</p>
      ) : null}
    </div>
  );
}

export function TeamCrest({
  logoUrl,
  label,
  bare = false,
  className,
}: {
  logoUrl: string | null;
  label: string;
  bare?: boolean;
  className?: string;
}) {
  if (bare) {
    return logoUrl ? (
      <img src={logoUrl} alt="" className={cn("size-8 shrink-0 object-contain drop-shadow-sm", className)} />
    ) : (
      <span className={cn("grid size-8 shrink-0 place-items-center text-sm font-black text-[#9e1b28]", className)}>
        {label.slice(0, 4).toUpperCase()}
      </span>
    );
  }
  return logoUrl ? (
    <img src={logoUrl} alt="" className="size-8 shrink-0 rounded-full bg-white object-contain p-0.5 ring-1 ring-rose-100" />
  ) : (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-rose-50 text-[10px] font-bold text-[#9e1b28] ring-1 ring-rose-100">
      {label.slice(0, 3).toUpperCase()}
    </span>
  );
}
