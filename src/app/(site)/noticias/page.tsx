import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cloudinaryImage } from "@/lib/public/media";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Noticias",
};

export const revalidate = 30;

const FALLBACK_COVER = "/news/futbol-campo.webp";

function publishedOn(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default async function NoticiasPage() {
  const { news } = await getPublicCatalog();
  const sorted = [...news].sort(
    (a, b) =>
      Number(b.isFeatured) - Number(a.isFeatured) ||
      +new Date(b.publishedAt ?? 0) - +new Date(a.publishedAt ?? 0),
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      <p className="text-[11px] font-black tracking-[0.18em] text-[#C8102E] uppercase">Crónica y noticias</p>
      <h1 className="font-jersey mt-1 text-[3.5rem] leading-[0.85] text-[#09090B] uppercase sm:text-7xl">
        Noticias
      </h1>

      {sorted.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-zinc-200/80 bg-white p-6 text-sm text-[#71717A]">
          Todavía no hay noticias publicadas.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((item) => {
            const date = publishedOn(item.publishedAt);
            return (
              <li key={item.id}>
                <Link
                  href={`/noticias/${item.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-colors hover:border-[#C8102E]/60"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cloudinaryImage(item.coverImageUrl, 640) || FALLBACK_COVER}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover object-[50%_20%] transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[10px] font-black tracking-wide text-[#C8102E] uppercase">
                      {[item.sportName, item.universityName].filter(Boolean).join(" · ") || "Liga U"}
                    </p>
                    <h2 className="font-jersey mt-1.5 text-3xl leading-[0.92] text-[#09090B] uppercase">
                      {item.title}
                    </h2>
                    {item.excerpt ? (
                      <p className="mt-2 line-clamp-3 text-sm text-[#71717A]">{item.excerpt}</p>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <span className="text-xs text-zinc-400">{date}</span>
                      <span className="inline-flex min-h-11 items-center gap-1 text-xs font-black tracking-wide text-[#C8102E] uppercase">
                        Leer nota
                        <ArrowUpRight className="size-4" strokeWidth={2.5} />
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
