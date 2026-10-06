import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { LigaULogo } from "@/components/public/brand";
import { getStaffSession } from "@/lib/admin/session";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage() {
  if (await getStaffSession()) redirect("/admin/partidos");

  return (
    <main className="ligau-admin relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-[#f4c7c5]/60 blur-3xl"
      />
      <Card className="admin-surface relative w-full max-w-md rounded-3xl">
        <CardHeader className="space-y-3 text-center">
          <LigaULogo preload className="mx-auto h-20" />
          <CardTitle className="text-2xl text-zinc-950">Panel de control</CardTitle>
          <CardDescription>
            Ingresa con tu cuenta de Liga U.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
