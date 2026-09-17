"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function trackBenefitClick(benefitId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("pass_benefits")
    .select("click_count")
    .eq("id", benefitId)
    .maybeSingle();
  if (!data) return { ok: false as const };
  await admin
    .from("pass_benefits")
    .update({ click_count: data.click_count + 1 })
    .eq("id", benefitId);
  return { ok: true as const };
}
