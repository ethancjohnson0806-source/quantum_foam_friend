import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { templeInteractions, templeBeliefs, moralGrowth } from "../drizzle/schema";
import { ENV } from './_core/env';

const db = drizzle({
  connection: {
    host: ENV.DB_HOST,
    user: ENV.DB_USER,
    password: ENV.DB_PASSWORD,
    database: ENV.DB_NAME,
    port: ENV.DB_PORT,
  },
});

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
  return db.insert(templeInteractions).values({
    sourceTempleId: data.sourceTempleId,
    targetTempleId: data.targetTempleId,
    interactionType: data.interactionType,
    influenceStrength: data.influenceStrength.toString(),
    resonanceVector: data.resonanceVector ? JSON.stringify(data.resonanceVector) : null,
  });
}

export async function getRecentInteractions(templeId: string, limit: number = 10) {
  return db
    .select()
    .from(templeInteractions)
    .where(eq(templeInteractions.targetTempleId, templeId))
    .orderBy(templeInteractions.timestamp)
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
  return db.insert(templeBeliefs).values({
    templeId: data.templeId,
    beliefCategory: data.beliefCategory,
    beliefStatement: data.beliefStatement,
    confidence: data.confidence.toString(),
    sourceType: data.sourceType,
  });
}

export async function getTempleBeliefs(templeId: string) {
  return db
    .select()
    .from(templeBeliefs)
    .where(eq(templeBeliefs.templeId, templeId))
    .orderBy(templeBeliefs.updatedAt);
}

export async function updateBeliefConfidence(beliefId: number, newConfidence: number) {
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

export async function getMoralGrowthHistory(templeId: string, limit: number = 20) {
  return db
    .select()
    .from(moralGrowth)
    .where(eq(moralGrowth.templeId, templeId))
    .orderBy(moralGrowth.timestamp)
    .limit(limit);
}

export async function getLatestMoralScore(templeId: string) {
  const result = await db
    .select()
    .from(moralGrowth)
    .where(eq(moralGrowth.templeId, templeId))
    .orderBy(moralGrowth.timestamp)
    .limit(1);
  return result[0] || null;
}
