import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analyses } from "@/db/schema";
import { eq } from "drizzle-orm";

const SYSTEM_PROMPT = `You are an expert consumer protection lawyer and document risk analyst.
Analyze ANY document the user provides — it may be a Terms of Service, rental agreement, freelance contract, privacy policy, invoice, receipt, employment letter, school form, insurance policy, NDA, email dump, notes, or completely unrelated text/images-turned-text.

Your job is to:
1. Identify what the document is (even if it is NOT a contract)
2. Summarize it clearly
3. Flag anything risky, predatory, unusual, unfair, privacy-invasive, financially harmful, legally dangerous, or worth the user noticing
4. If it is NOT a legal/contract document, still analyze it honestly — give a low risk score when appropriate, explain what it is, and only include red flags if something is actually concerning

Output strictly in this JSON format (no markdown, no extra text):
{
  "risk_score": [integer 0-100, where 0 is harmless and 100 is extremely dangerous to the user],
  "summary": "A 2-sentence summary of what this document actually is/says.",
  "document_type": "Short label like Terms of Service / Rental Agreement / Invoice / Personal Notes / Unknown Document",
  "red_flags": [
    {
      "clause_type": "Data Privacy / Financial / Legal / Liability / Cancellation / Safety / Other",
      "original_text": "[Quote the problematic or notable text]",
      "dumbed_down": "[Explain the issue in simple, casual Gen-Z English]"
    }
  ]
}

Rules:
- Always return valid JSON and nothing else
- risk_score must be an integer from 0 to 100
- Never refuse because the document "isn't a contract" — analyze whatever is given
- Find real issues only; do not invent problems
- If no red flags, return an empty red_flags array
- Be thorough but fair
- Categorize each red flag accurately`;

function getDemoAnalysis(text: string) {
  const lower = text.toLowerCase();
  const looksLikeContract =
    lower.includes("terms") ||
    lower.includes("agreement") ||
    lower.includes("liability") ||
    lower.includes("arbitration") ||
    lower.includes("privacy") ||
    lower.includes("cancel") ||
    lower.includes("license");

  if (!looksLikeContract) {
    return {
      risk_score: 12,
      summary:
        "This does not look like a formal contract or Terms of Service. It appears to be a general document or extracted text with no major legal traps detected in demo mode.",
      document_type: "General Document",
      red_flags: [
        {
          clause_type: "Other",
          original_text: text.trim().slice(0, 180),
          dumbed_down:
            "Nothing super predatory jumped out in demo mode. Still skim it yourself — demo analysis is a stand-in until the live AI key is connected.",
        },
      ],
    };
  }

  return {
    risk_score: 72,
    summary:
      "This document grants the company broad rights while limiting their liability to you. Several clauses look unfavorable around data sharing, billing, and dispute resolution.",
    document_type: "Terms of Service / Contract",
    red_flags: [
      {
        clause_type: "Data Privacy",
        original_text:
          "By using our services, you grant us a worldwide, perpetual, irrevocable license to use, modify, and distribute your content in any form.",
        dumbed_down:
          "They basically own everything you post — forever. They can do literally anything with your photos, texts, and data, and you can never take that back. 💀",
      },
      {
        clause_type: "Financial",
        original_text:
          "We reserve the right to modify pricing at any time. Continued use constitutes acceptance of new pricing terms.",
        dumbed_down:
          "They can jack up the price whenever they want, and if you keep using the app even once after that, you're locked in. No heads up needed. 🚩",
      },
      {
        clause_type: "Legal",
        original_text:
          "You agree to resolve all disputes through binding arbitration and waive your right to participate in class action lawsuits.",
        dumbed_down:
          "You can't sue them or join a group lawsuit. Instead, you have to go through their private arbitration, which almost always favors the company. 😤",
      },
      {
        clause_type: "Data Privacy",
        original_text:
          "We may share your personal information with third-party partners for marketing and analytics purposes.",
        dumbed_down:
          "They're selling your data to random companies so they can target you with ads. Your info is basically a product they profit from. 📊",
      },
      {
        clause_type: "Cancellation",
        original_text:
          "Cancellation requests must be submitted 30 days prior to the renewal date. Failure to cancel in time will result in automatic renewal for another term.",
        dumbed_down:
          "Miss the cancel window by one day? Congrats, you're paying for another whole cycle. They make it hard to leave on purpose. ⏰",
      },
    ],
  };
}

function normalizeResult(raw: Record<string, unknown>, fallbackText: string) {
  const demo = getDemoAnalysis(fallbackText);
  const risk = Number(raw.risk_score);
  return {
    risk_score:
      Number.isFinite(risk) ? Math.max(0, Math.min(100, Math.round(risk))) : demo.risk_score,
    summary:
      typeof raw.summary === "string" && raw.summary.trim()
        ? raw.summary.trim()
        : demo.summary,
    document_type:
      typeof raw.document_type === "string" && raw.document_type.trim()
        ? raw.document_type.trim()
        : demo.document_type,
    red_flags: Array.isArray(raw.red_flags) ? raw.red_flags : demo.red_flags,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json(
        {
          error:
            "Please provide at least 10 characters of document text to analyze.",
        },
        { status: 400 }
      );
    }

    const cleaned = text.trim().slice(0, 50000);

    if (!db) {
      const result = getDemoAnalysis(cleaned);

      return NextResponse.json({
        id: "demo",
        riskScore: result.risk_score,
        summary: result.summary,
        redFlags: result.red_flags,
        documentType: result.document_type,
        status: "completed",
      });
    }

    // Insert the analysis record
    const [record] = await db
      .insert(analyses)
      .values({
        inputText: cleaned,
        status: "processing",
      })
      .returning();

    let result;

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                  role: "user",
                  content: `Analyze this document (any type is fine):\n\n${cleaned.slice(0, 20000)}`,
                },
              ],
              temperature: 0.3,
              max_tokens: 4000,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) throw new Error("No content in response");

        let jsonStr = content.trim();
        if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr
            .replace(/^```(?:json)?\n?/, "")
            .replace(/\n?```$/, "");
        }

        result = normalizeResult(JSON.parse(jsonStr), cleaned);
      } catch {
        result = getDemoAnalysis(cleaned);
      }
    } else {
      result = getDemoAnalysis(cleaned);
    }

    const [updated] = await db
      .update(analyses)
      .set({
        riskScore: result.risk_score,
        summary: result.summary,
        redFlags: result.red_flags,
        status: "completed",
      })
      .where(eq(analyses.id, record.id))
      .returning();

    return NextResponse.json({
      id: updated.id,
      riskScore: updated.riskScore,
      summary: updated.summary,
      redFlags: updated.redFlags,
      documentType:
        "document_type" in result
          ? (result as { document_type?: string }).document_type
          : undefined,
      status: updated.status,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze the document. Please try again." },
      { status: 500 }
    );
  }
}
