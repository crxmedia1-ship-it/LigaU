export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Cargando inicio" className="mx-auto max-w-6xl animate-pulse px-4 pt-5 pb-10">
      <div className="h-44 rounded-[1.6rem] bg-zinc-200/80" />
      <div className="mt-4 h-28 rounded-[1.4rem] bg-zinc-200/70" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-36 rounded-[1.4rem] bg-zinc-200/70" />
        <div className="h-36 rounded-[1.4rem] bg-zinc-200/70" />
      </div>
      <div className="mt-4 h-24 rounded-[1.4rem] bg-zinc-200/60" />
    </main>
  );
}
