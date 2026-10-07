"use client";

import { useEffect, useRef } from "react";
import type { AnimatedLogoKey } from "@/lib/public/animated-logos";
import { cn } from "@/lib/utils";

/** Plays the intro once the logo scrolls into view, then lets the idle loop run. */
function usePlayInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.dataset.on = "";
        observer.disconnect();
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/**
 * Each logo is its original SVG split into pieces that share one canvas (`public/sponsors/<key>/`),
 * stacked in paint order. `shine` lays a moving highlight masked by that piece; `bubbles` adds rising fizz.
 */
type Layer = { piece: string; index?: number } | { shine: string } | { bubbles: number };

const LOGOS: Record<AnimatedLogoKey, { name: string; aspect: string; layers: Layer[] }> = {
  cinex: {
    name: "Cinex",
    aspect: "1618/462",
    layers: [{ piece: "word" }, { shine: "word" }, { piece: "star" }],
  },
  gatorade: {
    name: "Gatorade",
    aspect: "1903/2088",
    layers: [{ piece: "g" }, { piece: "bolt" }],
  },
  minalba: {
    name: "Minalba",
    aspect: "3599/993",
    layers: ["m", "i", "n", "a1", "l", "b", "a2", "dot"].map((piece, index) => ({ piece, index })),
  },
  pan: {
    name: "P.A.N",
    aspect: "3210/3033",
    layers: [
      { piece: "badge" },
      ...["p", "dot1", "a", "dot2", "n"].map((piece, index) => ({ piece, index })),
      { piece: "since" },
    ],
  },
  pepsi: {
    name: "Pepsi",
    aspect: "1383/1383",
    layers: [
      { piece: "globe" },
      ...["p1", "e", "p2", "s", "i"].map((piece, index) => ({ piece, index })),
      { bubbles: 7 },
    ],
  },
  champion: {
    name: "Champion",
    aspect: "3763/714",
    layers: [{ piece: "word" }, { piece: "reg" }, { piece: "c" }],
  },
  maltin: {
    name: "Maltín Polar",
    aspect: "4401/2622",
    layers: [{ piece: "word" }, { shine: "word" }, { piece: "badge" }],
  },
  movistar: {
    name: "Movistar",
    aspect: "1208/893",
    layers: [{ piece: "m" }],
  },
};

/** Sized by `--logo-h` (its height when there's room); narrower containers shrink it proportionally. */
export function AnimatedSponsorLogo({ logo, className }: { logo: AnimatedLogoKey; className?: string }) {
  const ref = usePlayInView<HTMLSpanElement>();
  const { name, aspect, layers } = LOGOS[logo];
  const [width, height] = aspect.split("/").map(Number);
  const base = `/sponsors/${logo}`;

  return (
    <span
      ref={ref}
      role="img"
      aria-label={name}
      className={cn(`ligau-logo ligau-logo-${logo} relative block`, className)}
      style={{ aspectRatio: aspect, width: `min(100%, calc(var(--logo-h, 5rem) * ${(width / height).toFixed(4)}))` }}
    >
      {layers.map((layer) => {
        if ("shine" in layer) {
          return (
            <span
              key={`shine-${layer.shine}`}
              aria-hidden
              className={`ligau-logo-shine ligau-${logo}-shine`}
              style={{ maskImage: `url(${base}/${layer.shine}.svg)`, WebkitMaskImage: `url(${base}/${layer.shine}.svg)` }}
            >
              <span />
            </span>
          );
        }
        if ("bubbles" in layer) {
          return (
            <span key="bubbles" aria-hidden className={`ligau-${logo}-bubbles`}>
              {Array.from({ length: layer.bubbles }, (_, index) => (
                <span key={index} style={{ "--i": index } as React.CSSProperties} />
              ))}
            </span>
          );
        }
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={layer.piece}
            src={`${base}/${layer.piece}.svg`}
            alt=""
            className={`ligau-${logo}-${layer.piece}`}
            style={layer.index === undefined ? undefined : ({ "--i": layer.index } as React.CSSProperties)}
          />
        );
      })}
    </span>
  );
}
