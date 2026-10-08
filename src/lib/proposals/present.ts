import { formatProposalDate } from "@/lib/proposals/format";
import { fillMarca, proposalPackage, UPASS_POINTS } from "@/lib/proposals/master";
import type { ProposalDeckData } from "@/lib/proposals/types";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function deckFromFields(input: {
  companyName: string;
  logoUrl: string | null;
  contactName: string | null;
  note: string | null;
  packageId: string;
  priceAmount: number;
  priceCaption: string;
  includeUpass: boolean;
  upassPriceAmount: number | null;
  validUntil: string | null;
}): ProposalDeckData | null {
  const selected = proposalPackage(input.packageId);
  const company = input.companyName.trim();
  if (!selected || !company) return null;
  return {
    companyName: company,
    logoUrl: input.logoUrl,
    contactName: input.contactName?.trim() || null,
    note: input.note?.trim() || null,
    packageName: selected.name,
    packageEyebrow: selected.eyebrow,
    packagePitch: fillMarca(selected.pitch, company),
    deliverables: selected.deliverables.map((item) => ({
      visual: item.visual,
      title: fillMarca(item.title, company),
      detail: fillMarca(item.detail, company),
    })),
    priceAmount: input.priceAmount,
    priceCaption: input.priceCaption.trim() || "Temporada 2026",
    includeUpass: input.includeUpass,
    upassPriceAmount: input.includeUpass ? input.upassPriceAmount : null,
    upassPoints: UPASS_POINTS.map((item) => ({
      title: fillMarca(item.title, company),
      detail: fillMarca(item.detail, company),
    })),
    validUntilLabel: input.validUntil && DATE.test(input.validUntil) ? formatProposalDate(input.validUntil) : null,
  };
}

/** Full deck used as the sample a brand would open. Not stored as a client proposal. */
export function exampleProposal(): ProposalDeckData {
  const deck = deckFromFields({
    companyName: "Atlas",
    logoUrl: null,
    contactName: "Dirección comercial",
    note: "Atlas puede ser la marca que nombra la temporada universitaria de Caracas.",
    packageId: "titulo",
    priceAmount: 15000,
    priceCaption: "Temporada 2026",
    includeUpass: true,
    upassPriceAmount: 2500,
    validUntil: "2026-12-15",
  });
  if (!deck) throw new Error("La propuesta de ejemplo no se pudo armar.");
  return deck;
}
