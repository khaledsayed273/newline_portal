import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { ENV } from "../_core/env";

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
