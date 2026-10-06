"use client";

import { useState, useTransition } from "react";
import { MousePointerClickIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, NativeSelect } from "@/components/admin/field";
import { ImageUploader } from "@/components/admin/image-uploader";
import { PASS_STATUS_LABELS, REDEMPTION_LABELS } from "@/lib/admin/labels";
import {
  deleteBenefit,
  deleteSponsor,
  upsertBenefit,
  upsertSponsor,
} from "@/app/admin/comercial/actions";
import type { Database } from "@/types/database.types";

type PassStatus = Database["public"]["Enums"]["pass_status"];
type RedemptionType = Database["public"]["Enums"]["redemption_type"];

export type SponsorRow = {
  id: string;
  name: string;
  category: string;
  locationTag: string | null;
  logoUrl: string | null;
  isActive: boolean;
};

export type BenefitRow = {
  id: string;
  sponsorId: string;
  sponsorName: string;
  discountTitle: string;
  status: PassStatus;
  redemptionType: RedemptionType;
  promoCode: string | null;
  instructions: string | null;
  externalUrl: string | null;
  clickCount: number;
};

const CMS_STATUSES: PassStatus[] = ["active", "coming_soon", "raffle", "expired"];
const CMS_REDEMPTIONS: RedemptionType[] = [
  "carnetx_scan",
  "promo_code",
  "external_link",
];

function statusBadge(status: PassStatus) {
  if (status === "active") return "default" as const;
  if (status === "expired") return "destructive" as const;
  if (status === "raffle") return "secondary" as const;
  return "outline" as const;
}

