"use client";

import { useState } from "react";

interface AuthButtonProps {
  isAuthenticated: boolean;
}

export default function AuthButton({ isAuthenticated }: AuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    setLoading(true);
    window.location.href = "/api/auth/google";
  };

  const handleSignOut = async () => {
    setLoading(true);
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.reload();
  };

  if (isAuthenticated) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="badge badge-green">
          <span
            className="pulse-dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--green)",
              display: "inline-block",
            }}
          />
          Connected
        </span>
        <button
          onClick={handleSignOut}
          disabled={loading}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            border: "1px solid var(--border-2)",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.color = "var(--text)";
            (e.target as HTMLButtonElement).style.borderColor = "var(--border-2)";
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.color = "var(--text-muted)";
          }}
        >
          {loading ? "…" : "Disconnect"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 22px",
        borderRadius: 10,
        border: "1px solid var(--accent)",
        background: "var(--accent-glow)",
        color: "var(--accent-2)",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        transition: "background 0.2s, box-shadow 0.2s",
        boxShadow: "0 0 0 0 var(--accent-glow)",
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(91,110,245,0.25)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 0 16px var(--accent-glow)";
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--accent-glow)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
      }}
    >
      {loading ? (
        "Redirecting…"
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Connect with Google
        </>
      )}
    </button>
  );
}
