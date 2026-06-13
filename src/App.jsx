
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Settings,
  Search,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Sun,
  Moon,
  RefreshCw,
  Inbox,
  AlertTriangle,
  Plus,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════
   DATA  — fictional subscription SaaS "Meridian". In production
   this is fetched; kept inline so the artifact is self-contained.
   ════════════════════════════════════════════════════════════ */

const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const series = (vals) => vals.map((value, i) => ({ month: MONTHS[i], value }));

const KPIS = [
  {
    key: "mrr",
    label: "Monthly recurring revenue",
    value: "$48,250",
    delta: 12.4,
    positive: true,
    format: "money",
    data: series([31200, 33100, 34800, 36050, 38400, 39900, 41600, 42850, 44100, 45700, 46900, 48250]),
  },
  {
    key: "subs",
    label: "Active subscribers",
    value: "1,284",
    delta: 5.2,
    positive: true,
    format: "number",
    data: series([1062, 1090, 1115, 1140, 1168, 1190, 1205, 1225, 1244, 1262, 1271, 1284]),
  },
  {
    key: "churn",
    label: "Monthly churn",
    value: "2.1%",
    delta: -0.4,
    positive: true, // a drop in churn is good
    format: "percent",
    data: series([3.1, 3.0, 2.9, 2.8, 2.7, 2.6, 2.5, 2.5, 2.4, 2.3, 2.2, 2.1]),
  },
  {
    key: "arpu",
    label: "Avg revenue / user",
    value: "$37.60",
    delta: 6.8,
    positive: true,
    format: "usd",
    data: series([29.4, 30.4, 31.2, 31.6, 32.9, 33.5, 34.5, 34.9, 35.4, 36.2, 36.9, 37.6]),
  },
];

const MOVEMENTS = [
  { month: "Jan", new: 3200, expansion: 1400, churn: -1100 },
  { month: "Feb", new: 2800, expansion: 1650, churn: -1300 },
  { month: "Mar", new: 3500, expansion: 1200, churn: -1450 },
  { month: "Apr", new: 3900, expansion: 1800, churn: -1100 },
  { month: "May", new: 3100, expansion: 2100, churn: -1500 },
  { month: "Jun", new: 4200, expansion: 1950, churn: -1350 },
];

const PLAN_MIX = [
  { name: "Starter", value: 9100, color: "var(--c-muted-line)" },
  { name: "Pro", value: 16400, color: "var(--c-accent-2)" },
  { name: "Business", value: 14200, color: "var(--c-accent)" },
  { name: "Enterprise", value: 8550, color: "var(--c-ink)" },
];

const ACTIVITY = [
  { cust: "Northwind Labs", plan: "Enterprise", mrr: 1490, status: "new", date: "Jun 12" },
  { cust: "Aria Studios", plan: "Business", mrr: 420, status: "upgrade", date: "Jun 11" },
  { cust: "Kettle & Co", plan: "Pro", mrr: 99, status: "new", date: "Jun 10" },
  { cust: "Vertex Logistics", plan: "Business", mrr: -420, status: "churn", date: "Jun 09" },
  { cust: "Bloom Health", plan: "Pro", mrr: 99, status: "new", date: "Jun 09" },
  { cust: "Tinsel Robotics", plan: "Enterprise", mrr: 980, status: "upgrade", date: "Jun 08" },
];

/* ── formatting + windowing ───────────────────────────────── */

const FMT = {
  money: { full: (v) => "$" + Math.round(v).toLocaleString("en-US"), axis: (v) => "$" + v / 1000 + "k" },
  number: { full: (v) => Math.round(v).toLocaleString("en-US"), axis: (v) => (v >= 1000 ? v / 1000 + "k" : "" + v) },
  percent: { full: (v) => v.toFixed(1) + "%", axis: (v) => v + "%" },
  usd: { full: (v) => "$" + v.toFixed(2), axis: (v) => "$" + v },
};
const moneyDelta = (n) => (n < 0 ? "−$" : "+$") + Math.abs(n).toLocaleString("en-US");

