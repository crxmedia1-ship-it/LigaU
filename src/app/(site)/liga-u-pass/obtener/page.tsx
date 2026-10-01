import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Obtener U Pass",
};

export default function ObtenerPassPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-[11px] font-semibold tracking-[0.32em] text-[#C8102E] uppercase">Próximamente</p>
      <h1 className="mt-3 text-[28px] leading-[1.1] font-semibold tracking-[-0.022em] text-zinc-950">
        Muy pronto podrás obtener tu U Pass.
      </h1>
      <p className="mt-3 text-[17px] leading-[1.47] tracking-[-0.022em] text-zinc-500">
        Estamos preparando la compra en línea. Mientras tanto, descubre los beneficios de las marcas aliadas.
      </p>
      <Link
        href="/liga-u-pass"
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#C8102E] px-5 text-[15px] font-medium text-white transition-colors hover:bg-[#a50f25]"
      >
        Ver beneficios
      </Link>
    </main>
  );
}
