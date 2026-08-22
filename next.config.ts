import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Vendored pdf.js worker — content is tied to the pdfjs-dist
        // version we ship, never edited by hand, safe to cache forever.
        source: "/pdf.worker.min.mjs",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Static 3D model assets — filenames change if the model is ever replaced.
        source: "/models/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Self-hosted HDRI environment map (see ModelViewerStage) — same reasoning as /models/*.
        source: "/hdri/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