const RANGES = { "Last 90 days": 3, "Last 6 months": 6, "Last 12 months": 12 };
const windowed = (arr, range) => arr.slice(-RANGES[range]);

const axisTick = { fill: "var(--c-muted)", fontSize: 11, fontFamily: "var(--f-mono)" };

/* ════════════════════════════════════════════════════════════
   SMALL PIECES
   ════════════════════════════════════════════════════════════ */

function ChartTooltip({ active, payload, label, fmt = FMT.money.full }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="tip">
      <div className="tip-label">{label}</div>
      {payload.map((p, i) => (
        <div className="tip-row" key={i}>
          <span className="tip-dot" style={{ background: p.color || p.fill }} />
          <span className="tip-name">{p.name}</span>
          <span className="tip-val">{fmt(Math.abs(p.value))}</span>
        </div>
      ))}
    </div>
  );
}

function Dropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div className="dd" ref={ref}>
      <button className="range" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}>
        {value}
        <ChevronDown size={15} strokeWidth={1.75} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>
      {open && (
        <ul className="dd-menu" role="listbox">
          {options.map((opt) => (
            <li key={opt}>
              <button
                role="option"
                aria-selected={opt === value}
                className={"dd-opt" + (opt === value ? " is-sel" : "")}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── States: loading / error / empty ──────────────────────── */

function Skeleton() {
  return (
    <>
      <div className="kpi-grid">
        {[0, 1, 2, 3].map((i) => (
          <div className="kpi" key={i}>
            <div className="sk sk-line" style={{ width: "70%" }} />
            <div className="sk sk-line lg" style={{ width: "45%" }} />
            <div className="sk sk-block" style={{ height: 34 }} />
          </div>
        ))}
      </div>
      <div className="grid-2">
        <div className="card"><div className="sk sk-line" style={{ width: "30%" }} /><div className="sk sk-block" style={{ height: 230, marginTop: 14 }} /></div>
        <div className="card"><div className="sk sk-line" style={{ width: "40%" }} /><div className="sk sk-block" style={{ height: 230, marginTop: 14 }} /></div>
      </div>
    </>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="state-pane">
      <div className="state-icon err"><AlertTriangle size={26} strokeWidth={1.75} /></div>
      <h2 className="state-title">Couldn't load your metrics</h2>
      <p className="state-text">The analytics service didn't respond. Your data is safe — this is a fetch problem, not a data problem.</p>
      <button className="btn-primary" onClick={onRetry}><RefreshCw size={15} strokeWidth={2} />Try again</button>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="state-pane">
      <div className="state-icon"><Inbox size={26} strokeWidth={1.75} /></div>
      <h2 className="state-title">No revenue data yet</h2>
      <p className="state-text">Once your first subscription is active, MRR, churn, and movements will show up here.</p>
      <button className="btn-primary" onClick={onAdd}><Plus size={15} strokeWidth={2} />Connect billing</button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD (the "ready" view)
   ════════════════════════════════════════════════════════════ */

function DashboardView({ range, selected, setSelected }) {
  const kpi = KPIS.find((k) => k.key === selected);
  const heroData = windowed(kpi.data, range);
  const moveData = windowed(MOVEMENTS, range);
  const f = FMT[kpi.format];

  return (
    <>
      {/* KPI row — clickable, drives the hero chart */}
      <section className="kpi-grid" aria-label="Key metrics">
        {KPIS.map((k) => {
          const spark = k.data.slice(-7);
          return (
            <button
              key={k.key}
              className={"kpi" + (k.key === selected ? " is-sel" : "")}
              onClick={() => setSelected(k.key)}
              aria-pressed={k.key === selected}
            >
              <span className="kpi-label">{k.label}</span>
              <span className="kpi-mid">
                <span className="kpi-value">{k.value}</span>
                <span className={"delta " + (k.positive ? "up" : "down")}>
                  {k.positive ? <ArrowUpRight size={13} strokeWidth={2.25} /> : <ArrowDownRight size={13} strokeWidth={2.25} />}
                  {Math.abs(k.delta)}%
                </span>
              </span>
              <span className="kpi-spark">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spark}>
                    <Line type="monotone" dataKey="value" stroke="var(--c-accent)" strokeWidth={1.75} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </span>
            </button>
          );
        })}
      </section>

      {/* Charts row */}
      <section className="grid-2">
        <article className="card chart-card">
          <div className="card-head">
            <div>
              <h2 className="card-title">{kpi.label}</h2>
              <p className="card-sub">{range}</p>
            </div>
            <span className={"badge " + (kpi.positive ? "" : "neg")}>
              {kpi.positive ? "+" : ""}{kpi.delta}% MoM
            </span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={heroData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillHero" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--c-accent)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--c-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--c-line)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTick} />
                <YAxis tickLine={false} axisLine={false} tick={axisTick} tickFormatter={f.axis} width={48} domain={["auto", "auto"]} />
                <Tooltip content={<ChartTooltip fmt={f.full} />} cursor={{ stroke: "var(--c-muted-line)" }} />
                <Area type="monotone" dataKey="value" name={kpi.label} stroke="var(--c-accent)" strokeWidth={2} fill="url(#fillHero)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card chart-card">
          <div className="card-head">
            <div>
              <h2 className="card-title">Plan mix</h2>
              <p className="card-sub">MRR by tier</p>
            </div>
          </div>
          <div className="donut-wrap">
            <div className="donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PLAN_MIX} dataKey="value" innerRadius="62%" outerRadius="100%" paddingAngle={2} stroke="none" isAnimationActive={false}>
                    {PLAN_MIX.map((p, i) => <Cell key={i} fill={p.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip fmt={FMT.money.full} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <span className="donut-total">$48.2k</span>
                <span className="donut-cap">total MRR</span>
              </div>
            </div>
            <ul className="legend">
              {PLAN_MIX.map((p) => (
                <li key={p.name}>
                  <span className="legend-dot" style={{ background: p.color }} />
                  <span className="legend-name">{p.name}</span>
                  <span className="legend-val">{FMT.money.full(p.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      {/* Lower row */}
      <section className="grid-2 lower">
        <article className="card chart-card">
          <div className="card-head">
            <div>
              <h2 className="card-title">MRR movements</h2>
              <p className="card-sub">New vs expansion vs churn</p>
            </div>
            <div className="mini-legend">
              <span><i style={{ background: "var(--c-accent)" }} />New</span>
              <span><i style={{ background: "var(--c-accent-2)" }} />Expansion</span>
              <span><i style={{ background: "var(--c-neg)" }} />Churn</span>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moveData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={2}>
                <CartesianGrid stroke="var(--c-line)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTick} />
                <YAxis tickLine={false} axisLine={false} tick={axisTick} tickFormatter={(v) => "$" + v / 1000 + "k"} width={48} />
                <Tooltip content={<ChartTooltip fmt={FMT.money.full} />} cursor={{ fill: "var(--c-hover)" }} />
                <Bar dataKey="new" name="New" fill="var(--c-accent)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="expansion" name="Expansion" fill="var(--c-accent-2)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="churn" name="Churn" fill="var(--c-neg)" radius={[0, 0, 2, 2]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card">
          <div className="card-head">
            <div>
              <h2 className="card-title">Recent activity</h2>
              <p className="card-sub">Subscription changes</p>
            </div>
            <button className="link-btn">View all</button>
          </div>
          <div className="table">
            <div className="tr th">
              <span>Customer</span><span>Plan</span><span className="num">MRR Δ</span><span className="ta-right">Date</span>
            </div>
            {ACTIVITY.map((a, i) => (
              <div className="tr" key={i}>
                <span className="cust"><span className={"status-dot " + a.status} /><span>{a.cust}</span></span>
                <span className="muted">{a.plan}</span>
                <span className={"num " + (a.mrr < 0 ? "neg" : "pos")}>{moneyDelta(a.mrr)}</span>
                <span className="ta-right muted">{a.date}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   APP SHELL
   ════════════════════════════════════════════════════════════ */

export default function MeridianDashboard() {
  const [theme, setTheme] = useState("light");
  const [range, setRange] = useState("Last 12 months");
  const [selected, setSelected] = useState("mrr");
  const [status, setStatus] = useState("ready"); // loading | error | empty | ready
  const [nav, setNav] = useState("Overview");

  const simulateFetch = useCallback(() => {
    setStatus("loading");
    const t = setTimeout(() => setStatus("ready"), 1100);
    return () => clearTimeout(t);
  }, []);

  const navItems = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Revenue", icon: TrendingUp },
    { label: "Customers", icon: Users },
    { label: "Settings", icon: Settings },
  ];
  const states = ["ready", "loading", "empty", "error"];

  return (
    <>
      <style>{CSS}</style>
      <div className="app" data-theme={theme}>
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark" aria-hidden />
            <span className="brand-name">Meridian</span>
          </div>
          <nav className="nav" aria-label="Primary">
            {navItems.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className={"nav-item" + (nav === label ? " is-active" : "")}
                onClick={() => setNav(label)}
                aria-current={nav === label ? "page" : undefined}
              >
                <Icon size={17} strokeWidth={1.75} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-foot">
            <div className="plan-pill"><span className="plan-dot" />Growth plan</div>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div>
              <p className="eyebrow">Dashboard</p>
              <h1 className="page-title">Overview</h1>
            </div>
            <div className="topbar-tools">
              <Dropdown value={range} options={Object.keys(RANGES)} onChange={setRange} />
              <button className="icon-btn" aria-label="Refresh data" onClick={simulateFetch}>
                <RefreshCw size={16} strokeWidth={1.75} />
              </button>
              <button className="icon-btn" aria-label="Toggle theme" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
                {theme === "light" ? <Moon size={16} strokeWidth={1.75} /> : <Sun size={16} strokeWidth={1.75} />}
              </button>
              <button className="icon-btn" aria-label="Search"><Search size={17} strokeWidth={1.75} /></button>
              <button className="icon-btn" aria-label="Notifications"><Bell size={17} strokeWidth={1.75} /></button>
              <div className="avatar" title="Pragati Gautam">PG</div>
            </div>
          </header>

          {/* demo affordance — lets reviewers preview every state */}
          <div className="demobar">
            <span className="demobar-tag">Preview states</span>
            <div className="seg">
              {states.map((s) => (
                <button key={s} className={"seg-btn" + (status === s ? " is-on" : "")} aria-pressed={status === s} onClick={() => setStatus(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {status === "loading" && <Skeleton />}
          {status === "error" && <ErrorState onRetry={simulateFetch} />}
          {status === "empty" && <EmptyState onAdd={() => setStatus("ready")} />}
          {status === "ready" && <DashboardView range={range} selected={selected} setSelected={setSelected} />}
        </main>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   DESIGN SYSTEM — all tokens as CSS variables. Dark mode is a
   single override block on [data-theme="dark"]; every color in
   the UI and charts reads from these vars, so both themes stay
   in sync automatically.
   ════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

.app{
  --c-canvas:#EDEBE4; --c-surface:#FBFAF6; --c-ink:#1F1E1B; --c-muted:#76746B;
  --c-line:#E6E3DA; --c-muted-line:#CFCCC1;
  --c-accent:#1A6A66; --c-accent-2:#C8801E; --c-pos:#2E7D5B; --c-neg:#B4452F;
  --c-pos-soft:rgba(46,125,91,0.10); --c-neg-soft:rgba(180,69,47,0.10);
  --c-tip-bg:#1F1E1B; --c-tip-fg:#FBFAF6; --c-hover:rgba(0,0,0,0.03);
  --c-sk:rgba(0,0,0,0.05); --c-sk-2:rgba(0,0,0,0.09);
  --f-display:'Fraunces',Georgia,serif; --f-ui:'Inter',system-ui,sans-serif; --f-mono:'JetBrains Mono',ui-monospace,monospace;
  --radius:10px;
}
.app[data-theme="dark"]{
  --c-canvas:#1A1917; --c-surface:#232220; --c-ink:#F2F0EA; --c-muted:#9C988D;
  --c-line:#322F2B; --c-muted-line:#4A4640;
  --c-accent:#3FA89F; --c-accent-2:#E0A24A; --c-pos:#5FB98C; --c-neg:#D9744F;
  --c-pos-soft:rgba(95,185,140,0.14); --c-neg-soft:rgba(217,116,79,0.16);
  --c-tip-bg:#0F0E0D; --c-tip-fg:#F2F0EA; --c-hover:rgba(255,255,255,0.04);
  --c-sk:rgba(255,255,255,0.05); --c-sk-2:rgba(255,255,255,0.09);
}

*{box-sizing:border-box;}

.app{
  display:flex; min-height:660px; background:var(--c-canvas); color:var(--c-ink);
  font-family:var(--f-ui); font-size:14px; line-height:1.45; -webkit-font-smoothing:antialiased;
  transition:background .2s,color .2s;
}

/* ── Sidebar ── */
.sidebar{width:228px;flex-shrink:0;padding:24px 18px;border-right:1px solid var(--c-line);display:flex;flex-direction:column;}
.brand{display:flex;align-items:center;gap:10px;padding:4px 8px 22px;}
.brand-mark{width:22px;height:22px;border-radius:6px;background:var(--c-accent);box-shadow:inset 0 0 0 4px var(--c-canvas),inset 0 0 0 5px var(--c-accent);}
.brand-name{font-family:var(--f-display);font-weight:600;font-size:19px;letter-spacing:-0.01em;}
.nav{display:flex;flex-direction:column;gap:2px;}
.nav-item{display:flex;align-items:center;gap:11px;padding:9px 11px;border-radius:8px;border:none;background:none;cursor:pointer;font:inherit;color:var(--c-muted);text-align:left;width:100%;transition:background .15s,color .15s;}
.nav-item:hover{background:var(--c-hover);color:var(--c-ink);}
.nav-item.is-active{background:var(--c-surface);color:var(--c-ink);font-weight:500;box-shadow:0 0 0 1px var(--c-line);}
.nav-item:focus-visible{outline:2px solid var(--c-accent);outline-offset:2px;}
.sidebar-foot{margin-top:auto;}
.plan-pill{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--c-muted);padding:10px 12px;border:1px solid var(--c-line);border-radius:8px;}
.plan-dot{width:7px;height:7px;border-radius:50%;background:var(--c-pos);}

/* ── Main / topbar ── */
.main{flex:1;padding:24px 30px 36px;overflow:auto;min-width:0;}
.topbar{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:18px;gap:16px;}
.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:0.13em;color:var(--c-muted);margin:0 0 3px;}
.page-title{font-family:var(--f-display);font-weight:500;font-size:30px;letter-spacing:-0.02em;margin:0;}
.topbar-tools{display:flex;align-items:center;gap:8px;}
.dd{position:relative;}
.range{display:flex;align-items:center;gap:7px;padding:8px 12px;border:1px solid var(--c-line);border-radius:8px;background:var(--c-surface);color:var(--c-ink);font:inherit;font-size:13px;cursor:pointer;white-space:nowrap;}
.range:hover{border-color:var(--c-muted-line);}
.dd-menu{position:absolute;top:calc(100% + 6px);right:0;z-index:20;list-style:none;margin:0;padding:5px;min-width:170px;background:var(--c-surface);border:1px solid var(--c-line);border-radius:9px;box-shadow:0 12px 30px rgba(0,0,0,0.14);}
.dd-opt{display:block;width:100%;text-align:left;padding:8px 10px;border:none;background:none;border-radius:6px;font:inherit;font-size:13px;color:var(--c-ink);cursor:pointer;}
.dd-opt:hover{background:var(--c-hover);}
.dd-opt.is-sel{color:var(--c-accent);font-weight:500;}
.icon-btn{width:36px;height:36px;display:grid;place-items:center;border:1px solid var(--c-line);border-radius:8px;background:var(--c-surface);color:var(--c-muted);cursor:pointer;transition:color .15s,border-color .15s;}
.icon-btn:hover{color:var(--c-ink);border-color:var(--c-muted-line);}
.range:focus-visible,.icon-btn:focus-visible,.dd-opt:focus-visible{outline:2px solid var(--c-accent);outline-offset:2px;}
.avatar{width:36px;height:36px;border-radius:50%;background:var(--c-ink);color:var(--c-canvas);display:grid;place-items:center;font-size:12px;font-weight:600;letter-spacing:0.02em;}

/* ── Demo state switcher ── */
.demobar{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-bottom:18px;}
.demobar-tag{font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--c-muted);}
.seg{display:inline-flex;background:var(--c-surface);border:1px solid var(--c-line);border-radius:8px;padding:3px;gap:2px;}
.seg-btn{border:none;background:none;font:inherit;font-size:12px;color:var(--c-muted);padding:5px 11px;border-radius:6px;cursor:pointer;text-transform:capitalize;}
.seg-btn:hover{color:var(--c-ink);}
.seg-btn.is-on{background:var(--c-accent);color:#fff;font-weight:500;}
.app[data-theme="dark"] .seg-btn.is-on{color:#10100F;}
.seg-btn:focus-visible{outline:2px solid var(--c-accent);outline-offset:2px;}

/* ── KPI cards (signature) ── */
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:16px;}
.kpi{background:var(--c-surface);border:1px solid var(--c-line);border-radius:var(--radius);padding:16px 17px 8px;display:flex;flex-direction:column;gap:9px;text-align:left;cursor:pointer;font:inherit;color:inherit;transition:border-color .15s,box-shadow .15s;}
.kpi:hover{border-color:var(--c-muted-line);}
.kpi.is-sel{border-color:var(--c-accent);box-shadow:0 0 0 1px var(--c-accent);}
.kpi:focus-visible{outline:2px solid var(--c-accent);outline-offset:2px;}
.kpi-label{font-size:12px;color:var(--c-muted);}
.kpi-mid{display:flex;align-items:baseline;justify-content:space-between;gap:10px;}
.kpi-value{font-family:var(--f-display);font-weight:500;font-size:27px;letter-spacing:-0.02em;font-variant-numeric:tabular-nums;}
.delta{display:inline-flex;align-items:center;gap:2px;font-family:var(--f-mono);font-size:11.5px;font-weight:500;padding:2px 6px;border-radius:6px;white-space:nowrap;}
.delta.up{color:var(--c-pos);background:var(--c-pos-soft);}
.delta.down{color:var(--c-neg);background:var(--c-neg-soft);}
.kpi-spark{height:34px;margin:0 -3px;display:block;}

/* ── Cards / grids ── */
.grid-2{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px;}
.grid-2.lower{grid-template-columns:1fr 1fr;}
.card{background:var(--c-surface);border:1px solid var(--c-line);border-radius:var(--radius);padding:18px 18px 16px;display:flex;flex-direction:column;min-width:0;}
.card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px;}
.card-title{font-family:var(--f-display);font-weight:500;font-size:17px;letter-spacing:-0.01em;margin:0;}
.card-sub{font-size:12px;color:var(--c-muted);margin:2px 0 0;}
.badge{font-family:var(--f-mono);font-size:11.5px;color:var(--c-pos);background:var(--c-pos-soft);padding:3px 8px;border-radius:6px;white-space:nowrap;}
.badge.neg{color:var(--c-neg);background:var(--c-neg-soft);}
.chart-body{height:230px;}

/* ── Donut ── */
.donut-wrap{display:flex;flex-direction:column;gap:14px;}
.donut{position:relative;height:168px;}
.donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;}
.donut-total{font-family:var(--f-display);font-weight:500;font-size:23px;letter-spacing:-0.02em;}
.donut-cap{font-size:11px;color:var(--c-muted);}
.legend{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;}
.legend li{display:flex;align-items:center;gap:9px;font-size:13px;}
.legend-dot{width:9px;height:9px;border-radius:3px;flex-shrink:0;}
.legend-name{flex:1;}
.legend-val{font-family:var(--f-mono);font-size:12.5px;color:var(--c-muted);font-variant-numeric:tabular-nums;}
.mini-legend{display:flex;gap:13px;font-size:11.5px;color:var(--c-muted);}
.mini-legend span{display:inline-flex;align-items:center;gap:5px;}
.mini-legend i{width:9px;height:9px;border-radius:3px;}

/* ── Table ── */
.link-btn{border:none;background:none;color:var(--c-accent);font:inherit;font-size:12.5px;cursor:pointer;padding:0;}
.link-btn:hover{text-decoration:underline;}
.table{display:flex;flex-direction:column;}
.tr{display:grid;grid-template-columns:1.6fr 1fr 0.9fr 0.7fr;align-items:center;gap:10px;padding:11px 4px;border-top:1px solid var(--c-line);font-size:13px;}
.tr.th{border-top:none;padding-top:0;padding-bottom:9px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--c-muted);}
.cust{display:flex;align-items:center;gap:9px;font-weight:500;min-width:0;}
.cust span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.status-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.status-dot.new{background:var(--c-accent);}
.status-dot.upgrade{background:var(--c-accent-2);}
.status-dot.churn{background:var(--c-neg);}
.muted{color:var(--c-muted);}
.num{font-family:var(--f-mono);font-size:12.5px;font-variant-numeric:tabular-nums;}
.num.pos{color:var(--c-pos);}
.num.neg{color:var(--c-neg);}
.ta-right{text-align:right;}

/* ── Tooltip ── */
.tip{background:var(--c-tip-bg);color:var(--c-tip-fg);border-radius:8px;padding:9px 11px;font-size:12px;box-shadow:0 8px 24px rgba(0,0,0,0.22);}
.tip-label{font-family:var(--f-mono);font-size:10.5px;opacity:0.6;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;}
.tip-row{display:flex;align-items:center;gap:8px;margin-top:3px;}
.tip-dot{width:8px;height:8px;border-radius:2px;}
.tip-name{flex:1;opacity:0.85;}
.tip-val{font-family:var(--f-mono);font-variant-numeric:tabular-nums;}

/* ── Skeleton ── */
.sk{background:linear-gradient(90deg,var(--c-sk) 25%,var(--c-sk-2) 37%,var(--c-sk) 63%);background-size:400% 100%;border-radius:6px;animation:shimmer 1.4s ease infinite;}
.sk-line{height:11px;margin-bottom:10px;}
.sk-line.lg{height:24px;margin-bottom:14px;}
.sk-block{border-radius:8px;}
@keyframes shimmer{0%{background-position:100% 0;}100%{background-position:0 0;}}

/* ── State panes (error / empty) ── */
.state-pane{background:var(--c-surface);border:1px solid var(--c-line);border-radius:var(--radius);padding:56px 24px;display:flex;flex-direction:column;align-items:center;text-align:center;}
.state-icon{width:54px;height:54px;border-radius:14px;display:grid;place-items:center;background:var(--c-hover);color:var(--c-muted);margin-bottom:18px;}
.state-icon.err{color:var(--c-neg);background:var(--c-neg-soft);}
.state-title{font-family:var(--f-display);font-weight:500;font-size:20px;margin:0 0 7px;}
.state-text{font-size:13.5px;color:var(--c-muted);max-width:380px;margin:0 0 20px;line-height:1.55;}
.btn-primary{display:inline-flex;align-items:center;gap:7px;background:var(--c-accent);color:#fff;border:none;border-radius:8px;padding:10px 16px;font:inherit;font-size:13.5px;font-weight:500;cursor:pointer;}
.app[data-theme="dark"] .btn-primary{color:#10100F;}
.btn-primary:hover{filter:brightness(1.05);}
.btn-primary:focus-visible{outline:2px solid var(--c-accent);outline-offset:2px;}

/* ── Responsive ── */
@media (max-width:1080px){
  .kpi-grid{grid-template-columns:repeat(2,1fr);}
  .grid-2,.grid-2.lower{grid-template-columns:1fr;}
}
@media (max-width:640px){
  .sidebar{display:none;}
  .main{padding:18px;}
  .kpi-grid{grid-template-columns:1fr;}
  .page-title{font-size:25px;}
  .demobar{justify-content:flex-start;flex-wrap:wrap;}
}
@media (prefers-reduced-motion:reduce){
  *{transition:none !important;animation:none !important;}
}
`;
