import type { UserRole } from "@/lib/auth/roles";

export type AdminNavItem = {
  href: string;
  label: string;
  description: string;
  icon: "calendar" | "users" | "newspaper" | "radio" | "store" | "studio";
  roles: UserRole[];
};

export const ADMIN_NAV: AdminNavItem[] = [
  {
    href: "/admin/partidos",
    label: "Partidos",
    description: "Calendario, resultados y MVP",
    icon: "calendar",
    roles: ["superadmin", "mesa_tecnica"],
  },
  {
    href: "/admin/equipos",
    label: "Equipos / Atletas",
    description: "Universidades, plantillas y rostros",
    icon: "users",
    roles: ["superadmin", "mesa_tecnica"],
  },
  {
    href: "/admin/noticias",
    label: "Noticias",
    description: "Crónicas y publicaciones",
    icon: "newspaper",
    roles: ["superadmin", "mesa_tecnica"],
  },
  {
    href: "/admin/multimedia",
    label: "Multimedia",
    description: "Podcasts y videos oficiales",
    icon: "radio",
    roles: ["superadmin", "mesa_tecnica"],
  },
  {
    href: "/admin/studio",
    label: "Live Studio",
    description: "Constructor visual de MVP, cupones y banners",
    icon: "studio",
    roles: ["superadmin", "mesa_tecnica"],
  },
  {
    href: "/admin/comercial",
    label: "Hub Comercial (Liga U Pass)",
    description: "Patrocinadores, beneficios y métricas",
    icon: "store",
    roles: ["superadmin"],
  },
];
