export const CONTACT_FIELDS = [
  { key: "instagram", label: "Instagram", placeholder: "@marca" },
  { key: "tiktok", label: "TikTok", placeholder: "@marca" },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/marca" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "+58 412 000 0000" },
  { key: "website", label: "Página web", placeholder: "marca.com" },
  { key: "phone", label: "Teléfono", placeholder: "+58 212 000 0000" },
  { key: "email", label: "Correo", placeholder: "hola@marca.com" },
] as const;

export type ContactKey = (typeof CONTACT_FIELDS)[number]["key"];
export type SponsorContact = Partial<Record<ContactKey, string>>;

export function parseContact(value: unknown): SponsorContact {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const contact: SponsorContact = {};
  for (const { key } of CONTACT_FIELDS) {
    const raw = (value as Record<string, unknown>)[key];
    if (typeof raw === "string" && raw.trim()) contact[key] = raw.trim();
  }
  return contact;
}

export function contactHref(key: ContactKey, value: string) {
  const handle = value.replace(/^@/, "");
  const isUrl = /^https?:\/\//i.test(value);
  const digits = value.replace(/[^\d+]/g, "");
  switch (key) {
    case "instagram":
      return isUrl ? value : `https://instagram.com/${handle}`;
    case "tiktok":
      return isUrl ? value : `https://www.tiktok.com/@${handle}`;
    case "facebook":
      return isUrl ? value : `https://${value.includes("facebook.com") ? value : `facebook.com/${handle}`}`;
    case "website":
      return isUrl ? value : `https://${value}`;
    case "whatsapp":
      return `https://wa.me/${digits.replace(/^\+/, "")}`;
    case "phone":
      return `tel:${digits}`;
    case "email":
      return `mailto:${value}`;
  }
}
