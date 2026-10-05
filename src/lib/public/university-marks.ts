export type UniversityMarks = {
  crestUrl: string | null;
  mascotUrl: string | null;
};

const SLUGS = ["uah", "ucab", "ucv", "uma", "une", "unimet", "usb", "usm"] as const;

const MASCOT_SLUGS = new Set<string>(["uah", "ucab", "ucv", "uma", "unimet", "usb", "usm"]);

function slugOf(shortName: string) {
  return shortName.trim().toLowerCase();
}

function marksFor(shortName: string): UniversityMarks {
  const slug = slugOf(shortName);
  if (!SLUGS.includes(slug as (typeof SLUGS)[number])) {
    return { crestUrl: null, mascotUrl: null };
  }
  return {
    crestUrl: `/marks/${slug}/crest.svg`,
    mascotUrl: MASCOT_SLUGS.has(slug) ? `/marks/${slug}/mascot.svg` : null,
  };
}

/** Team mark on fixtures and standings. UNE only has an institutional crest. */
export function universityLogoUrl(shortName: string) {
  const marks = marksFor(shortName);
  return marks.mascotUrl ?? marks.crestUrl;
}

export function getUniversityMarks(): Record<string, UniversityMarks> {
  return Object.fromEntries(SLUGS.map((slug) => [slug, marksFor(slug)]));
}

export function applyUniversityMarks(
  shortName: string,
  _logoUrl: string | null,
  marks: Record<string, UniversityMarks> = getUniversityMarks(),
): UniversityMarks {
  return marks[slugOf(shortName)] ?? { crestUrl: null, mascotUrl: null };
}
