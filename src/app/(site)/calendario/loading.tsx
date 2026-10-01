export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Cargando calendario" className="mx-auto max-w-6xl animate-pulse px-4 pt-5 pb-10">
      <div className="h-9 w-44 rounded-full bg-zinc-200/80" />
      <div className="mt-4 h-11 rounded-full bg-zinc-200/70" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-24 rounded-[1.4rem] bg-zinc-200/70" />
        ))}
      </div>
    </main>
  );
}
