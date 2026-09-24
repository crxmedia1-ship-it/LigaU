import type { Metadata } from "next";
import { Suspense } from "react";
import { Bebas_Neue } from "next/font/google";
import { MobileBottomNav } from "@/components/public/mobile-bottom-nav";
import { SiteFooter, SiteHeader } from "@/components/public/site-chrome";
import { cn } from "@/lib/utils";

const jersey = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jersey",
});

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
  return (
    <div
      className={cn(
        "ligau-public min-h-screen overflow-x-hidden bg-transparent text-zinc-900",
        jersey.variable,
      )}
    >
      <SiteHeader />
      <div className="pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        {children}
        <SiteFooter />
      </div>
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
    </div>
  );
}
