import type { Metadata } from "next";
import { ProposalDeck } from "@/components/proposals/proposal-deck";
import { exampleProposal } from "@/lib/proposals/present";

export const metadata: Metadata = {
  title: "Atlas · Propuesta Liga U",
  description: "Propuesta de alianza entre Liga U y Atlas para la temporada 2026.",
  robots: { index: false, follow: false },
};

export default function ExampleProposalPage() {
  return <ProposalDeck proposal={exampleProposal()} />;
}