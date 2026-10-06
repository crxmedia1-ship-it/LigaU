"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Bebas_Neue, Cinzel, Inter, Montserrat } from "next/font/google";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"] });
const cinzel = Cinzel({ weight: "700", subsets: ["latin"] });
const inter = Inter({ weight: ["400", "600", "700"], subsets: ["latin"] });
const montserrat = Montserrat({ weight: ["600", "700", "800"], subsets: ["latin"] });
const FONTS: Record<string, string> = {
  Bebas_Neue: bebas.className,
  Cinzel: cinzel.className,
  Inter: inter.className,
  Montserrat: montserrat.className,
};

/** Logical canvas of a CarnetX design; layers are percentages of it. */
const CARD_WIDTH = 360;
const CARD_HEIGHT = 600;
const MIN_FONT_PX = 6;
const TEXT_SHADOW = "drop-shadow(0 1px 2px rgba(0,0,0,0.85)) drop-shadow(0 0 1px rgba(0,0,0,0.95))";

type Fill = { type: "solid"; color: string } | { type: "gradient"; from: string; to: string; angle: number };
type Box = { x: number; y: number; w: number; h: number; rotation?: number; opacity?: number; when?: unknown };
type Layer = Box &
  (
    | {
        type: "text";
        text: string;
        font: string;
        size: number;
        weight: number;
        color: string;
        align: "left" | "center" | "right";
        fit: "shrink" | "wrap";
        lineHeight?: number;
        letterSpacing?: number;
        uppercase?: boolean;
        shadow?: boolean;
      }
    | { type: "image"; src: string; fit: CSSProperties["objectFit"]; shadow?: boolean }
    | { type: "photo"; radius: number; borderWidth: number; borderColor: string; shadow?: boolean }
    | { type: "shape"; fill: Fill; radius: number; borderWidth: number; borderColor: string; shadow?: boolean }
    | { type: "qr"; fg: string; bg: string; padding: number; radius: number }
    | { type: "logos"; items: string[]; duration: number; gap: number; monochrome?: boolean }
  );

export type CarnetSide = { background: { fill: Fill }; layers: Layer[] };
export type CarnetDesign = { radius: number; front: CarnetSide; back: CarnetSide };
export type CarnetData = Record<string, string>;

function fillStyle(fill: Fill): CSSProperties {
  return fill.type === "solid"
    ? { backgroundColor: fill.color }
    : { backgroundImage: `linear-gradient(${fill.angle}deg, ${fill.from}, ${fill.to})` };
}

function resolve(text: string, data: CarnetData) {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => data[key] ?? "");
}

