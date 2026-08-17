"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { experienceConfig } from "@/config/experience";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } },
};

export function IntroScreen() {
  const { intro, couple } = experienceConfig;

  return (
    <main className="relative flex h-screen-safe w-full flex-col items-center justify-center overflow-hidden bg-cream-50 px-6 safe-top safe-bottom">
      <BackgroundOrnament />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-xl flex-col items-center text-center"
      >
        <motion.span
          variants={itemVariants}
          className="mb-6 font-sans text-xs uppercase tracking-[0.35em] text-gold-600"
        >
          {couple.name1} &amp; {couple.name2}
        </motion.span>

        <motion.h1
          variants={itemVariants}
          className="font-serif text-4xl leading-tight text-anthracite-900 sm:text-5xl md:text-6xl"
        >
          {intro.title}
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-8 max-w-md font-serif text-xl italic leading-relaxed text-anthracite-700 sm:text-2xl"
        >
          {intro.quote}
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="mt-6 max-w-sm font-sans text-sm leading-relaxed text-anthracite-500 sm:text-base"
        >
          {intro.description}
        </motion.p>

        {intro.date && (
          <motion.p
            variants={itemVariants}
            className="mt-4 font-sans text-xs uppercase tracking-[0.25em] text-gold-600"
          >
            {intro.date}
          </motion.p>
        )}

        <motion.div variants={itemVariants} className="mt-12">
          <Link
            href="/bauen"
            className="group inline-flex h-14 items-center gap-3 rounded-full bg-anthracite-900 px-9 font-sans text-base font-medium tracking-wide text-cream-50 shadow-sm transition-all duration-300 ease-out hover:bg-anthracite-800 hover:shadow-md hover:shadow-anthracite-900/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
          >
            {intro.cta}
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}

function BackgroundOrnament() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gold-300/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-gold-300/15 blur-3xl" />
      <svg
        className="absolute left-1/2 top-10 h-6 w-6 -translate-x-1/2 text-gold-400/70"
        viewBox="0 0 24 24"
        fill="none"
      >
        <rect x="4" y="10" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="8" cy="7" r="1.6" fill="currentColor" />
        <circle cx="12" cy="7" r="1.6" fill="currentColor" />
        <circle cx="16" cy="7" r="1.6" fill="currentColor" />
      </svg>
    </div>
  );
}
