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
    ];
  },
};

export default nextConfig;
