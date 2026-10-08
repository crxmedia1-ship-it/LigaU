"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ExternalLinkIcon, HandshakeIcon, PlusIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { AdminEmptyState, AdminPageHeader, adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { Button } from "@/components/ui/button";
import { deleteProposal } from "@/app/admin/(panel)/propuestas/actions";
import { PROPOSAL_STATUS_LABEL, type ProposalStatus } from "@/lib/proposals/master";
import { cloudinaryLogo } from "@/lib/public/media";
import { cn } from "@/lib/utils";

export type ProposalListItem = {
  id: string;
  token: string;
  companyName: string;
  logoUrl: string | null;
  packageName: string;
  priceLabel: string;
  includeUpass: boolean;
  status: ProposalStatus;
  updatedLabel: string;
};

const TONE: Record<ProposalStatus, string> = {
  draft: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  sent: "bg-sky-50 text-sky-700 ring-sky-200",
  accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  archived: "bg-zinc-100 text-zinc-400 ring-zinc-200",
};

export function PropuestasBoard({ proposals }: { proposals: ProposalListItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function copyLink(token: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/propuesta/${token}`);
    toast.add({ type: "success", title: "Link copiado" });
  }

  function remove(item: ProposalListItem) {
    if (!confirm(`¿Eliminar la propuesta de ${item.companyName}?`)) return;
    startTransition(async () => {
      const result = await deleteProposal(item.id);
      if (!result.ok) {
        toast.add({ type: "error", title: "No se pudo eliminar", description: result.error });
        return;
      }
      toast.add({ type: "success", title: "Propuesta eliminada" });
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <AdminPageHeader
        kicker="Comercial"
        title="Propuestas"
        description="Cada marca recibe el mismo deck de Liga U. Cambian el logo, el paquete, el precio y si entra U Pass."
        action={
          <Link href="/admin/propuestas/nueva" className={cn("inline-flex items-center gap-2 rounded-lg px-4", adminLaserCtaClass)}>
            <PlusIcon className="size-4" />
            Nueva propuesta
          </Link>
        }
      />

      {proposals.length === 0 ? (
        <AdminEmptyState
          icon={<HandshakeIcon className="size-8" />}
          title="Todavía no hay propuestas"
          description="Arma la primera con el nombre de la marca, un paquete y el precio. El link queda listo para enviarlo."
          actionLabel="Nueva propuesta"
          onAction={() => router.push("/admin/propuestas/nueva")}
        />
      ) : (
        <ul className="grid gap-3">
          {proposals.map((item) => {
            const logo = cloudinaryLogo(item.logoUrl, 120) ?? item.logoUrl;
            return (
              <li key={item.id} className="flex flex-col gap-4 rounded-3xl bg-white p-4 ring-1 ring-rose-100 sm:flex-row sm:items-center">
                <Link href={`/admin/propuestas/${item.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-zinc-50 ring-1 ring-zinc-200">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt="" className="max-h-10 max-w-12 object-contain" />
                    ) : (
                      <span className="text-lg font-semibold text-zinc-400">{item.companyName.slice(0, 1)}</span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-base font-semibold text-zinc-950">{item.companyName}</span>
                    <span className="mt-0.5 block truncate text-sm text-zinc-500">
                      {item.packageName} · {item.priceLabel}
                      {item.includeUpass ? " · U Pass" : ""}
                    </span>
                    <span className="mt-1 block text-xs text-zinc-400">Actualizada {item.updatedLabel}</span>
                  </span>
                </Link>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold ring-1", TONE[item.status])}>
                    {PROPOSAL_STATUS_LABEL[item.status]}
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={() => void copyLink(item.token)}>
                    Copiar link
                  </Button>
                  <a
                    href={`/propuesta/${item.token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-7 items-center gap-1 rounded-lg border border-zinc-200 px-2.5 text-[0.8rem] font-medium hover:bg-rose-50"
                  >
                    <ExternalLinkIcon className="size-3.5" />
                    Abrir
                  </a>
                  <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => remove(item)}>
                    Eliminar
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
