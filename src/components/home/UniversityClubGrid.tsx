import Link from "next/link";
import { SafeLogo } from "@/components/public/safe-logo";
import type { UniversityCard } from "@/lib/public/types";

function markUrl(university: UniversityCard) {
  return university.crestUrl ?? university.mascotUrl ?? university.logoUrl;
}

export function UniversityClubGrid({ universities }: { universities: UniversityCard[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <Link
        href="/universidades"
        className="group relative flex h-[140px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 transition-all hover:border-red-600/70 md:h-[160px]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(39 39 42 / 45%) 1px, transparent 1px), linear-gradient(to bottom, rgb(39 39 42 / 45%) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -bottom-16 h-40 w-40 rounded-full bg-[#BA0C2F]/25 blur-3xl transition-opacity group-hover:bg-[#BA0C2F]/40"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 h-full w-1 bg-[#BA0C2F]"
        />
        <div className="relative z-10">
          <span className="inline-flex bg-[#BA0C2F] px-2 py-0.5 text-[10px] font-black tracking-[0.18em] text-white uppercase shadow-[0_0_18px_rgba(186,12,47,0.55)]">
            Rosters oficiales
          </span>
          <h2 className="mt-2 font-jersey text-2xl tracking-wide text-white uppercase md:text-3xl">
            Plantillas y atletas
          </h2>
        </div>
        <div className="relative z-10 flex items-center gap-2.5 overflow-hidden">
          {universities.map((university) => (
            <SafeLogo
              key={university.id}
              url={markUrl(university)}
              label={university.shortName}
              className="h-7 w-7 shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
            />
          ))}
        </div>
      </Link>
    </section>
  );
}
