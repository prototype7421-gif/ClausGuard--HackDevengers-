import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/pdfExtract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a valid PDF file." },
        { status: 400 }
      );
    }

    // Validate file type
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "Only PDF files are supported. Please upload a .pdf file." },
        { status: 400 }
      );
    }

    // Validate file size (max 20MB — OCR may need larger scanned docs)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 20MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extracted;
    try {
      extracted = await extractTextFromPdf(buffer);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not read the PDF. Please try another file or paste the text instead.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({
      text: extracted.text,
      pages: extracted.pages,
      fileName: file.name,
      charCount: extracted.text.length,
      method: extracted.method,
    });
  } catch (error) {
    console.error("PDF upload error:", error);
    return NextResponse.json(
      { error: "Failed to process the PDF. Please try again." },
      { status: 500 }
    );
  }
}
