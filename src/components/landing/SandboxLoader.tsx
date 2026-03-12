import { useState, useEffect } from "react";
import { T } from "../../lib/theme.js";

interface Props {
  onReady: () => void;
}

const STEPS = [
  { label: "Initializing sandbox environment",   duration: 800 },
  { label: "Provisioning ARIA orchestrator",      duration: 1000 },
  { label: "Loading agent toolkit",               duration: 700 },
  { label: "Sandbox ready",                        duration: 600 },
];

export default function SandboxLoader({ onReady }: Props) {
  const [current, setCurrent] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (current >= STEPS.length) {
      const t = setTimeout(() => setFadeOut(true), 200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCurrent(c => c + 1), STEPS[current].duration);
    return () => clearTimeout(t);
  }, [current]);

  useEffect(() => {
    if (!fadeOut) return;
    const t = setTimeout(onReady, 400);
    return () => clearTimeout(t);
  }, [fadeOut, onReady]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: T.bg,
        transition: "opacity .4s ease",
        opacity: fadeOut ? 0 : 1,
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 40, animation: "fadeUp .3s ease both" }}>
        <span style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 500, color: T.text }}>
          getu<span style={{ color: T.green }}>.ai</span>
        </span>
      </div>

      {/* Steps */}
      <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 14 }}>
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current && current < STEPS.length;
          const pending = i > current;
          const isLast = i === STEPS.length - 1;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: pending ? 0 : 1,
                transform: pending ? "translateY(4px)" : "none",
                transition: "opacity .3s ease, transform .3s ease",
              }}
            >
              {/* Icon */}
              <div style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "fadeUp .2s ease both" }}>
                    <circle cx="8" cy="8" r="7" stroke={T.green} strokeWidth="1.5" fill={isLast ? T.greenLight : "none"} />
                    <path d="M5 8l2 2 4-4" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : active ? (
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: `2px solid ${T.green}`,
                      borderTopColor: "transparent",
                      animation: "spin .7s linear infinite",
                    }}
                  />
                ) : (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.borderMid }} />
                )}
              </div>

              {/* Label */}
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 12,
                  color: done && isLast ? T.green : done ? T.text : active ? T.text : T.textDim,
                  fontWeight: done && isLast ? 500 : 400,
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
