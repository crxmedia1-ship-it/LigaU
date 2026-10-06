import type { Database } from "@/types/database.types";

export type UserRole = Database["public"]["Enums"]["user_role"];

/** Only one profile can hold it (unique index in the database). */
const SUPERADMIN_ROLE = "superadmin" as const satisfies UserRole;
const DIRECTIVO_ROLE = "directivo" as const satisfies UserRole;

export const STAFF_ROLES = [SUPERADMIN_ROLE, DIRECTIVO_ROLE] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(role: UserRole | null | undefined): role is StaffRole {
  return role === SUPERADMIN_ROLE || role === DIRECTIVO_ROLE;
}

export function isSuperadmin(role: UserRole | null | undefined): boolean {
  return role === SUPERADMIN_ROLE;
}

export function roleLabel(role: UserRole | null | undefined): string {
  if (role === SUPERADMIN_ROLE) return "Superadmin";
  if (role === DIRECTIVO_ROLE) return "Directivo";
  return "Sin rol";
}
