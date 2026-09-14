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
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <div style={{ fontFamily: "Fraunces", fontOpticalSizing: "auto", fontWeight: 500, fontSize: 52, color: COLORS.ink, lineHeight: 1 }}>
                ${total.toLocaleString()}
              </div>
              <div style={{ fontFamily: "Inter", fontSize: 15, fontWeight: 600, color: COLORS.sage }}>
                +{dayChange}% today
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#E4DDCB", marginBottom: 32 }}>
            {[
              { label: "Holdings screened clear", value: `${clearCount} of ${holdings.length}` },
              { label: "Restricted income to purify", value: "$14.20" },
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
