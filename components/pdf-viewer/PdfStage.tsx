"use client";

import "@/lib/pdfWorker";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Document, Page } from "react-pdf";
import { useElementSize } from "@/lib/hooks/useElementSize";
import { useSwipe } from "@/lib/hooks/useSwipe";
import { scheduleIdle } from "@/lib/scheduleIdle";
import { DEFAULT_ZOOM } from "@/config/experience";
import { Loader } from "@/components/ui/Loader";

const MAX_PAGE_WIDTH = 820;
const HORIZONTAL_PADDING = 32;
const VERTICAL_PADDING = 24;
const DEFAULT_ASPECT_RATIO = 1 / Math.SQRT2; // A4 portrait, width / height
// Canvases render at CSS-width × devicePixelRatio physical pixels. On a 3x
// phone screen that's 9x the pixel-fill/decode cost of a 1x display for a
// sharpness gain that's invisible at this page size — capping it keeps pages
// crisp while cutting render time substantially on high-DPI devices.
const MAX_DEVICE_PIXEL_RATIO = 2;
// The server serves the PDF with byte-range support, so mounting a page only
// fetches the bytes it actually needs. Readers mostly go forward, so we
// actually pre-render (fetch + decode + paint) a couple of pages ahead, and
// keep the last one cached, instead of only warming the network.
const FORWARD_PRERENDER_PAGES = 2;
const BACKWARD_CACHE_PAGES = 1;
const MAX_POOL_DISTANCE = Math.max(FORWARD_PRERENDER_PAGES, BACKWARD_CACHE_PAGES);
const SLIDE_DISTANCE = 24;

interface PdfProxy {
  numPages: number;
}

interface PdfStageProps {
  file: string;
  pageNumber: number;
  zoom: number;
  rotation: number;
  onLoadSuccess: (numPages: number) => void;
  onLoadError: () => void;
  onPageError: () => void;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
}

