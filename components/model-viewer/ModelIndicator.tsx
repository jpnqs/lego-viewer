"use client";

import { motion } from "framer-motion";
import { CubeIcon } from "@/components/ui/CubeIcon";

export function ModelIndicator({ onClick }: { onClick: () => void }) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 sm:bottom-6 sm:left-6">
      <motion.button
        type="button"
        onClick={onClick}
        aria-label="Fertiges Modell in 3D ansehen"
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-anthracite-900/15 bg-cream-50/95 text-anthracite-700 shadow-lg shadow-anthracite-900/10 backdrop-blur transition-colors hover:bg-cream-100"
        whileTap={{ scale: 0.92 }}
      >
        <CubeIcon className="h-6 w-6" />
      </motion.button>
    </div>
  );
}
