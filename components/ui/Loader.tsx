"use client";

import { motion } from "framer-motion";

export function Loader({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="relative h-12 w-12" role="status" aria-label={label}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-sm border-2 border-gold-400"
            initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 1.1], rotate: 90 }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <p className="font-serif text-lg italic text-anthracite-700">{label}</p>
    </div>
  );
}
