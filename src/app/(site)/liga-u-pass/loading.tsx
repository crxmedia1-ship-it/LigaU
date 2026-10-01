export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Cargando U Pass" className="animate-pulse bg-white px-5 pt-6 pb-12">
      <div className="mx-auto h-7 w-56 rounded-full bg-zinc-200/80" />
      <div className="mx-auto mt-5 h-24 max-w-md rounded-2xl bg-zinc-200/70" />
      <div className="mx-auto mt-8 h-52 max-w-sm rounded-[1.8rem] bg-zinc-200/80" />
      <div className="mx-auto mt-8 h-12 max-w-xs rounded-full bg-zinc-200/70" />
      <div className="mx-auto mt-10 grid max-w-6xl gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-40 rounded-[1.6rem] bg-zinc-200/60" />
        ))}
      </div>
    </main>
  );
}
