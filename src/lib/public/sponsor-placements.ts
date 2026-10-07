/** Every place on the public site an official sponsor can hold. Each slot belongs to one sponsor at a time. */
export const SPONSOR_SLOTS = [
  {
    id: "home_flyer",
    page: "Inicio",
    label: "Panel principal",
    hint: "Tarjeta grande en el carrusel de lo destacado",
    format: "home",
  },
  {
    id: "calendar_presenter",
    page: "Calendario",
    label: "Presentado por",
    hint: "Pastilla junto al título (computadora)",
    format: "pill",
  },
  {
    id: "calendar_matchday",
    page: "Calendario",
    label: "Jornada presentada por",
    hint: "Sello sobre el primer día de partidos",
    format: "mark",
  },
  {
    id: "calendar_flyer",
    page: "Calendario",
    label: "Panel del calendario",
    hint: "Tarjeta grande entre los partidos",
    format: "flyer",
  },
  {
    id: "standings_presenter",
    page: "Clasificación",
    label: "Tabla oficial por",
    hint: "Pastilla junto al título (computadora)",
    format: "pill",
  },
  {
    id: "standings_flyer",
    page: "Clasificación",
    label: "Panel de clasificación",
    hint: "Tarjeta grande debajo de la tabla",
    format: "flyer",
  },
] as const;

export type SponsorSlot = (typeof SPONSOR_SLOTS)[number]["id"];
export type SponsorSlotFormat = (typeof SPONSOR_SLOTS)[number]["format"];

const SLOT_IDS = new Set<string>(SPONSOR_SLOTS.map((slot) => slot.id));

export function isSponsorSlot(value: string): value is SponsorSlot {
  return SLOT_IDS.has(value);
}
