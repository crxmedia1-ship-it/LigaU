import { notFound, redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/admin/session";
import { isProposalStatus } from "@/lib/proposals/master";
import { createClient } from "@/lib/supabase/server";
import type { ProposalDraft } from "@/app/admin/(panel)/propuestas/actions";
import { ProposalForm } from "@/app/admin/(panel)/propuestas/proposal-form";

export default async function EditarPropuestaPage({ params }: { params: Promise<{ id: string }> }) {
  const staff = await requireSuperadmin();
  if (!staff.ok) redirect("/admin");
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase.from("sponsor_proposals").select("*").eq("id", id).maybeSingle();
  if (!data || !isProposalStatus(data.status)) notFound();

  const initial: ProposalDraft = {
    companyName: data.company_name,
    logoUrl: data.logo_url ?? "",
    contactName: data.contact_name ?? "",
    note: data.note ?? "",
    packageId: data.package_id,
    priceAmount: String(data.price_amount),
    priceCaption: data.price_caption,
    includeUpass: data.include_upass,
    upassPriceAmount: data.upass_price_amount == null ? "" : String(data.upass_price_amount),
    validUntil: data.valid_until ?? "",
    status: data.status,
  };

  return <ProposalForm heading={data.company_name} proposalId={data.id} token={data.token} initial={initial} />;
}
