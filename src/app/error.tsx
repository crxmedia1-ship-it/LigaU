"use client";

import { useEffect } from "react";
import Link from "next/link";
import { STATUS_PRIMARY, STATUS_SECONDARY, StatusScreen } from "@/components/public/status-screen";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      code="!"
      kicker="Tiempo muerto"
      title="Algo falló de nuestro lado."
      text="No pudimos cargar esta sección. Intenta de nuevo en unos segundos."
    >
      <button type="button" onClick={() => retry()} className={STATUS_PRIMARY}>
        Reintentar
      </button>
      <Link href="/" className={STATUS_SECONDARY}>
        Ir al inicio
      </Link>
    </StatusScreen>
  );
}
