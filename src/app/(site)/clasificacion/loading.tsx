export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Cargando clasificación" className="mx-auto max-w-6xl animate-pulse px-4 pt-5 pb-10">
      <div className="h-9 w-52 rounded-full bg-zinc-200/80" />
      <div className="mt-4 h-11 w-56 rounded-full bg-zinc-200/70" />
      <div className="mt-5 h-48 rounded-[1.9rem] bg-zinc-200/70" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-12 rounded-2xl bg-zinc-200/60" />
        ))}
      </div>
    </main>
  );
}
