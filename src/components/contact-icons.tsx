import { GlobeIcon, MailIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import { FacebookGlyph, InstagramGlyph, TiktokGlyph } from "@/components/brand-icons";
import type { ContactKey } from "@/lib/public/pass-contact";

export const CONTACT_ICONS: Record<ContactKey, (props: { className?: string }) => React.ReactNode> = {
  instagram: InstagramGlyph,
  tiktok: TiktokGlyph,
  facebook: FacebookGlyph,
  whatsapp: MessageCircleIcon,
  website: GlobeIcon,
  phone: PhoneIcon,
  email: MailIcon,
};

export const CONTACT_COLORS: Record<ContactKey, string> = {
  instagram: "bg-linear-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white",
  tiktok: "bg-zinc-950 text-white",
  facebook: "bg-[#1877F2] text-white",
  whatsapp: "bg-[#25D366] text-white",
  website: "bg-zinc-800 text-white",
  phone: "bg-[#C8102E] text-white",
  email: "bg-zinc-600 text-white",
};
