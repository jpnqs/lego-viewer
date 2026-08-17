"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HeartIcon } from "@/components/ui/HeartIcon";

export function AutoOpenToast({ visible }: { visible: boolean }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center"
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 rounded-full bg-anthracite-900 px-5 py-2.5 font-sans text-sm text-cream-50 shadow-lg"
          >
            <HeartIcon className="h-4 w-4 shrink-0 text-gold-400" />
            Eine Nachricht für euch
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