/** One face of a CarnetX carnet, scaled from its 360×600 canvas to the width of its parent. */
export function CarnetFace({
  design,
  side,
  data,
  photoUrl,
  qrValue,
  logos,
  className,
}: {
  design: CarnetDesign;
  side: "front" | "back";
  data: CarnetData;
  photoUrl: string;
  qrValue: string;
  /** Replaces the logos baked into the design when non-empty. */
  logos?: string[];
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const face = design[side];

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const update = () => setScale(frame.clientWidth / CARD_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className={cn("absolute inset-0 overflow-hidden", className)}>
      <div
        className="relative origin-top-left overflow-hidden"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: design.radius,
          transform: `scale(${scale})`,
          visibility: scale ? undefined : "hidden",
        }}
      >
        <div aria-hidden className="absolute inset-0" style={fillStyle(face.background.fill)} />
        {face.layers.map((layer, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: `${layer.x}%`,
              top: `${layer.y}%`,
              width: `${layer.w}%`,
              height: `${layer.h}%`,
              transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
              opacity: layer.opacity ?? 1,
            }}
          >
            <LayerContent
              layer={layer.type === "logos" && logos?.length ? { ...layer, items: logos } : layer}
              data={data}
              photoUrl={photoUrl}
              qrValue={qrValue}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function LayerContent({
  layer,
  data,
  photoUrl,
  qrValue,
}: {
  layer: Layer;
  data: CarnetData;
  photoUrl: string;
  qrValue: string;
}) {
  switch (layer.type) {
    case "text": {
      const text = resolve(layer.text, data);
      return text.trim() ? <FitText layer={layer} text={text} /> : null;
    }
    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={layer.src}
          alt=""
          draggable={false}
          className="size-full"
          style={{
            objectFit: layer.fit,
            filter: layer.shadow ? "drop-shadow(0 6px 12px rgba(0,0,0,0.35))" : undefined,
          }}
        />
      );
    case "photo":
      return (
        <div
          className="size-full overflow-hidden bg-stone-300/80"
          style={{
            borderRadius: `${layer.radius}%`,
            border: layer.borderWidth ? `${layer.borderWidth}px solid ${layer.borderColor}` : undefined,
            boxShadow: layer.shadow ? "0 6px 18px rgba(0,0,0,0.28)" : undefined,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="" className="size-full object-cover object-top" />
        </div>
      );
    case "shape":
      return (
        <div
          className={cn(
            "size-full",
            layer.shadow && "shadow-[0_10px_24px_-10px_rgba(12,10,9,0.35),0_2px_6px_-2px_rgba(12,10,9,0.12)]",
          )}
          style={{
            ...fillStyle(layer.fill),
            borderRadius: layer.radius,
            border: layer.borderWidth ? `${layer.borderWidth}px solid ${layer.borderColor}` : undefined,
          }}
        />
      );
    case "qr":
      return (
        <div
          className="flex size-full items-center justify-center"
          style={{ backgroundColor: layer.bg, padding: layer.padding, borderRadius: layer.radius }}
        >
          <QRCodeSVG value={qrValue} size={256} bgColor={layer.bg} fgColor={layer.fg} level="M" className="size-full" />
        </div>
      );
    case "logos":
      return <LogoStrip layer={layer} />;
  }
}

/** Logos run twice and the track moves half its width, so the loop has no seam. */
function LogoStrip({ layer }: { layer: Extract<Layer, { type: "logos" }> }) {
  const row = (hidden: boolean) => (
    <div
      className="flex h-full shrink-0 items-center"
      style={{ gap: layer.gap, paddingRight: layer.gap }}
      aria-hidden={hidden || undefined}
    >
      {layer.items.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          draggable={false}
          className="h-[72%] w-auto max-w-none shrink-0 object-contain"
          style={{ filter: layer.monochrome ? "brightness(0) invert(1)" : undefined }}
        />
      ))}
    </div>
  );
  return (
    <div className="size-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent)]">
      <div
        className="animate-ligau-marquee flex h-full w-max motion-reduce:animate-none"
        style={{ animationDuration: `${layer.duration}s` }}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

/** Shrinks the text until it fits its box, like the CarnetX renderer. */
function FitText({ layer, text }: { layer: Extract<Layer, { type: "text" }>; text: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const fit = useCallback(() => {
    const box = boxRef.current;
    const el = textRef.current;
    if (!box || !el) return;
    const bw = box.clientWidth;
    const bh = box.clientHeight;
    const fits = (size: number) => {
      el.style.fontSize = `${size}px`;
      return layer.fit === "wrap"
        ? el.scrollHeight <= bh + 1 && el.scrollWidth <= bw + 1
        : el.scrollWidth <= bw + 1;
    };
    if (bw < 2 || fits(layer.size)) return;
    let lo = MIN_FONT_PX;
    let hi = layer.size;
    while (hi - lo > 0.25) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid;
      else hi = mid;
    }
    el.style.fontSize = `${lo}px`;
  }, [layer.fit, layer.size]);

  useLayoutEffect(fit, [fit, text]);
  useEffect(() => {
    document.fonts?.ready.then(fit).catch(() => {});
  }, [fit]);

  const justify = layer.align === "left" ? "justify-start" : layer.align === "right" ? "justify-end" : "justify-center";
  return (
    <div
      ref={boxRef}
      className={cn("flex size-full items-center", justify, FONTS[layer.font] ?? inter.className)}
      style={{ filter: layer.shadow ? TEXT_SHADOW : undefined }}
    >
      <span
        ref={textRef}
        className={layer.fit === "wrap" ? "block max-h-full w-full break-words" : "block whitespace-nowrap"}
        style={{
          fontSize: layer.size,
          fontWeight: layer.weight,
          color: layer.color,
          textAlign: layer.align,
          textTransform: layer.uppercase ? "uppercase" : undefined,
          letterSpacing: layer.letterSpacing ? `${layer.letterSpacing}em` : undefined,
          lineHeight: layer.lineHeight ?? 1.15,
        }}
      >
        {text}
      </span>
    </div>
  );
}
