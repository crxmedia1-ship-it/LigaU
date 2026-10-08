import { Bebas_Neue } from "next/font/google";
import { cn } from "@/lib/utils";

const jersey = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jersey",
});

export default function ProposalLayout({ children }: { children: React.ReactNode }) {
  return <div className={cn("font-sans", jersey.variable)}>{children}</div>;
}
