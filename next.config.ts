import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep PDF/OCR packages external so Node can load their workers & native deps
  serverExternalPackages: [
    "pdf-parse",
    "pdfjs-dist",
    "canvas",
    "tesseract.js",
  ],
};

export default nextConfig;
