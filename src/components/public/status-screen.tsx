import type { ReactNode } from "react";
import { LigaULogo } from "@/components/public/brand";

/** Full-page message for 404 and error states, in the light Liga U style. */
export function StatusScreen({
  code,
  kicker,
  title,
  text,
  children,
}: {
  code: string;
  kicker: string;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <main className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-white px-6 py-16 text-center">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [background-image:linear-gradient(rgba(9,9,11,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(9,9,11,0.045)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_50%_45%,black_20%,transparent_70%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 -translate-1/2 bg-[linear-gradient(180deg,rgba(200,16,46,0.14),rgba(200,16,46,0))] bg-clip-text text-[38vw] leading-none font-black tracking-[-0.06em] text-transparent select-none md:text-[22rem]"
      >
        {code}
      </span>
      <LigaULogo className="h-16 w-auto" />
      <p className="mt-8 text-[11px] font-bold tracking-[0.32em] text-brand-red uppercase">{kicker}</p>
      <h1 className="mt-3 max-w-md text-[30px] leading-[1.1] font-semibold tracking-[-0.022em] text-zinc-950 md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-sm text-[16px] leading-[1.5] text-zinc-500">{text}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>
    </main>
  );
}

export const STATUS_PRIMARY =
  "inline-flex min-h-12 items-center rounded-full bg-brand-red px-6 text-[15px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(200,16,46,0.8)] transition-colors hover:bg-brand-red-dark";
export const STATUS_SECONDARY =
  "inline-flex min-h-12 items-center rounded-full bg-white px-6 text-[15px] font-semibold text-zinc-800 ring-1 ring-zinc-200 transition-colors hover:bg-zinc-50";
