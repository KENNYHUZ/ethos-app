import React, { useState, useEffect } from "react";
import Auth from "./Auth";
import { supabase } from "./supabaseClient";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');`;

const COLORS = {
  ink: "#132821",
  ivory: "#F6F2E9",
  brass: "#A9832F",
  sage: "#7C9885",
  clay: "#B4534A",
  inkSoft: "#3C5049",
};

const HOLDINGS = [
  { id: 1, name: "Northbridge Renewables", ticker: "NBR", weight: 18, value: 4120, change: 2.3, screen: "clear" },
  { id: 2, name: "Vantage Health Systems", ticker: "VHS", weight: 14, value: 3210, change: -0.8, screen: "clear" },
  { id: 3, name: "Alden Industrial Materials", ticker: "AIM", weight: 11, value: 2540, change: 1.1, screen: "review" },
  { id: 4, name: "Cedarline Consumer Goods", ticker: "CDL", weight: 9, value: 2080, change: 0.4, screen: "clear" },
  { id: 5, name: "Foraya Sukuk Trust", ticker: "FST", weight: 22, value: 5060, change: 0.6, screen: "clear" },
];

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

function Dashboard() {
  const total = HOLDINGS.reduce((s, h) => s + h.value, 0);
  const dayChange = 1.4;
  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: "Inter", fontSize: 13, color: COLORS.inkSoft, marginBottom: 6 }}>Portfolio value</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <div style={{ fontFamily: "Fraunces", fontOpticalSizing: "auto", fontWeight: 500, fontSize: 52, color: COLORS.ink, lineHeight: 1 }}>
            ${total.toLocaleString()}
          </div>
          <div style={{ fontFamily: "Inter", fontSize: 15, fontWeight: 600, color: COLORS.sage }}>
            +{dayChange}% today
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#E4DDCB", marginBottom: 40 }}>
        {[
          { label: "Holdings screened clear", value: "16 of 18" },
          { label: "Restricted income to purify", value: "$14.20" },
          { label: "Values screen", value: "Active" },
        ].map((s) => (
          <div key={s.label} style={{ background: COLORS.ivory, padding: "20px 22px" }}>
            <div style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "Fraunces", fontSize: 22, fontWeight: 500, color: COLORS.ink }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: "Fraunces", fontSize: 19, fontWeight: 500, color: COLORS.ink, marginBottom: 4 }}>Holdings</div>
      <div style={{ fontFamily: "Inter", fontSize: 13, color: COLORS.inkSoft, marginBottom: 18 }}>
        Ordered by portfolio weight
      </div>

      <div>
        {HOLDINGS.map((h, i) => (
          <div
            key={h.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 0",
              borderTop: i === 0 ? `1px solid #E4DDCB` : "none",
              borderBottom: "1px solid #E4DDCB",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 38, textAlign: "right", fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>
                {h.weight}%
              </div>
              <div>
                <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14.5, color: COLORS.ink }}>{h.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
                  <span style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{h.ticker}</span>
                  <StatusDot status={h.screen} />
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14.5, color: COLORS.ink }}>
                ${h.value.toLocaleString()}
              </div>
              <div style={{ fontFamily: "Inter", fontSize: 12.5, color: h.change >= 0 ? COLORS.sage : COLORS.clay, marginTop: 3 }}>
                {h.change >= 0 ? "+" : ""}{h.change}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Discover() {
  const [filter, setFilter] = useState("all");
  const filtered = DISCOVER.filter((d) => (filter === "all" ? true : d.status === filter));

  return (
    <div>
      <div style={{ fontFamily: "Fraunces", fontSize: 28, fontWeight: 500, color: COLORS.ink, marginBottom: 8 }}>
        Discover
      </div>
      <div style={{ fontFamily: "Inter", fontSize: 13.5, color: COLORS.inkSoft, marginBottom: 26, maxWidth: 440 }}>
        Every listing is checked against the values screen — low debt reliance, no interest-based revenue, no
        restricted sectors — before it appears here.
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { key: "all", label: "All" },
          { key: "clear", label: "Clear" },
          { key: "review", label: "Needs review" },
          { key: "excluded", label: "Excluded" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              fontFamily: "Inter",
              fontSize: 13,
              fontWeight: 500,
              padding: "8px 14px",
              borderRadius: 20,
              border: `1px solid ${filter === f.key ? COLORS.ink : "#D8D0BC"}`,
              background: filter === f.key ? COLORS.ink : "transparent",
              color: filter === f.key ? COLORS.ivory : COLORS.inkSoft,
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div>
        {filtered.map((d, i) => (
          <div
            key={d.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 0",
              borderTop: i === 0 ? "1px solid #E4DDCB" : "none",
              borderBottom: "1px solid #E4DDCB",
            }}
          >
            <div>
              <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14.5, color: COLORS.ink }}>
                {d.name} <span style={{ color: COLORS.inkSoft, fontWeight: 500 }}>· {d.ticker}</span>
              </div>
              <div style={{ fontFamily: "Inter", fontSize: 12.5, color: COLORS.inkSoft, marginTop: 4 }}>{d.sector}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "Inter", fontSize: 11.5, color: COLORS.inkSoft }}>Debt ratio</div>
                <div style={{ fontFamily: "Inter", fontSize: 13.5, fontWeight: 600, color: COLORS.ink }}>{d.debtRatio}%</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "Inter", fontSize: 11.5, color: COLORS.inkSoft }}>Interest income</div>
                <div style={{ fontFamily: "Inter", fontSize: 13.5, fontWeight: 600, color: COLORS.ink }}>{d.interestIncome}%</div>
              </div>
              <div style={{ width: 120, textAlign: "right" }}>
                <StatusDot status={d.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Calculator() {
  const [income, setIncome] = useState(14.2);
  return (
    <div style={{ maxWidth: 460 }}>
      <div style={{ fontFamily: "Fraunces", fontSize: 28, fontWeight: 500, color: COLORS.ink, marginBottom: 8 }}>
        Purification
      </div>
      <div style={{ fontFamily: "Inter", fontSize: 13.5, color: COLORS.inkSoft, marginBottom: 30 }}>
        A small share of income across your holdings comes from interest or other restricted sources. This
        calculates that amount so you can donate it separately from your returns.
      </div>

      <div style={{ background: COLORS.ivory, border: "1px solid #E4DDCB", padding: 28 }}>
        <div style={{ fontFamily: "Inter", fontSize: 12.5, color: COLORS.inkSoft, marginBottom: 10 }}>
          Restricted income this quarter
        </div>
        <div style={{ fontFamily: "Fraunces", fontSize: 40, fontWeight: 500, color: COLORS.ink, marginBottom: 22 }}>
          ${income.toFixed(2)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter", fontSize: 13, color: COLORS.inkSoft, borderTop: "1px solid #E4DDCB", paddingTop: 16 }}>
          <span>Across 3 holdings</span>
          <span>Updated quarterly</span>
        </div>
      </div>

      <button
        style={{
          marginTop: 20,
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 14,
          padding: "13px 22px",
          background: COLORS.ink,
          color: COLORS.ivory,
          border: "none",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Mark as donated
      </button>
    </div>
  );
}

export default function EthosApp() {
  const [tab, setTab] = useState("dashboard");
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (checking) {
    return (
      <div style={{ background: COLORS.ink, minHeight: "100vh" }} />
    );
  }

  if (!session) {
    return <Auth onLoggedIn={setSession} />;
  }

  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "discover", label: "Discover" },
    { key: "calculator", label: "Purification" },
  ];

  return (
    <div style={{ background: COLORS.ivory, minHeight: "100%", fontFamily: "Inter" }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ display: "flex", minHeight: 560 }}>
        <div style={{ width: 190, background: COLORS.ink, padding: "28px 20px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Fraunces", fontSize: 22, fontWeight: 500, color: COLORS.ivory, marginBottom: 40 }}>
            Ethos
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  textAlign: "left",
                  background: tab === t.key ? "rgba(246,242,233,0.1)" : "transparent",
                  border: "none",
                  color: tab === t.key ? COLORS.ivory : "rgba(246,242,233,0.55)",
                  fontFamily: "Inter",
                  fontSize: 13.5,
                  fontWeight: 500,
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            style={{
              textAlign: "left",
              background: "transparent",
              border: "none",
              color: "rgba(246,242,233,0.4)",
              fontFamily: "Inter",
              fontSize: 12.5,
              padding: "10px 12px",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
        <div style={{ flex: 1, padding: "36px 44px", overflow: "auto" }}>
          {tab === "dashboard" && <Dashboard />}
          {tab === "discover" && <Discover />}
          {tab === "calculator" && <Calculator />}
        </div>
      </div>
    </div>
  );
}
