import { cache } from "react";
import { isStaffRole, isSuperadmin, type StaffRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export type ActionResult<T = undefined> = T extends undefined
  ? { ok: true } | { ok: false; error: string }
  : { ok: true; data: T } | { ok: false; error: string };

export type StaffSession = {
  userId: string;
  email: string;
  fullName: string;
  role: StaffRole;
};

/** One claims + profile lookup per request, shared by the layout, pages and actions. */
export const getStaffSession = cache(async (): Promise<StaffSession | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  if (!userId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId)
    .maybeSingle();
  if (!profile || !isStaffRole(profile.role)) return null;

  const email = typeof data?.claims?.email === "string" ? data.claims.email : "";
  return {
    userId,
    email,
    fullName: profile.full_name || email || "Staff Liga U",
    role: profile.role,
  };
});

export async function requireStaff(): Promise<
  { ok: true; userId: string; role: StaffRole } | { ok: false; error: string }
> {
  const session = await getStaffSession();
  if (!session) return { ok: false, error: "No tienes acceso al panel." };
  return { ok: true, userId: session.userId, role: session.role };
}

export async function requireSuperadmin() {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  if (!isSuperadmin(staff.role)) {
    return {
      ok: false as const,
      error: "Esta sección es exclusiva de Superadmin.",
    };
  }
  return staff;
}
