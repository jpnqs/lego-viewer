"use client";

import { motion } from "framer-motion";
import { HeartIcon } from "@/components/ui/HeartIcon";

export function MessageIndicator({ onClick }: { onClick: () => void }) {
  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-10 sm:bottom-6 sm:right-6">
      <span aria-hidden className="animate-gold-ping absolute inset-0 rounded-full bg-gold-400" />
      <motion.button
        type="button"
        onClick={onClick}
        aria-label="Persönliche Nachricht öffnen"
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full border border-gold-400/60 bg-cream-50/95 text-gold-600 shadow-lg shadow-anthracite-900/10 backdrop-blur transition-colors hover:bg-cream-100"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        whileTap={{ scale: 0.92 }}
      >
        <HeartIcon className="h-6 w-6" />
      </motion.button>
    </div>
  );
}
