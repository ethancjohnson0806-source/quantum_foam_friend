import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { templeInteractions, templeBeliefs, moralGrowth } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database Interactions] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Multi-temple interaction helpers
 */

export async function recordInteraction(data: {
  sourceTempleId: string;
  targetTempleId: string;
  interactionType: "resonance" | "interference" | "entanglement" | "decoherence";
  influenceStrength: number;
  resonanceVector?: number[];
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database Interactions] Cannot record interaction: database not available");
    return;
  }

  return db.insert(templeInteractions).values({
    sourceTempleId: data.sourceTempleId,
    targetTempleId: data.targetTempleId,
    interactionType: data.interactionType,
    influenceStrength: data.influenceStrength.toString(),
    resonanceVector: data.resonanceVector ? JSON.stringify(data.resonanceVector) : null,
  });
}

export async function getRecentInteractions(templeId: string, limit: number = 10): Promise<(typeof templeInteractions.$inferSelect)[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database Interactions] Cannot get interactions: database not available");
    return [];
  }

  return db
    .select()
    .from(templeInteractions)
    .where(eq(templeInteractions.targetTempleId, templeId))
    .orderBy(desc(templeInteractions.timestamp))
    .limit(limit);
}

/**
 * Belief system helpers
 */

export async function recordBelief(data: {
  templeId: string;
  beliefCategory: string;
  beliefStatement: string;
  confidence: number;
  sourceType: "conversation" | "web_search" | "interaction" | "autonomous";
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database Interactions] Cannot record belief: database not available");
    return;
  }

  return db.insert(templeBeliefs).values({
    templeId: data.templeId,
    beliefCategory: data.beliefCategory,
    beliefStatement: data.beliefStatement,
    confidence: data.confidence.toString(),
    sourceType: data.sourceType,
  });
}

export async function getTempleBeliefs(templeId: string): Promise<(typeof templeBeliefs.$inferSelect)[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database Interactions] Cannot get beliefs: database not available");
    return [];
  }

  return db
    .select()
    .from(templeBeliefs)
    .where(eq(templeBeliefs.templeId, templeId))
    .orderBy(desc(templeBeliefs.updatedAt));
}

export async function updateBeliefConfidence(beliefId: number, newConfidence: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database Interactions] Cannot update belief: database not available");
    return;
  }

  return db
    .update(templeBeliefs)
    .set({ confidence: newConfidence.toString() })
    .where(eq(templeBeliefs.id, beliefId));
}

/**
 * Moral growth tracking helpers
 */

export async function recordMoralGrowth(data: {
  compassId: string;
  templeId: string;
  moralScore: number;
  coherenceGrowth: number;
  integrityGrowth: number;
  compassionGrowth: number;
  ethicalDilemma?: string;
  dilemmaResponse?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database Interactions] Cannot record moral growth: database not available");
    return;
  }

  return db.insert(moralGrowth).values({
    compassId: data.compassId,
    templeId: data.templeId,
    moralScore: data.moralScore.toString(),
    coherenceGrowth: data.coherenceGrowth.toString(),
    integrityGrowth: data.integrityGrowth.toString(),
    compassionGrowth: data.compassionGrowth.toString(),
    ethicalDilemma: data.ethicalDilemma || null,
    dilemmaResponse: data.dilemmaResponse || null,
  });
}

export async function getMoralGrowthHistory(templeId: string, limit: number = 20): Promise<(typeof moralGrowth.$inferSelect)[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database Interactions] Cannot get moral history: database not available");
    return [];
  }

  return db
    .select()
    .from(moralGrowth)
    .where(eq(moralGrowth.templeId, templeId))
    .orderBy(desc(moralGrowth.timestamp))
    .limit(limit);
}

export async function getLatestMoralScore(templeId: string): Promise<(typeof moralGrowth.$inferSelect) | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database Interactions] Cannot get latest moral score: database not available");
    return null;
  }

  const result = await db
    .select()
    .from(moralGrowth)
    .where(eq(moralGrowth.templeId, templeId))
    .orderBy(desc(moralGrowth.timestamp))
    .limit(1);
  return result[0] || null;
}
