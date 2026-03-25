// pages/index.js
// This is the main MemoSA app.
// All content comes from JSON files in /data — edit those to update the site.
// Charts, heatmaps, tables all auto-reflect your JSON changes on deploy.

import { useState, useEffect } from "react";
import fs from "fs";
import path from "path";
import dynamic from "next/dynamic";

// Dynamically import recharts (client-side only)
const RechartsComponents = dynamic(
  () => import("recharts").then((mod) => {
    // Store module globally for use in components
    if (typeof window !== "undefined") window.__recharts = mod;
    return () => null; // Dummy component
  }),
  { ssr: false }
);

// ── getStaticProps: Loads ALL your data at build time ──
// When you edit any JSON file and push to GitHub, Vercel rebuilds and your
// site automatically reflects the changes.
export async function getStaticProps() {
  const dataDir = path.join(process.cwd(), "data");
  const memosDir = path.join(dataDir, "memos");

  // Load master data
  const stocks = JSON.parse(fs.readFileSync(path.join(dataDir, "stocks.json"), "utf8"));
  const sectors = JSON.parse(fs.readFileSync(path.join(dataDir, "sectors.json"), "utf8"));
  const peers = JSON.parse(fs.readFileSync(path.join(dataDir, "peers.json"), "utf8"));

  // Load all individual memo files
  const memoFiles = fs.readdirSync(memosDir).filter((f) => f.endsWith(".json"));
  const memos = {};
  for (const file of memoFiles) {
    const memo = JSON.parse(fs.readFileSync(path.join(memosDir, file), "utf8"));
    memos[memo.ticker] = memo;
  }

  return {
    props: { stocks, sectors, peers, memos },
    // Rebuild every 60 seconds if using ISR (Incremental Static Regeneration)
    // Remove this line for pure static builds
    revalidate: 60,
  };
}

// ── Design Tokens ──
const P = {
  bg: "#F7F7F8", surface: "#FFFFFF", hover: "#F0F0F3",
  card: "#FFFFFF", border: "#E8E8EC",
  shadow: "0 1px 4px rgba(0,0,0,0.04)",
  shadowHover: "0 12px 32px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)",
  shark: "#191C1F",
  acc: "#F37021", accDim: "rgba(243,112,33,0.08)", accLight: "#F8944D",
  green: "#00B386", greenDim: "rgba(0,179,134,0.07)",
  red: "#E5484D", redDim: "rgba(229,72,77,0.07)",
  amber: "#F5A623", amberDim: "rgba(245,166,35,0.07)",
  purple: "#8B5CF6", forecast: "#3B82F6", forecastDim: "rgba(59,130,246,0.1)",
  orange: "#F37021",
  text: "#191C1F", t2: "#5E6069", t3: "#94A3B8",
  f: "'Public Sans', system-ui, sans-serif",
  mono: "'IBM Plex Mono', 'SF Mono', monospace",
  ease: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
  fast: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
};

// ── Shared Components ──
function Logo({ s = 28 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
      <rect x="16.5" y="24.5" width="3" height="6.5" rx="1.2" fill={P.t3} opacity=".35" />
      <rect x="12.5" y="30" width="11" height="2" rx="1" fill={P.t3} opacity=".25" />
      <path d="M9 5 L18 25.5 L27 5 Z" fill="none" stroke={P.t3} strokeWidth="1.1" opacity=".25" />
      <path d="M10 7 L13.2 15 L22.8 15 L26 7 Z" fill="url(#rv_logo)" opacity=".8" />
      <circle cx="15" cy="11.5" r=".6" fill={P.accLight} opacity=".4">
        <animate attributeName="cy" values="11.5;6.5" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values=".4;0" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="20" cy="13" r=".5" fill={P.accLight} opacity=".35">
        <animate attributeName="cy" values="13;7" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values=".35;0" dur="2.8s" repeatCount="indefinite" />
      </circle>
      <g transform="translate(24.5, 3.5)">
        <path d="M0 2 C0.5 -0.5,4.5 -0.5,5 2 C5 4,3 5.5,0 2Z" fill={P.orange} opacity=".92" />
        <path d="M0.5 2 C0.5 2,2.5 1,2.5 4" stroke="#FDE68A" strokeWidth=".35" opacity=".5" fill="none" />
        <path d="M1 1.8 C1 1.8,3.5 0.8,4 3" stroke="#FDE68A" strokeWidth=".35" opacity=".4" fill="none" />
      </g>
      <defs>
        <linearGradient id="rv_logo" x1="18" y1="7" x2="18" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor={P.orange} stopOpacity=".95" />
          <stop offset=".5" stopColor="#FBBF24" stopOpacity=".7" />
          <stop offset="1" stopColor={P.accLight} stopOpacity=".3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Card({ children, style, onClick, h = true }) {
  return (
    <div onClick={onClick} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, boxShadow: P.shadow, transition: P.ease, cursor: onClick ? "pointer" : "default", ...style }}
      onMouseEnter={e => { if (h && onClick) { e.currentTarget.style.boxShadow = P.shadowHover; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "#D4D4D8"; } }}
      onMouseLeave={e => { if (h && onClick) { e.currentTarget.style.boxShadow = P.shadow; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = P.border; } }}>
      {children}
    </div>
  );
}

