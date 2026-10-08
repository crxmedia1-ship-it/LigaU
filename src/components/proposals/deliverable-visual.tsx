import { Heart, Lock, MessageCircle, Play, Send } from "lucide-react";
import { LigaULogo } from "@/components/public/brand";
import { Marquee } from "@/components/magic/marquee";
import type { DeliverableVisual } from "@/lib/proposals/master";
import { cn } from "@/lib/utils";

const HALFTONE =
  "[background-image:radial-gradient(rgba(9,9,11,0.12)_1px,transparent_1.4px)] [background-size:8px_8px]";

type Brand = { name: string; logo: string | null };

/** The proposed brand: its logo when there is one, otherwise its name in jersey type. */
function Mark({ brand, className, light = false }: { brand: Brand; className?: string; light?: boolean }) {
  if (brand.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={brand.logo} alt="" className={cn("object-contain", className)} />;
  }
  return (
    <span className={cn("font-jersey leading-none uppercase", light ? "text-white" : "text-zinc-950", className)}>
      {brand.name}
    </span>
  );
}

function Browser({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex h-full flex-col overflow-hidden border-2 border-zinc-950 bg-white", className)}>
      <div className="flex items-center gap-1 border-b-2 border-zinc-950 bg-zinc-100 px-2 py-1">
        <span className="size-1.5 rounded-full bg-brand-red" />
        <span className="size-1.5 rounded-full bg-zinc-400" />
        <span className="size-1.5 rounded-full bg-zinc-300" />
        <span className="ml-2 h-1.5 flex-1 rounded-full bg-zinc-200" />
      </div>
      <div className="relative flex-1 p-2">{children}</div>
    </div>
  );
}

function Lines({ count = 2, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-1", className)}>
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className={cn("h-1.5 rounded-full bg-zinc-200", index === count - 1 && "w-2/3")} />
      ))}
    </div>
  );
}

function Naming({ brand }: { brand: Brand }) {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-zinc-950 px-6">
      <div aria-hidden className="absolute inset-y-0 -right-8 w-1/2 -skew-x-[14deg] bg-brand-red" />
      <div aria-hidden className="absolute inset-y-0 right-[46%] w-3 -skew-x-[14deg] bg-zinc-700" />
      <div className="relative flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-white">
        <span className="grid size-16 place-items-center border-2 border-zinc-950 bg-white p-1.5 shadow-[3px_3px_0_0_#C8102E] sm:size-20">
          <LigaULogo className="h-11 sm:h-14" />
        </span>
        <div className="text-center">
          <p className="text-[10px] font-black tracking-[0.24em] text-white/60 uppercase">Temporada 2026</p>
          <p className="font-jersey text-2xl leading-none sm:text-3xl">Presentada por</p>
        </div>
        <span className="grid h-16 min-w-16 place-items-center border-2 border-zinc-950 bg-white px-3 shadow-[3px_3px_0_0_#09090b] transition duration-300 group-hover:-rotate-3 group-hover:scale-105 sm:h-20">
          <Mark brand={brand} className="max-h-12 max-w-28 text-4xl sm:max-h-14" />
        </span>
      </div>
    </div>
  );
}

function Hero({ brand }: { brand: Brand }) {
  return (
    <Browser>
      <div className="flex h-full flex-col gap-1.5">
        <div className="relative flex flex-1 items-center justify-between overflow-hidden bg-zinc-950 px-3 transition duration-300 group-hover:bg-brand-red">
          <div className="grid gap-1">
            <span className="h-1.5 w-14 rounded-full bg-white/70" />
            <span className="h-1.5 w-9 rounded-full bg-white/40" />
            <span className="mt-1 h-3 w-10 bg-brand-red transition group-hover:bg-zinc-950" />
          </div>
          <span className="grid h-10 min-w-10 place-items-center bg-white px-2">
            <Mark brand={brand} className="max-h-7 max-w-16 text-xl" />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((index) => (
            <span key={index} className="h-5 bg-zinc-100" />
          ))}
        </div>
      </div>
    </Browser>
  );
}

