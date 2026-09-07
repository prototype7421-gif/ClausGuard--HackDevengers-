import path from "path";
import { pathToFileURL } from "url";
import { createRequire } from "module";

export interface PdfExtractResult {
  text: string;
  pages: number;
  method: "text" | "ocr" | "mixed";
}

const MIN_USEFUL_CHARS = 20;
const MAX_OCR_PAGES = 10;
const MAX_TEXT_CHARS = 50000;

// Use createRequire so Next.js always resolves to the CJS Node build,
// regardless of whether the server bundle is compiled as ESM or CJS.
const nodeRequire = createRequire(path.join(process.cwd(), "package.json"));

type PDFParseClass = {
  new (opts: { data: Uint8Array }): PDFParseInstance;
  setWorker: (src: string) => void;
};

type PDFParseInstance = {
  getText: () => Promise<{ total?: number; pages?: { text?: string }[] }>;
  getInfo: () => Promise<{ total?: number }>;
  destroy: () => Promise<void>;
};

let workerConfigured = false;

function getPDFParse(): PDFParseClass {
  const mod: any = nodeRequire("pdf-parse");  
  const PDFParse: PDFParseClass = mod.PDFParse ?? mod.default?.PDFParse ?? mod;
  if (typeof PDFParse !== "function") {
    throw new Error("pdf-parse: PDFParse constructor not found");
  }
  return PDFParse;
}

function ensurePdfWorker(PDFParse: PDFParseClass) {
  if (workerConfigured) return;

  const candidates = [
    path.join(process.cwd(), "node_modules/pdf-parse/dist/worker/pdf.worker.mjs"),
    path.join(process.cwd(), "node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs"),
    path.join(process.cwd(), "node_modules/pdf-parse/dist/pdf-parse/esm/pdf.worker.mjs"),
    path.join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
    path.join(process.cwd(), "node_modules/pdfjs-dist/build/pdf.worker.min.mjs"),
    path.join(process.cwd(), "node_modules/pdfjs-dist/build/pdf.worker.mjs"),
  ];

   
  const fs = require("fs") as typeof import("fs");

  const workerPath = candidates.find((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });

  if (workerPath) {
    try {
      PDFParse.setWorker(pathToFileURL(path.resolve(workerPath)).href);
    } catch {
      // setWorker failure is non-fatal; pdf-parse may auto-discover the worker
    }
  }

  workerConfigured = true;
}

/**
 * Extract readable text from any PDF buffer.
 * 1) Try embedded text layer first
 * 2) If little/no text (scanned/image PDF), OCR via tesseract.js
 */
export async function extractTextFromPdf(
  buffer: Buffer
): Promise<PdfExtractResult> {
  let textLayer = "";
  let pages = 0;

  const PDFParse = getPDFParse();
  ensurePdfWorker(PDFParse);

  // ── Step 1: embedded text ──
  try {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      pages = result.total ?? 0;
      textLayer = (result.pages || [])
        .map((p: { text?: string }) => (p.text || "").trim())
        .filter(Boolean)
        .join("\n\n")
        .trim();
    } finally {
      try {
        await parser.destroy();
      } catch {
        // ignore
      }
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

  // ── Step 2: OCR via tesseract ──
  let ocrText = "";
  try {
    ocrText = await ocrPdfPages(buffer, pages || MAX_OCR_PAGES, PDFParse);
  } catch (ocrErr) {
    console.warn("OCR failed:", ocrErr);
  }

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
  totalPagesHint: number,
  PDFParse: PDFParseClass
): Promise<string> {
   
  const { createWorker } = require("tesseract.js") as typeof import("tesseract.js");

  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  try {
    let totalPages = totalPagesHint;
    try {
      const info = await parser.getInfo();
      totalPages = Math.min(info.total || totalPagesHint || 1, MAX_OCR_PAGES);
    } catch {
      totalPages = Math.min(totalPagesHint || 1, MAX_OCR_PAGES);
    }

    // Try page screenshots first
    let pageImages: Uint8Array[] = [];
    try {
      const screenshot = await (parser as any).getScreenshot({  
        scale: 2,
        imageBuffer: true,
        imageDataUrl: false,
        partial: Array.from({ length: totalPages }, (_, i) => i + 1),
      });
      pageImages = (screenshot.pages || [])
        .map((p: { data?: Uint8Array }) => p.data)
        .filter(
          (d: Uint8Array | undefined): d is Uint8Array => !!d && d.length > 0
        );
    } catch {
      // getScreenshot not supported or failed — fall through to embedded images
    }

    // Fall back to embedded images if no screenshots
    if (pageImages.length === 0) {
      try {
        const imagesResult = await (parser as any).getImage({});  
        for (const page of imagesResult.pages || []) {
          for (const img of page.images || []) {
            const maybe = img as { data?: Uint8Array };
            if (maybe.data instanceof Uint8Array && maybe.data.length > 0) {
              pageImages.push(maybe.data);
              if (pageImages.length >= MAX_OCR_PAGES) break;
            }
          }
          if (pageImages.length >= MAX_OCR_PAGES) break;
        }
      } catch {
        // No embedded images either
      }
    }

    if (pageImages.length === 0) return "";

    const worker = await createWorker("eng");
    const pageTexts: string[] = [];

    try {
      const limit = Math.min(pageImages.length, MAX_OCR_PAGES);
      for (let i = 0; i < limit; i++) {
        const {
          data: { text },
        } = await worker.recognize(Buffer.from(pageImages[i]));
        const cleaned = (text || "").trim();
        if (cleaned) pageTexts.push(cleaned);
      }
    } finally {
      await worker.terminate().catch(() => {});
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
