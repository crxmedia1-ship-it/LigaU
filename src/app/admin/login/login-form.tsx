"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { isStaffRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";

function authErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirma tu correo antes de entrar al backoffice.";
  }
  return message;
}

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        const message = authErrorMessage(
          error?.message ?? "Revisa tu correo y contraseña.",
        );
        setFormError(message);
        toast.add({
          type: "error",
          title: "No se pudo iniciar sesión",
          description: message,
        });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !isStaffRole(profile?.role)) {
        await supabase.auth.signOut();
        const message = "Esta cuenta no tiene permisos para el backoffice.";
        setFormError(message);
        toast.add({
          type: "error",
          title: "Acceso denegado",
          description: message,
        });
        return;
      }

      toast.add({
        type: "success",
        title: "Sesión iniciada",
        description: "Redirigiendo al panel de Liga U.",
      });
      router.replace("/admin/partidos");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Intenta de nuevo en unos segundos.";
      setFormError(message);
      toast.add({
        type: "error",
        title: "Error de conexión",
        description: message,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Correo
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@correo.com"
          className="h-10"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="h-10"
        />
      </div>
      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="h-10 w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2Icon className="animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar al backoffice"
        )}
      </Button>
    </form>
  );
}