export function ComercialBoard({
  sponsors,
  benefits,
}: {
  sponsors: SponsorRow[];
  benefits: BenefitRow[];
}) {
  const totalClicks = benefits.reduce((sum, benefit) => sum + benefit.clickCount, 0);
  const activeBenefits = benefits.filter((benefit) => benefit.status === "active").length;
  const [tab, setTab] = useState("sponsors");
  const [sponsorOpen, setSponsorOpen] = useState(false);
  const [benefitOpen, setBenefitOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [sponsorDraft, setSponsorDraft] = useState({
    id: undefined as string | undefined,
    name: "",
    category: "",
    locationTag: "",
    logoUrl: null as string | null,
    isActive: true,
  });
  const [benefitDraft, setBenefitDraft] = useState({
    id: undefined as string | undefined,
    sponsorId: sponsors[0]?.id ?? "",
    discountTitle: "",
    status: "active" as PassStatus,
    redemptionType: "promo_code" as RedemptionType,
    promoCode: "",
    instructions: "",
    externalUrl: "",
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Superadmin
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Hub comercial · Liga U Pass
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Patrocinadores, beneficios y métricas de interacción. Exclusivo de Superadmin.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Clics acumulados</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <MousePointerClickIcon className="size-6 text-primary" />
              {totalClicks}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Beneficios activos</CardDescription>
            <CardTitle className="text-3xl">{activeBenefits}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Patrocinadores</CardDescription>
            <CardTitle className="text-3xl">{sponsors.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="sponsors">Patrocinadores</TabsTrigger>
            <TabsTrigger value="benefits">Beneficios</TabsTrigger>
          </TabsList>
          {tab === "sponsors" ? (
            <Button
              type="button"
              onClick={() => {
                setSponsorDraft({
                  id: undefined,
                  name: "",
                  category: "",
                  locationTag: "",
                  logoUrl: null,
                  isActive: true,
                });
                setSponsorOpen(true);
              }}
            >
              <PlusIcon />
              Nuevo sponsor
            </Button>
          ) : (
            <Button
              type="button"
              disabled={sponsors.length === 0}
              onClick={() => {
                setBenefitDraft({
                  id: undefined,
                  sponsorId: sponsors[0]?.id ?? "",
                  discountTitle: "",
                  status: "active",
                  redemptionType: "promo_code",
                  promoCode: "",
                  instructions: "",
                  externalUrl: "",
                });
                setBenefitOpen(true);
              }}
            >
              <PlusIcon />
              Nuevo beneficio
            </Button>
          )}
        </div>

        <TabsContent value="sponsors" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sponsor</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sponsors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        Aún no hay patrocinadores. El logo se sube a Cloudinary.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sponsors.map((sponsor) => (
                      <TableRow key={sponsor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {sponsor.logoUrl ? (
                              <img
                                src={sponsor.logoUrl}
                                alt=""
                                className="size-9 rounded-md object-contain ring-1 ring-border"
                              />
                            ) : (
                              <div className="size-9 rounded-md bg-muted" />
                            )}
                            <span className="font-medium">{sponsor.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{sponsor.category}</TableCell>
                        <TableCell>{sponsor.locationTag || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={sponsor.isActive ? "default" : "outline"}>
                            {sponsor.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => {
                                setSponsorDraft({
                                  id: sponsor.id,
                                  name: sponsor.name,
                                  category: sponsor.category,
                                  locationTag: sponsor.locationTag ?? "",
                                  logoUrl: sponsor.logoUrl,
                                  isActive: sponsor.isActive,
                                });
                                setSponsorOpen(true);
                              }}
                            >
                              <PencilIcon />
                            </Button>
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => {
                                if (!confirm("¿Eliminar este patrocinador?")) return;
                                startTransition(async () => {
                                  const result = await deleteSponsor(sponsor.id);
                                  if (!result.ok) {
                                    toast.add({
                                      type: "error",
                                      title: "No se pudo eliminar",
                                      description: result.error,
                                    });
                                  }
                                });
                              }}
                              disabled={pending}
                            >
                              <Trash2Icon />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beneficio</TableHead>
                    <TableHead>Sponsor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Canje</TableHead>
                    <TableHead>Clics</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {benefits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        Crea un beneficio y asígnalo a un patrocinador.
                      </TableCell>
                    </TableRow>
                  ) : (
                    benefits.map((benefit) => (
                      <TableRow key={benefit.id}>
                        <TableCell>
                          <div className="font-medium">{benefit.discountTitle}</div>
                          {benefit.promoCode ? (
                            <div className="text-xs text-muted-foreground">
                              Código: {benefit.promoCode}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell>{benefit.sponsorName}</TableCell>
                        <TableCell>
                          <Badge variant={statusBadge(benefit.status)}>
                            {PASS_STATUS_LABELS[benefit.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {REDEMPTION_LABELS[benefit.redemptionType]}
                        </TableCell>
                        <TableCell>{benefit.clickCount}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => {
                                setBenefitDraft({
                                  id: benefit.id,
                                  sponsorId: benefit.sponsorId,
                                  discountTitle: benefit.discountTitle,
                                  status: benefit.status,
                                  redemptionType: benefit.redemptionType,
                                  promoCode: benefit.promoCode ?? "",
                                  instructions: benefit.instructions ?? "",
                                  externalUrl: benefit.externalUrl ?? "",
                                });
                                setBenefitOpen(true);
                              }}
                            >
                              <PencilIcon />
                            </Button>
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => {
                                if (!confirm("¿Eliminar este beneficio?")) return;
                                startTransition(async () => {
                                  const result = await deleteBenefit(benefit.id);
                                  if (!result.ok) {
                                    toast.add({
                                      type: "error",
                                      title: "No se pudo eliminar",
                                      description: result.error,
                                    });
                                  }
                                });
                              }}
                              disabled={pending}
                            >
                              <Trash2Icon />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={sponsorOpen} onOpenChange={setSponsorOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {sponsorDraft.id ? "Editar patrocinador" : "Nuevo patrocinador"}
            </DialogTitle>
            <DialogDescription>
              Logo firmado a Cloudinary. Solo Superadmin puede mutar esta tabla.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await upsertSponsor(sponsorDraft);
                if (!result.ok) {
                  toast.add({
                    type: "error",
                    title: "No se pudo guardar",
                    description: result.error,
                  });
                  return;
                }
                toast.add({ type: "success", title: "Patrocinador guardado" });
                setSponsorOpen(false);
              });
            }}
          >
            <Field label="Nombre">
              <Input
                value={sponsorDraft.name}
                onChange={(event) =>
                  setSponsorDraft({ ...sponsorDraft, name: event.target.value })
                }
                required
              />
            </Field>
            <Field label="Categoría comercial">
              <Input
                value={sponsorDraft.category}
                onChange={(event) =>
                  setSponsorDraft({ ...sponsorDraft, category: event.target.value })
                }
                placeholder="Alimentos, banca, retail..."
                required
              />
            </Field>
            <Field label="Ubicación">
              <Input
                value={sponsorDraft.locationTag}
                onChange={(event) =>
                  setSponsorDraft({
                    ...sponsorDraft,
                    locationTag: event.target.value,
                  })
                }
                placeholder="Caracas, online, recinto..."
              />
            </Field>
            <Field label="Estado">
              <NativeSelect
                value={sponsorDraft.isActive ? "active" : "inactive"}
                onChange={(event) =>
                  setSponsorDraft({
                    ...sponsorDraft,
                    isActive: event.target.value === "active",
                  })
                }
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </NativeSelect>
            </Field>
            <ImageUploader
              key={sponsorDraft.id ?? "new-sponsor"}
              folder="logo patrocinadores"
              label="Logo"
              initialUrl={sponsorDraft.logoUrl}
              onUploaded={(asset) =>
                setSponsorDraft({ ...sponsorDraft, logoUrl: asset.secureUrl })
              }
            />
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando..." : "Guardar sponsor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={benefitOpen} onOpenChange={setBenefitOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {benefitDraft.id ? "Editar beneficio" : "Nuevo beneficio"}
            </DialogTitle>
            <DialogDescription>
              Asigna el descuento a un sponsor y define cómo se canjea.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await upsertBenefit(benefitDraft);
                if (!result.ok) {
                  toast.add({
                    type: "error",
                    title: "No se pudo guardar",
                    description: result.error,
                  });
                  return;
                }
                toast.add({ type: "success", title: "Beneficio guardado" });
                setBenefitOpen(false);
              });
            }}
          >
            <Field label="Patrocinador">
              <NativeSelect
                value={benefitDraft.sponsorId}
                onChange={(event) =>
                  setBenefitDraft({ ...benefitDraft, sponsorId: event.target.value })
                }
                required
              >
                {sponsors.map((sponsor) => (
                  <option key={sponsor.id} value={sponsor.id}>
                    {sponsor.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Título del descuento">
              <Input
                value={benefitDraft.discountTitle}
                onChange={(event) =>
                  setBenefitDraft({
                    ...benefitDraft,
                    discountTitle: event.target.value,
                  })
                }
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Estado">
                <NativeSelect
                  value={benefitDraft.status}
                  onChange={(event) =>
                    setBenefitDraft({
                      ...benefitDraft,
                      status: event.target.value as PassStatus,
                    })
                  }
                >
                  {CMS_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {PASS_STATUS_LABELS[status]}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Modalidad de canje">
                <NativeSelect
                  value={benefitDraft.redemptionType}
                  onChange={(event) =>
                    setBenefitDraft({
                      ...benefitDraft,
                      redemptionType: event.target.value as RedemptionType,
                    })
                  }
                >
                  {CMS_REDEMPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {REDEMPTION_LABELS[type]}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>
            {benefitDraft.redemptionType === "promo_code" ? (
              <Field label="Código promocional">
                <Input
                  value={benefitDraft.promoCode}
                  onChange={(event) =>
                    setBenefitDraft({
                      ...benefitDraft,
                      promoCode: event.target.value,
                    })
                  }
                />
              </Field>
            ) : null}
            {benefitDraft.redemptionType === "external_link" ? (
              <Field label="Enlace externo">
                <Input
                  type="url"
                  value={benefitDraft.externalUrl}
                  onChange={(event) =>
                    setBenefitDraft({
                      ...benefitDraft,
                      externalUrl: event.target.value,
                    })
                  }
                />
              </Field>
            ) : null}
            <Field label="Instrucciones de canje">
              <Textarea
                value={benefitDraft.instructions}
                onChange={(event) =>
                  setBenefitDraft({
                    ...benefitDraft,
                    instructions: event.target.value,
                  })
                }
              />
            </Field>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando..." : "Guardar beneficio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
