"use client";

import { motion, useReducedMotion } from "motion/react";

const PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 13 + 7) % 100}%`,
  top: `${(index * 19 + 5) % 100}%`,
  size: index % 4 === 0 ? 3 : 2,
  delay: index * 0.14,
  duration: 4.2 + (index % 5) * 0.55,
  red: index % 5 === 0,
}));

export function HeroParticles() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((particle) => (
        <motion.span
          key={particle.id}
          className={
            particle.red
              ? "absolute rounded-full bg-[#BA0C2F]"
              : "absolute rounded-full bg-zinc-600"
          }
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={
            reduce
              ? undefined
              : { y: [0, -18, 0], x: [0, particle.red ? 8 : -6, 0], opacity: [0.12, 0.55, 0.12] }
          }
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
