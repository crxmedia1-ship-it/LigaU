import { CalendarDaysIcon, HomeIcon, SparklesIcon, TablePropertiesIcon } from "lucide-react";

export const NAV_TABS = [
  { href: "/", label: "Inicio", icon: HomeIcon, id: "home" },
  { href: "/calendario", label: "Calendario", icon: CalendarDaysIcon, id: "calendario" },
  { href: "/clasificacion", label: "Clasificación", icon: TablePropertiesIcon, id: "tabla" },
  { href: "/liga-u-pass", label: "U Pass", icon: SparklesIcon, id: "pass" },
] as const;

export function activeTabIndex(pathname: string) {
  return NAV_TABS.findIndex((tab) => (tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)));
}
