import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/admin/session";
import { formatProposalMoney } from "@/lib/proposals/format";
import { isProposalStatus, proposalPackage } from "@/lib/proposals/master";
import { createClient } from "@/lib/supabase/server";
import { PropuestasBoard, type ProposalListItem } from "@/app/admin/(panel)/propuestas/propuestas-board";

const UPDATED = new Intl.DateTimeFormat("es-VE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Caracas",
});

export default async function PropuestasPage() {
  const staff = await requireSuperadmin();
  if (!staff.ok) redirect("/admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("sponsor_proposals")
    .select("id, token, company_name, logo_url, package_id, price_amount, include_upass, status, updated_at")
    .order("updated_at", { ascending: false });

  const proposals: ProposalListItem[] = (data ?? []).flatMap((row) => {
    const selected = proposalPackage(row.package_id);
    if (!selected || !isProposalStatus(row.status)) return [];
    return [
      {
        id: row.id,
        token: row.token,
        companyName: row.company_name,
        logoUrl: row.logo_url,
        packageName: selected.name,
        priceLabel: formatProposalMoney(row.price_amount),
        includeUpass: row.include_upass,
        status: row.status,
        updatedLabel: UPDATED.format(new Date(row.updated_at)),
      },
    ];
  });

  return <PropuestasBoard proposals={proposals} />;
}
