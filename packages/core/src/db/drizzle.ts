import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { Resource } from "sst";
import * as schema from "./schema/game.sql";

// Create connection pool
const pool = new Pool({
  host: Resource.BigSpellaDB.host,
  port: Resource.BigSpellaDB.port,
  user: Resource.BigSpellaDB.username,
  password: Resource.BigSpellaDB.password,
  database: Resource.BigSpellaDB.database,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
});

// Create drizzle database instance
export const db = drizzle(pool, { schema });

// Utility function to run migrations
export async function runMigrations() {
  console.log("Running migrations...");
  try {
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Utility function to check database connection
export async function checkConnection() {
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Cleanup function for graceful shutdown
export async function closeConnection() {
  try {
    await pool.end();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error closing database connection:", error);
    throw error;
  }
}
