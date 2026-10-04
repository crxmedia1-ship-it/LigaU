import { redirect } from "next/navigation";

export default async function CompeticionPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const params = await searchParams;
  const tab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  if (tab === "medallero" || tab === "titulos") redirect("/clasificacion?vista=titulos");
  if (tab === "tabla") redirect("/clasificacion");
  redirect("/calendario");
}
