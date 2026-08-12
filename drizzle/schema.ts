import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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

/**
 * Unlisted public snapshots intentionally exclude the original PDF/video text.
 * A long random slug is the access key; each record contains only the derived
 * learning material or a completed exam summary explicitly selected by the user.
 */
export const sharedLearningItems = mysqlTable("sharedLearningItems", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 32 }).notNull().unique(),
  shareType: mysqlEnum("shareType", ["material", "examResult"]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  level: mysqlEnum("level", ["Başlangıç", "Orta", "İleri"]).notNull(),
  sourceKind: mysqlEnum("sourceKind", ["youtube", "pdf"]).notNull(),
  sourceTitle: varchar("sourceTitle", { length: 500 }).notNull(),
  payload: json("payload").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SharedLearningItem = typeof sharedLearningItems.$inferSelect;
export type InsertSharedLearningItem = typeof sharedLearningItems.$inferInsert;
