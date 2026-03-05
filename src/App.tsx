import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase.js";
import { GLOBAL_STYLES } from "./lib/theme.js";
import LandingPage from "./components/landing/LandingPage.js";
import AuthPage from "./components/auth/AuthPage.js";
import AppShell from "./components/layout/AppShell.js";

type View = "landing" | "auth" | "app";

export default function App() {
  const [user, setUser]     = useState<User | null>(null);
  const [view, setView]     = useState<View>("landing");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_STYLES;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      setView(u ? "app" : "landing");
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) setView("app");
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <LoadingScreen />;

  if (view === "landing") return (
    <LandingPage
      onGetStarted={() => setView("auth")}
      onSignIn={() => setView("auth")}
    />
  );

  if (view === "auth" || !user) return (
    <AuthPage onBack={() => setView("landing")} />
  );

  return <AppShell user={user} />;
}

function LoadingScreen() {
  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f2ed" }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#9a9690" }}>
        getu<span style={{ color: "#16a34a" }}>.ai</span>
      </span>
    </div>
  );
}
