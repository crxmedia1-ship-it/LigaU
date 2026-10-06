"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validPassword(password: string) {
  return password.length >= 10;
}

/** New accounts are always Directivo: the database allows a single Superadmin. */
export async function createStaffUser(input: { email: string; fullName: string; password: string }) {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;

  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  if (!EMAIL_RE.test(email)) return { ok: false as const, error: "El correo no es válido." };
  if (!fullName) return { ok: false as const, error: "El nombre es obligatorio." };
  if (!validPassword(input.password)) {
    return { ok: false as const, error: "La contraseña debe tener al menos 10 caracteres." };
  }

  const admin = createAdminClient();
  const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) return { ok: false as const, error: listError.message };

  let userId = list.users.find((user) => user.email?.toLowerCase() === email)?.id;
  if (userId === staff.userId) return { ok: false as const, error: "Ese correo es tu propia cuenta." };
  if (userId) {
    const { error } = await admin.auth.admin.updateUserById(userId, { password: input.password });
    if (error) return { ok: false as const, error: error.message };
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error || !data.user) {
      return { ok: false as const, error: error?.message ?? "No se pudo crear el usuario." };
    }
    userId = data.user.id;
  }

  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id: userId, full_name: fullName, role: "directivo" });
  if (profileError) return { ok: false as const, error: profileError.message };

  revalidatePath("/admin/usuarios");
  return { ok: true as const };
}

export async function resetStaffPassword(userId: string, password: string) {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;
  if (!validPassword(password)) {
    return { ok: false as const, error: "La contraseña debe tener al menos 10 caracteres." };
  }
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function revokeStaffAccess(userId: string) {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;
  if (userId === staff.userId) {
    return { ok: false as const, error: "No puedes quitarte el acceso a ti mismo." };
  }
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ role: null }).eq("id", userId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/usuarios");
  return { ok: true as const };
}
