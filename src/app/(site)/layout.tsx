import type { Metadata } from "next";
import { PublicShell } from "@/components/public/public-shell";

export const metadata: Metadata = {
  title: {
    default: "Liga U",
    template: "%s · Liga U",
  },
  description:
    "Portal público del torneo universitario de Caracas: resultados, atletas, podcasts y Liga U Pass.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Liga U",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <PublicShell>{children}</PublicShell>;
}
