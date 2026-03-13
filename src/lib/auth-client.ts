"use client";

import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NODE_ENV === "production"
    ? "http://fs.adelbr.tech:4200"
    : "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: "include",
    timeout: 15000,
  },
});
