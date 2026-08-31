"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

export interface ModelTab {
  id: string;
  label: string;
  objFile: string;
  mtlFile: string;
}

interface ModelTabsProps {
  tabs: ModelTab[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function ModelTabs({ tabs, activeId, onSelect }: ModelTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Roving focus, as the tabs pattern expects. Stopping propagation matters
  // here: the page-turn shortcuts live on document, so without it the left and
  // right arrows would also flip the instructions behind the open viewer.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;

    e.preventDefault();
    e.stopPropagation();

    const index = tabs.findIndex((t) => t.id === activeId);
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    onSelect(next.id);
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-tab-id="${next.id}"]`)
      ?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="3D-Ansichten"
      onKeyDown={handleKeyDown}
      className="flex min-w-0 gap-1 rounded-full bg-anthracite-900/5 p-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(tab.id)}
            className="relative min-w-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm"
          >
            {isActive && (
              // Shared layoutId: the pill slides between tabs instead of
              // blinking from one to the other.
              <motion.span
                layoutId="model-tab-pill"
                className="absolute inset-0 rounded-full bg-anthracite-900 shadow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span
              className={`relative block truncate ${
                isActive ? "text-cream-50" : "text-anthracite-700"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
