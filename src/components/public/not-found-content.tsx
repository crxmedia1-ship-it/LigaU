import Link from "next/link";

const DIGITS = ["4", "0", "4"];

/** Body of the Liga U 404; callers outside the public layout wrap it in PublicShell. */
export function NotFoundContent() {
  return (
    <main className="relative isolate overflow-hidden px-5 pt-10 pb-16 md:pt-20 md:pb-24">
      <div
        aria-hidden
        className="absolute top-24 left-1/2 -z-10 h-72 w-[min(48rem,140%)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(200,16,46,0.16),transparent_68%)] blur-2xl"
      />

      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <div className="relative w-full max-w-[22rem] rounded-[28px] bg-[linear-gradient(180deg,#ffffff_0%,#f4f4f6_100%)] p-4 shadow-[0_30px_60px_-30px_rgba(200,16,46,0.35),0_10px_24px_-14px_rgba(9,9,11,0.18)] ring-1 ring-zinc-200/90 md:max-w-sm">
          <div className="grid grid-cols-3 gap-2 [perspective:600px]">
            {DIGITS.map((digit, index) => (
              <span
                key={index}
                className="animate-ligau-digit font-jersey relative grid aspect-[3/4] place-items-center overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f8_50%,#eeeef1_50%,#f6f6f8_100%)] text-[5.5rem] leading-none text-brand-red shadow-[inset_0_1px_0_#ffffff,0_6px_14px_-8px_rgba(9,9,11,0.25)] ring-1 ring-zinc-200/80 [text-shadow:0_6px_18px_rgba(200,16,46,0.28)] md:text-[6.5rem]"
                style={{ animationDelay: `${120 + index * 140}ms` }}
              >
                {digit}
                <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-zinc-300/80" />
              </span>
            ))}
          </div>
        </div>

        <h1 className="mt-10 text-[30px] leading-[1.1] font-semibold tracking-[-0.022em] text-zinc-950 md:text-5xl">
          Esta jugada no existe.
        </h1>
        <p className="mt-4 max-w-md text-[16px] leading-[1.5] text-zinc-500 md:text-lg">
          El enlace está roto o la página se movió.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-12 items-center rounded-full bg-brand-red px-7 text-[15px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(200,16,46,0.8)] transition-[transform,background-color] hover:bg-brand-red-dark active:scale-[0.97]"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
