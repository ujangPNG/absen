import { pgTable, serial, varchar, timestamp, text, integer, decimal } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const attendances = pgTable("attendances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  timestamp: text("timestamp"),//.notNull(),
  createdAt: timestamp("created_at",{withTimezone:true}).defaultNow().notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  accuracy: decimal(),
  // photoUrl: text("photo_url"), // link ke storage (misal Supabase/Vercel Blob)
  photoBlobUrl: text("photo_blob_url"), // link ke storage (misal Supabase/Vercel Blob)
  address: text("address"), // link ke storage (misal Supabase/Vercel Blob)
});
