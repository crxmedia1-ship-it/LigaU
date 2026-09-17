"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="size-11" aria-hidden />;
  }

  const dark = resolvedTheme === "dark";

  return (
    <motion.button
      type="button"
      aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      className="grid size-11 place-items-center border border-zinc-800 text-zinc-200 transition-colors duration-150 hover:border-[#BA0C2F]/50 hover:text-[#BA0C2F]"
      style={{
        clipPath:
          "polygon(18% 0, 100% 0, 100% 82%, 82% 100%, 0 100%, 0 18%)",
      }}
    >
      <motion.span
        key={dark ? "sun" : "moon"}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
      >
        {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
      </motion.span>
    </motion.button>
  );
}
