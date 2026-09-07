"use client";

import { useState, useRef, useCallback } from "react";
import {
  Shield,
  AlertTriangle,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  Upload,
  X,
  FileUp,
  File,
} from "lucide-react";

interface RedFlag {
  clause_type: string;
  original_text: string;
  dumbed_down: string;
}

interface AnalysisResult {
  id: string;
  riskScore: number;
  summary: string;
  redFlags: RedFlag[];
  documentType?: string;
  status: string;
}

const SAMPLE_TEXT = `TERMS OF SERVICE AGREEMENT

Last Updated: January 1, 2025

By accessing or using our services, you agree to be bound by these Terms. If you do not agree, do not use our services.

1. LICENSE AND CONTENT RIGHTS
By using our services, you grant us a worldwide, perpetual, irrevocable, royalty-free license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display your content in any media or distribution method now known or later developed. This license continues even after you stop using our services.

2. DATA COLLECTION AND SHARING
We collect personal information including but not limited to your name, email address, location data, browsing history, device information, and usage patterns. We may share your personal information with third-party partners for marketing, analytics, and advertising purposes. You consent to receiving promotional communications from us and our partners.

3. PRICING AND BILLING
We reserve the right to modify pricing at any time without prior notice. Continued use of our services after a pricing change constitutes acceptance of the new pricing terms. All fees are non-refundable, and we are not obligated to provide refunds for any reason, including service outages or dissatisfaction.

4. DISPUTE RESOLUTION
You agree to resolve all disputes through binding arbitration administered by a provider of our choosing. You waive your right to participate in class action lawsuits or class-wide arbitration. The arbitration will take place in our jurisdiction, and you are responsible for all costs associated with the arbitration process.

5. LIMITATION OF LIABILITY
In no event shall the company be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, regardless of whether we were advised of the possibility of such damages. Our total liability shall not exceed the amount you paid us in the last 12 months.

6. CANCELLATION AND TERMINATION
Cancellation requests must be submitted in writing at least 30 days prior to the next billing cycle renewal date. Failure to cancel within this window will result in automatic renewal for another full term. We reserve the right to terminate your account at any time for any reason without notice or refund.

7. MODIFICATIONS TO TERMS
We may modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of our services constitutes acceptance of any modified terms. It is your responsibility to review these terms regularly.`;

type InputMode = "text" | "pdf";

