export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Cargando universidades" className="mx-auto max-w-6xl animate-pulse px-4 py-6">
      <div className="h-4 w-36 rounded-full bg-zinc-200/80" />
      <div className="mt-3 h-10 w-64 rounded-2xl bg-zinc-200/70" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-56 rounded-2xl bg-zinc-200/70" />
        ))}
      </div>
    </main>
  );
}