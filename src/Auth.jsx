import React, { useState } from "react";
import { supabase } from "./supabaseClient";

const COLORS = {
  ink: "#132821",
  ivory: "#F6F2E9",
  brass: "#A9832F",
  sage: "#7C9885",
  clay: "#B4534A",
  inkSoft: "#3C5049",
};

export default function Auth({ onLoggedIn }) {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setMessage(error.message);
      } else if (data?.user) {
        setMessage("Account created. Check your email to confirm, then log in.");
        setMode("login");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setMessage(error.message);
      } else if (data?.session) {
        onLoggedIn(data.session);
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: 32,
            fontWeight: 500,
            color: COLORS.ivory,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Ethos
        </div>
        <div
          style={{
            fontFamily: "Inter",
            fontSize: 13.5,
            color: "rgba(246,242,233,0.6)",
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          {mode === "login" ? "Log in to your account" : "Create your account"}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 14px",
              marginBottom: 12,
              background: "rgba(246,242,233,0.08)",
              border: "1px solid rgba(246,242,233,0.2)",
              borderRadius: 4,
              color: COLORS.ivory,
              fontSize: 14,
              fontFamily: "Inter",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 14px",
              marginBottom: 20,
              background: "rgba(246,242,233,0.08)",
              border: "1px solid rgba(246,242,233,0.2)",
              borderRadius: 4,
              color: COLORS.ivory,
              fontSize: 14,
              fontFamily: "Inter",
            }}
          />

          {message && (
            <div
              style={{
                color: COLORS.brass,
                fontSize: 13,
                marginBottom: 16,
                fontFamily: "Inter",
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 0",
              background: COLORS.brass,
              color: COLORS.ink,
              border: "none",
              borderRadius: 4,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            fontFamily: "Inter",
            fontSize: 13,
            color: "rgba(246,242,233,0.6)",
          }}
        >
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <span
                onClick={() => { setMode("signup"); setMessage(""); }}
                style={{ color: COLORS.brass, cursor: "pointer", fontWeight: 600 }}
              >
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => { setMode("login"); setMessage(""); }}
                style={{ color: COLORS.brass, cursor: "pointer", fontWeight: 600 }}
              >
                Log in
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
