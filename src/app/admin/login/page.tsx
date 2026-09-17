import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <main className="ligau-admin dark relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(200,16,46,0.18),_transparent_42%)]" />
      <Card className="relative w-full max-w-md border-zinc-800 bg-zinc-950">
        <CardHeader className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Liga U
          </p>
          <CardTitle className="text-2xl">Backoffice</CardTitle>
          <CardDescription>
            Ingresa con tu cuenta de Superadmin o Coordinador de Liga.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
