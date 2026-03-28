import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  pgPool?: Pool;
};

export const db =
  globalForDb.pgPool ??
  new Pool({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? 5432),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = db;
}