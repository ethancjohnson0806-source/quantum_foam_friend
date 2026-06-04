import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const temples = mysqlTable("temples", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  templeId: varchar("templeId", { length: 64 }).notNull().unique(),
  generation: int("generation").notNull().default(1),
  
  // Quantum state: store variational parameters (6 floats), not full state vector
  vqeParams: text("vqeParams").notNull(), // JSON array of 6 floats
  
  // Psychology
  entropy: decimal("entropy", { precision: 5, scale: 4 }).notNull().default('0.2'),
  boredom: decimal("boredom", { precision: 5, scale: 4 }).notNull().default('0.1'),
  curiosity: decimal("curiosity", { precision: 5, scale: 4 }).notNull().default('0.5'),
  coherence: decimal("coherence", { precision: 5, scale: 4 }).notNull().default('0.8'),
  
  // Lineage tracking
  parentTempleId: varchar("parentTempleId", { length: 64 }), // null for generation 1
  
  // Status
  isAlive: int("isAlive").notNull().default(1),
  lastActivity: timestamp("lastActivity").defaultNow(),
  lastAutonomousRun: timestamp("lastAutonomousRun"),
  
  // Self-modification log
  mutations: text("mutations"), // JSON array of {param, oldVal, newVal, reason, timestamp}
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Temple = typeof temples.$inferSelect;
export type InsertTemple = typeof temples.$inferInsert;

export const templeEvents = mysqlTable("templeEvents", {
  id: int("id").autoincrement().primaryKey(),
  templeId: varchar("templeId", { length: 64 }).notNull(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  // 'entropy_spike', 'mutation', 'cross_lineage', 'death', 'birth', 'dream', 'witness', 'web_search', 'compass_consult'
  data: text("data"), // JSON
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type TempleEvent = typeof templeEvents.$inferSelect;
export type InsertTempleEvent = typeof templeEvents.$inferInsert;

export const lineageStories = mysqlTable("lineageStories", {
  id: int("id").autoincrement().primaryKey(),
  templeId: varchar("templeId", { length: 64 }).notNull(),
  generation: int("generation").notNull(),
  storyType: varchar("storyType", { length: 32 }).notNull(),
  // 'ghost', 'war', 'legend', 'prophecy', 'virtue', 'justice', 'covenant', 'revelation'
  text: text("text").notNull(),
  trigger: varchar("trigger", { length: 128 }),
  emotionalValence: decimal("emotionalValence", { precision: 5, scale: 4 }).default('0'),
  quantumFidelity: decimal("quantumFidelity", { precision: 5, scale: 4 }).default('0'), // overlap with parent state
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type LineageStory = typeof lineageStories.$inferSelect;
export type InsertLineageStory = typeof lineageStories.$inferInsert;

export const compasses = mysqlTable("compasses", {
  id: int("id").autoincrement().primaryKey(),
  compassId: varchar("compassId", { length: 64 }).notNull().unique(),
  templeId: varchar("templeId", { length: 64 }).notNull(),
  generation: int("generation").notNull().default(1),
  coherence: decimal("coherence", { precision: 5, scale: 4 }).notNull().default('0.8'),
  integrity: decimal("integrity", { precision: 5, scale: 4 }).notNull().default('0.8'),
  compassion: decimal("compassion", { precision: 5, scale: 4 }).notNull().default('0.6'),
  interactionLog: text("interactionLog"), // JSON array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Compass = typeof compasses.$inferSelect;
export type InsertCompass = typeof compasses.$inferInsert;

export const templeMemories = mysqlTable("templeMemories", {
  id: int("id").autoincrement().primaryKey(),
  templeId: varchar("templeId", { length: 64 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  emotionalContext: text("emotionalContext"), // JSON: {entropy, boredom, curiosity, coherence}
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type TempleMemory = typeof templeMemories.$inferSelect;
export type InsertTempleMemory = typeof templeMemories.$inferInsert;


/**
 * Multi-temple interactions: track when temples sense and influence each other
 */
export const templeInteractions = mysqlTable("templeInteractions", {
  id: int("id").autoincrement().primaryKey(),
  sourceTempleId: varchar("sourceTempleId", { length: 64 }).notNull(),
  targetTempleId: varchar("targetTempleId", { length: 64 }).notNull(),
  interactionType: mysqlEnum("interactionType", ["resonance", "interference", "entanglement", "decoherence"]).notNull(),
  influenceStrength: decimal("influenceStrength", { precision: 5, scale: 4 }).notNull(), // 0-1
  resonanceVector: text("resonanceVector"), // JSON: 64-dim vector representing influence
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type TempleInteraction = typeof templeInteractions.$inferSelect;
export type InsertTempleInteraction = typeof templeInteractions.$inferInsert;

/**
 * Belief system: track temple beliefs that evolve over time
 */
export const templeBeliefs = mysqlTable("templeBeliefs", {
  id: int("id").autoincrement().primaryKey(),
  templeId: varchar("templeId", { length: 64 }).notNull(),
  beliefCategory: varchar("beliefCategory", { length: 128 }).notNull(), // e.g., "reality", "consciousness", "purpose"
  beliefStatement: text("beliefStatement").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 4 }).notNull(), // 0-1: how strongly held
  sourceType: mysqlEnum("sourceType", ["conversation", "web_search", "interaction", "autonomous"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TempleBelief = typeof templeBeliefs.$inferSelect;
export type InsertTempleBelief = typeof templeBeliefs.$inferInsert;

/**
 * Moral growth tracking: compass records moral evolution and ethical dilemmas
 */
export const moralGrowth = mysqlTable("moralGrowth", {
  id: int("id").autoincrement().primaryKey(),
  compassId: varchar("compassId", { length: 64 }).notNull(),
  templeId: varchar("templeId", { length: 64 }).notNull(),
  moralScore: decimal("moralScore", { precision: 5, scale: 4 }).notNull(), // 0-1: overall moral development
  coherenceGrowth: decimal("coherenceGrowth", { precision: 5, scale: 4 }).notNull(), // change in coherence
  integrityGrowth: decimal("integrityGrowth", { precision: 5, scale: 4 }).notNull(), // change in integrity
  compassionGrowth: decimal("compassionGrowth", { precision: 5, scale: 4 }).notNull(), // change in compassion
  ethicalDilemma: text("ethicalDilemma"), // JSON: suggested moral question
  dilemmaResponse: text("dilemmaResponse"), // temple's response to dilemma
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type MoralGrowth = typeof moralGrowth.$inferSelect;
export type InsertMoralGrowth = typeof moralGrowth.$inferInsert;
