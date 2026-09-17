import type { Database } from "@/types/database.types";

export type UserRole = Database["public"]["Enums"]["user_role"];

/** Coordinador de Liga / Mesa Técnica en el enum de Supabase. */
export const COORDINATOR_ROLE = "mesa_tecnica" as const satisfies UserRole;
export const SUPERADMIN_ROLE = "superadmin" as const satisfies UserRole;

export const STAFF_ROLES = [SUPERADMIN_ROLE, COORDINATOR_ROLE] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(role: UserRole | null | undefined): role is StaffRole {
  return role === SUPERADMIN_ROLE || role === COORDINATOR_ROLE;
}

export function isSuperadmin(role: UserRole | null | undefined): boolean {
  return role === SUPERADMIN_ROLE;
}

export function isCoordinator(role: UserRole | null | undefined): boolean {
  return role === COORDINATOR_ROLE;
}

export function roleLabel(role: UserRole | null | undefined): string {
  if (role === SUPERADMIN_ROLE) return "Superadmin";
  if (role === COORDINATOR_ROLE) return "Coordinador";
  return "Sin rol";
}
