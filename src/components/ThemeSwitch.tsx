"use client";
import { useTheme } from "@/lib/ThemeProvider";

export default function ThemeSwitch() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      className="ck-theme-switch"
      onClick={toggle}
      aria-label={theme === "dark" ? "切换浅色主题" : "切换深色主题"}
      title={theme === "dark" ? "浅色主题" : "深色主题"}
    >
      <span aria-hidden>{theme === "dark" ? "☼" : "☾"}</span>
      <span className="hidden sm:inline">{theme === "dark" ? "纸月" : "月夜"}</span>
    </button>
  );
}