import React, { useState, useEffect } from "react";
import Auth from "./Auth";
import { supabase } from "./supabaseClient";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');

.ethos-app { max-width: 480px; margin: 0 auto; min-height: 100vh; box-sizing: border-box; padding-bottom: 84px; position: relative; }
.ethos-topbar { display: flex; align-items: center; justify-content: space-between; padding: 20px 20px 4px; }
.ethos-content { padding: 16px 20px 20px; }
.ethos-balance-card { background: #132821; border-radius: 16px; padding: 24px 22px; color: #F6F2E9; margin-bottom: 20px; }
.ethos-quick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 28px; }
.ethos-quick-tile { background: #fff; border: 1px solid #E4DDCB; border-radius: 12px; padding: 16px 8px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; }
.ethos-bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1px solid #E4DDCB; display: flex; justify-content: space-around; padding: 10px 8px calc(10px + env(safe-area-inset-bottom)); max-width: 480px; margin: 0 auto; }
.ethos-nav-item { display: flex; flex-direction: column; align-items: center; gap: 3px; background: transparent; border: none; cursor: pointer; font-family: Inter; font-size: 11px; padding: 4px 10px; }
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

// --- tiny inline icons, no external library needed ---
function Icon({ children, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
const EyeIcon = () => <Icon><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></Icon>;
const EyeOffIcon = () => <Icon><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.7 19.7 0 0 1 4.22-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a19.9 19.9 0 0 1-2.16 3.19" /><path d="M1 1l22 22" /><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" /></Icon>;
const BellIcon = () => <Icon size={19}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></Icon>;
const HomeIcon = ({ active }) => <Icon size={21}><path d={active ? "M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" : "M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z"} fill={active ? "currentColor" : "none"} /></Icon>;
const CompassIcon = () => <Icon size={21}><circle cx="12" cy="12" r="10" /><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" /></Icon>;
const LeafIcon = () => <Icon size={21}><path d="M11 20A7 7 0 0 1 4 13c0-4 3-9 8-11 5 2 8 7 8 11a7 7 0 0 1-7 7c-1 0-2-.3-2-1z" /><path d="M12 4v16" /></Icon>;
const UserIcon = () => <Icon size={21}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></Icon>;
const PlusIcon = () => <Icon size={19}><path d="M12 5v14M5 12h14" /></Icon>;

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
    borderRadius: 8,
    color: COLORS.ink,
    fontSize: 14,
    fontFamily: "Inter",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ background: "#fff", border: "1px solid #E4DDCB", borderRadius: 12, padding: 20, marginBottom: 20 }}
    >
      <div style={{ fontFamily: "Fraunces", fontSize: 18, fontWeight: 500, color: COLORS.ink, marginBottom: 14 }}>
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
        placeholder="% of income that's interest-based (optional)"
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
            fontFamily: "Inter", fontWeight: 600, fontSize: 14, padding: "11px 18px",
            background: COLORS.ink, color: COLORS.ivory, border: "none", borderRadius: 8,
            cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving…" : "Save holding"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            fontFamily: "Inter", fontWeight: 500, fontSize: 14, padding: "11px 18px",
            background: "transparent", color: COLORS.inkSoft, border: "1px solid #D8D0BC", borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function BalanceCard({ total, clearCount, holdingsCount, hidden, onToggleHidden, onAddClick }) {
  return (
    <div className="ethos-balance-card">
      <div style={{ fontFamily: "Inter", fontSize: 13, color: "rgba(246,242,233,0.65)", marginBottom: 10 }}>
        Your Portfolio
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ fontFamily: "Fraunces", fontSize: 36, fontWeight: 500 }}>
          {hidden ? "••••••" : `$${total.toLocaleString()}`}
        </div>
        <button
          onClick={onToggleHidden}
          style={{ background: "transparent", border: "none", color: "rgba(246,242,233,0.7)", cursor: "pointer", padding: 4 }}
        >
          {hidden ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      <div style={{ fontFamily: "Inter", fontSize: 12.5, color: "rgba(246,242,233,0.55)", marginBottom: 20 }}>
        {holdingsCount} holding{holdingsCount === 1 ? "" : "s"} · {clearCount} screened clear
      </div>
      <button
        onClick={onAddClick}
        style={{
          fontFamily: "Inter", fontWeight: 600, fontSize: 13.5, padding: "11px 16px",
          background: "rgba(246,242,233,0.12)", color: COLORS.ivory, border: "1px solid rgba(246,242,233,0.25)",
          borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
        }}
      >
        <PlusIcon /> Add a holding
      </button>
    </div>
  );
}