function Pill({ brand }: { brand: Brand }) {
  return (
    <Browser>
      <div className="flex items-center justify-between gap-2">
        <span className="font-jersey text-xl leading-none text-zinc-950">Calendario</span>
        <span className="relative flex items-center gap-1.5 rounded-full border-2 border-zinc-950 bg-white py-0.5 pr-2 pl-2 shadow-[2px_2px_0_0_#C8102E]">
          <span className="absolute -inset-1 animate-ping rounded-full border-2 border-brand-red opacity-30 motion-reduce:animate-none" />
          <span className="text-[7px] font-black tracking-[0.12em] text-zinc-500 uppercase">Presentado por</span>
          <Mark brand={brand} className="max-h-4 max-w-12 text-sm" />
        </span>
      </div>
      <div className="mt-2 grid gap-1">
        {[0, 1, 2].map((index) => (
          <div key={index} className="flex items-center gap-1.5 bg-zinc-50 px-1.5 py-1">
            <span className="size-3 rounded-full bg-zinc-300" />
            <span className="h-1.5 flex-1 rounded-full bg-zinc-200" />
            <span className="font-jersey text-xs leading-none text-zinc-400">
              {index + 1} - {index}
            </span>
            <span className="h-1.5 flex-1 rounded-full bg-zinc-200" />
            <span className="size-3 rounded-full bg-zinc-300" />
          </div>
        ))}
      </div>
    </Browser>
  );
}

function Stamp({ brand }: { brand: Brand }) {
  return (
    <Browser>
      <div className="grid h-full grid-cols-7 grid-rows-2 gap-1">
        {Array.from({ length: 14 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "relative flex items-start justify-end bg-zinc-100 p-0.5 text-[7px] font-bold text-zinc-400",
              index === 2 && "bg-zinc-950 text-white",
            )}
          >
            {index + 1}
            {index === 2 ? (
              <span className="absolute -inset-3 z-10 grid place-items-center rounded-full border-[3px] border-brand-red bg-white/95 px-1 text-brand-red -rotate-12 shadow-[2px_2px_0_0_#09090b] transition duration-300 group-hover:-rotate-3 group-hover:scale-110">
                <Mark brand={brand} className="max-h-6 max-w-9 text-sm" />
              </span>
            ) : null}
          </span>
        ))}
      </div>
    </Browser>
  );
}

function Panels({ brand }: { brand: Brand }) {
  return (
    <Browser>
      <div className="grid h-full grid-rows-[auto_1fr_auto] gap-1.5">
        <Lines />
        <div className="relative flex items-center justify-center overflow-hidden border-2 border-zinc-950 bg-zinc-950 shadow-[2px_2px_0_0_#C8102E] transition duration-300 group-hover:-translate-y-0.5">
          <div aria-hidden className="absolute inset-y-0 -right-4 w-1/3 -skew-x-[14deg] bg-brand-red" />
          <span className="relative grid h-9 min-w-9 place-items-center bg-white px-2">
            <Mark brand={brand} className="max-h-6 max-w-16 text-lg" />
          </span>
        </div>
        <Lines />
      </div>
    </Browser>
  );
}

