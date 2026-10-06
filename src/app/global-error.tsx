"use client";

import { useEffect } from "react";

/** Replaces the root layout, so it cannot rely on globals.css; styles are inline. */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "grid",
          placeItems: "center",
          background: "#ffffff",
          color: "#09090b",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <title>Liga U</title>
        <main>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.32em", color: "#C8102E", margin: 0 }}>
            TIEMPO MUERTO
          </p>
          <h1 style={{ fontSize: 30, lineHeight: 1.1, margin: "12px 0 0", fontWeight: 600 }}>
            Liga U no está disponible ahora.
          </h1>
          <p style={{ color: "#71717a", maxWidth: 360, margin: "16px auto 0", lineHeight: 1.5 }}>
            Estamos resolviéndolo. Intenta de nuevo en unos segundos.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 28,
              minHeight: 48,
              padding: "0 24px",
              border: 0,
              borderRadius: 999,
              background: "#C8102E",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
