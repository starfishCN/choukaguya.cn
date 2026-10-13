"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = document.cookie.match(/ck_theme=(dark|light)/)?.[1] as Theme | undefined;
    const next = saved ?? "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.cookie = `ck_theme=${next}; path=/; max-age=31536000`;
  };

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);