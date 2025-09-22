import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://fs.adelbr.tech"
      : "http://localhost:3000"),
});
