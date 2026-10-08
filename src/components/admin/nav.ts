import type { UserRole } from "@/lib/auth/roles";

export type AdminNavItem = {
  href: string;
  label: string;
  description: string;
  icon:
    | "calendar"
    | "trophy"
    | "standings"
    | "stats"
    | "users"
    | "newspaper"
    | "shield"
    | "teams"
    | "catalog"
    | "popup"
    | "proposal";
  group: "Competición" | "Contenido" | "Administración";
  roles: UserRole[];
};

export const ADMIN_NAV: AdminNavItem[] = [
  {
    href: "/admin/partidos",
    label: "Partidos",
    description: "Resultados y estadísticas",
    icon: "trophy",
    group: "Competición",
    roles: ["superadmin", "directivo"],
  },
  {
    href: "/admin/calendario",
    label: "Calendario",
    description: "Programar partidos y jornadas",
    icon: "calendar",
    group: "Competición",
    roles: ["superadmin", "directivo"],
  },
  {
    href: "/admin/clasificacion",
    label: "Clasificación",
    description: "Tabla por deporte y rama, calculada con los resultados",
    icon: "standings",
    group: "Competición",
    roles: ["superadmin", "directivo"],
  },
  {
    href: "/admin/inscripciones",
    label: "Equipos",
    description: "Qué universidades compiten en cada deporte",
    icon: "teams",
    group: "Competición",
    roles: ["superadmin", "directivo"],
  },
  {
    href: "/admin/equipos",
    label: "Atletas",
    description: "Plantillas y fotos de jugadores",
    icon: "users",
    group: "Competición",
    roles: ["superadmin", "directivo"],
  },
  {
    href: "/admin/estadisticas",
    label: "Estadísticas",
    description: "Líderes y números por jugador",
    icon: "stats",
    group: "Competición",
    roles: ["superadmin", "directivo"],
  },
  {
    href: "/admin/media",
    label: "Media",
    description: "Noticias, podcast y highlights",
    icon: "newspaper",
    group: "Contenido",
    roles: ["superadmin", "directivo"],
  },
  {
    href: "/admin/popup",
    label: "Pop-up",
    description: "Imagen que aparece al abrir el sitio",
    icon: "popup",
    group: "Contenido",
    roles: ["superadmin", "directivo"],
  },
  {
    href: "/admin/propuestas",
    label: "Propuestas",
    description: "Decks de patrocinio para marcas",
    icon: "proposal",
    group: "Administración",
    roles: ["superadmin"],
  },
  {
    href: "/admin/catalogo",
    label: "Catálogo",
    description: "Universidades, deportes y marcas",
    icon: "catalog",
    group: "Administración",
    roles: ["superadmin", "directivo"],
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    description: "Cuentas con acceso al panel y sus roles",
    icon: "shield",
    group: "Administración",
    roles: ["superadmin"],
  },
];

export function isNavActive(item: AdminNavItem, pathname: string) {
  if (item.href === "/admin") return pathname === "/admin";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
