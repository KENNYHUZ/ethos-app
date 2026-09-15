import React, { useState, useEffect } from "react";
import Auth from "./Auth";
import { supabase } from "./supabaseClient";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');

.ethos-shell { display: flex; min-height: 560px; }
.ethos-sidebar { width: 190px; background: #132821; padding: 28px 20px; flex-shrink: 0; display: flex; flex-direction: column; }
.ethos-main { flex: 1; padding: 36px 44px; overflow: auto; min-width: 0; }
.ethos-portfolio-value { font-size: 52px; }
.ethos-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #E4DDCB; margin-bottom: 32px; }

@media (max-width: 640px) {
  .ethos-shell { flex-direction: column; min-height: auto; }
  .ethos-sidebar { width: 100%; box-sizing: border-box; flex-direction: column !important; align-items: stretch; padding: 14px 16px; gap: 10px; }
  .ethos-brand { margin-bottom: 0 !important; font-size: 18px; }
  .ethos-nav { flex-direction: row !important; flex: none !important; gap: 6px; flex-wrap: wrap; }
  .ethos-nav button { padding: 7px 10px; font-size: 12.5px; }
  .ethos-logout { align-self: flex-end; padding: 4px 0 !important; }
  .ethos-main { padding: 20px 16px; }
  .ethos-portfolio-value { font-size: 34px; }
  .ethos-stat-grid { grid-template-columns: 1fr; }
}
`;

const COLORS = {
  ink: "#132821",
  ivory: "#F6F2E9",
  brass: "#A9832F",
  sage: "#7C9885",
  clay: "#B4534A",
  inkSoft: "#3C5049",
};

const SCREEN_OPTIONS = ["clear", "review", "excluded"];

const DISCOVER = [
  { id: 1, name: "Northbridge Renewables", ticker: "NBR", sector: "Clean Energy", debtRatio: 12, interestIncome: 0.4, status: "clear" },
  { id: 2, name: "Solandra Biotech", ticker: "SOL", sector: "Healthcare", debtRatio: 9, interestIncome: 0.1, status: "clear" },
  { id: 3, name: "Meridian Capital Bank", ticker: "MCB", sector: "Conventional Finance", debtRatio: 61, interestIncome: 38, status: "excluded" },
  { id: 4, name: "Alden Industrial Materials", ticker: "AIM", sector: "Manufacturing", debtRatio: 29, interestIncome: 4.2, status: "review" },
  { id: 5, name: "Cedarline Consumer Goods", ticker: "CDL", sector: "Consumer Staples", debtRatio: 15, interestIncome: 1.8, status: "clear" },
  { id: 6, name: "Highgate Leisure Group", ticker: "HLG", sector: "Gaming & Leisure", debtRatio: 22, interestIncome: 2.0, status: "excluded" },
];

const STATUS_META = {
  clear: { label: "Screened clear", color: COLORS.sage },
  review: { label: "Needs review", color: COLORS.brass },
  excluded: { label: "Excluded", color: COLORS.clay },
};

function StatusDot({ status }) {
  const meta = STATUS_META[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Inter", fontSize: 12.5, color: COLORS.inkSoft }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, display: "inline-block" }} />
      {meta.label}
    </span>
  );
}

function AddHoldingForm({ onAdded, onCancel }) {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [value, setValue] = useState("");
  const [screen, setScreen] = useState("clear");
  const [interestPct, setInterestPct] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from("holdings").insert({
      user_id: userData.user.id,
      name,
      ticker: ticker.toUpperCase(),
      value: Number(value),
      weight: 0,
      change: 0,
      screen,
      interest_pct: Number(interestPct) || 0,
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
    } else {
      onAdded();
    }
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    marginBottom: 12,
    background: "#fff",
    border: "1px solid #D8D0BC",
    borderRadius: 4,
    color: COLORS.ink,
    fontSize: 14,
    fontFamily: "Inter",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ background: COLORS.ivory, border: "1px solid #E4DDCB", padding: 24, maxWidth: 420, marginBottom: 32 }}
    >
      <div style={{ fontFamily: "Fraunces", fontSize: 19, fontWeight: 500, color: COLORS.ink, marginBottom: 16 }}>
        Add a holding
      </div>

      <input style={inputStyle} placeholder="Company name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input style={inputStyle} placeholder="Ticker (e.g. NBR)" value={ticker} onChange={(e) => setTicker(e.target.value)} required maxLength={8} />
      <input style={inputStyle} type="number" placeholder="Value ($)" value={value} onChange={(e) => setValue(e.target.value)} required min="0" step="0.01" />
      <select style={inputStyle} value={screen} onChange={(e) => setScreen(e.target.value)}>
        {SCREEN_OPTIONS.map((op
