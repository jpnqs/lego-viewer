"use client";

import { useEffect, useRef, useState } from "react";

interface PageCounterProps {
  currentPage: number;
  totalPages: number;
  onJumpToPage: (page: number) => void;
}

export function PageCounter({ currentPage, totalPages, onJumpToPage }: PageCounterProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(currentPage));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEditing = () => {
    setDraft(String(currentPage));
    setEditing(true);
  };

  const commit = () => {
    const parsed = Number.parseInt(draft, 10);
    if (Number.isFinite(parsed)) {
      onJumpToPage(parsed);
    }
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-1.5 font-sans text-sm text-anthracite-700">
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          min={1}
          max={totalPages}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          aria-label="Zu Seite springen"
          className="h-9 w-16 rounded-md border border-anthracite-900/20 bg-cream-50 text-center tabular-nums text-anthracite-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-600"
        />
      ) : (
        <button
          type="button"
          onClick={startEditing}
          className="rounded-md px-2 py-1.5 tabular-nums hover:bg-anthracite-900/5"
          aria-label={`Seite ${currentPage} von ${totalPages}. Zum Ändern tippen.`}
        >
          <span className="font-medium text-anthracite-900">{currentPage}</span>
          <span className="mx-1 text-anthracite-500">/</span>
          <span>{totalPages}</span>
        </button>
      )}
    </div>
  );
}
