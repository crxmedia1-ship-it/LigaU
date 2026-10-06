import type { Metadata } from "next";
import { NotFoundContent } from "@/components/public/not-found-content";
import { PublicShell } from "@/components/public/public-shell";

export const metadata: Metadata = {
  title: "Página no encontrada · Liga U",
};

export default function NotFound() {
  return (
    <PublicShell>
      <NotFoundContent />
    </PublicShell>
  );
}
