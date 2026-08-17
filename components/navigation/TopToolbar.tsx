"use client";

import Link from "next/link";
import { MAX_ZOOM, MIN_ZOOM } from "@/config/experience";

interface TopToolbarProps {
  zoom: number;
  rotation: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onRotate: () => void;
}

export function TopToolbar({
  zoom,
  rotation,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onRotate,
}: TopToolbarProps) {
  return (
    <header className="relative z-10 flex-none border-b border-anthracite-900/10 bg-cream-50/95 backdrop-blur safe-top safe-left safe-right">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-3 py-2 sm:px-8">
        <Link
          href="/"
          aria-label="Zurück zur Startseite"
          className="flex h-11 items-center gap-2 rounded-full px-3 font-serif text-base italic text-anthracite-700 transition-colors hover:text-anthracite-900"
        >
          Stein für Stein
        </Link>

        <div className="flex items-center gap-1">
          <ToolbarIconButton
            label="Verkleinern"
            onClick={onZoomOut}
            disabled={zoom <= MIN_ZOOM + 0.001}
          >
            <MinusIcon />
          </ToolbarIconButton>
          <button
            type="button"
            onClick={onZoomReset}
            aria-label="Zoom zurücksetzen"
            className="h-11 min-w-11 rounded-full px-2 font-sans text-xs tabular-nums text-anthracite-700 hover:bg-anthracite-900/5"
          >
            {Math.round(zoom * 100)}%
          </button>
          <ToolbarIconButton
            label="Vergrößern"
            onClick={onZoomIn}
            disabled={zoom >= MAX_ZOOM - 0.001}
          >
            <PlusIcon />
          </ToolbarIconButton>
          <ToolbarIconButton label={`Seite drehen (aktuell ${rotation}°)`} onClick={onRotate}>
            <RotateIcon />
          </ToolbarIconButton>
        </div>
      </div>
    </header>
  );
}

function ToolbarIconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full text-anthracite-700 transition-colors hover:bg-anthracite-900/5 disabled:opacity-30 disabled:pointer-events-none"
    >
      {children}
    </button>
  );
}

const iconProps = {
  viewBox: "0 0 24 24",
  className: "h-4.5 w-4.5",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function MinusIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 12a9 9 0 1 1 3.05 6.75" />
      <path d="M3 17v-4h4" />
    </svg>
  );
}

