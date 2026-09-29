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

/** View-transition type for moving between tabs, so screens slide the way the tab bar moves. */
export function tabTransition(from: number, to: number): string[] | undefined {
  if (from === -1 || from === to) return undefined;
  return [to > from ? "tab-next" : "tab-prev"];
}
