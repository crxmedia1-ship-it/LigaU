import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getStaffSession } from "@/lib/admin/session";

export default async function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, cookieStore] = await Promise.all([getStaffSession(), cookies()]);
  if (!session) redirect("/admin/login");

  return (
    <AdminShell
      collapsed={cookieStore.get("ligau-admin-sidebar")?.value === "1"}
      profile={{ fullName: session.fullName, email: session.email, role: session.role }}
    >
      {children}
    </AdminShell>
  );
}
