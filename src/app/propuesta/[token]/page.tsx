import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProposalDeck } from "@/components/proposals/proposal-deck";
import { loadProposalDeck } from "@/lib/proposals/load";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const proposal = await loadProposalDeck(token);
  const title = proposal ? `${proposal.companyName} · Propuesta Liga U` : "Propuesta Liga U";
  return {
    title,
    description: proposal
      ? `Propuesta de alianza entre Liga U y ${proposal.companyName} para la temporada 2026.`
      : "Propuesta de alianza Liga U.",
    robots: { index: false, follow: false },
  };
}

export default async function ProposalPage({ params }: PageProps) {
  const { token } = await params;
  const proposal = await loadProposalDeck(token);
  if (!proposal) notFound();
  return <ProposalDeck proposal={proposal} />;
}
