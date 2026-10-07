export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Cargando universidades"
      className="mx-auto max-w-6xl animate-pulse overflow-x-clip px-4 py-6 md:py-10"
    >
      <div className="h-3 w-28 rounded-full bg-zinc-200/80" />
      <div className="mt-3 h-10 w-64 rounded-2xl bg-zinc-200/70" />
      <div className="mt-6 flex justify-center">
        <div className="aspect-[3/4] w-[82vw] rounded-[2rem] bg-zinc-200/70 sm:w-[60vw] md:aspect-[16/11] lg:w-[38rem]" />
      </div>
      <div className="mt-5 flex gap-2">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="size-12 shrink-0 rounded-2xl bg-zinc-200/70" />
        ))}
      </div>
    </main>
  );
}
