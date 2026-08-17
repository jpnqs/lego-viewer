"use client";

import { PageCounter } from "@/components/navigation/PageCounter";
import { ProgressBar } from "@/components/navigation/ProgressBar";

interface BottomNavProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onJumpToPage: (page: number) => void;
}

export function BottomNav({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onJumpToPage,
}: BottomNavProps) {
  const isFirst = currentPage <= 1;

  return (
    <nav
      aria-label="Seitennavigation"
      className="relative z-10 flex-none border-t border-anthracite-900/10 bg-cream-50/95 backdrop-blur safe-bottom safe-left safe-right"
    >
      <ProgressBar currentPage={currentPage} totalPages={totalPages} />
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <NavButton direction="prev" onClick={onPrev} disabled={isFirst} />

        <PageCounter currentPage={currentPage} totalPages={totalPages} onJumpToPage={onJumpToPage} />

        <NavButton direction="next" onClick={onNext} />
      </div>
    </nav>
  );
}

function NavButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? "Vorherige Seite" : "Nächste Seite"}
      className="flex h-14 min-w-14 flex-1 max-w-40 items-center justify-center gap-2 rounded-full bg-anthracite-900 font-sans text-sm font-medium text-cream-50 transition-all duration-200 ease-out hover:bg-anthracite-800 active:scale-[0.97] disabled:opacity-30 disabled:pointer-events-none sm:flex-none sm:px-6"
    >
      {isPrev && <ChevronIcon direction="left" />}
      <span className="hidden sm:inline">{isPrev ? "Zurück" : "Weiter"}</span>
      {!isPrev && <ChevronIcon direction="right" />}
    </button>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 6l6 6-6 6" />}
    </svg>
  );
}
