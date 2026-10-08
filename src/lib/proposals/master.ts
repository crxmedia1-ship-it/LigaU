export const DELIVERABLE_VISUALS = [
  "naming",
  "hero",
  "pill",
  "stamp",
  "panels",
  "ribbon",
  "social",
  "exclusive",
  "seal",
  "content",
] as const;
export type DeliverableVisual = (typeof DELIVERABLE_VISUALS)[number];

export const PROPOSAL_PACKAGES = [
  {
    id: "titulo",
    name: "Título de la temporada",
    eyebrow: "Presencia máxima",
    pitch: "La liga se presenta con el nombre de la marca durante toda la temporada.",
    suggestedPrice: 15000,
    deliverables: [
      {
        visual: "naming",
        title: "La temporada lleva el nombre de {marca}",
        detail: "Liga U presentada por {marca} en la comunicación de la temporada.",
      },
      {
        visual: "hero",
        title: "Panel principal del inicio",
        detail: "La primera pieza grande que ve quien abre el sitio.",
      },
      {
        visual: "pill",
        title: "Calendario y clasificación",
        detail: "Pastilla «presentado por» junto al título de las dos secciones.",
      },
      {
        visual: "stamp",
        title: "Sello de la jornada",
        detail: "La marca sobre el primer día de partidos del calendario.",
      },
      {
        visual: "panels",
        title: "Paneles de calendario y clasificación",
        detail: "Las tarjetas grandes entre el contenido de cada página.",
      },
      {
        visual: "ribbon",
        title: "Cinta de patrocinantes",
        detail: "Primer lugar entre las marcas oficiales del sitio.",
      },
      {
        visual: "social",
        title: "Redes @ligauve",
        detail: "Pieza de temporada como marca título en Instagram, TikTok y Facebook.",
      },
    ],
  },
  {
    id: "oficial",
    name: "Patrocinante oficial",
    eyebrow: "Espacio propio",
    pitch: "Un lugar fijo en el sitio y en el grupo de marcas que sostienen la temporada.",
    suggestedPrice: 8000,
    deliverables: [
      {
        visual: "hero",
        title: "Un panel grande",
        detail: "Inicio, calendario o clasificación: la pieza principal de una de esas páginas.",
      },
      {
        visual: "pill",
        title: "Una pastilla «presentado por»",
        detail: "Junto al título del calendario o de la clasificación.",
      },
      {
        visual: "ribbon",
        title: "Cinta de patrocinantes oficiales",
        detail: "El logo de {marca} en la banda de marcas de la liga.",
      },
      {
        visual: "social",
        title: "Mención de temporada",
        detail: "Presencia en las redes @ligauve a lo largo de la temporada.",
      },
    ],
  },
  {
    id: "categoria",
    name: "Marca de categoría",
    eyebrow: "Exclusividad",
    pitch: "Una categoría reservada. El rubro de la marca queda asociado a Liga U esta temporada.",
    suggestedPrice: 4500,
    deliverables: [
      {
        visual: "exclusive",
        title: "Categoría exclusiva",
        detail: "El rubro de {marca} no se comparte con otra marca en este nivel.",
      },
      {
        visual: "ribbon",
        title: "Cinta de patrocinantes oficiales",
        detail: "Logo visible en la banda de marcas de la liga.",
      },
      {
        visual: "panels",
        title: "Un espacio en el sitio",
        detail: "Un panel o una pastilla en inicio, calendario o clasificación.",
      },
      {
        visual: "seal",
        title: "El rubro, asociado a la liga",
        detail: "{marca} aparece como la marca de su categoría en la comunicación de la temporada.",
      },
    ],
  },
  {
    id: "digital",
    name: "Aliado de la liga",
    eyebrow: "Presencia clara",
    pitch: "El logo en el sitio y en la conversación de la temporada, con una inversión más contenida.",
    suggestedPrice: 2000,
    deliverables: [
      {
        visual: "ribbon",
        title: "Cinta de patrocinantes oficiales",
        detail: "El logo de {marca} en la banda de marcas del sitio.",
      },
      {
        visual: "social",
        title: "Redes @ligauve",
        detail: "Menciones durante la temporada en Instagram, TikTok y Facebook.",
      },
      {
        visual: "content",
        title: "Una pieza de contenido",
        detail: "Aparición en una noticia o un highlight de la liga.",
      },
    ],
  },
] as const;

export type ProposalPackageId = (typeof PROPOSAL_PACKAGES)[number]["id"];
export type ProposalPackage = (typeof PROPOSAL_PACKAGES)[number];

export const PROPOSAL_STATUSES = ["draft", "sent", "accepted", "archived"] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const PROPOSAL_STATUS_LABEL: Record<ProposalStatus, string> = {
  draft: "Borrador",
  sent: "Enviada",
  accepted: "Aceptada",
  archived: "Archivada",
};

export const PROPOSAL_UNIVERSITIES = ["UCV", "UCAB", "UNIMET", "UNE", "USB", "USM", "UAH", "UMA"] as const;

export const PROPOSAL_SPORTS = [
  "Fútbol campo",
  "Futsal",
  "Baloncesto",
  "Voleibol",
  "Voley playa",
  "Rugby",
  "Tenis",
  "Tenis de mesa",
  "Pádel",
  "Ajedrez",
  "eSports",
] as const;

export const UPASS_POINTS = [
  {
    title: "Un beneficio a nombre de {marca}",
    detail: "Descuento, preventa o ventaja publicada dentro del pase.",
  },
  {
    title: "Logo en las marcas del U Pass",
    detail: "La marca entra al reel de aliados que ve la comunidad universitaria.",
  },
  {
    title: "Canje con CarnetX",
    detail: "El estudiante valida el beneficio con su credencial digital.",
  },
  {
    title: "Presencia entre jornadas",
    detail: "La relación sigue abierta cuando se abre el pase, no solo el calendario.",
  },
] as const;

export function isProposalPackageId(value: string): value is ProposalPackageId {
  return PROPOSAL_PACKAGES.some((item) => item.id === value);
}

export function proposalPackage(id: string) {
  return PROPOSAL_PACKAGES.find((item) => item.id === id) ?? null;
}

export function isProposalStatus(value: string): value is ProposalStatus {
  return (PROPOSAL_STATUSES as readonly string[]).includes(value);
}

export function fillMarca(text: string, company: string) {
  return text.replaceAll("{marca}", company);
}
