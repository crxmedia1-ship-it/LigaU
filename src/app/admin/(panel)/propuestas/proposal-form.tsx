"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckIcon, ExternalLinkIcon, ImageUpIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { deleteProposal, saveProposal, type ProposalDraft } from "@/app/admin/(panel)/propuestas/actions";
import { uploadImageAction } from "@/lib/cloudinary";
import { formatProposalMoney } from "@/lib/proposals/format";
import {
  PROPOSAL_PACKAGES,
  PROPOSAL_STATUSES,
  PROPOSAL_STATUS_LABEL,
  proposalPackage,
  type ProposalPackageId,
} from "@/lib/proposals/master";
import { cloudinaryLogo } from "@/lib/public/media";
import { cn } from "@/lib/utils";

export const EMPTY_PROPOSAL: ProposalDraft = {
  companyName: "",
  logoUrl: "",
  contactName: "",
  note: "",
  packageId: "oficial",
  priceAmount: "8000",
  priceCaption: "Temporada 2026",
  includeUpass: false,
  upassPriceAmount: "",
  validUntil: "",
  status: "draft",
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-zinc-400">{hint}</span> : null}
    </label>
  );
}

export function ProposalForm({
  heading,
  proposalId,
  token,
  initial = EMPTY_PROPOSAL,
}: {
  heading: string;
  proposalId?: string;
  token?: string;
  initial?: ProposalDraft;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [uploading, startUpload] = useTransition();
  const [pending, startTransition] = useTransition();
  const selected = proposalPackage(draft.packageId);
  const logo = cloudinaryLogo(draft.logoUrl, 160) ?? draft.logoUrl;

  function patch(partial: Partial<ProposalDraft>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function choosePackage(id: ProposalPackageId) {
    setDraft((current) => {
      const previous = proposalPackage(current.packageId);
      const next = proposalPackage(id);
      if (!next) return current;
      const untouched = !current.priceAmount || current.priceAmount === String(previous?.suggestedPrice ?? "");
      return {
        ...current,
        packageId: id,
        priceAmount: untouched ? String(next.suggestedPrice) : current.priceAmount,
      };
    });
  }

  function pickLogo(file: File | undefined) {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "banners");
    formData.append("path", "propuestas");
    startUpload(async () => {
      const result = await uploadImageAction(formData);
      if (!result.ok) {
        toast.add({ type: "error", title: "No se pudo subir el logo", description: result.error });
        return;
      }
      patch({ logoUrl: result.secureUrl });
    });
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveProposal({ ...draft, id: proposalId });
      if (!result.ok) {
        toast.add({ type: "error", title: "No se pudo guardar", description: result.error });
        return;
      }
      toast.add({ type: "success", title: proposalId ? "Propuesta actualizada" : "Propuesta creada" });
      if (!proposalId) router.push(`/admin/propuestas/${result.id}`);
      else router.refresh();
    });
  }

  function remove() {
    if (!proposalId || !confirm(`¿Eliminar la propuesta de ${draft.companyName || "esta marca"}? El link deja de abrir.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteProposal(proposalId);
      if (!result.ok) {
        toast.add({ type: "error", title: "No se pudo eliminar", description: result.error });
        return;
      }
      router.push("/admin/propuestas");
    });
  }

  async function copyLink() {
    if (!token) return;
    await navigator.clipboard.writeText(`${window.location.origin}/propuesta/${token}`);
    toast.add({ type: "success", title: "Link copiado" });
  }

  return (
    <form onSubmit={save} className="mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-rose-100">
        <div className="flex items-center justify-between gap-3 border-b border-rose-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-950">{heading}</h1>
            <p className="truncate text-xs text-zinc-400">{selected?.name}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/propuesta/ejemplo"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold ring-1 ring-zinc-200 hover:bg-rose-50"
            >
              <ExternalLinkIcon className="size-3.5" />
              Ver ejemplo
            </Link>
            <Button type="submit" disabled={pending} className={cn("h-9", adminLaserCtaClass)}>
              {pending ? <Loader2Icon className="animate-spin" /> : null}
              {proposalId ? "Guardar" : "Crear"}
            </Button>
          </div>
        </div>

        <div className="space-y-5 px-4 py-4 sm:px-5">
          <Field label="Empresa">
            <Input
              required
              maxLength={80}
              value={draft.companyName}
              onChange={(event) => patch({ companyName: event.target.value })}
              placeholder="Nombre en la portada"
              className="h-11 text-base"
            />
          </Field>

          <div className="flex items-center gap-3">
            <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-zinc-50 ring-1 ring-zinc-200">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" className="max-h-12 max-w-14 object-contain" />
              ) : (
                <span className="text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Logo</span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <label
                className={cn(
                  "relative inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-zinc-950 px-3 text-xs font-semibold text-white",
                  uploading && "pointer-events-none opacity-60",
                )}
              >
                {uploading ? <Loader2Icon className="size-3.5 animate-spin" /> : <ImageUpIcon className="size-3.5" />}
                {uploading ? "Subiendo…" : draft.logoUrl ? "Cambiar logo" : "Subir logo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(event) => pickLogo(event.target.files?.[0])}
                />
              </label>
              {draft.logoUrl ? (
                <button type="button" className="text-xs font-semibold text-zinc-400 hover:text-brand-red" onClick={() => patch({ logoUrl: "" })}>
                  Quitar
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-800">Paquete</p>
            <div className="grid grid-cols-2 gap-2">
              {PROPOSAL_PACKAGES.map((item) => {
                const active = draft.packageId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => choosePackage(item.id)}
                      className={cn(
                      "rounded-2xl px-3 py-2.5 text-left ring-1 transition-colors",
                      active ? "bg-zinc-950 text-white ring-zinc-950" : "bg-zinc-50 text-zinc-950 ring-zinc-200 hover:ring-rose-200",
                    )}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm leading-tight font-semibold">{item.name}</span>
                      {active ? <CheckIcon className="size-3.5 shrink-0" /> : null}
                    </span>
                    <span className={cn("mt-2 block text-xs", active ? "text-white/55" : "text-zinc-400")}>
                      {formatProposalMoney(item.suggestedPrice)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
            <Field label="Precio USD">
              <Input
                required
                inputMode="numeric"
                value={draft.priceAmount}
                onChange={(event) => patch({ priceAmount: event.target.value.replace(/[^\d]/g, "") })}
                className="h-11 text-base"
              />
            </Field>
            <Field label="Leyenda">
              <Input
                value={draft.priceCaption}
                maxLength={60}
                onChange={(event) => patch({ priceCaption: event.target.value })}
                className="h-11"
              />
            </Field>
          </div>

          <div className="rounded-2xl bg-[#fffaf0] p-3 ring-1 ring-[#ead9a4]">
            <button
              type="button"
              aria-pressed={draft.includeUpass}
              onClick={() => {
                const next = !draft.includeUpass;
                patch({ includeUpass: next });
              }}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span>
                <span className="block text-sm font-semibold text-zinc-950">U Pass</span>
                <span className="block text-xs text-zinc-500">
                  {draft.includeUpass ? "Esta marca lo ve en la propuesta" : "Oculto para esta marca"}
                </span>
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase",
                  draft.includeUpass ? "bg-[#9a7420] text-white" : "bg-white text-zinc-400 ring-1 ring-zinc-200",
                )}
              >
                {draft.includeUpass ? "Incluido" : "Fuera"}
              </span>
            </button>
            {draft.includeUpass ? (
              <label className="mt-3 grid gap-1 text-xs font-medium text-zinc-600">
                Precio aparte, si no va dentro del de arriba
                <Input
                  inputMode="numeric"
                  value={draft.upassPriceAmount}
                  onChange={(event) => patch({ upassPriceAmount: event.target.value.replace(/[^\d]/g, "") })}
                  placeholder="Vacío = incluido"
                  className="h-10 bg-white"
                />
              </label>
            ) : null}
          </div>

          <Field label="Nota en la portada">
            <Textarea
              value={draft.note}
              maxLength={400}
              onChange={(event) => patch({ note: event.target.value })}
              placeholder="Una línea solo para esta empresa"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="A la atención de">
              <Input
                value={draft.contactName}
                maxLength={80}
                onChange={(event) => patch({ contactName: event.target.value })}
                placeholder="Quien recibe"
                className="h-10"
              />
            </Field>
            <Field label="Vigente hasta">
              <Input
                type="date"
                value={draft.validUntil}
                onChange={(event) => patch({ validUntil: event.target.value })}
                className="h-10"
              />
            </Field>
          </div>

          <Field label="Estado interno">
            <select
              value={draft.status}
              onChange={(event) => patch({ status: event.target.value })}
              className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              {PROPOSAL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {PROPOSAL_STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-rose-100 bg-white px-4 py-3 sm:px-5">
          {token ? (
            <>
              <a
                href={`/propuesta/${token}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold ring-1 ring-zinc-200 hover:bg-rose-50"
              >
                <ExternalLinkIcon className="size-3.5" />
                Abrir
              </a>
              <Button type="button" variant="outline" className="h-9" onClick={() => void copyLink()}>
                Copiar link
              </Button>
            </>
          ) : (
            <p className="self-center text-xs text-zinc-400">Al crear queda el link para la marca.</p>
          )}
          {proposalId ? (
            <Button type="button" variant="ghost" className="ml-auto h-9 text-brand-red" disabled={pending} onClick={remove}>
              <Trash2Icon />
              Eliminar
            </Button>
          ) : null}
        </div>
    </form>
  );
}
