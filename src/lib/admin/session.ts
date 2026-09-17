import { isStaffRole, isSuperadmin, type StaffRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export type ActionResult<T = undefined> = T extends undefined
  ? { ok: true } | { ok: false; error: string }
  : { ok: true; data: T } | { ok: false; error: string };

export async function requireStaff(): Promise<
  { ok: true; userId: string; role: StaffRole } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;

  if (!userId) {
    return { ok: false, error: "Debes iniciar sesión." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || !isStaffRole(profile.role)) {
    return { ok: false, error: "No tienes permisos de mesa técnica." };
  }

  return { ok: true, userId, role: profile.role };
}

export async function requireSuperadmin() {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  if (!isSuperadmin(staff.role)) {
    return {
      ok: false as const,
      error: "El Hub Comercial es exclusivo de Superadmin.",
    };
  }
  return staff;
}
