import { useState } from "react";
import { supabase } from "../../lib/supabase.js";
import { T } from "../../lib/theme.js";

type Mode = "signin" | "signup";

interface Props {
  onBack?: () => void;
}

export default function AuthPage({ onBack }: Props) {
  const [mode, setMode]         = useState<Mode>("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [sent, setSent]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "signup") {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) setError(err.message);
      else setSent(true);
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div style={outer}>
        <div style={card}>
          <Logo />
          <p style={{ fontSize: 14, color: T.textMid, textAlign: "center", lineHeight: 1.7 }}>
            Check your email — we sent a confirmation link to <strong>{email}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={outer}>
      <div style={card}>
        <Logo />

        {onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", color: T.textDim, fontSize: 12, cursor: "pointer", alignSelf: "flex-start", fontFamily: T.mono, padding: 0 }}>
            ← back
          </button>
        )}

        <h2 style={{ fontSize: 18, fontWeight: 600, color: T.text, textAlign: "center" }}>
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          {error && (
            <p style={{ fontSize: 12, color: "#dc2626", fontFamily: T.mono }}>{error}</p>
          )}
          <button type="submit" disabled={loading} style={primaryBtn}>
            {loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p style={{ fontSize: 12, color: T.textDim, textAlign: "center" }}>
          {mode === "signin" ? "No account? " : "Already have one? "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
            style={{ background: "none", border: "none", color: T.green, fontSize: 12, cursor: "pointer" }}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div style={{ textAlign: "center" }}>
      <span style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 500, color: T.text }}>
        getu<span style={{ color: T.green }}>.ai</span>
      </span>
    </div>
  );
}

const outer: React.CSSProperties = {
  minHeight:      "100vh",
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  background:     T.bg,
  padding:        "24px",
};

const card: React.CSSProperties = {
  background:    T.surface,
  border:        `1px solid ${T.border}`,
  borderRadius:  14,
  padding:       "32px 28px",
  width:         "100%",
  maxWidth:      360,
  display:       "flex",
  flexDirection: "column",
  gap:           18,
  boxShadow:     "0 4px 24px var(--t-shadow, rgba(0,0,0,0.06))",
};

const inputStyle: React.CSSProperties = {
  border:       `1px solid ${T.border}`,
  borderRadius: 8,
  padding:      "10px 12px",
  fontSize:     14,
  color:        T.text,
  background:   T.bg,
  fontFamily:   T.sans,
};

const primaryBtn: React.CSSProperties = {
  background:   T.text,
  color:        T.bg,
  border:       "none",
  borderRadius: 8,
  padding:      "11px 0",
  fontSize:     14,
  fontWeight:   500,
};
