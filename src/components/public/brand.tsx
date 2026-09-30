import Image from "next/image";
import { cn } from "@/lib/utils";

export function LigaULogo({
  className,
  preload,
}: {
  className?: string;
  preload?: boolean;
}) {
  return (
    <Image
      src="/brand/liga-u-logo.svg"
      alt="Liga U"
      width={868}
      height={950}
      preload={preload}
      className={cn("h-auto w-auto select-none", className)}
      draggable={false}
    />
  );
}

export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "glass-card border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md transition-colors duration-150",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function JerseyMark({ number = "U" }: { number?: string }) {
  return (
    <span
      aria-hidden
      className="font-jersey pointer-events-none absolute top-0 right-0 max-w-[120px] overflow-hidden text-[4.5rem] leading-none text-zinc-400 opacity-25 select-none sm:top-auto sm:-right-2 sm:-bottom-6 sm:max-w-[200px] sm:text-[8rem] sm:text-zinc-800 sm:opacity-20"
    >
      {number}
    </span>
  );
}

function TitleGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#BA0C2F]/20 blur-3xl"
    />
  );
}

export function PageKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="relative text-[11px] font-semibold tracking-[0.32em] text-[#BA0C2F] uppercase">
      {children}
    </p>
  );
}

export function PageHero({
  kicker,
  title,
  mark,
  description,
}: {
  kicker: string;
  title: string;
  mark: string;
  description?: string;
}) {
  return (
    <header className="relative mb-8">
      <JerseyMark number={mark} />
      <TitleGlow />
      <PageKicker>{kicker}</PageKicker>
      <h1 className="chrome-text relative mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="relative mt-2 max-w-2xl text-sm text-zinc-600">{description}</p>
      ) : null}
    </header>
  );
}