function QuickActions({ onAdd, onDiscover, onPurification }) {
  const tiles = [
    { label: "Add", icon: <PlusIcon />, onClick: onAdd },
    { label: "Discover", icon: <CompassIcon />, onClick: onDiscover },
    { label: "Purify", icon: <LeafIcon />, onClick: onPurification },
  ];
  return (
    <div className="ethos-quick-grid">
      {tiles.map((t) => (
        <div key={t.label} className="ethos-quick-tile" onClick={t.onClick}>
          <div style={{ color: COLORS.ink }}>{t.icon}</div>
          <div style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: COLORS.ink }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

function Home({ goTo }) {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hidden, setHidden] = useState(false);

  const loadHoldings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("holdings").select("*").order("value", { ascending: false });
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

  const total = holdings.reduce((s, h) => s + Number(h.value), 0);
  const clearCount = holdings.filter((h) => h.screen === "clear").length;

  if (loading) {
    return <div style={{ fontFamily: "Inter", fontSize: 13.5, color: COLORS.inkSoft }}>Loading your portfolio…</div>;
  }

  return (
    <div>
      <BalanceCard
        total={total}
        clearCount={clearCount}
        holdingsCount={holdings.length}
        hidden={hidden}
        onToggleHidden={() => setHidden(!hidden)}
        onAddClick={() => setShowForm(true)}
      />

      <QuickActions
        onAdd={() => setShowForm(true)}
        onDiscover={() => goTo("discover")}
        onPurification={() => goTo("purification")}
      />

      {showForm && (
        <AddHoldingForm
          onAdded={() => { setShowForm(false); loadHoldings(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {holdings.length === 0 ? (
        <div style={{ fontFamily: "Inter", fontSize: 13.5, color: COLORS.inkSoft, textAlign: "center", padding: "20px 0" }}>
          No holdings yet — tap "Add a holding" to get started.
        </div>
      ) : (
        <>
          <div style={{ fontFamily: "Fraunces", fontSize: 17, fontWeight: 500, color: COLORS.ink, marginBottom: 12 }}>
            Holdings
          </div>
          <div>
            {holdings.map((h, i) => {
              const weightPct = total > 0 ? ((Number(h.value) / total) * 100).toFixed(0) : 0;
              return (
                <div
                  key={h.id}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 0", borderTop: i === 0 ? "1px solid #E4DDCB" : "none", borderBottom: "1px solid #E4DDCB",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 32, textAlign: "right", fontFamily: "Inter", fontSize: 11.5, color: COLORS.inkSoft }}>
                      {weightPct}%
                    </div>
                    <div>
                      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: COLORS.ink }}>{h.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                        <span style={{ fontFamily: "Inter", fontSize: 11.5, color: COLORS.inkSoft }}>{h.ticker}</span>
                        <StatusDot status={h.screen} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: COLORS.ink }}>
                      ${Number(h.value).toLocaleString()}
                    </div>
                    <button
                      onClick={() => handleDelete(h.id)}
                      style={{ background: "transparent", border: "none", color: COLORS.clay, fontFamily: "Inter", fontSize: 11.5, cursor: "pointer" }}
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
      <div style={{ fontFamily: "Fraunces", fontSize: 24, fontWeight: 500, color: COLORS.ink, marginBottom: 8 }}>Discover</div>
      <div style={{ fontFamily: "Inter", fontSize: 13, color: COLORS.inkSoft, marginBottom: 20 }}>
        Every listing is checked against the values screen before it appears here.
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
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
              fontFamily: "Inter", fontSize: 12.5, fontWeight: 500, padding: "7px 12px", borderRadius: 20,
              border: `1px solid ${filter === f.key ? COLORS.ink : "#D8D0BC"}`,
              background: filter === f.key ? COLORS.ink : "transparent",
              color: filter === f.key ? COLORS.ivory : COLORS.inkSoft, cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div>
        {filtered.map((d, i) => (
          <div key={d.id} style={{ padding: "16px 0", borderTop: i === 0 ? "1px solid #E4DDCB" : "none", borderBottom: "1px solid #E4DDCB" }}>
            <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: COLORS.ink, marginBottom: 4 }}>
              {d.name} <span style={{ color: COLORS.inkSoft, fontWeight: 500 }}>· {d.ticker}</span>
            </div>
            <div style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft, marginBottom: 8 }}>{d.sector}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>Debt {d.debtRatio}%</div>
              <div style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>Interest {d.interestIncome}%</div>
              <StatusDot status={d.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Purification() {
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
    return <div style={{ fontFamily: "Inter", fontSize: 13.5, color: COLORS.inkSoft }}>Calculating…</div>;
  }

  const restrictedTotal = holdings.reduce((sum, h) => sum + Number(h.value) * (Number(h.interest_pct || 0) / 100), 0);
  const affectedCount = holdings.filter((h) => Number(h.interest_pct || 0) > 0).length;

  return (
    <div>
      <div style={{ fontFamily: "Fraunces", fontSize: 24, fontWeight: 500, color: COLORS.ink, marginBottom: 8 }}>Purification</div>
      <div style={{ fontFamily: "Inter", fontSize: 13, color: COLORS.inkSoft, marginBottom: 24 }}>
        A small share of income across your holdings comes from interest or other restricted sources. This
        calculates that amount so you can donate it separately.
      </div>

      <div style={{ background: "#fff", border: "1px solid #E4DDCB", borderRadius: 12, padding: 22 }}>
        <div style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft, marginBottom: 8 }}>
          Restricted income, based on your holdings
        </div>
        <div style={{ fontFamily: "Fraunces", fontSize: 34, fontWeight: 500, color: COLORS.ink, marginBottom: 18 }}>
          ${restrictedTotal.toFixed(2)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter", fontSize: 12.5, color: COLORS.inkSoft, borderTop: "1px solid #E4DDCB", paddingTop: 14 }}>
          <span>Across {affectedCount} holding{affectedCount === 1 ? "" : "s"}</span>
          <span>Calculated live</span>
        </div>
      </div>

      {holdings.length === 0 && (
        <div style={{ fontFamily: "Inter", fontSize: 12.5, color: COLORS.inkSoft, marginTop: 14 }}>
          Add holdings on Home to see this calculated.
        </div>
      )}
    </div>
  );
}

function Profile({ email, onLogout }) {
  return (
    <div>
      <div style={{ fontFamily: "Fraunces", fontSize: 24, fontWeight: 500, color: COLORS.ink, marginBottom: 20 }}>Profile</div>
      <div style={{ background: "#fff", border: "1px solid #E4DDCB", borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft, marginBottom: 4 }}>Signed in as</div>
        <div style={{ fontFamily: "Inter", fontSize: 14.5, fontWeight: 600, color: COLORS.ink }}>{email}</div>
      </div>
      <button
        onClick={onLogout}
        style={{
          fontFamily: "Inter", fontWeight: 600, fontSize: 14, padding: "12px 20px", width: "100%",
          background: "transparent", color: COLORS.clay, border: `1px solid ${COLORS.clay}`, borderRadius: 8, cursor: "pointer",
        }}
      >
        Log out
      </button>
    </div>
  );
}

export default function EthosApp() {
  const [tab, setTab] = useState("home");
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
    return <div style={{ background: COLORS.ink, minHeight: "100vh" }} />;
  }

  if (!session) {
    return <Auth onLoggedIn={setSession} />;
  }

  const email = session.user.email || "";
  const firstName = email.split("@")[0].replace(/[._-]/g, " ");
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const navItems = [
    { key: "home", label: "Home", icon: (active) => <HomeIcon active={active} /> },
    { key: "discover", label: "Discover", icon: () => <CompassIcon /> },
    { key: "purification", label: "Purify", icon: () => <LeafIcon /> },
    { key: "profile", label: "Profile", icon: () => <UserIcon /> },
  ];

  return (
    <div style={{ background: COLORS.ivory, minHeight: "100vh", fontFamily: "Inter" }}>
      <style>{FONT_IMPORT}</style>
      <div className="ethos-app">
        <div className="ethos-topbar">
          <div style={{ fontFamily: "Fraunces", fontSize: 18, fontWeight: 500, color: COLORS.ink }}>
            Hello, {displayName}
          </div>
          <div style={{ color: COLORS.inkSoft }}>
            <BellIcon />
          </div>
        </div>
        <div className="ethos-content">
          {tab === "home" && <Home goTo={setTab} />}
          {tab === "discover" && <Discover />}
          {tab === "purification" && <Purification />}
          {tab === "profile" && <Profile email={email} onLogout={handleLogout} />}
        </div>
      </div>

      <div className="ethos-bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            className="ethos-nav-item"
            onClick={() => setTab(item.key)}
            style={{ color: tab === item.key ? COLORS.ink : COLORS.inkSoft, fontWeight: tab === item.key ? 700 : 500 }}
          >
            {item.icon(tab === item.key)}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
