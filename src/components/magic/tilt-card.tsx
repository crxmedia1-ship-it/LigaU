"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

export function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [14, -14]), {
    stiffness: 180,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-16, 16]), {
    stiffness: 180,
    damping: 18,
  });
  const shineX = useTransform(x, [-0.5, 0.5], ["0%", "70%"]);
  const shineY = useTransform(y, [-0.5, 0.5], ["10%", "70%"]);

  useEffect(() => {
    const onOrient = (event: DeviceOrientationEvent) => {
      if (window.matchMedia("(pointer: fine)").matches) return;
      const gamma = (event.gamma ?? 0) / 45;
      const beta = ((event.beta ?? 45) - 45) / 45;
      x.set(Math.max(-0.5, Math.min(0.5, gamma * 0.5)));
      y.set(Math.max(-0.5, Math.min(0.5, beta * 0.5)));
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      className={cn("relative [perspective:1200px]", className)}
      onMouseMove={(event) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set((event.clientX - rect.left) / rect.width - 0.5);
        y.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full overflow-hidden drop-shadow-glow-red"
      >
        {children}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute size-36 rounded-full bg-[radial-gradient(circle,rgba(226,232,240,0.5),rgba(200,16,46,0.22)_45%,transparent_70%)] mix-blend-screen"
          style={{
            left: shineX,
            top: shineY,
            transform: "translateZ(36px)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
