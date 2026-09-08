"use client";

import Link from "next/link";

export default function MarketPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f172a 0%, #111827 50%, #09090b 100%)",
        color: "#fff",
        padding: "32px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "48px 24px",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          background: "rgba(17,24,39,0.72)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <Link
            href="/"
            style={{
              display: "inline-block",
              marginBottom: "18px",
              color: "#93c5fd",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            ← Back to home
          </Link>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "999px",
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.35)",
              color: "#bfdbfe",
              fontSize: "13px",
              marginBottom: "18px",
            }}
          >
            Early access preview
          </div>

          <h1
            style={{
              fontSize: "clamp(40px, 7vw, 72px)",
              lineHeight: 1.05,
              margin: "0 0 16px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            OLYNT Market
          </h1>

          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.7,
              maxWidth: "720px",
              color: "#d1d5db",
              margin: "0 0 28px",
            }}
          >
            Trade OLYNT directly with other community members.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
              marginBottom: "30px",
            }}
          >
            {[
              "✔ Secure escrow",
              "✔ Verified traders",
              "✔ Fast settlements",
              "✔ Transparent pricing",
            ].map((item) => (
              <div
                key={item}
                style={{
                  padding: "16px 18px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#f3f4f6",
                }}
              >
                {item}
              </div>
            ))}
          </div>

          <div
            style={{
              padding: "22px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(16,185,129,0.12))",
              border: "1px solid rgba(255,255,255,0.09)",
              marginBottom: "28px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "15px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#93c5fd",
                fontWeight: 700,
              }}
            >
              Coming Soon
            </p>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "17px",
                lineHeight: 1.7,
                color: "#e5e7eb",
              }}
            >
              Join thousands of early users preparing for launch.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              disabled
              style={{
                padding: "14px 20px",
                borderRadius: "12px",
                border: "none",
                background: "#374151",
                color: "#e5e7eb",
                fontWeight: 700,
                cursor: "not-allowed",
              }}
            >
              Market Launching Soon
            </button>

            <Link
              href="/tasks"
              style={{
                padding: "14px 20px",
                borderRadius: "12px",
                border: "1px solid rgba(147,197,253,0.45)",
                background: "transparent",
                color: "#bfdbfe",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Earn OLYNT in Tasks
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}