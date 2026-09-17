import { redirect } from "next/navigation";
import { isSuperadmin } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import {
  ComercialBoard,
  type BenefitRow,
  type SponsorRow,
} from "@/app/admin/comercial/comercial-board";

export default async function AdminComercialPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  if (!userId) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!isSuperadmin(profile?.role)) {
    redirect("/admin/partidos");
  }

  const [{ data: sponsors }, { data: benefits }] = await Promise.all([
    supabase
      .from("pass_sponsors")
      .select("id, name, category, location_tag, logo_url, is_active")
      .order("name"),
    supabase
      .from("pass_benefits")
      .select(
        "id, sponsor_id, discount_title, status, redemption_type, promo_code, instructions, external_url, click_count, pass_sponsors(name)",
      )
      .order("created_at", { ascending: false }),
  ]);

  const sponsorRows: SponsorRow[] = (sponsors ?? []).map((sponsor) => ({
    id: sponsor.id,
    name: sponsor.name,
    category: sponsor.category,
    locationTag: sponsor.location_tag,
    logoUrl: sponsor.logo_url,
    isActive: sponsor.is_active,
  }));

  const benefitRows: BenefitRow[] = (benefits ?? []).map((benefit) => {
    const sponsor = Array.isArray(benefit.pass_sponsors)
      ? benefit.pass_sponsors[0]
      : benefit.pass_sponsors;
    return {
      id: benefit.id,
      sponsorId: benefit.sponsor_id,
      sponsorName: sponsor?.name ?? "Sponsor",
      discountTitle: benefit.discount_title,
      status: benefit.status,
      redemptionType: benefit.redemption_type,
      promoCode: benefit.promo_code,
      instructions: benefit.instructions,
      externalUrl: benefit.external_url,
      clickCount: benefit.click_count,
    };
  });

  return <ComercialBoard sponsors={sponsorRows} benefits={benefitRows} />;
}
