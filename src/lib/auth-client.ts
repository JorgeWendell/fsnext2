import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "http://fs.adelbr.tech:3000"
      : "http://localhost:3000",
  fetchOptions: {
    timeout: 15000,
  },
});
