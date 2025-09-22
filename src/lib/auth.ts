import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db"; // your drizzle instance
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  user: {
    modelName: "usersTable",
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://fs.adelbr.tech",
    "http://fs.adelbr.tech:3000",
  ],
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://fs.adelbr.tech"
      : "http://localhost:3000",
});
