import type { Metadata } from "next";
import { getMemberBenefits } from "@/lib/public/queries";
import { UpassBoard } from "@/app/upass/upass-board";

export const metadata: Metadata = {
  title: "Liga U Pass · Beneficios",
  description: "Todos los beneficios de tu Liga U Pass.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default async function UpassPage() {
  const benefits = await getMemberBenefits();
  return <UpassBoard benefits={benefits} />;
}
