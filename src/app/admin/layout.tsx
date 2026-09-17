import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin/admin-shell";
import { isStaffRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : "";

  if (!userId) {
    return children;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || !isStaffRole(profile.role)) {
    return children;
  }

  const cookieStore = await cookies();
  const collapsed = cookieStore.get("ligau-admin-sidebar")?.value === "1";

  return (
    <AdminShell
      collapsed={collapsed}
      profile={{
        fullName: profile.full_name || email || "Staff Liga U",
        email,
        role: profile.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
