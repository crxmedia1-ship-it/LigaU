import type { Metadata } from "next";
import { ProposalDeck } from "@/components/proposals/proposal-deck";
import { loadPassLogos } from "@/lib/proposals/load";
import { exampleProposal } from "@/lib/proposals/present";

export const metadata: Metadata = {
  title: "Atlas · Propuesta Liga U",
  description: "Propuesta de alianza entre Liga U y Atlas para la temporada 2026.",
  robots: { index: false, follow: false },
};

export default async function ExampleProposalPage() {
  const proposal = exampleProposal();
  return <ProposalDeck proposal={proposal} passLogos={await loadPassLogos(proposal)} />;
}