export function PdfStage({
  file,
  pageNumber,
  zoom,
  rotation,
  onLoadSuccess,
  onLoadError,
  onPageError,
  onSwipeNext,
  onSwipePrev,
}: PdfStageProps) {
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT_RATIO);
  const [pdfProxy, setPdfProxy] = useState<PdfProxy | null>(null);
  const [mountedPages, setMountedPages] = useState<Set<number>>(() => new Set([pageNumber]));
  const devicePixelRatio = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    MAX_DEVICE_PIXEL_RATIO,
  );

  const swipeHandlers = useSwipe(onSwipeNext, onSwipePrev, zoom === DEFAULT_ZOOM);

  const handleDocumentLoadSuccess = useCallback(
    (pdf: PdfProxy) => {
      setPdfProxy(pdf);
      onLoadSuccess(pdf.numPages);
    },
    [onLoadSuccess],
  );

  // The current page is always mounted immediately, full priority. Pages
  // that have drifted out of the retention window get dropped to bound
  // memory/canvas count.
  useEffect(() => {
    setMountedPages((prev) => {
      const next = new Set<number>();
      for (const page of prev) {
        if (Math.abs(page - pageNumber) <= MAX_POOL_DISTANCE) next.add(page);
      }
      next.add(pageNumber);
      return next;
    });
  }, [pageNumber]);

  // Actually pre-render (not just fetch) the next couple of pages, plus keep
  // the previous one cached, during browser idle time — so paging forward
  // shows an already-painted canvas instead of decoding one from scratch.
  // Idle-scheduled so it never competes with the current page's own render
  // or with touch/scroll handling, and cancelled on rapid navigation so we
  // don't warm targets that are already stale.
  useEffect(() => {
    if (!pdfProxy) return;

    const targets: number[] = [];
    for (let offset = 1; offset <= FORWARD_PRERENDER_PAGES; offset++) {
      targets.push(pageNumber + offset);
    }
    for (let offset = 1; offset <= BACKWARD_CACHE_PAGES; offset++) {
      targets.push(pageNumber - offset);
    }
    const validTargets = targets.filter((page) => page >= 1 && page <= pdfProxy.numPages);
    if (validTargets.length === 0) return;

    return scheduleIdle(() => {
      setMountedPages((prev) => {
        const next = new Set(prev);
        let changed = false;
        for (const target of validTargets) {
          if (!next.has(target)) {
            next.add(target);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    });
  }, [pageNumber, pdfProxy]);

  const handlePageLoadSuccess = useCallback((page: { originalWidth: number; originalHeight: number }) => {
    // Use the unscaled page size, not the rendered width/height — those
    // reflect the `width` prop we just passed in and would feed back into
    // the size calculation below, causing an infinite render loop.
    if (page.originalWidth && page.originalHeight) {
      setAspectRatio((prev) => {
        const next = page.originalWidth / page.originalHeight;
        return Math.abs(next - prev) < 0.001 ? prev : next;
      });
    }
  }, []);

  // A background pre-render failing shouldn't block the whole viewer — drop
  // it so a fresh attempt happens if the reader actually reaches that page.
  // A failure on the page currently being looked at is the real error.
  const handlePageLoadError = useCallback(
    (page: number) => {
      if (page === pageNumber) {
        onPageError();
        return;
      }
      setMountedPages((prev) => {
        if (!prev.has(page)) return prev;
        const next = new Set(prev);
        next.delete(page);
        return next;
      });
    },
    [pageNumber, onPageError],
  );

  // react-pdf's `width` prop always maps to the rendered canvas width, but
  // when rotated 90/270 the page's displayed shape is height×width swapped —
  // so fitting it to the available space means solving with the inverse ratio.
  const isSideways = rotation === 90 || rotation === 270;
  const displayAspectRatio = isSideways ? 1 / aspectRatio : aspectRatio;

  const availableWidth = Math.max(size.width - HORIZONTAL_PADDING, 0);
  const availableHeight = Math.max(size.height - VERTICAL_PADDING, 0);
  const widthFromHeight = isSideways ? availableHeight / aspectRatio : availableHeight * aspectRatio;
  const baseWidth = Math.min(availableWidth, widthFromHeight || availableWidth, MAX_PAGE_WIDTH) || availableWidth;
  const pageWidth = Math.max(baseWidth * zoom, 1);

  const isZoomed = zoom > DEFAULT_ZOOM + 0.001;

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full w-full min-h-0 flex-1 items-start justify-center ${
        isZoomed ? "overflow-auto" : "overflow-hidden"
      }`}
      {...swipeHandlers}
    >
      <div
        className="flex min-h-full w-full items-center justify-center py-3"
        style={isZoomed ? { minWidth: pageWidth + HORIZONTAL_PADDING } : undefined}
      >
        <Document
          file={file}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={onLoadError}
          loading={<Loader label="Eure Bauanleitung wird vorbereitet …" />}
          error={null}
        >
          <div className="relative" style={{ width: pageWidth, aspectRatio: displayAspectRatio }}>
            {Array.from(mountedPages).map((page) => {
              const isActive = page === pageNumber;
              const offset = isActive ? 0 : page > pageNumber ? SLIDE_DISTANCE : -SLIDE_DISTANCE;
              return (
                <motion.div
                  key={page}
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0, x: offset }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  style={{ zIndex: isActive ? 1 : 0, pointerEvents: isActive ? "auto" : "none" }}
                  className="absolute inset-0 overflow-hidden rounded-sm bg-white shadow-[0_8px_30px_rgba(33,31,29,0.12)]"
                >
                  <Page
                    pageNumber={page}
                    width={pageWidth}
                    rotate={rotation}
                    devicePixelRatio={devicePixelRatio}
                    onLoadSuccess={handlePageLoadSuccess}
                    onLoadError={() => handlePageLoadError(page)}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={
                      <div
                        style={{ width: pageWidth, aspectRatio: displayAspectRatio }}
                        className="animate-pulse bg-cream-200"
                      />
                    }
                  />
                </motion.div>
              );
            })}
          </div>
        </Document>
      </div>
    </div>
  );
}
