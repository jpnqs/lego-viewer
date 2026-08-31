"use client";

import { motion } from "framer-motion";
import { CubeIcon } from "@/components/ui/CubeIcon";

interface ModelIndicatorProps {
  onClick: () => void;
  /** Number of 3D views available for the current page (full model + any sub-model). */
  modelCount?: number;
}

export function ModelIndicator({ onClick, modelCount = 1 }: ModelIndicatorProps) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 sm:bottom-6 sm:left-6">
      <motion.button
        type="button"
        onClick={onClick}
        aria-label="Fertiges Modell in 3D ansehen"
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full border border-anthracite-900/15 bg-cream-50/95 text-anthracite-700 shadow-lg shadow-anthracite-900/10 backdrop-blur transition-colors hover:bg-cream-100"
        whileTap={{ scale: 0.92 }}
      >
        <CubeIcon className="h-6 w-6" />
        {modelCount > 1 && (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-anthracite-900 px-1 text-xs font-medium text-cream-50"
          >
            {modelCount}
          </span>
        )}
      </motion.button>
    </div>
  );
}