function Ribbon({ brand }: { brand: Brand }) {
  return (
    <div className={cn("flex h-full flex-col justify-center gap-2 bg-zinc-100", HALFTONE)}>
      <p className="text-center text-[8px] font-black tracking-[0.24em] text-zinc-500 uppercase">Marcas oficiales</p>
      <div className="border-y-2 border-zinc-950 bg-white py-2">
        <Marquee
          duration="18s"
          pauseOnHover={false}
          className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        >
          {[0, 1, 2, 3].map((index) => (
            <span key={index} className="flex shrink-0 items-center gap-6 pr-0">
              <span className="grid h-8 min-w-8 place-items-center border-2 border-brand-red bg-white px-2">
                <Mark brand={brand} className="max-h-5 max-w-14 text-base" />
              </span>
              <span className="h-4 w-12 rounded-sm bg-zinc-200" />
              <span className="h-4 w-9 rounded-sm bg-zinc-200" />
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}

function Social({ brand }: { brand: Brand }) {
  return (
    <div className={cn("flex h-full items-center justify-center bg-zinc-100", HALFTONE)}>
      <div className="w-28 -rotate-3 border-2 border-zinc-950 bg-white shadow-[3px_3px_0_0_#09090b] transition duration-300 group-hover:rotate-0">
        <div className="flex items-center gap-1 px-1.5 py-1">
          <span className="size-3 rounded-full bg-brand-red" />
          <span className="text-[7px] font-black">@ligauve</span>
        </div>
        <div className="relative grid aspect-square place-items-center overflow-hidden bg-zinc-950">
          <div aria-hidden className="absolute inset-y-0 -right-3 w-1/2 -skew-x-[14deg] bg-brand-red" />
          <div className="relative grid justify-items-center gap-1">
            <span className="font-jersey text-sm leading-none text-white">Temporada 2026</span>
            <span className="grid h-8 min-w-8 place-items-center bg-white px-1.5">
              <Mark brand={brand} className="max-h-6 max-w-14 text-base" />
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-1.5 py-1 text-zinc-950">
          <Heart className="size-3 fill-brand-red text-brand-red transition group-hover:scale-125" />
          <MessageCircle className="size-3" />
          <Send className="size-3" />
        </div>
      </div>
    </div>
  );
}

function Exclusive({ brand }: { brand: Brand }) {
  return (
    <div className={cn("flex h-full items-center justify-center gap-3 bg-zinc-100 px-3", HALFTONE)}>
      <span className="h-10 w-12 rotate-6 bg-zinc-300 opacity-60" />
      <div className="relative grid justify-items-center border-2 border-zinc-950 bg-white px-3 py-2 shadow-[3px_3px_0_0_#C8102E] transition duration-300 group-hover:scale-105">
        <span className="absolute -top-3 grid size-6 place-items-center rounded-full border-2 border-zinc-950 bg-brand-red text-white">
          <Lock className="size-3" strokeWidth={3} />
        </span>
        <Mark brand={brand} className="mt-1 max-h-8 max-w-20 text-2xl" />
        <span className="mt-1 text-[7px] font-black tracking-[0.18em] text-brand-red uppercase">Exclusiva</span>
      </div>
      <span className="h-10 w-12 -rotate-6 bg-zinc-300 opacity-60" />
    </div>
  );
}

function Seal({ brand }: { brand: Brand }) {
  return (
    <div className={cn("flex h-full items-center justify-center bg-zinc-100", HALFTONE)}>
      <div className="grid size-28 -rotate-6 place-items-center rounded-full border-[3px] border-zinc-950 bg-brand-red shadow-[3px_3px_0_0_#09090b] transition duration-300 group-hover:rotate-6">
        <div className="grid size-[5.6rem] place-items-center rounded-full border-2 border-dashed border-white/70 text-center">
          <div className="grid justify-items-center gap-1">
            <span className="text-[6px] font-black tracking-[0.2em] text-white uppercase">Marca oficial</span>
            <span className="grid h-7 min-w-7 place-items-center bg-white px-1.5">
              <Mark brand={brand} className="max-h-5 max-w-12 text-sm" />
            </span>
            <span className="font-jersey text-xs leading-none text-white">Liga U 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Content({ brand }: { brand: Brand }) {
  return (
    <Browser>
      <div className="grid h-full grid-cols-[1.2fr_1fr] gap-2">
        <div className="relative grid place-items-center overflow-hidden bg-zinc-950">
          <div aria-hidden className="absolute inset-y-0 -right-3 w-1/2 -skew-x-[14deg] bg-brand-red" />
          <span className="relative grid size-8 place-items-center rounded-full border-2 border-white bg-brand-red text-white transition group-hover:scale-110">
            <Play className="size-3.5 fill-white" />
          </span>
          <span className="absolute bottom-1 left-1 grid h-5 place-items-center bg-white px-1">
            <Mark brand={brand} className="max-h-3.5 max-w-10 text-xs" />
          </span>
        </div>
        <div className="grid content-center gap-1.5">
          <span className="w-fit bg-brand-red px-1 text-[6px] font-black tracking-[0.16em] text-white uppercase">
            Highlight
          </span>
          <Lines count={3} />
        </div>
      </div>
    </Browser>
  );
}

const VISUALS: Record<DeliverableVisual, (props: { brand: Brand }) => React.ReactNode> = {
  naming: Naming,
  hero: Hero,
  pill: Pill,
  stamp: Stamp,
  panels: Panels,
  ribbon: Ribbon,
  social: Social,
  exclusive: Exclusive,
  seal: Seal,
  content: Content,
};

export function DeliverableVisualArt({ visual, brand }: { visual: DeliverableVisual; brand: Brand }) {
  const Visual = VISUALS[visual];
  return <Visual brand={brand} />;
}
