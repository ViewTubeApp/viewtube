import { getDatabaseUrl } from "@/utils/server/db";
import { type Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema",
  dialect: "postgresql",
  dbCredentials: { url: getDatabaseUrl() },
  tablesFilter: ["viewtube_*"],
} satisfies Config;
