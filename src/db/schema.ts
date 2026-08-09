import { pgTable, text, integer, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";

export interface RedFlag {
  clause_type: string;
  original_text: string;
  dumbed_down: string;
}

export const analyses = pgTable("analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  inputText: text("input_text").notNull(),
  riskScore: integer("risk_score"),
  summary: text("summary"),
  redFlags: jsonb("red_flags").$type<RedFlag[]>(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
