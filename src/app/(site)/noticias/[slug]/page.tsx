import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JerseyMark, PageKicker } from "@/components/public/brand";
import { cloudinaryImage } from "@/lib/public/media";
import { getNewsContent, getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Noticia",
};

export const revalidate = 30;

export function generateStaticParams() {
  return [];
}

export default async function NoticiaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { news } = await getPublicCatalog();
  const item = news.find((entry) => entry.slug === slug);
  if (!item) notFound();
  const content = await getNewsContent(item.id);

  return (
    <main className="relative mx-auto max-w-3xl px-4 py-6 md:py-10">
      <JerseyMark number="01" />
      <PageKicker>
        {item.sportName || "Noticia"} {item.universityName ? `· ${item.universityName}` : ""}
      </PageKicker>
      <h1 className="chrome-text mt-3 text-4xl font-black">{item.title}</h1>
      {item.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cloudinaryImage(item.coverImageUrl, 1200) ?? item.coverImageUrl}
          alt=""
          fetchPriority="high"
          className="mt-6 aspect-[16/10] w-full object-cover object-[50%_20%]"
          style={{
            clipPath:
              "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)",
          }}
        />
      ) : null}
      {item.excerpt ? (
        <p className="mt-6 text-lg text-brand-silver-dim">{item.excerpt}</p>
      ) : null}
      {content ? (
        <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-brand-silver">
          {content}
        </div>
      ) : null}
    </main>
  );
}
