import type { Metadata } from "next";
import { PublicShell } from "@/components/public/public-shell";
import { SitePopupModal } from "@/components/public/site-popup";
import { getSitePopup } from "@/lib/public/site-popup";

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

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const popup = await getSitePopup();
  return (
    <PublicShell>
      {children}
      {popup ? <SitePopupModal key={`${popup.id}:${popup.version}`} popup={popup} /> : null}
    </PublicShell>
  );
}
