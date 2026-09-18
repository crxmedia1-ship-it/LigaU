import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

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
      className="font-jersey pointer-events-none absolute -right-2 -bottom-6 max-w-[200px] overflow-hidden text-[7rem] leading-none text-zinc-800 opacity-20 select-none sm:text-[8rem]"
    >
      {number}
    </span>
  );
}

export function TitleGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#BA0C2F]/20 blur-3xl"
    />
  );
}

export function LaserBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="laser-badge inline-flex max-w-full items-center px-3 py-1 text-[10px] font-semibold whitespace-normal uppercase">
      {children}
    </span>
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
        <p className="relative mt-2 max-w-2xl text-sm text-zinc-400">{description}</p>
      ) : null}
    </header>
  );
}

export function LaserCta({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "btn-liga inline-flex h-11 min-h-11 w-full items-center justify-center gap-2 bg-[#BA0C2F] px-5 text-sm font-semibold text-white sm:w-auto",
        className,
      )}
    >
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
        <ArrowRightIcon className="size-4" />
      </span>
    </Link>
  );
}
