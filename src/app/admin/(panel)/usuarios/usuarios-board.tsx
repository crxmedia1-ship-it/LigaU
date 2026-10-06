"use client";

import { useState, useTransition } from "react";
import {
  CheckIcon,
  CopyIcon,
  KeyRoundIcon,
  RefreshCwIcon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AdminPageHeader, adminLaserCtaClass } from "@/components/admin/admin-chrome";
import { Field } from "@/components/admin/field";
import { roleLabel, type StaffRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import {
  createStaffUser,
  resetStaffPassword,
  revokeStaffAccess,
} from "@/app/admin/(panel)/usuarios/actions";

export type StaffUser = {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
  lastSignInAt: string | null;
};

function generatePassword() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return `${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}!7`;
}

type Credentials = { email: string; password: string; title: string };

export function UsuariosBoard({
  users,
  currentUserId,
}: {
  users: StaffUser[];
  currentUserId: string;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ fullName: "", email: "", password: "" });
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setDraft({ fullName: "", email: "", password: generatePassword() });
    setCreateOpen(true);
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <AdminPageHeader
        kicker="Administración"
        title="Usuarios"
        description="Crea las cuentas de la liga para que entren al panel. Solo el Superadmin puede ver esta sección."
        action={
          <Button type="button" className={adminLaserCtaClass} onClick={openCreate}>
            <UserPlusIcon />
            Nuevo usuario
          </Button>
        }
      />

      <section className="admin-surface overflow-hidden rounded-2xl">
        <div className="flex items-center gap-2 border-b border-rose-100 px-5 py-4">
          <UsersIcon className="size-4 text-brand-red" />
          <h2 className="font-semibold text-zinc-950">Con acceso al panel</h2>
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-[#9e1b28]">
            {users.length}
          </span>
        </div>
        <ul className="divide-y divide-rose-50">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <li
                key={user.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold",
                      user.role === "superadmin"
                        ? "bg-linear-to-br from-[#e0233f] to-[#8a0b20] text-white shadow-[0_6px_16px_-6px_rgba(200,16,46,0.6)]"
                        : "bg-rose-50 text-[#9e1b28] ring-1 ring-rose-100",
                    )}
                  >
                    {user.fullName.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-zinc-950">
                      {user.fullName}
                      {isSelf ? <span className="ml-2 text-xs font-medium text-zinc-400">(tú)</span> : null}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {user.email} ·{" "}
                      {user.lastSignInAt
                        ? `último acceso ${new Date(user.lastSignInAt).toLocaleDateString("es-VE", {
                            day: "numeric",
                            month: "short",
                          })}`
                        : "nunca ha entrado"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex min-h-8 items-center rounded-full px-3 text-xs font-semibold",
                      user.role === "superadmin"
                        ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white"
                        : "bg-rose-50 text-[#9e1b28] ring-1 ring-rose-100",
                    )}
                  >
                    {roleLabel(user.role)}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-rose-100 bg-white text-zinc-600 hover:bg-rose-50 hover:text-brand-red"
                    disabled={pending}
                    onClick={() => {
                      if (!confirm(`¿Generar una contraseña nueva para ${user.fullName}?`)) return;
                      const password = generatePassword();
                      startTransition(async () => {
                        const result = await resetStaffPassword(user.id, password);
                        if (!result.ok) {
                          toast.add({ type: "error", title: "No se pudo cambiar", description: result.error });
                          return;
                        }
                        setCredentials({ email: user.email, password, title: "Contraseña nueva" });
                      });
                    }}
                  >
                    <KeyRoundIcon />
                    Nueva clave
                  </Button>
                  {!isSelf ? (
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      title="Quitar acceso"
                      className="text-zinc-400 hover:bg-rose-50 hover:text-brand-red"
                      disabled={pending}
                      onClick={() => {
                        if (!confirm(`¿Quitar el acceso al panel a ${user.fullName}?`)) return;
                        startTransition(async () => {
                          const result = await revokeStaffAccess(user.id);
                          if (!result.ok) {
                            toast.add({ type: "error", title: "No se pudo quitar", description: result.error });
                            return;
                          }
                          toast.add({ type: "success", title: "Acceso retirado" });
                        });
                      }}
                    >
                      <UserMinusIcon />
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              Se crea como Directivo: ve todo el panel menos Patrocinantes, U Pass y Usuarios. La cuenta queda activa al instante.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await createStaffUser(draft);
                if (!result.ok) {
                  toast.add({ type: "error", title: "No se pudo crear", description: result.error });
                  return;
                }
                setCreateOpen(false);
                setCredentials({
                  email: draft.email.trim().toLowerCase(),
                  password: draft.password,
                  title: `Cuenta creada para ${draft.fullName.trim()}`,
                });
              });
            }}
          >
            <Field label="Nombre">
              <Input
                value={draft.fullName}
                onChange={(event) => setDraft({ ...draft, fullName: event.target.value })}
                placeholder="Ej. María González"
                required
              />
            </Field>
            <Field label="Correo">
              <Input
                type="email"
                value={draft.email}
                onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                placeholder="nombre@ligau.com"
                required
              />
            </Field>
            <Field label="Contraseña">
              <div className="flex gap-2">
                <Input
                  value={draft.password}
                  onChange={(event) => setDraft({ ...draft, password: event.target.value })}
                  minLength={10}
                  required
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Generar otra"
                  onClick={() => setDraft({ ...draft, password: generatePassword() })}
                >
                  <RefreshCwIcon />
                </Button>
              </div>
            </Field>
            <DialogFooter>
              <Button type="submit" disabled={pending} className={adminLaserCtaClass}>
                {pending ? "Creando..." : "Crear usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(credentials)} onOpenChange={(open) => !open && setCredentials(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{credentials?.title}</DialogTitle>
            <DialogDescription>
              Copia estos datos ahora: la contraseña no se vuelve a mostrar.
            </DialogDescription>
          </DialogHeader>
          {credentials ? (
            <div className="grid gap-2">
              <CopyRow label="Panel" value={`${window.location.origin}/admin/login`} />
              <CopyRow label="Correo" value={credentials.email} />
              <CopyRow label="Contraseña" value={credentials.password} mono />
              <CopyRow
                label="Todo junto"
                value={`Panel Liga U: ${window.location.origin}/admin/login\nCorreo: ${credentials.email}\nContraseña: ${credentials.password}`}
                compact
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CopyRow({
  label,
  value,
  mono = false,
  compact = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-white px-3 py-2">
      <span className="w-20 shrink-0 text-xs font-medium text-zinc-500">{label}</span>
      <span className={cn("min-w-0 flex-1 truncate text-sm text-zinc-900", mono && "font-mono")}>
        {compact ? "Mensaje para enviar" : value}
      </span>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className="text-zinc-400 hover:bg-rose-50 hover:text-brand-red"
        onClick={() => {
          void navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <CheckIcon className="text-emerald-600" /> : <CopyIcon />}
      </Button>
    </div>
  );
}
