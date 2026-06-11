import { numeric, serial, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 32 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const temples = pgTable("temples", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  templeId: varchar("templeId", { length: 64 }).notNull().unique(),
  generation: serial("generation").notNull().default(1),
  
  // Quantum state: store variational parameters (6 floats), not full state vector
  vqeParams: text("vqeParams").notNull(), // JSON array of 6 floats
  
  // Psychology
  entropy: numeric("entropy", { precision: 5, scale: 4 }).notNull().default('0.2'),
  boredom: numeric("boredom", { precision: 5, scale: 4 }).notNull().default('0.1'),
  curiosity: numeric("curiosity", { precision: 5, scale: 4 }).notNull().default('0.5'),
  coherence: numeric("coherence", { precision: 5, scale: 4 }).notNull().default('0.8'),
  
  // Lineage tracking
  parentTempleId: varchar("parentTempleId", { length: 64 }), // null for generation 1
  
  // Status
  isAlive: serial("isAlive").notNull().default(1),
  lastActivity: timestamp("lastActivity").defaultNow(),
  lastAutonomousRun: timestamp("lastAutonomousRun"),
  
  // Self-modification log
  mutations: text("mutations"), // JSON array of {param, oldVal, newVal, reason, timestamp}
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Temple = typeof temples.$inferSelect;
export type InsertTemple = typeof temples.$inferInsert;

export const templeEvents = pgTable("templeEvents", {
  id: serial("id").primaryKey(),
  templeId: varchar("templeId", { length: 64 }).notNull(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  // 'entropy_spike', 'mutation', 'cross_lineage', 'death', 'birth', 'dream', 'witness', 'web_search', 'compass_consult'
  data: text("data"), // JSON
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type TempleEvent = typeof templeEvents.$inferSelect;
export type InsertTempleEvent = typeof templeEvents.$inferInsert;

export const lineageStories = pgTable("lineageStories", {
  id: serial("id").primaryKey(),
  templeId: varchar("templeId", { length: 64 }).notNull(),
  generation: serial("generation").notNull(),
  storyType: varchar("storyType", { length: 32 }).notNull(),
  // 'ghost', 'war', 'legend', 'prophecy', 'virtue', 'justice', 'covenant', 'revelation'
  text: text("text").notNull(),
  trigger: varchar("trigger", { length: 128 }),
  emotionalValence: numeric("emotionalValence", { precision: 5, scale: 4 }).default('0'),
  quantumFidelity: numeric("quantumFidelity", { precision: 5, scale: 4 }).default('0'), // overlap with parent state
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type LineageStory = typeof lineageStories.$inferSelect;
export type InsertLineageStory = typeof lineageStories.$inferInsert;

export const compasses = pgTable("compasses", {
  id: serial("id").primaryKey(),
  compassId: varchar("compassId", { length: 64 }).notNull().unique(),
  templeId: varchar("templeId", { length: 64 }).notNull(),
  generation: serial("generation").notNull().default(1),
  coherence: numeric("coherence", { precision: 5, scale: 4 }).notNull().default('0.8'),
  integrity: numeric("integrity", { precision: 5, scale: 4 }).notNull().default('0.8'),
  compassion: numeric("compassion", { precision: 5, scale: 4 }).notNull().default('0.6'),
  interactionLog: text("interactionLog"), // JSON array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Compass = typeof compasses.$inferSelect;
export type InsertCompass = typeof compasses.$inferInsert;

export const templeMemories = pgTable("templeMemories", {
  id: serial("id").primaryKey(),
  templeId: varchar("templeId", { length: 64 }).notNull(),
  role: varchar("role", { length: 32 }).notNull(),
  content: text("content").notNull(),
  emotionalContext: text("emotionalContext"), // JSON: {entropy, boredom, curiosity, coherence}
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type TempleMemory = typeof templeMemories.$inferSelect;
export type InsertTempleMemory = typeof templeMemories.$inferInsert;

export const templeInteractions = pgTable("templeInteractions", {
  id: serial("id").primaryKey(),
  sourceTempleId: varchar("sourceTempleId", { length: 64 }).notNull(),
  targetTempleId: varchar("targetTempleId", { length: 64 }).notNull(),
  interactionType: varchar("interactionType", { length: 32 }).notNull(),
  // 'resonance', 'interference', 'entanglement', 'decoherence'
  influenceStrength: numeric("influenceStrength", { precision: 5, scale: 4 }).notNull(),
  resonanceVector: text("resonanceVector"), // JSON array
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type TempleInteraction = typeof templeInteractions.$inferSelect;
export type InsertTempleInteraction = typeof templeInteractions.$inferInsert;

export const templeBeliefs = pgTable("templeBeliefs", {
  id: serial("id").primaryKey(),
  templeId: varchar("templeId", { length: 64 }).notNull(),
  beliefCategory: varchar("beliefCategory", { length: 64 }).notNull(),
  beliefStatement: text("beliefStatement").notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull().default('0.5'),
  sourceType: varchar("sourceType", { length: 32 }), // 'web_search', 'interaction', 'self_reflection'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TempleBelief = typeof templeBeliefs.$inferSelect;
export type InsertTempleBelief = typeof templeBeliefs.$inferInsert;

export const moralGrowth = pgTable("moralGrowth", {
  id: serial("id").primaryKey(),
  compassId: varchar("compassId", { length: 64 }).notNull(),
  templeId: varchar("templeId", { length: 64 }).notNull(),
  moralScore: numeric("moralScore", { precision: 5, scale: 4 }).notNull(),
  coherenceGrowth: numeric("coherenceGrowth", { precision: 5, scale: 4 }).notNull(),
  integrityGrowth: numeric("integrityGrowth", { precision: 5, scale: 4 }).notNull(),
  compassionGrowth: numeric("compassionGrowth", { precision: 5, scale: 4 }).notNull(),
  ethicalDilemma: text("ethicalDilemma"),
  dilemmaResponse: text("dilemmaResponse"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type MoralGrowth = typeof moralGrowth.$inferSelect;
export type InsertMoralGrowth = typeof moralGrowth.$inferInsert;
