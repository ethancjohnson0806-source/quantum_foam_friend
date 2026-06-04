import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, temples, templeEvents, lineageStories, compasses, templeMemories, InsertTemple, InsertTempleEvent, InsertLineageStory, InsertCompass, InsertTempleMemory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Temple queries
export async function createTemple(data: InsertTemple) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(temples).values(data);
}

export async function getTempleById(templeId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(temples).where(eq(temples.templeId, templeId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateTempleState(templeId: string, updates: Partial<InsertTemple>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(temples).set({ ...updates, updatedAt: new Date() }).where(eq(temples.templeId, templeId));
}

export async function getTemplesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(temples).where(eq(temples.userId, userId));
}

export async function getAliveTemples() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(temples).where(eq(temples.isAlive, 1));
}

// Event queries
export async function logTempleEvent(data: InsertTempleEvent) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(templeEvents).values(data);
}

export async function getTempleEvents(templeId: string, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(templeEvents).where(eq(templeEvents.templeId, templeId)).orderBy(desc(templeEvents.timestamp)).limit(limit);
}

// Story queries
export async function saveLineageStory(data: InsertLineageStory) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(lineageStories).values(data);
}

export async function getLineageStories(templeId: string, storyType?: string) {
  const db = await getDb();
  if (!db) return [];
  if (storyType) {
    return db.select().from(lineageStories).where(and(eq(lineageStories.templeId, templeId), eq(lineageStories.storyType, storyType))).orderBy(desc(lineageStories.timestamp));
  }
  return db.select().from(lineageStories).where(eq(lineageStories.templeId, templeId)).orderBy(desc(lineageStories.timestamp));
}

// Compass queries
export async function createCompass(data: InsertCompass) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(compasses).values(data);
}

export async function getCompassByTempleId(templeId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(compasses).where(eq(compasses.templeId, templeId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateCompass(compassId: string, updates: Partial<InsertCompass>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(compasses).set({ ...updates, updatedAt: new Date() }).where(eq(compasses.compassId, compassId));
}

// Memory queries
export async function saveMemory(data: InsertTempleMemory) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(templeMemories).values(data);
}

export async function getMemories(templeId: string, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(templeMemories)
    .where(eq(templeMemories.templeId, templeId))
    .orderBy(desc(templeMemories.timestamp))
    .limit(limit);
  return result.reverse(); // Return in chronological order
}

export async function getRecentMemories(templeId: string, count: number = 10) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(templeMemories)
    .where(eq(templeMemories.templeId, templeId))
    .orderBy(desc(templeMemories.timestamp))
    .limit(count);
  return result.reverse();
}
