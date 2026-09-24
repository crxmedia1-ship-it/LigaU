import type { Metadata } from "next";
import { PassCatalog } from "@/components/public/pass-catalog";
import { VipPassCard } from "@/components/public/vip-pass-card";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Liga U Pass",
};

export default async function LigaUPassPage() {
  const { benefits, sponsors } = await getPublicCatalog();

  return (
    <main className="relative mx-auto max-w-6xl px-4 pt-6 pb-24 md:py-10">
      <header className="mb-8">
        <p className="text-[11px] font-semibold tracking-[0.32em] text-[#D4AF37] uppercase">
          Membresía exclusiva
        </p>
        <h1 className="chrome-text mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
          Liga U Pass
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Credencial VIP de beneficios universitarios. Canje web con un toque o validación
          física con CarnetX en caja.
        </p>
        <div className="mt-6">
          <VipPassCard benefitsCount={benefits.length} sponsorsCount={sponsors.length} />
        </div>
      </header>
      <PassCatalog benefits={benefits} />
    </main>
  );
}
