import { cn } from "@/lib/utils";

export const HALFTONE_RED =
  "[background-image:radial-gradient(rgba(200,16,46,0.55)_1.2px,transparent_1.6px)] [background-size:9px_9px]";
export const HALFTONE_INK =
  "[background-image:radial-gradient(rgba(9,9,11,0.16)_1.2px,transparent_1.6px)] [background-size:9px_9px]";

export function Tag({ children, tone = "red" }: { children: React.ReactNode; tone?: "red" | "ink" | "white" }) {
  return (
    <span
      className={cn(
        "inline-block -skew-x-12 px-3 py-1",
        tone === "red" && "bg-brand-red text-white",
        tone === "ink" && "bg-zinc-950 text-white",
        tone === "white" && "bg-white text-zinc-950",
      )}
    >
      <span className="inline-block skew-x-12 text-[11px] font-black tracking-[0.22em] uppercase">{children}</span>
    </span>
  );
}

export function SectionHeading({ eyebrow, title, light = false }: { eyebrow: string; title: string; light?: boolean }) {
  return (
    <div>
      <Tag tone={light ? "white" : "red"}>{eyebrow}</Tag>
      <h2
        className={cn(
          "font-jersey mt-3 text-5xl leading-[0.85] uppercase sm:text-6xl",
          light
            ? "text-white [text-shadow:3px_3px_0_#C8102E]"
            : "text-zinc-950 [text-shadow:3px_3px_0_rgba(200,16,46,0.28)]",
        )}
      >
        {title}
      </h2>
    </div>
  );
}
