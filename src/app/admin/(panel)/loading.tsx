export default function AdminLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl animate-pulse space-y-5" aria-busy="true" aria-label="Cargando">
      <div className="h-9 w-48 rounded-xl bg-zinc-200/70" />
      <div className="h-14 rounded-2xl bg-white ring-1 ring-rose-100" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-40 rounded-3xl bg-white ring-1 ring-rose-100" />
        ))}
      </div>
    </div>
  );
}
