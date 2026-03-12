import { useEffect, useState, useCallback, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import { getGlobalStyles, ThemeContext, type ThemeMode } from "./lib/theme.js";
import AppShell from "./components/layout/AppShell.js";
import LandingPage from "./components/landing/LandingPage.js";
import SandboxLoader from "./components/landing/SandboxLoader.js";

const DEV_USER = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "steve@getu.ai",
  user_metadata: { full_name: "Steve" },
} as unknown as User;

const THEME_KEY = "getu-theme";

function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch { /* SSR / restricted */ }
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export default function App() {
  const [view, setView] = useState<"landing" | "loading" | "app">("landing");
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => {
      const next = prev === "light" ? "dark" : "light";
      try { localStorage.setItem(THEME_KEY, next); } catch { /* noop */ }
      return next;
    });
  }, []);

  const themeCtx = useMemo(() => ({ mode: themeMode, toggle: toggleTheme }), [themeMode, toggleTheme]);

  useEffect(() => {
    const id = "getu-global-styles";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = getGlobalStyles(themeMode);
    return () => {};
  }, [themeMode]);

  const handleGetStarted = useCallback(() => setView("loading"), []);
  const handleLoaded = useCallback(() => setView("app"), []);

  return (
    <ThemeContext.Provider value={themeCtx}>
      {view === "landing" && (
        <LandingPage onGetStarted={handleGetStarted} onSignIn={handleGetStarted} />
      )}
      {view === "loading" && <SandboxLoader onReady={handleLoaded} />}
      {view === "app" && <AppShell user={DEV_USER} />}
    </ThemeContext.Provider>
  );
}
