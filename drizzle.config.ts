import { env } from "@/env";
import debug from "debug";
import { defineConfig } from "drizzle-kit";

debug("drizzle:config")(env);

export default defineConfig({
  schema: "./src/server/db/schema",
  dialect: "mysql",
  dbCredentials: { url: env.DATABASE_URL },
  schemaFilter: ["public", "viewtube"],
});
