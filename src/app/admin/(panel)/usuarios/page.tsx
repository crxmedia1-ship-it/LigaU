import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/admin/session";
import { isStaffRole } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { UsuariosBoard, type StaffUser } from "@/app/admin/(panel)/usuarios/usuarios-board";

export default async function AdminUsuariosPage() {
  const staff = await requireSuperadmin();
  if (!staff.ok) redirect("/admin/partidos");

  const admin = createAdminClient();
  const [{ data: list }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("profiles").select("id, full_name, role"),
  ]);

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const users: StaffUser[] = (list?.users ?? [])
    .flatMap((user) => {
      const profile = profileById.get(user.id);
      if (!profile || !isStaffRole(profile.role)) return [];
      return [
        {
          id: user.id,
          email: user.email ?? "",
          fullName: profile.full_name || user.email || "Sin nombre",
          role: profile.role,
          lastSignInAt: user.last_sign_in_at ?? null,
        },
      ];
    })
    .sort((a, b) => a.role.localeCompare(b.role) || a.fullName.localeCompare(b.fullName));

  return <UsuariosBoard users={users} currentUserId={staff.userId} />;
}
