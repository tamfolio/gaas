"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ onDark = false }: { onDark?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ width: "2rem", height: "2rem" }} />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0.25rem",
        borderRadius: "0.375rem",
        color: onDark ? "rgba(255,255,255,0.5)" : "var(--muted-foreground)",
        fontSize: "1rem",
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "2rem",
        height: "2rem",
        transition: "color 0.15s",
      }}
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}