function Badge({ status }) {
  const m = { active: { l: "Active", c: P.green, b: P.greenDim }, monitor: { l: "Monitor", c: P.acc, b: P.accDim }, review: { l: "Review", c: P.amber, b: P.amberDim } };
  const x = m[status] || m.monitor;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, color: x.c, background: x.b, textTransform: "uppercase", fontFamily: P.f }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: x.c, animation: status === "active" ? "dot 2s infinite" : "none" }} />{x.l}</span>;
}

function StarBtn({ on, toggle }) {
  return <button onClick={toggle} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: on ? P.acc : P.t3, transition: P.fast }}>{on ? "\u2605" : "\u2606"}</button>;
}

function Btn({ children, active, onClick, small }) {
  return (
    <button onClick={onClick} style={{ background: active ? P.shark : P.surface, color: active ? "#fff" : P.t2, border: `1px solid ${active ? P.shark : P.border}`, padding: small ? "5px 12px" : "7px 15px", borderRadius: 9, fontSize: small ? 11 : 12, fontWeight: 600, cursor: "pointer", fontFamily: P.f, transition: P.fast, boxShadow: active ? "none" : P.shadow }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.transform = "scale(1.04)"; }}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
      {children}
    </button>
  );
}

function SH({ t, sub, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
      <div>
        <h2 style={{ fontFamily: P.f, fontSize: 18, fontWeight: 700, letterSpacing: -.4 }}>{t}</h2>
        {sub && <p style={{ color: P.t3, fontSize: 12.5, marginTop: 3 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function hc(c) {
  if (c > 2) return { bg: "rgba(0,179,134,0.14)", bd: "rgba(0,179,134,0.2)", tx: P.green };
  if (c > 1) return { bg: "rgba(0,179,134,0.08)", bd: "rgba(0,179,134,0.12)", tx: P.green };
  if (c > 0) return { bg: "rgba(0,179,134,0.04)", bd: "rgba(0,179,134,0.06)", tx: P.green };
  if (c > -1) return { bg: "rgba(229,72,77,0.04)", bd: "rgba(229,72,77,0.06)", tx: P.red };
  if (c > -2) return { bg: "rgba(229,72,77,0.08)", bd: "rgba(229,72,77,0.12)", tx: P.red };
  return { bg: "rgba(229,72,77,0.14)", bd: "rgba(229,72,77,0.2)", tx: P.red };
}

// ── Ticker Bar ──
function TickerBar() {
  const fallback = [
    { name: "NIFTY 50", value: "23,842", change: +0.62 }, { name: "SENSEX", value: "78,620", change: +0.58 },
    { name: "NIFTY SMLCAP 250", value: "17,456", change: +1.24 }, { name: "NIFTY PSU BANK", value: "6,892", change: +1.82 },
    { name: "NIFTY BANK", value: "51,120", change: +0.41 }, { name: "INDIA VIX", value: "13.42", change: -3.20 },
  ];
  const preferred = ["NIFTY 50", "NIFTY NEXT 50", "SENSEX", "NIFTY SMLCAP 250", "NIFTY MIDCAP 150", "NIFTY PSU BANK", "NIFTY BANK", "INDIA VIX", "NIFTY IT", "NIFTY FINANCIAL SERVICES"];
  const [tickers, setTickers] = useState(fallback);
  const [live, setLive] = useState(false);

  useEffect(() => {
    async function fetchIndices() {
      try {
        const r = await fetch("/api/indices");
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          const filtered = data.filter(d => preferred.some(p => d.name && d.name.toUpperCase().includes(p.toUpperCase())));
          if (filtered.length > 0) { setTickers(filtered); setLive(true); }
        }
      } catch (e) {}
    }
    fetchIndices();
    const iv = setInterval(fetchIndices, 15000);
    return () => clearInterval(iv);
  }, []);

  const d = [...tickers, ...tickers];
  return (
    <div style={{ background: P.shark, overflow: "hidden", height: 36, display: "flex", alignItems: "center" }}>
      <div style={{ display: "inline-flex", gap: 34, animation: "tick 20s linear infinite", whiteSpace: "nowrap", paddingLeft: 16 }}>
        {live && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginRight: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", animation: "dot 1.5s ease infinite" }} />
          <span style={{ fontFamily: P.mono, fontSize: 9, color: "#4ADE80", fontWeight: 600, letterSpacing: 0.5 }}>LIVE</span>
        </span>}
        {d.map((t, i) => (
          <span key={i} style={{ fontFamily: P.mono, fontSize: 11, display: "inline-flex", alignItems: "center", gap: 7 }}>
            <span style={{ color: "#6B6F78" }}>{t.name}</span>
            <span style={{ color: "#E4E4E7", fontWeight: 600 }}>{t.value}</span>
            <span style={{ color: (t.change || 0) >= 0 ? "#4ADE80" : "#FB7185", fontWeight: 600, fontSize: 10.5 }}>{(t.change || 0) >= 0 ? "+" : ""}{parseFloat(t.change || 0).toFixed(2)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Nav ──
function Nav({ view, setView, wc }) {
  return (
    <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 28px", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px) saturate(180%)", borderBottom: `1px solid ${P.border}`, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", transition: P.fast }} onClick={() => setView("home")}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        <Logo s={27} /><span style={{ fontFamily: P.f, fontSize: 18, fontWeight: 800, letterSpacing: -.7, color: P.shark }}>Memo<span style={{ color: P.acc }}>SA</span></span>
      </div>
      <div style={{ display: "flex", gap: 2, background: P.bg, borderRadius: 11, padding: 3 }}>
        {[{ id: "home", l: "Home" }, { id: "memos", l: "Memos" }, { id: "compare", l: "Compare" }, { id: "watchlist", l: `Watchlist \u00B7 ${wc}` }, { id: "about", l: "About" }].map(n => (
          <button key={n.id} onClick={() => setView(n.id)} style={{ background: view === n.id ? P.surface : "transparent", color: view === n.id ? P.acc : P.t3, border: "none", padding: "7px 16px", borderRadius: 9, fontSize: 12.5, fontWeight: view === n.id ? 600 : 500, cursor: "pointer", fontFamily: P.f, transition: P.fast, boxShadow: view === n.id ? "0 1px 3px rgba(0,0,0,.05)" : "none" }}
            onMouseEnter={e => { if (view !== n.id) { e.currentTarget.style.color = P.t2; e.currentTarget.style.transform = "scale(1.03)"; } }}
            onMouseLeave={e => { if (view !== n.id) { e.currentTarget.style.color = P.t3; e.currentTarget.style.transform = "scale(1)"; } }}>
            {n.l}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── Stock Heatmap — reads from stocks prop ──
function StkMap({ stocks, onClick }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(128px, 1fr))", gap: 6 }}>
      {stocks.map((d, i) => {
        const cl = hc(d.change || 0);
        return (
          <Card key={d.ticker} onClick={() => onClick?.(d.ticker)} style={{ padding: "12px 11px", background: cl.bg, borderColor: cl.bd, animation: `up .35s ease ${i * .02}s both` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 700 }}>{d.ticker}</span>
              <Badge status={d.status} />
            </div>
            <div style={{ fontSize: 10, color: P.t2, marginBottom: 4 }}>{d.name}</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: P.mono, fontSize: 12, fontWeight: 600 }}>{d.pe}x</span>
              <span style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 700, color: cl.tx }}>
                {(d.change || 0) >= 0 ? "+" : ""}{parseFloat(d.change || 0).toFixed(1)}%
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── Earnings Calendar — reads from stocks prop ──
function EarnCal({ stocks }) {
  const sorted = [...stocks].sort((a, b) => new Date("2026 " + a.earningsDate) - new Date("2026 " + b.earningsDate));
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
      {sorted.map((s, i) => (
        <Card key={s.ticker} style={{ minWidth: 135, padding: "13px 15px", flexShrink: 0, animation: `sr .4s ease ${i * .04}s both` }} h={false}>
          <div style={{ fontFamily: P.mono, fontSize: 10.5, fontWeight: 600, color: P.acc, marginBottom: 6 }}>{s.earningsDate}</div>
          <div style={{ fontFamily: P.mono, fontSize: 12.5, fontWeight: 700 }}>{s.ticker}</div>
          <div style={{ fontSize: 10.5, color: P.t3, marginTop: 2 }}>{s.name}</div>
        </Card>
      ))}
    </div>
  );
}

// ── Sectors — reads from sectors + stocks props ──
function SectorCards({ sectors, stocks, onClick }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
      {sectors.map((s, i) => {
        const count = stocks.filter(st => st.sector === s.name || st.sector === s.id).length;
        return (
          <Card key={s.id} onClick={() => onClick(s.id)} style={{ padding: "16px 18px", animation: `up .3s ease ${i * .04}s both` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <div>
                  <h3 style={{ fontSize: 13.5, fontWeight: 600 }}>{s.name}</h3>
                  <span style={{ fontSize: 11, color: P.t3 }}>{count} tracked</span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── Memos List Page — reads from stocks prop ──
function MemosView({ stocks, setView, setMemo, stars, tog }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? stocks : stocks.filter(s => s.status === filter);

  return (
    <div style={{ padding: "36px 28px", maxWidth: 1100, margin: "0 auto", animation: "fade .3s ease" }}>
      <SH t="All Memos" sub={`${stocks.length} companies with MemoSA coverage`}
        right={<div style={{ display: "flex", gap: 4 }}>
          {["all", "active", "monitor", "review"].map(f =>
            <Btn key={f} active={filter === f} onClick={() => setFilter(f)} small>{f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)}</Btn>)}
        </div>} />
      <Card style={{ overflow: "hidden" }} h={false}>
        <div style={{ display: "grid", gridTemplateColumns: "34px 90px 1fr 90px 70px 70px 70px 80px 80px", padding: "11px 18px", borderBottom: `1px solid ${P.border}`, fontSize: 9.5, color: P.t3, fontWeight: 600, letterSpacing: .6, textTransform: "uppercase" }}>
          <span /><span>Ticker</span><span>Company</span><span style={{ textAlign: "right" }}>P/E</span><span style={{ textAlign: "right" }}>ROCE</span><span style={{ textAlign: "right" }}>ROE</span><span style={{ textAlign: "right" }}>P/B</span><span style={{ textAlign: "center" }}>Sector</span><span style={{ textAlign: "center" }}>Status</span>
        </div>
        {filtered.map((s, i) => (
          <div key={s.ticker} onClick={() => { setMemo(s.ticker); setView("memo"); }}
            style={{ display: "grid", gridTemplateColumns: "34px 90px 1fr 90px 70px 70px 70px 80px 80px", padding: "13px 18px", borderBottom: `1px solid ${P.border}44`, alignItems: "center", cursor: "pointer", transition: P.fast, animation: `up .25s ease ${i * .025}s both` }}
            onMouseEnter={e => { e.currentTarget.style.background = P.hover; e.currentTarget.style.transform = "translateX(3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateX(0)"; }}>
            <StarBtn on={stars.has(s.ticker)} toggle={e => { e.stopPropagation(); tog(s.ticker); }} />
            <span style={{ fontFamily: P.mono, fontSize: 12, fontWeight: 700, color: P.acc }}>{s.ticker}</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
            <span style={{ textAlign: "right", fontFamily: P.mono, fontSize: 12, color: P.t2 }}>{s.pe}x</span>
            <span style={{ textAlign: "right", fontFamily: P.mono, fontSize: 12, color: P.t2 }}>{s.roce}%</span>
            <span style={{ textAlign: "right", fontFamily: P.mono, fontSize: 12, color: P.t2 }}>{s.roe}%</span>
            <span style={{ textAlign: "right", fontFamily: P.mono, fontSize: 12, color: P.t2 }}>{s.pb}x</span>
            <span style={{ textAlign: "center", fontSize: 10.5, color: P.t3 }}>{s.sector}</span>
            <span style={{ textAlign: "center" }}><Badge status={s.status} /></span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── Home View ──
function HomeView({ stocks, sectors, setView, setMemo, setSec }) {
  return (
    <div style={{ padding: "40px 28px", maxWidth: 1200, margin: "0 auto", animation: "fade .35s ease" }}>
      <div style={{ marginBottom: 44, maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
          <Logo s={22} />
          <span style={{ fontSize: 11, color: P.acc, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>MemoSA</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5, color: P.shark, marginBottom: 14 }}>
          One-page deep dives into <span style={{ color: P.acc }}>Indian equities</span>
        </h1>
        <p style={{ color: P.t2, fontSize: 15, lineHeight: 1.7 }}>
          Opinionated memos on NSE/BSE micro, small & midcap stocks. Interactive charts, peer comps, and live data.
        </p>
      </div>
      <div style={{ marginBottom: 40 }}><SH t="Earnings Calendar" sub="Upcoming results" /><EarnCal stocks={stocks} /></div>
      <div style={{ marginBottom: 40 }}><SH t="Thesis Heatmap" sub="Stocks with MemoSA coverage" /><StkMap stocks={stocks} onClick={t => { setMemo(t); setView("memo"); }} /></div>
      <div style={{ marginBottom: 40 }}>
        <SH t="Sectors" sub="Browse by theme" />
        <SectorCards sectors={sectors} stocks={stocks} onClick={id => { setSec(id); setView("sector"); }} />
      </div>
      <div style={{ marginBottom: 40 }}>
        <SH t="Index Heatmap" sub="Key market benchmarks" />
        <IndexHeatmap />
      </div>
    </div>
  );
}

// ── Index Heatmap ──
function IndexHeatmap() {
  const [indices, setIndices] = useState([
    { name: "NIFTY 50", value: "23,842", change: +0.62 },
    { name: "SENSEX", value: "78,620", change: +0.58 },
    { name: "NIFTY SMLCAP 250", value: "17,456", change: +1.24 },
    { name: "NIFTY PSU BANK", value: "6,892", change: +1.82 },
    { name: "NIFTY BANK", value: "51,120", change: +0.41 },
    { name: "INDIA VIX", value: "13.42", change: -3.20 },
    { name: "NIFTY MIDCAP 150", value: "21,340", change: +0.95 },
    { name: "NIFTY IT", value: "34,560", change: -0.48 },
  ]);

  useEffect(() => {
    const preferred = ["NIFTY 50", "SENSEX", "NIFTY SMLCAP 250", "NIFTY PSU BANK", "NIFTY BANK", "INDIA VIX", "NIFTY MIDCAP 150", "NIFTY IT"];
    async function fetchIndices() {
      try {
        const r = await fetch("/api/indices");
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          const filtered = data.filter(d => preferred.some(p => d.name && d.name.toUpperCase().includes(p.toUpperCase())));
          if (filtered.length > 0) setIndices(filtered.map(d => ({ name: d.name, value: typeof d.value === "number" ? d.value.toLocaleString("en-IN") : d.value, change: d.change })));
        }
      } catch (e) {}
    }
    fetchIndices();
    const iv = setInterval(fetchIndices, 15000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 8 }}>
      {indices.map((idx, i) => {
        const cl = hc(idx.change || 0);
        return (
          <Card key={idx.name} style={{ padding: "14px 16px", background: cl.bg, borderColor: cl.bd, animation: `up .3s ease ${i * .03}s both` }} h={false}>
            <div style={{ fontSize: 10.5, color: P.t3, fontWeight: 600, marginBottom: 6, letterSpacing: 0.3 }}>{idx.name}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: P.mono, fontSize: 15, fontWeight: 700, color: P.text }}>{idx.value}</span>
              <span style={{ fontFamily: P.mono, fontSize: 11.5, fontWeight: 700, color: cl.tx }}>
                {(idx.change || 0) >= 0 ? "+" : ""}{parseFloat(idx.change || 0).toFixed(2)}%
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── About View ──
function AboutView() {
  return (
    <div style={{ padding: "52px 28px", maxWidth: 560, margin: "0 auto", animation: "fade .35s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 20 }}>
        <Logo s={44} />
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>Memo<span style={{ color: P.acc }}>SA</span></h1>
      </div>
      <p style={{ color: P.t2, fontSize: 14, lineHeight: 1.85, marginBottom: 14 }}>
        Named after the mimosa — the Sunday brunch cocktail that makes everything look a little clearer. MemoSA is a curated collection of one-page investment memos on Indian micro, small, and midcap stocks listed on NSE/BSE.
      </p>
      <p style={{ color: P.t2, fontSize: 14, lineHeight: 1.85, marginBottom: 14 }}>
        Each memo pairs an opinionated thesis with live market data, interactive charts, and peer context — built for retail investors and equity research enthusiasts.
      </p>
      <p style={{ color: P.t3, fontSize: 13, fontStyle: "italic", marginBottom: 24 }}>
        "One person's attempt to think clearly about interesting businesses in public."
      </p>
      <Card style={{ padding: "18px 22px" }} h={false}>
        <div style={{ fontSize: 10, color: P.t3, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Disclaimer</div>
        <p style={{ fontSize: 12, color: P.t2, lineHeight: 1.7 }}>Not SEBI registered. Not investment advice. All views personal. DYOR. Author may hold positions discussed.</p>
      </Card>
    </div>
  );
}

// ── Placeholder for Memo Detail View ──
// The full memo view from v7 goes here.
// For launch, this renders the memo data from your JSON files.
function MemoDetailView({ memo, peers, setView, stars, tog }) {
  const [horizon, setHorizon] = useState("short");
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    // Wait for recharts to load via dynamic import
    const check = () => {
      if (typeof window !== "undefined" && window.__recharts) { setChartsReady(true); return; }
      setTimeout(check, 100);
    };
    check();
  }, []);

  if (!memo) {
    return (
      <div style={{ padding: "60px 28px", textAlign: "center" }}>
        <p style={{ color: P.t3, fontSize: 14 }}>Memo not found. <button onClick={() => setView("home")} style={{ color: P.acc, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Go home</button></p>
      </div>
    );
  }

  const rc = typeof window !== "undefined" ? window.__recharts || {} : {};
  const { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine, Area, AreaChart, Legend } = rc;

  const hz = memo.horizons ? memo.horizons[horizon] : null;
  const upside = memo.analystTarget && memo.entryPrice ? (((memo.analystTarget - memo.entryPrice) / memo.entryPrice) * 100).toFixed(1) : null;
  const sectorPeers = peers ? (peers[memo.sector] || null) : null;

  // Radar data for score
  const radarData = hz && hz.score ? [
    { dim: "Valuation", val: hz.score.valuation },
    { dim: "Growth", val: hz.score.growth },
    { dim: "Quality", val: hz.score.quality },
    { dim: "Momentum", val: hz.score.momentum },
    { dim: "Safety", val: hz.score.safety },
    { dim: "Dividends", val: hz.score.dividends },
  ] : [];

  const hzKeys = [
    { key: "short", label: "Short (1Y)" },
    { key: "medium", label: "Medium (2-3Y)" },
    { key: "long", label: "Long (5Y+)" },
  ];

  return (
    <div style={{ padding: "28px", maxWidth: 1100, margin: "0 auto", animation: "fade .25s ease" }}>
      <button onClick={() => setView("memos")} style={{ background: "none", border: "none", color: P.t3, cursor: "pointer", fontSize: 12.5, fontFamily: P.f, marginBottom: 22, fontWeight: 500, transition: P.fast }}
        onMouseEnter={e => e.currentTarget.style.color = P.acc} onMouseLeave={e => e.currentTarget.style.color = P.t3}>
        {"\u2190 Back to Memos"}
      </button>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1.2 }}>{memo.name}</h1>
            <StarBtn on={stars.has(memo.ticker)} toggle={() => tog(memo.ticker)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: P.mono, fontSize: 11.5, fontWeight: 700, color: P.acc, background: P.accDim, padding: "3px 9px", borderRadius: 6 }}>{memo.exchange}:{memo.ticker}</span>
            <Badge status={memo.status} />
            <span style={{ fontSize: 11, color: P.t3 }}>{memo.updatedAt}</span>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Bar ── */}
      <Card style={{ padding: "16px 22px", marginBottom: 14, display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }} h={false}>
        {[
          { label: "Entry Price", value: `\u20B9${memo.entryPrice}`, mono: true },
          { label: "Analyst Target", value: `\u20B9${memo.analystTarget}`, mono: true },
          upside ? { label: "Upside", value: `${upside}%`, mono: true, color: parseFloat(upside) > 0 ? P.green : P.red } : null,
          { label: "Entry Date", value: memo.entryDate },
          { label: "Earnings", value: memo.earningsDate },
          { label: "Sector", value: memo.sector },
        ].filter(Boolean).map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 10, color: P.t3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{m.label}</span>
            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: m.mono ? P.mono : P.f, color: m.color || P.text }}>{m.value}</span>
          </div>
        ))}
      </Card>

      {/* ── Price History Chart ── */}
      {memo.priceHistory && chartsReady && ResponsiveContainer && (
        <Card style={{ padding: "22px 24px", marginBottom: 14 }} h={false}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 3, height: 18, background: P.acc, borderRadius: 2, display: "inline-block" }} />
            Price History
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={memo.priceHistory} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={P.acc} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={P.acc} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={P.border} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: P.t3, fontFamily: P.mono }} axisLine={{ stroke: P.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: P.t3, fontFamily: P.mono }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ fontSize: 12, fontFamily: P.mono, borderRadius: 8, border: `1px solid ${P.border}`, boxShadow: P.shadow }} formatter={(v) => [`\u20B9${v}`, "Price"]} />
              {memo.entryPrice && <ReferenceLine y={memo.entryPrice} stroke={P.green} strokeDasharray="5 3" label={{ value: `Entry \u20B9${memo.entryPrice}`, position: "right", fontSize: 10, fill: P.green, fontFamily: P.mono }} />}
              <Area type="monotone" dataKey="price" stroke={P.acc} strokeWidth={2.5} fill="url(#priceGrad)" dot={{ r: 3, fill: P.acc, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ── Investment Thesis ── */}
      <Card style={{ padding: "24px", marginBottom: 14 }} h={false}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 3, height: 18, background: P.acc, borderRadius: 2, display: "inline-block" }} />
          Investment Thesis
        </h2>
        <div style={{ fontSize: 14, lineHeight: 1.85, color: P.t2, whiteSpace: "pre-line" }}>{memo.thesis}</div>

        {memo.tailwinds && memo.headwinds && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
            <div style={{ background: P.greenDim, borderRadius: 12, padding: "16px 18px" }}>
              <h3 style={{ fontSize: 12.5, fontWeight: 700, color: P.green, marginBottom: 10 }}>{"\u25B2"} Key Tailwinds</h3>
              {memo.tailwinds.map((t, i) => (
                <div key={i} style={{ fontSize: 12, color: P.t2, lineHeight: 1.6, padding: "5px 0", borderBottom: i < memo.tailwinds.length - 1 ? "1px solid rgba(0,179,134,0.1)" : "none" }}>{t}</div>
              ))}
            </div>
            <div style={{ background: P.redDim, borderRadius: 12, padding: "16px 18px" }}>
              <h3 style={{ fontSize: 12.5, fontWeight: 700, color: P.red, marginBottom: 10 }}>{"\u25BC"} Key Headwinds</h3>
              {memo.headwinds.map((t, i) => (
                <div key={i} style={{ fontSize: 12, color: P.t2, lineHeight: 1.6, padding: "5px 0", borderBottom: i < memo.headwinds.length - 1 ? "1px solid rgba(229,72,77,0.1)" : "none" }}>{t}</div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ── Why a Winner ── */}
      {memo.whyWinner && (
        <Card style={{ padding: "22px 24px", marginBottom: 14, borderColor: P.acc + "22", background: `linear-gradient(135deg, ${P.accDim}, ${P.card})` }} h={false}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: P.acc }}>{"\u{1F3C6}"} Why {memo.name} is a Winner</h2>
          <div style={{ fontSize: 13.5, lineHeight: 1.8, color: P.t2 }}>{memo.whyWinner}</div>
        </Card>
      )}

      {/* ── Horizon Analysis ── */}
      {memo.horizons && (
        <Card style={{ padding: "24px", marginBottom: 14 }} h={false}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 3, height: 18, background: P.purple, borderRadius: 2, display: "inline-block" }} />
            Horizon Analysis
          </h2>

          {/* Toggle */}
          <div style={{ display: "flex", gap: 6, marginBottom: 22, background: P.bg, borderRadius: 10, padding: 4, width: "fit-content" }}>
            {hzKeys.map(h => (
              <button key={h.key} onClick={() => setHorizon(h.key)} style={{
                padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 700, fontFamily: P.f, transition: P.fast,
                background: horizon === h.key ? P.card : "transparent",
                color: horizon === h.key ? P.acc : P.t3,
                boxShadow: horizon === h.key ? P.shadow : "none",
              }}>{h.label}</button>
            ))}
          </div>

          {hz && (
            <>
              {/* So What */}
              <div style={{ background: P.bg, borderRadius: 12, padding: "16px 20px", marginBottom: 20, borderLeft: `3px solid ${P.purple}` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: P.purple, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, display: "block" }}>{hz.label} — So What?</span>
                <div style={{ fontSize: 13.5, lineHeight: 1.75, color: P.t2 }}>{hz.soWhat}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: chartsReady && BarChart ? "1fr 1fr" : "1fr", gap: 18, marginBottom: 18 }}>
                {/* Financials Bar Chart */}
                {hz.financials && chartsReady && BarChart && ResponsiveContainer && (
                  <div>
                    <h3 style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 12, color: P.t2 }}>Revenue & PAT Projections (Cr)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={hz.financials} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={P.border} />
                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: P.t3, fontFamily: P.mono }} axisLine={{ stroke: P.border }} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: P.t3, fontFamily: P.mono }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                        <Tooltip contentStyle={{ fontSize: 11, fontFamily: P.mono, borderRadius: 8, border: `1px solid ${P.border}` }} formatter={(v, name) => [`\u20B9${v.toLocaleString()} Cr`, name === "revenue" ? "Revenue" : "PAT"]} />
                        <Bar dataKey="revenue" fill={P.acc} radius={[4, 4, 0, 0]} opacity={0.85} name="revenue" />
                        <Bar dataKey="pat" fill={P.green} radius={[4, 4, 0, 0]} opacity={0.85} name="pat" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 6 }}>
                      <span style={{ fontSize: 10, color: P.t3, display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: P.acc, display: "inline-block" }} /> Revenue</span>
                      <span style={{ fontSize: 10, color: P.t3, display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: P.green, display: "inline-block" }} /> PAT</span>
                      {hz.financials.some(f => f.actual) && hz.financials.some(f => !f.actual) && (
                        <span style={{ fontSize: 10, color: P.t3 }}>Solid = Actual | Light = Estimate</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Score Radar */}
                {radarData.length > 0 && chartsReady && RadarChart && ResponsiveContainer && (
                  <div>
                    <h3 style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 12, color: P.t2 }}>Conviction Scorecard</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke={P.border} />
                        <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: P.t3, fontFamily: P.f }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: P.t3 }} axisLine={false} />
                        <Radar name="Score" dataKey="val" stroke={P.acc} fill={P.acc} fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: P.acc }} />
                      </RadarChart>
                    </ResponsiveContainer>
                    {hz.scoreRationale && (
                      <div style={{ fontSize: 11.5, color: P.t3, lineHeight: 1.6, marginTop: 8, fontStyle: "italic", textAlign: "center", padding: "0 12px" }}>{hz.scoreRationale}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Assumptions Table */}
              {hz.assumptions && (
                <div style={{ marginTop: 4 }}>
                  <h3 style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 10, color: P.t2 }}>Key Assumptions</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
                    {[
                      { label: "WACC", value: hz.assumptions.wacc },
                      { label: "Terminal Growth", value: hz.assumptions.terminalGrowth },
                      { label: "Loan Growth", value: hz.assumptions.loanGrowth },
                      { label: "NIM", value: hz.assumptions.nim },
                      { label: "Credit Cost", value: hz.assumptions.creditCost },
                      { label: "CRAR", value: hz.assumptions.crar },
                    ].filter(a => a.value).map((a, i) => (
                      <div key={i} style={{ background: P.bg, borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 9.5, color: P.t3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{a.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: P.mono, color: P.text }}>{a.value}</div>
                      </div>
                    ))}
                  </div>
                  {hz.assumptions.notes && (
                    <div style={{ fontSize: 12, color: P.t3, lineHeight: 1.6, marginTop: 10, padding: "10px 14px", background: P.bg, borderRadius: 8, fontStyle: "italic" }}>{hz.assumptions.notes}</div>
                  )}
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* ── Asset Quality Chart ── */}
      {memo.assetQuality && chartsReady && ResponsiveContainer && LineChart && (
        <Card style={{ padding: "22px 24px", marginBottom: 14 }} h={false}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 3, height: 18, background: P.green, borderRadius: 2, display: "inline-block" }} />
            Asset Quality Trend
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={memo.assetQuality} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={P.border} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: P.t3, fontFamily: P.mono }} axisLine={{ stroke: P.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: P.t3, fontFamily: P.mono }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ fontSize: 11, fontFamily: P.mono, borderRadius: 8, border: `1px solid ${P.border}` }} formatter={(v, name) => [`${v}%`, name === "gnpa" ? "GNPA" : "NNPA"]} />
              <Line type="monotone" dataKey="gnpa" stroke={P.red} strokeWidth={2.5} dot={{ r: 4, fill: P.red, stroke: "#fff", strokeWidth: 2 }} name="gnpa" />
              <Line type="monotone" dataKey="nnpa" stroke={P.amber} strokeWidth={2.5} dot={{ r: 4, fill: P.amber, stroke: "#fff", strokeWidth: 2 }} name="nnpa" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
            <span style={{ fontSize: 10, color: P.t3, display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: P.red, display: "inline-block" }} /> GNPA %</span>
            <span style={{ fontSize: 10, color: P.t3, display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: P.amber, display: "inline-block" }} /> NNPA %</span>
          </div>
        </Card>
      )}

      {/* ── Peer Comparison ── */}
      {sectorPeers && (
        <Card style={{ padding: "22px 24px", marginBottom: 14 }} h={false}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 3, height: 18, background: P.forecast, borderRadius: 2, display: "inline-block" }} />
            Peer Comparison — {memo.sector}
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: P.mono }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${P.border}` }}>
                  {["Company", "MCap", "P/E", "P/B", "ROE", "ROCE", sectorPeers.relevantMetric].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: h === "Company" ? "left" : "right", fontSize: 10, fontWeight: 700, color: P.t3, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sectorPeers.peers.map((p, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${P.border}44`, transition: P.fast }}
                    onMouseEnter={e => e.currentTarget.style.background = P.hover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "10px", fontFamily: P.f, fontWeight: 600, fontSize: 12.5 }}>{p.name}</td>
                    <td style={{ padding: "10px", textAlign: "right", fontSize: 11 }}>{p.mcap}</td>
                    <td style={{ padding: "10px", textAlign: "right" }}>{p.pe}x</td>
                    <td style={{ padding: "10px", textAlign: "right" }}>{p.pb}x</td>
                    <td style={{ padding: "10px", textAlign: "right" }}>{p.roe}%</td>
                    <td style={{ padding: "10px", textAlign: "right" }}>{p.roce}</td>
                    <td style={{ padding: "10px", textAlign: "right", fontWeight: 700, color: P.acc }}>{p[sectorPeers.relevantMetricKey]}{sectorPeers.relevantMetricKey === "gnpa" || sectorPeers.relevantMetricKey === "ebitdaMargin" ? "%" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Catalysts & Risks ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {[{ t: "Catalysts", i: "\u25B2", c: P.green, items: memo.catalysts }, { t: "Risks", i: "\u25BC", c: P.red, items: memo.risks }].map(sec => (
          <Card key={sec.t} style={{ padding: "18px 20px" }} h={false}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 11, display: "flex", alignItems: "center", gap: 5 }}><span style={{ color: sec.c, fontSize: 9 }}>{sec.i}</span>{sec.t}</h3>
            {(sec.items || []).map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: i < (sec.items || []).length - 1 ? `1px solid ${P.border}44` : "none", fontSize: 12.5, color: P.t2, lineHeight: 1.55 }}>
                <span style={{ color: sec.c, fontFamily: P.mono, fontSize: 10, fontWeight: 700, marginTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>{item}
              </div>
            ))}
          </Card>
        ))}
      </div>

      {/* ── Changelog ── */}
      <Card style={{ padding: "18px 20px" }} h={false}>
        <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 11 }}>Changelog</h3>
        {(memo.changelog || []).map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: i < (memo.changelog || []).length - 1 ? `1px solid ${P.border}44` : "none" }}>
            <span style={{ fontFamily: P.mono, fontSize: 10, color: P.t3, whiteSpace: "nowrap", fontWeight: 600 }}>{c.date}</span>
            <span style={{ fontSize: 12, color: P.t2, lineHeight: 1.5 }}>{c.note}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── Main App ──
export default function MemoSA({ stocks, sectors, peers, memos }) {
  const [view, setView] = useState("home");
  const [sec, setSec] = useState("psu-banks");
  const [memoTicker, setMemoTicker] = useState(null);
  const [stars, setStars] = useState(new Set(["CANBK", "BANKBARODA", "WABAG"]));

  const tog = t => setStars(p => { const n = new Set(p); n.has(t) ? n.delete(t) : n.add(t); return n; });

  // Live price overlay — fetches from your API every 60s
  const [livePrices, setLivePrices] = useState({});
  useEffect(() => {
    async function fetchPrices() {
      try {
        const promises = stocks.map(s =>
          fetch(`/api/stock/${s.ticker}`).then(r => r.json()).catch(() => null)
        );
        const results = await Promise.all(promises);
        const prices = {};
        results.forEach((r, i) => {
          if (r && r.price) prices[stocks[i].ticker] = r;
        });
        setLivePrices(prices);
      } catch (e) { /* fail silently */ }
    }
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, [stocks]);

  // Merge live prices into stocks data
  const enrichedStocks = stocks.map(s => ({
    ...s,
    ...(livePrices[s.ticker] ? {
      livePrice: livePrices[s.ticker].price,
      change: livePrices[s.ticker].change ?? s.change,
    } : {}),
  }));

  const currentMemo = memoTicker ? memos[memoTicker] : null;

  return (
    <div style={{ background: P.bg, minHeight: "100vh", color: P.text, fontFamily: P.f }}>
      <RechartsComponents />
      <TickerBar />
      <Nav view={view} setView={setView} wc={stars.size} />

      {view === "home" && <HomeView stocks={enrichedStocks} sectors={sectors} setView={setView} setMemo={setMemoTicker} setSec={setSec} />}
      {view === "memos" && <MemosView stocks={enrichedStocks} setView={setView} setMemo={setMemoTicker} stars={stars} tog={tog} />}
      {view === "memo" && <MemoDetailView memo={currentMemo} peers={peers} setView={setView} stars={stars} tog={tog} />}
      {view === "compare" && <div style={{ padding: "60px 28px", textAlign: "center", color: P.t3 }}>Compare view — use the v7 artifact component</div>}
      {view === "watchlist" && <div style={{ padding: "60px 28px", textAlign: "center", color: P.t3 }}>Watchlist view — use the v7 artifact component</div>}
      {view === "about" && <AboutView />}

      <div style={{ borderTop: `1px solid ${P.border}`, padding: "18px 28px", marginTop: 48, display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Logo s={15} /><span style={{ fontSize: 11, color: P.t3 }}>MemoSA {"\u00A9"} 2026</span>
        </div>
        <span style={{ fontSize: 11, color: P.t3 }}>Not SEBI registered {"\u00B7"} NSE {"\u00B7"} BSE</span>
      </div>
    </div>
  );
}
