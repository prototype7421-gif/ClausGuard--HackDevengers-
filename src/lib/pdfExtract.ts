import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { PDFParse } from "pdf-parse";
import { createWorker } from "tesseract.js";

export interface PdfExtractResult {
  text: string;
  pages: number;
  method: "text" | "ocr" | "mixed";
}

const MIN_USEFUL_CHARS = 20;
const MAX_OCR_PAGES = 15;
const MAX_TEXT_CHARS = 50000;

// Resolve from project root — safe in Next.js server bundles (no __filename)
const require = createRequire(path.join(process.cwd(), "package.json"));

let workerConfigured = false;

/**
 * Point pdf.js at a real worker file on disk.
 * Next.js production builds otherwise look for pdf.worker.mjs inside
 * `.next/server/chunks` and fail with "Cannot find module pdf.worker.mjs".
 */
function ensurePdfWorker() {
  if (workerConfigured) return;

  const candidates: string[] = [];

  const tryResolve = (id: string) => {
    try {
      candidates.push(require.resolve(id));
    } catch {
      // ignore
    }
  };

  tryResolve("pdf-parse/dist/worker/pdf.worker.mjs");
  tryResolve("pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs");
  tryResolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
  tryResolve("pdfjs-dist/build/pdf.worker.min.mjs");
  tryResolve("pdfjs-dist/build/pdf.worker.mjs");

  candidates.push(
    path.join(process.cwd(), "node_modules/pdf-parse/dist/worker/pdf.worker.mjs"),
    path.join(
      process.cwd(),
      "node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs"
    ),
    path.join(
      process.cwd(),
      "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
    ),
    path.join(
      process.cwd(),
      "node_modules/pdfjs-dist/build/pdf.worker.min.mjs"
    )
  );

  const workerPath = candidates.find((p) => {
    try {
      return typeof p === "string" && fs.existsSync(p);
    } catch {
      return false;
    }
  });

  if (!workerPath) {
    throw new Error(
      "PDF worker file not found. Ensure pdf-parse / pdfjs-dist are installed."
    );
  }

  // Absolute file:// URL is the most reliable for Node ESM worker loading
  const workerSrc = pathToFileURL(path.resolve(workerPath)).href;
  PDFParse.setWorker(workerSrc);
  workerConfigured = true;
}

function createParser(buffer: Buffer) {
  ensurePdfWorker();
  return new PDFParse({ data: new Uint8Array(buffer) });
}

/**
 * Extract readable text from any PDF.
 * 1) Try embedded text layer first
 * 2) If little/no text (scanned/image PDF), render pages and OCR them
 */
export async function extractTextFromPdf(
  buffer: Buffer
): Promise<PdfExtractResult> {
  let textLayer = "";
  let pages = 0;

  // ── Step 1: embedded text ──
  try {
    const parser = createParser(buffer);
    try {
      const result = await parser.getText();
      pages = result.total ?? 0;
      textLayer = (result.pages || [])
        .map((p: { text?: string }) => (p.text || "").trim())
        .filter(Boolean)
        .join("\n\n")
        .trim();
    } finally {
      await parser.destroy();
    }
  } catch (err) {
    console.warn("PDF text extraction failed, will try OCR:", err);
  }

  // Enough embedded text → done
  if (textLayer.replace(/\s+/g, " ").trim().length >= MIN_USEFUL_CHARS) {
    return {
      text: textLayer.slice(0, MAX_TEXT_CHARS),
      pages,
      method: "text",
    };
  }

  // ── Step 2: OCR via page screenshots ──
  const ocrText = await ocrPdfPages(buffer, pages || MAX_OCR_PAGES);

  const combined = [textLayer, ocrText]
    .filter((t) => t && t.trim().length > 0)
    .join("\n\n")
    .trim();

  if (combined.replace(/\s+/g, " ").trim().length < MIN_USEFUL_CHARS) {
    throw new Error(
      "Could not extract readable text from this PDF. The file may be empty, corrupted, password-protected, or the images are too low quality to read."
    );
  }

  return {
    text: combined.slice(0, MAX_TEXT_CHARS),
    pages: pages || 1,
    method: textLayer ? "mixed" : "ocr",
  };
}

async function ocrPdfPages(
  buffer: Buffer,
  totalPagesHint: number
): Promise<string> {
  const parser = createParser(buffer);

  try {
    const info = await parser.getInfo();
    const totalPages = Math.min(
      info.total || totalPagesHint || 1,
      MAX_OCR_PAGES
    );

    const screenshot = await parser.getScreenshot({
      scale: 2,
      imageBuffer: true,
      imageDataUrl: false,
      partial: Array.from({ length: totalPages }, (_, i) => i + 1),
    });

    const pageImages: Uint8Array[] = (screenshot.pages || [])
      .map((p: { data?: Uint8Array }) => p.data)
      .filter(
        (d: Uint8Array | undefined): d is Uint8Array => !!d && d.length > 0
      );

    if (pageImages.length === 0) {
      return await ocrEmbeddedImages(parser);
    }

    const worker = await createWorker("eng");
    const pageTexts: string[] = [];

    try {
      for (let i = 0; i < pageImages.length; i++) {
        const img = pageImages[i];
        const {
          data: { text },
        } = await worker.recognize(Buffer.from(img));
        const cleaned = (text || "").trim();
        if (cleaned) {
          pageTexts.push(cleaned);
        }
      }
    } finally {
      await worker.terminate();
    }

    return pageTexts.join("\n\n").trim();
  } finally {
    try {
      await parser.destroy();
    } catch {
      // ignore
    }
  }
}

async function ocrEmbeddedImages(
  parser: InstanceType<typeof PDFParse>
): Promise<string> {
  try {
    const imagesResult = await parser.getImage({});
    const images: Uint8Array[] = [];

    for (const page of imagesResult.pages || []) {
      for (const img of page.images || []) {
        const maybe = img as { data?: Uint8Array };
        if (maybe.data instanceof Uint8Array && maybe.data.length > 0) {
          images.push(maybe.data);
        }
      }
    }

    if (images.length === 0) return "";

    const worker = await createWorker("eng");
    const texts: string[] = [];
    try {
      const limit = Math.min(images.length, MAX_OCR_PAGES);
      for (let i = 0; i < limit; i++) {
        const {
          data: { text },
        } = await worker.recognize(Buffer.from(images[i]));
        const cleaned = (text || "").trim();
        if (cleaned) texts.push(cleaned);
      }
    } finally {
      await worker.terminate();
    }
    return texts.join("\n\n").trim();
  } catch (err) {
    console.warn("Embedded image OCR failed:", err);
    return "";
  }
}
