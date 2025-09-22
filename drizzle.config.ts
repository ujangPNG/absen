import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts", // lokasi schema
  out: "./drizzle", // folder hasil migrasi
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
} satisfies Config;
