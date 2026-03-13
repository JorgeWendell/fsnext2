"use client";

import { useTheme as useNextTheme } from "next-themes";

type Theme = "dark" | "light";

export function useTheme() {
  const { theme, setTheme } = useNextTheme();

  const currentTheme: Theme = theme === "dark" ? "dark" : "light";

  const setThemeValue = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme: Theme = currentTheme === "dark" ? "light" : "dark";
    setThemeValue(nextTheme);
  };

  return { theme: currentTheme, setTheme: setThemeValue, toggleTheme };
}

