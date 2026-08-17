export function ProgressBar({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const percent = totalPages > 0 ? Math.min(100, (currentPage / totalPages) * 100) : 0;

  return (
    <div
      role="progressbar"
      aria-label="Baufortschritt"
      aria-valuemin={1}
      aria-valuemax={totalPages}
      aria-valuenow={currentPage}
      className="h-1 w-full overflow-hidden bg-anthracite-900/8"
    >
      <div
        className="h-full bg-gold-400 transition-[width] duration-300 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
