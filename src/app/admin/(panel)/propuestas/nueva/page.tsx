import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/admin/session";
import { ProposalForm } from "@/app/admin/(panel)/propuestas/proposal-form";

export default async function NuevaPropuestaPage() {
  const staff = await requireSuperadmin();
  if (!staff.ok) redirect("/admin");

  return <ProposalForm heading="Nueva propuesta" />;
}
