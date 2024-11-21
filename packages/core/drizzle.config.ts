import { Resource } from "sst";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  // Pick up all our schema files
  schema: ["./src/**/*.sql.ts"],
  out: "./migrations",
  dbCredentials: {
    ssl: {
      rejectUnauthorized: false,
    },
    host: Resource.BigSpellaDB.host,
    port: Resource.BigSpellaDB.port,
    user: Resource.BigSpellaDB.username,
    password: Resource.BigSpellaDB.password,
    database: Resource.BigSpellaDB.database,
  },
});
