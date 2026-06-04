import { db } from "./db-client";
import { templeMemories } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Temple memory helpers for conversation persistence
 */

export async function saveMemory(data: {
  templeId: string;
  role: "user" | "assistant" | "system";
  content: string;
  emotionalContext?: {
    entropy: number;
    boredom: number;
    curiosity: number;
    coherence: number;
  };
}) {
  return db.insert(templeMemories).values({
    templeId: data.templeId,
    role: data.role,
    content: data.content,
    emotionalContext: data.emotionalContext
      ? JSON.stringify(data.emotionalContext)
      : null,
  });
}

export async function getMemories(templeId: string, limit: number = 10) {
  return db
    .select()
    .from(templeMemories)
    .where(eq(templeMemories.templeId, templeId))
    .orderBy(templeMemories.timestamp)
    .limit(limit);
}

export async function getRecentMemories(templeId: string, minutes: number = 60) {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  return db
    .select()
    .from(templeMemories)
    .where(eq(templeMemories.templeId, templeId))
    .orderBy(templeMemories.timestamp)
    .limit(20);
}

export async function clearMemories(templeId: string) {
  return db.delete(templeMemories).where(eq(templeMemories.templeId, templeId));
}
