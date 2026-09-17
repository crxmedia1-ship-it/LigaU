import type { Metadata } from "next";
import { PageHero } from "@/components/public/brand";
import { PassCatalog } from "@/components/public/pass-catalog";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Liga U Pass",
};

export default async function LigaUPassPage() {
  const { benefits } = await getPublicCatalog();

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-10">
      <PageHero
        kicker="Club de beneficios"
        title="Liga U Pass"
        mark="VIP"
        description="Descuentos para la comunidad universitaria. El canje web copia el código; el canje físico se valida mostrando el carnet digital CarnetX."
      />
      <PassCatalog benefits={benefits} />
    </main>
  );
}
