import { NextResponse } from "next/server";
import { db } from "@/db";
import { analyses } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  if (!db) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const records = await db
      .select({
        id: analyses.id,
        riskScore: analyses.riskScore,
        summary: analyses.summary,
        status: analyses.status,
        createdAt: analyses.createdAt,
        redFlagCount: analyses.redFlags,
      })
      .from(analyses)
      .orderBy(desc(analyses.createdAt))
      .limit(20);

    const formatted = records.map((r) => ({
      id: r.id,
      riskScore: r.riskScore,
      summary: r.summary,
      status: r.status,
      createdAt: r.createdAt,
      redFlagCount: Array.isArray(r.redFlagCount) ? r.redFlagCount.length : 0,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch analyses:", error);
    return NextResponse.json([], { status: 200 });
  }
}
