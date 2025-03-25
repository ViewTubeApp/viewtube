import { env } from "@/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema",
  dialect: "mysql",
  dbCredentials: { url: env.DATABASE_URL },
  schemaFilter: ["public", "viewtube"],
});
