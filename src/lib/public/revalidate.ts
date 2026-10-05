import { revalidatePath, updateTag } from "next/cache";

export const PUBLIC_CATALOG_TAG = "public-catalog";

/** Call from admin Server Actions after a write so the cached public pages show it on the next visit. */
export function refreshPublicSite() {
  updateTag(PUBLIC_CATALOG_TAG);
  revalidatePath("/", "layout");
}
