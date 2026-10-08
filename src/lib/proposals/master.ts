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
  "jersey-front",
  "jersey-back",
  "activation",
  "medal",
  "posts",
  "featured",
  "gala",
  "nextgen",
] as const;
export type DeliverableVisual = (typeof DELIVERABLE_VISUALS)[number];

export const PROPOSAL_PACKAGE_GROUPS = ["Copa Navidad 2026", "Sitio web"] as const;

export const PROPOSAL_PACKAGES = [
  {
    id: "suma-cum-laudem",
    group: "Copa Navidad 2026",
    name: "Suma Cum Laudem",
    eyebrow: "Copa Navidad · Presencia máxima",
    pitch: "{marca} va al frente de la camiseta, en las medallas y en cada pieza que mueve el torneo.",
    suggestedPrice: 25000,
    caption: "Copa Navidad 2026",
    deliverables: [
      {
        visual: "jersey-front",
        title: "Frente de la camiseta",
        detail: "El logo de {marca} en el pecho de los atletas durante toda la Copa Navidad.",
      },
      {
        visual: "activation",
        title: "Activaciones en las jornadas",
        detail: "Espacio de marca en las sedes, con público de las ocho universidades.",
      },
      {
        visual: "medal",
        title: "Medallas y trofeos",
        detail: "{marca} sube al podio con cada campeón de la Copa.",
      },
      {
        visual: "posts",
        title: "Posts e historias",
        detail: "Calendario, tabla de clasificación y tabla de goleadores con la marca.",
      },
      {
        visual: "featured",
        title: "Publicación destacada en exclusiva",
        detail: "Goleadores, clasificación o MVP: una de las tres queda solo para {marca}.",
      },
      {
        visual: "gala",
        title: "Premio con su nombre en la gala",
        detail: "Una categoría de la Gala de Premiación asociada a {marca}.",
      },
      {
        visual: "nextgen",
        title: "Torneo Next Generation",
        detail: "Activaciones con talentos de 16 a 19 años que llegan a la universidad.",
      },
      {
        visual: "exclusive",
        title: "Exclusividad de categoría",
        detail: "El rubro de {marca} no se comparte con otra marca patrocinante.",
      },
    ],
  },
  {
    id: "cum-laudem",
    group: "Copa Navidad 2026",
    name: "Cum Laudem",
    eyebrow: "Copa Navidad · Espalda de la camiseta",
    pitch: "{marca} viaja en la espalda de los atletas y en la conversación de todo el torneo.",
    suggestedPrice: 15000,
    caption: "Copa Navidad 2026",
    deliverables: [
      {
        visual: "jersey-back",
        title: "Espalda de la camiseta",
        detail: "El logo de {marca} en la parte posterior de las camisetas de los atletas.",
      },
      {
        visual: "activation",
        title: "Activaciones en las jornadas",
        detail: "Espacio de marca en las sedes, con público de las ocho universidades.",
      },
      {
        visual: "posts",
        title: "Posts e historias",
        detail: "Calendario, tabla de clasificación y tabla de goleadores con la marca.",
      },
      {
        visual: "gala",
        title: "Premio con su nombre en la gala",
        detail: "Una categoría de la Gala de Premiación asociada a {marca}.",
      },
      {
        visual: "nextgen",
        title: "Torneo Next Generation",
        detail: "Activaciones con talentos de 16 a 19 años que llegan a la universidad.",
      },
      {
        visual: "exclusive",
        title: "Exclusividad de categoría",
        detail: "El rubro de {marca} no se comparte con otra marca patrocinante.",
      },
    ],
  },
  {
    id: "aprobado",
    group: "Copa Navidad 2026",
    name: "Aprobado",
    eyebrow: "Copa Navidad · Entrada al torneo",
    pitch: "La forma directa de que {marca} esté en las sedes, en las redes y en la gala.",
    suggestedPrice: 5000,
    caption: "Copa Navidad 2026",
    deliverables: [
      {
        visual: "activation",
        title: "Activaciones en las jornadas",
        detail: "Espacio de marca en las sedes, con público de las ocho universidades.",
      },
      {
        visual: "posts",
        title: "Posts e historias",
        detail: "Calendario, tabla de clasificación y tabla de goleadores con la marca.",
      },
      {
        visual: "gala",
        title: "Premio con su nombre en la gala",
        detail: "Una categoría de la Gala de Premiación asociada a {marca}.",
      },
    ],
  },
  {
    id: "titulo",
    group: "Sitio web",
    name: "Título de la temporada",
    eyebrow: "Presencia máxima",
    pitch: "La liga se presenta con el nombre de la marca durante toda la temporada.",
    suggestedPrice: 15000,
    caption: "Temporada 2026",
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
    group: "Sitio web",
    name: "Patrocinante oficial",
    eyebrow: "Espacio propio",
    pitch: "Un lugar fijo en el sitio y en el grupo de marcas que sostienen la temporada.",
    suggestedPrice: 8000,
    caption: "Temporada 2026",
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
    group: "Sitio web",
    name: "Marca de categoría",
    eyebrow: "Exclusividad",
    pitch: "Una categoría reservada. El rubro de la marca queda asociado a Liga U esta temporada.",
    suggestedPrice: 4500,
    caption: "Temporada 2026",
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
    group: "Sitio web",
    name: "Aliado de la liga",
    eyebrow: "Presencia clara",
    pitch: "El logo en el sitio y en la conversación de la temporada, con una inversión más contenida.",
    suggestedPrice: 2000,
    caption: "Temporada 2026",
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
  "Fútbol",
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

export const PROPOSAL_TRIAL_SPORTS = ["Baloncesto 3x3", "Fútbol 7 femenino"] as const;

export const LEAGUE_FACTS = {
  founded: 2016,
  season: "26-27",
  athletesPerTournament: 750,
  socialEvents: 6,
  participation: { male: 70, female: 30 },
} as const;

export const SEASON_TOURNAMENTS = [
  { months: "Oct · Nov · Dic", name: "Copa Navidad", athletes: 700, note: "Abre la temporada", sponsorship: "open" },
  { months: "Ene · Feb", name: "NextGen U", athletes: 650, note: "Talento de 16 a 19 años", sponsorship: null },
  { months: "Mar · Abr", name: "Torneo Apertura", athletes: 750, note: "Temporada regular", sponsorship: "soon" },
  { months: "May · Jun", name: "Torneo Clausura", athletes: 750, note: "Temporada regular", sponsorship: "soon" },
  { months: "Julio", name: "Final absoluta", athletes: null, note: "Campeones U", sponsorship: null },
] as const;

export const COPA_NAVIDAD_DATES = [
  { day: "8", month: "Oct", label: "Rueda de prensa", venue: null },
  { day: "17", month: "Oct", label: "Jornada 1", venue: "UCAB" },
  { day: "24", month: "Oct", label: "Jornada 2", venue: "UNIMET" },
  { day: "31", month: "Oct", label: "Jornada 3", venue: "USM" },
  { day: "7", month: "Nov", label: "Jornada 4", venue: "USB" },
  { day: "14", month: "Nov", label: "Jornada 5", venue: "USM" },
  { day: "21", month: "Nov", label: "Jornada 6", venue: "UNIMET" },
  { day: "28", month: "Nov", label: "Gala deportiva", venue: null },
] as const;

export const SEASON_AXES = [
  {
    title: "Fuera del campus",
    detail: "La competencia llega a clubes e instalaciones aliadas, con más público y más territorio.",
  },
  {
    title: "Más mujeres compitiendo",
    detail: "Dos deportes nuevos en prueba, pensados para seguir subiendo la participación femenina.",
  },
  {
    title: "Inclusión real",
    detail: "Atletas con diversidad funcional compiten en ajedrez y eSports como parte plena de la liga.",
  },
  {
    title: "Torneo Next Generation",
    detail: "Colegios y liceos de 16 a 19 años conectados con la competencia universitaria.",
  },
  {
    title: "Seis eventos sociales",
    detail: "Galas, reuniones de capitanes y entrenadores, Día de la Madre y del Padre U.",
  },
  {
    title: "Más cobertura",
    detail: "Periodistas y creadores de las propias universidades al frente de la narrativa.",
  },
] as const;

export const AUDIENCE_KPIS = [
  { value: "+6.000", label: "Comunidad", detail: "Crecimiento orgánico" },
  { value: "2.0M+", label: "Impresiones al mes", detail: "Pico de temporada" },
  { value: "70%", label: "Formato reels", detail: "El motor del alcance" },
  { value: "55%", label: "Público de 18 a 24", detail: "Universitarios" },
] as const;

/** Monthly impressions in millions, by tournament phase. */
export const REACH_BY_PHASE = [
  { phase: "Pre-temp", value: 0.5 },
  { phase: "Grupos", value: 1.2 },
  { phase: "Playoffs", value: 1.8 },
  { phase: "Final", value: 2.2 },
] as const;

export const AUDIENCE_AGE = [
  { range: "18 a 24", share: 55 },
  { range: "25 a 34", share: 25 },
  { range: "13 a 17", share: 12 },
  { range: "35 o más", share: 8 },
] as const;

export const HIGH_IMPACT_FORMATS = [
  { title: "Reels patrocinados", detail: "Resúmenes, goles de la fecha y lo mejor de cada partido." },
  { title: "Historias interactivas", detail: "Votación del MVP por jornada y cobertura en vivo desde la cancha." },
  { title: "Marca en pantalla", detail: "Integrada en tablas de posiciones y marcadores." },
] as const;

export const WHY_INVEST = [
  {
    title: "Ocho universidades, acceso directo",
    detail: "Un público segmentado y difícil de alcanzar por otros medios.",
  },
  {
    title: "Toda la universidad",
    detail: "El deporte integra a estudiantes, profesores y egresados.",
  },
  {
    title: "Influencers propios",
    detail: "Atletas y creadores que la comunidad ya sigue.",
  },
  {
    title: "Publicidad que no molesta",
    detail: "En el deporte universitario la marca no se percibe como intrusiva.",
  },
] as const;

export const SPONSOR_EXTRAS = [
  "Rueda de prensa de la liga",
  "Campañas digitales con atletas",
  "Redes de los equipos universitarios",
  "Emplazamiento en la vida universitaria",
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
