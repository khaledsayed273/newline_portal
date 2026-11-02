import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { ENV } from "../_core/env";
import { users } from "../../drizzle/schema";

// Keep the schema surface in one infrastructure module so repositories do not
// need to know how the database connection is initialized.
export * from "../../drizzle/schema";

let db: MySql2Database | null = null;

export async function getDb() {
  if (!db && ENV.databaseUrl) {
    try {
      const pool = mysql.createPool({
        uri: ENV.databaseUrl,
        waitForConnections: true,
        connectionLimit: 10,
      });
      db = drizzle(pool, { mode: "default" });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      db = null;
    }
  }
  return db;
}

export function getDatabaseTarget(): string {
  if (!ENV.databaseUrl) return "not configured";
  try {
    const url = new URL(ENV.databaseUrl);
    return `${url.hostname}:${url.port || "3306"}/${url.pathname.slice(1)}`;
  } catch {
    return "invalid DATABASE_URL";
  }
}

export async function checkDatabaseConnection(): Promise<void> {
  const database = await getDb();
  if (!database) throw new Error("DATABASE_URL is not configured");
  await database.select({ id: users.id }).from(users).limit(1);
}