export default function AnalyzerClient() {
  const [text, setText] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [expandedFlags, setExpandedFlags] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pdfInfo, setPdfInfo] = useState<{
    fileName: string;
    pages: number;
    charCount: number;
    method?: "text" | "ocr" | "mixed";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── PDF Upload Handler ──
  const handlePdfUpload = useCallback(async (file: File) => {
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Only PDF files are supported. Please upload a .pdf file.");
      return;
    }

    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_SIZE) {
      setError("File is too large. Maximum size is 20MB.");
      return;
    }

    setUploading(true);
    setError("");
    setPdfInfo(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to process the PDF.");
        return;
      }

      setText(data.text);
      setPdfInfo({
        fileName: data.fileName,
        pages: data.pages,
        charCount: data.charCount,
        method: data.method,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Network error uploading PDF: ${msg}`);
    } finally {
      setUploading(false);
    }
  }, []);

  // ── Drag & Drop Handlers ──
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handlePdfUpload(e.dataTransfer.files[0]);
      }
    },
    [handlePdfUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handlePdfUpload(e.target.files[0]);
      }
    },
    [handlePdfUpload]
  );

  // ── Analysis Handler ──
  const handleAnalyze = async () => {
    if (text.trim().length < 10) {
      setError("Please enter at least 10 characters of document text.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setExpandedFlags(new Set());

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Analysis failed. Please try again.");
        return;
      }

      setResult(data);
      const allIndices = new Set<number>(
        (data.redFlags || []).map((_: RedFlag, i: number) => i)
      );
      setExpandedFlags(allIndices);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = (index: number) => {
    setExpandedFlags((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const loadSample = () => {
    setText(SAMPLE_TEXT);
    setResult(null);
    setError("");
    setPdfInfo(null);
    setInputMode("text");
  };

  const clearAll = () => {
    setText("");
    setResult(null);
    setError("");
    setPdfInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const report = `ClauseGuard Analysis Report
Risk Score: ${result.riskScore}/100
Summary: ${result.summary}

Red Flags:
${(result.redFlags || [])
  .map(
    (f, i) =>
      `${i + 1}. [${f.clause_type}] ${f.dumbed_down}\n   Original: "${f.original_text}"`
  )
  .join("\n\n")}`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskColor = (score: number) => {
    if (score <= 30)
      return { text: "text-green-500", bg: "bg-green-500", label: "Low Risk" };
    if (score <= 60)
      return {
        text: "text-yellow-500",
        bg: "bg-yellow-500",
        label: "Medium Risk",
      };
    if (score <= 80)
      return {
        text: "text-orange-500",
        bg: "bg-orange-500",
        label: "High Risk",
      };
    return { text: "text-red-500", bg: "bg-red-500", label: "Critical Risk" };
  };

  const getClauseColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("data") || t.includes("privacy"))
      return "border-purple-400 bg-purple-50";
    if (
      t.includes("financial") ||
      t.includes("pricing") ||
      t.includes("billing")
    )
      return "border-orange-400 bg-orange-50";
    if (
      t.includes("legal") ||
      t.includes("dispute") ||
      t.includes("arbitration")
    )
      return "border-red-400 bg-red-50";
    if (t.includes("cancel") || t.includes("termination"))
      return "border-yellow-400 bg-yellow-50";
    if (t.includes("liability")) return "border-pink-400 bg-pink-50";
    return "border-gray-400 bg-gray-50";
  };

  const getClauseBadgeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("data") || t.includes("privacy"))
      return "bg-purple-100 text-purple-700";
    if (
      t.includes("financial") ||
      t.includes("pricing") ||
      t.includes("billing")
    )
      return "bg-orange-100 text-orange-700";
    if (
      t.includes("legal") ||
      t.includes("dispute") ||
      t.includes("arbitration")
    )
      return "bg-red-100 text-red-700";
    if (t.includes("cancel") || t.includes("termination"))
      return "bg-yellow-100 text-yellow-700";
    if (t.includes("liability")) return "bg-pink-100 text-pink-700";
    return "bg-gray-100 text-gray-700";
  };

  const canAnalyze = text.trim().length >= 10;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-20">
      {/* Page Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-1.5 text-sm font-semibold text-brand-pink mb-4">
          <Sparkles className="h-4 w-4" />
          AI-Powered Analysis
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          Document <span className="gradient-text">Analyzer</span>
        </h1>
        <p className="mt-3 text-gray-500 text-lg max-w-xl mx-auto">
          Paste any text or upload any PDF — including scanned image PDFs. Works even if it&apos;s not a contract.
        </p>
      </div>

      {/* Input Section */}
      <div className="rounded-3xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-gray-100 p-6 md:p-8">
        {/* ── Tab Switcher ── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => {
                setInputMode("text");
                setError("");
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                inputMode === "text"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="h-4 w-4" />
              Paste Text
            </button>
            <button
              onClick={() => {
                setInputMode("pdf");
                setError("");
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                inputMode === "pdf"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload PDF
            </button>
          </div>

          <button
            onClick={loadSample}
            className="text-sm text-brand-pink hover:text-pink-600 font-medium transition-colors"
          >
            Load sample contract
          </button>
        </div>

        {/* ── TEXT INPUT MODE ── */}
        {inputMode === "text" && (
          <>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError("");
                setPdfInfo(null);
              }}
              placeholder="Paste any document text here — contracts, policies, invoices, letters, notes, or anything else..."
              className="w-full h-64 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all resize-none leading-relaxed"
            />
            <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-gray-400">
                {text.length.toLocaleString()} characters
              </span>
              <div className="flex gap-3">
                {text.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !canAnalyze}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-pink to-brand-purple px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Analyze Document
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── PDF UPLOAD MODE ── */}
        {inputMode === "pdf" && (
          <>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />

            {/* PDF info badge when a file has been successfully extracted */}
            {pdfInfo && (
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-green-50 border border-green-100 px-4 py-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <File className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-green-800 truncate">
                    {pdfInfo.fileName}
                  </p>
                  <p className="text-xs text-green-600">
                    {pdfInfo.pages} page{pdfInfo.pages !== 1 ? "s" : ""} •{" "}
                    {pdfInfo.charCount.toLocaleString()} characters extracted
                    {pdfInfo.method === "ocr"
                      ? " • OCR used (image PDF)"
                      : pdfInfo.method === "mixed"
                      ? " • Text + OCR"
                      : " • Text layer"}
                  </p>
                </div>
                <button
                  onClick={clearAll}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-green-100 transition-colors"
                >
                  <X className="h-4 w-4 text-green-600" />
                </button>
              </div>
            )}

            {/* Drop Zone */}
            {!pdfInfo && !uploading && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-all ${
                  dragActive
                    ? "border-brand-pink bg-pink-50/50 scale-[1.01]"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100/50"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                    dragActive
                      ? "bg-brand-pink/10"
                      : "bg-gray-100"
                  }`}
                >
                  <FileUp
                    className={`h-8 w-8 transition-colors ${
                      dragActive ? "text-brand-pink" : "text-gray-400"
                    }`}
                  />
                </div>
                <p className="text-base font-semibold text-gray-700 mb-1">
                  {dragActive
                    ? "Drop your PDF here"
                    : "Drag & drop your PDF here"}
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  or click to browse files
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    Text + scanned PDFs
                  </span>
                  <span>•</span>
                  <span>Max 20MB</span>
                </div>
              </div>
            )}

            {/* Uploading state */}
            {uploading && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-pink bg-pink-50/30 p-12">
                <Loader2 className="h-10 w-10 animate-spin text-brand-pink mb-4" />
                <p className="text-base font-semibold text-gray-700 mb-1">
                  Reading PDF (text + OCR)...
                </p>
                <p className="text-sm text-gray-400">
                  Scanned image PDFs may take longer while we OCR each page
                </p>
              </div>
            )}

            {/* Preview of extracted text + Analyze button */}
            {pdfInfo && text && (
              <>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 max-h-48 overflow-y-auto">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Extracted Text Preview
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {text.slice(0, 2000)}
                    {text.length > 2000 && (
                      <span className="text-gray-400">
                        ... ({(text.length - 2000).toLocaleString()} more characters)
                      </span>
                    )}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
                  <span className="text-xs text-gray-400">
                    {text.length.toLocaleString()} characters extracted
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={clearAll}
                      className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleAnalyze}
                      disabled={loading || !canAnalyze}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-pink to-brand-purple px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4" />
                          Analyze Document
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-5 py-3 text-sm text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Loading Animation */}
      {loading && (
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-5 shadow-lg border border-gray-100">
            <Loader2 className="h-6 w-6 animate-spin text-brand-pink" />
            <div className="text-left">
              <div className="font-semibold text-gray-800">
                Scanning your document...
              </div>
              <div className="text-sm text-gray-500">
                Our AI is reading every line for risks and gotchas
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="mt-12 space-y-8 animate-fade-in-up">
          {/* Risk Score Card */}
          <div className="rounded-3xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-gray-100 p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Score Circle */}
              <div className="relative flex-shrink-0">
                <svg
                  className="w-40 h-40 -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={
                      (result.riskScore ?? 0) <= 30
                        ? "#22c55e"
                        : (result.riskScore ?? 0) <= 60
                        ? "#eab308"
                        : (result.riskScore ?? 0) <= 80
                        ? "#f97316"
                        : "#ef4444"
                    }
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset={
                      283 - (283 * (result.riskScore ?? 0)) / 100
                    }
                    className="animate-score-fill"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={`text-4xl font-black ${
                      getRiskColor(result.riskScore ?? 0).text
                    }`}
                  >
                    {result.riskScore}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    / 100
                  </span>
                </div>
              </div>

              {/* Score Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      getRiskColor(result.riskScore ?? 0).bg
                    } text-white`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {getRiskColor(result.riskScore ?? 0).label}
                  </span>
                  <span className="text-sm text-gray-400">
                    {(result.redFlags || []).length} red flag
                    {(result.redFlags || []).length !== 1 ? "s" : ""} found
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Risk Assessment
                </h2>
                {result.documentType && (
                  <p className="text-sm font-semibold text-brand-purple mb-2">
                    Detected: {result.documentType}
                  </p>
                )}
                <p className="text-gray-500 leading-relaxed">
                  {result.summary}
                </p>

                <button
                  onClick={handleCopyReport}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Red Flags */}
          {(result.redFlags || []).length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Red Flags Found</h3>
                  <p className="text-sm text-gray-500">
                    Click each flag to see the original clause text
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {(result.redFlags || []).map((flag, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl border-l-4 bg-white shadow-sm border border-gray-100 overflow-hidden transition-all animate-slide-in ${getClauseColor(
                      flag.clause_type
                    )}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <button
                      onClick={() => toggleFlag(index)}
                      className="w-full flex items-center justify-between p-5 text-left"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold mb-1 ${getClauseBadgeColor(
                              flag.clause_type
                            )}`}
                          >
                            {flag.clause_type}
                          </span>
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {flag.dumbed_down}
                          </p>
                        </div>
                      </div>
                      {expandedFlags.has(index) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                      )}
                    </button>

                    {expandedFlags.has(index) && (
                      <div className="px-5 pb-5 pt-0">
                        <div className="rounded-xl bg-white/80 border border-gray-100 p-4">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            ⚠️ Plain English Explanation
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed mb-4">
                            {flag.dumbed_down}
                          </p>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            📄 Original Contract Text
                          </p>
                          <p className="text-sm text-gray-500 italic leading-relaxed border-l-2 border-gray-200 pl-3">
                            &ldquo;{flag.original_text}&rdquo;
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analyze Another */}
          <div className="text-center pt-4">
            <button
              onClick={() => {
                clearAll();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Analyze Another Contract
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
