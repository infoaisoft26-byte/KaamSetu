import { Pool } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured.");
}

const globalForDb = globalThis as unknown as { kaamsetuPool?: Pool };

export const db = globalForDb.kaamsetuPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});

if (process.env.NODE_ENV !== "production") globalForDb.kaamsetuPool = db;
