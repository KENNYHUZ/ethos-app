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
        {SCREEN_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {STATUS_META[opt].label}
          </option>
        ))}
      </select>
      <input
        style={inputStyle}
        type="number"
        placeholder="% of income that's interest-based (optional, e.g. 2)"
        value={interestPct}
        onChange={(e) => setInterestPct(e.target.value)}
        min="0"
        max="100"
        step="0.1"
      />

      {error && (
        <div style={{ color: COLORS.clay, fontSize: 13, marginBottom: 12, fontFamily: "Inter" }}>{error}</div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 14,
            padding: "11px 18px",
            background: COLORS.ink,
            color: COLORS.ivory,
            border: "none",
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving…" : "Save holding"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 14,
            padding: "11px 18px",
            background: "transparent",
            color: COLORS.inkSoft,
            border: "1px solid #D8D0BC",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Dashboard() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadHoldings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("holdings")
      .select("*")
      .order("value", { ascending: false });
    if (!error) setHoldings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadHoldings();
  }, []);

  const handleDelete = async (id) => {
    await supabase.from("holdings").delete().eq("id", id);
    loadHoldings();
  };

  if (loading) {
    return (
      <div style={{ fontFamily: "Inter", fontSize: 13.5, color: COLORS.inkSoft }}>Loading your portfolio…</div>
    );
  }

  const total = holdings.reduce((s, h) => s + Number(h.value), 0);
  const dayChange = 1.4;
  const clearCount = holdings.filter((h) => h.screen === "clear").length;
  const restrictedTotal = holdings.reduce(
    (sum, h) => sum + Number(h.value) * (Number(h.interest_pct || 0) / 100),
    0
  );

  if (holdings.length === 0 && !showForm) {
    return (
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontFamily: "Fraunces", fontSize: 26, fontWeight: 500, color: COLORS.ink, marginBottom: 10 }}>
          No holdings yet
        </div>
        <div style={{ fontFamily: "Inter", fontSize: 13.5, color: COLORS.inkSoft, marginBottom: 24 }}>
          Add your first holding to start tracking your portfolio.
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 14,
            padding: "12px 20px",
            background: COLORS.ink,
            color: COLORS.ivory,
            border: "none",
            cursor: "pointer",
          }}
        >
          Add a holding
        </button>
      </div>
    );
  }

  return (
    <div>
      {showForm && (
        <AddHoldingForm
          onAdded={() => { setShowForm(false); loadHoldings(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {holdings.length > 0 && (
        <>
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: "Inter", fontSize: 13, color: COLORS.inkSoft, marginBottom: 6 }}>Portfolio value</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
              <div className="ethos-portfolio-value" style={{ fontFamily: "Fraunces", fontOpticalSizing: "auto", fontWeight: 500, color: COLORS.ink, lineHeight: 1 }}>
                ${total.toLocaleString()}
              </div>
              <div style={{ fontFamily: "Inter", fontSize: 15, fontWeight: 600, color: COLORS.sage }}>
                +{dayChange}% today
              </div>
            </div>
          </div>

          <div className="ethos-stat-grid">
            {[
              { label: "Holdings screened clear", value: `${clearCount} of ${holdings.length}` },
              { label: "Restricted income to purify", value: `$${restrictedTotal.toFixed(2)}` },
              { label: "Values screen", value: "Active" },
            ].map((s) => (
              <div key={s.label} style={{ background: COLORS.ivory, padding: "20px 22px" }}>
                <div style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontFamily: "Fraunces", fontSize: 22, fontWeight: 500, color: COLORS.ink }}>{s.value}</div>
              </div>
            ))}
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 13.5,
                padding: "10px 16px",
                background: "transparent",
                color: COLORS.ink,
                border: `1px solid ${COLORS.ink}`,
                cursor: "pointer",
                marginBottom: 28,
              }}
            >
              + Add a holding
            </button>
          )}

          <div style={{ fontFamily: "Fraunces", fontSize: 19, fontWeight: 500, color: COLORS.ink, marginBottom: 4 }}>Holdings</div>
          <div style={{ fontFamily: "Inter", fontSize: 13, color: COLORS.inkSoft, marginBottom: 18 }}>
            Ordered by value
          </div>

          <div>
            {holdings.map((h, i) => {
              const weightPct = total > 0 ? ((Number(h.value) / total) * 100).toFixed(0) : 0;
              return (
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
                      {weightPct}%
                    </div>
                    <div>
                      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14.5, color: COLORS.ink }}>{h.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
                        <span style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{h.ticker}</span>
                        <StatusDot status={h.screen} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14.5, color: COLORS.ink }}>
                        ${Number(h.value).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(h.id)}
                      title="Delete holding"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: COLORS.clay,
                        fontFamily: "Inter",
                        fontSize: 12,
                        cursor: "pointer",
                        padding: 4,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
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
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("holdings").select("*");
      if (!error) setHoldings(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ fontFamily: "Inter", fontSize: 13.5, color: COLORS.inkSoft }}>Calculating…</div>
    );
  }

  const restrictedTotal = holdings.reduce(
    (sum, h) => sum + Number(h.value) * (Number(h.interest_pct || 0) / 100),
    0
  );
  const affectedCount = holdings.filter((h) => Number(h.interest_pct || 0) > 0).length;

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
          Restricted income, based on your holdings
        </div>
        <div style={{ fontFamily: "Fraunces", fontSize: 40, fontWeight: 500, color: COLORS.ink, marginBottom: 22 }}>
          ${restrictedTotal.toFixed(2)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter", fontSize: 13, color: COLORS.inkSoft, borderTop: "1px solid #E4DDCB", paddingTop: 16 }}>
          <span>Across {affectedCount} holding{affectedCount === 1 ? "" : "s"}</span>
          <span>Calculated live</span>
        </div>
      </div>

      {holdings.length === 0 && (
        <div style={{ fontFamily: "Inter", fontSize: 13, color: COLORS.inkSoft, marginTop: 16 }}>
          Add holdings on the Dashboard to see this calculated.
        </div>
      )}
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
      <div className="ethos-shell">
        <div className="ethos-sidebar">
          <div className="ethos-brand" style={{ fontFamily: "Fraunces", fontSize: 22, fontWeight: 500, color: COLORS.ivory, marginBottom: 40 }}>
            Ethos
          </div>
          <div className="ethos-nav" style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
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
            className="ethos-logout"
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
        <div className="ethos-main">
          {tab === "dashboard" && <Dashboard />}
          {tab === "discover" && <Discover />}
          {tab === "calculator" && <Calculator />}
        </div>
      </div>
    </div>
  );
}
