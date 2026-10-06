import type { ReactNode } from "react";
import { Bebas_Neue } from "next/font/google";
import { MobileBottomNav } from "@/components/public/mobile-bottom-nav";
import { SiteFooter, SiteHeader } from "@/components/public/site-chrome";
import { cn } from "@/lib/utils";

const jersey = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jersey",
});

/** Header, footer and mobile tab bar of the public site; also wraps the root 404. */
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className={cn("ligau-public min-h-screen overflow-x-clip bg-transparent text-zinc-900", jersey.variable)}>
      <SiteHeader />
      <div className="pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        {children}
        <SiteFooter />
      </div>
      <MobileBottomNav />
    </div>
  );
}
