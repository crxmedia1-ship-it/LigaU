import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteCanvas } from "@/components/public/site-canvas";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Liga U",
  description: "Portal deportivo universitario de Caracas",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#eef1f4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className="relative min-h-screen bg-[#eef1f4] text-zinc-900 antialiased">
        <ThemeProvider>
          <SiteCanvas />
          <div className="relative z-10">
            <Toaster>{children}</Toaster>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
