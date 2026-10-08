import { createClient } from "@/lib/supabase/server";
import { deckFromFields } from "@/lib/proposals/present";
import type { ProposalDeckData } from "@/lib/proposals/types";

const TOKEN = /^[A-Za-z0-9_-]{16,64}$/;

export async function loadProposalDeck(token: string): Promise<ProposalDeckData | null> {
  if (!TOKEN.test(token)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_sponsor_proposal", { lookup: token });
  const row = data?.[0];
  if (error || !row) return null;
  return deckFromFields({
    companyName: row.company_name,
    logoUrl: row.logo_url,
    contactName: row.contact_name,
    note: row.note,
    packageId: row.package_id,
    priceAmount: row.price_amount,
    priceCaption: row.price_caption,
    includeUpass: row.include_upass,
    upassPriceAmount: row.upass_price_amount,
    validUntil: row.valid_until,
  });
}
