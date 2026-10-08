export type ProposalDeckData = {
  companyName: string;
  logoUrl: string | null;
  contactName: string | null;
  note: string | null;
  packageName: string;
  packageEyebrow: string;
  packagePitch: string;
  deliverables: { title: string; detail: string }[];
  priceAmount: number;
  priceCaption: string;
  includeUpass: boolean;
  upassPriceAmount: number | null;
  upassPoints: { title: string; detail: string }[];
  validUntilLabel: string | null;
};
