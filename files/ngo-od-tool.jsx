import { useState, useCallback } from "react";

const CAPABILITIES = [
  {
    id: 1, name: "Strategic Clarity & Coherence", icon: "◎",
    color: "#1a6b5a",
    subcapabilities: [
      { id: "1a", name: "Mission and Vision", dei: false },
      { id: "1b", name: "Strategic Planning", dei: false },
      { id: "1c", name: "DEI in Strategy", dei: true },
    ]
  },
  {
    id: 2, name: "Governance & Board Management", icon: "⬡",
    color: "#2c5282",
    subcapabilities: [
      { id: "2a", name: "Board Composition & Characteristics", dei: false },
      { id: "2b", name: "Board Engagement", dei: false },
      { id: "2c", name: "Diversified Board", dei: true },
    ]
  },
  {
    id: 3, name: "Organisation Management & Culture", icon: "⬢",
    color: "#6b21a8",
    subcapabilities: [
      { id: "3a", name: "Organisational Structure", dei: false },
      { id: "3b", name: "Change Management", dei: false },
      { id: "3c", name: "Knowledge Management", dei: false },
      { id: "3d", name: "Administrative Procedures", dei: false },
      { id: "3e", name: "Staff Well-being", dei: false },
      { id: "3f", name: "Risk Management", dei: false },
      { id: "3g", name: "Organisational Culture", dei: true },
    ]
  },
  {
    id: 4, name: "Leadership Development", icon: "▲",
    color: "#9a3412",
    subcapabilities: [
      { id: "4a", name: "Management Style", dei: false },
      { id: "4b", name: "Succession Planning & Development", dei: false },
      { id: "4c", name: "Diversified Leadership", dei: true },
    ]
  },
  {
    id: 5, name: "Finance & Accounting", icon: "◈",
    color: "#064e3b",
    subcapabilities: [
      { id: "5a", name: "Financial Systems & Controls", dei: false },
      { id: "5b", name: "Staff Financial Skills", dei: false },
      { id: "5c", name: "Budgeting", dei: false },
      { id: "5d", name: "Accounting", dei: false },
      { id: "5e", name: "Financial Sustainability", dei: false },
    ]
  },
  {
    id: 6, name: "Human Resources", icon: "◉",
    color: "#1e3a5f",
    subcapabilities: [
      { id: "6a", name: "Job Descriptions & Appraisals", dei: false },
      { id: "6b", name: "HR Policies & Plans", dei: false },
      { id: "6c", name: "Compensation & Benefits", dei: false },
      { id: "6d", name: "Staff Development", dei: false },
      { id: "6e", name: "Staff Turnover", dei: false },
      { id: "6f", name: "DEI in HR", dei: true },
    ]
  },
  {
    id: 7, name: "Fundraising", icon: "◆",
    color: "#78350f",
    subcapabilities: [
      { id: "7a", name: "Funding Diversification", dei: false },
      { id: "7b", name: "Funder Management Systems", dei: false },
      { id: "7c", name: "Fundraising Capacity", dei: false },
    ]
  },
  {
    id: 8, name: "Communications, Marketing & Advocacy", icon: "◐",
    color: "#134e4a",
    subcapabilities: [
      { id: "8a", name: "Communications Strategy", dei: false },
      { id: "8b", name: "DEI in Communications & Marketing", dei: true },
      { id: "8c", name: "Advocacy", dei: false },
    ]
  },
  {
    id: 9, name: "Monitoring, Learning & Evaluation", icon: "◑",
    color: "#312e81",
    subcapabilities: [
      { id: "9a", name: "MLE Strategy", dei: false },
      { id: "9b", name: "Data Collection & Infrastructure", dei: false },
      { id: "9c", name: "Data Analysis & Dissemination", dei: false },
      { id: "9d", name: "Influence of Evaluation on Organisation", dei: false },
      { id: "9e", name: "Collection & Presentation of DEI Data", dei: true },
    ]
  },
  {
    id: 10, name: "Programme Management", icon: "◒",
    color: "#1c3340",
    subcapabilities: [
      { id: "10a", name: "Theory of Change & Results Framework", dei: false },
      { id: "10b", name: "Programme Planning", dei: false },
      { id: "10c", name: "Programme Growth & Replication", dei: false },
      { id: "10d", name: "New Programme Development", dei: false },
    ]
  },
  {
    id: 11, name: "Legal & Compliance", icon: "◓",
    color: "#3b0764",
    subcapabilities: [
      { id: "11a", name: "Legal Obligations", dei: false },
      { id: "11b", name: "Compliance", dei: false },
    ]
  },
  {
    id: 12, name: "Information Technology Systems", icon: "⬟",
    color: "#0c4a6e",
    subcapabilities: [
      { id: "12a", name: "Website", dei: false },
      { id: "12b", name: "Database Management & Reporting Systems", dei: false },
    ]
  },
  {
    id: 13, name: "Partnerships & Alliances", icon: "⬠",
    color: "#14532d",
    subcapabilities: [
      { id: "13a", name: "Partnership Strategy", dei: false },
    ]
  },
];

const LEVEL_LABELS = ["Not Assessed", "Level 1 — Nascent", "Level 2 — Emerging", "Level 3 — Developing", "Level 4 — Advanced"];
const LEVEL_COLORS = ["#d1d5db", "#ef4444", "#f97316", "#eab308", "#22c55e"];
const PRIORITY_LABELS = ["Low", "Medium", "High", "Critical"];

function LevelBadge({ level }) {
  if (!level) return <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>;
  return (
    <span style={{
      background: LEVEL_COLORS[level],
      color: level === 3 ? "#000" : level === 4 ? "#000" : "#fff",
      borderRadius: 4,
      padding: "2px 8px",
      fontSize: 12,
      fontWeight: 700,
      fontFamily: "'DM Mono', monospace",
    }}>L{level}</span>
  );
}

function RadarChart({ scores }) {
  const size = 220;
  const cx = size / 2, cy = size / 2, r = 85;
  const n = CAPABILITIES.length;
  const levels = [1, 2, 3, 4];

  const getPoint = (i, val, maxVal = 4) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const dist = (val / maxVal) * r;
    return [cx + dist * Math.cos(angle), cy + dist * Math.sin(angle)];
  };

  const dataPoints = CAPABILITIES.map((cap, i) => {
    const subs = cap.subcapabilities;
    const rated = subs.filter(s => scores[s.id]);
    const avg = rated.length ? rated.reduce((a, s) => a + (scores[s.id] || 0), 0) / rated.length : 0;
    return getPoint(i, avg);
  });

  const polyPoints = dataPoints.map(p => p.join(",")).join(" ");

  return (
    <svg width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
      {levels.map(lvl => {
        const pts = CAPABILITIES.map((_, i) => getPoint(i, lvl).join(",")).join(" ");
        return <polygon key={lvl} points={pts} fill="none" stroke={lvl === 4 ? "#374151" : "#1f2937"} strokeWidth={lvl === 4 ? 1 : 0.5} />;
      })}
      {CAPABILITIES.map((_, i) => {
        const [x, y] = getPoint(i, 4);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#1f2937" strokeWidth={0.5} />;
      })}
      <polygon points={polyPoints} fill="rgba(99,202,183,0.25)" stroke="#63cab7" strokeWidth={2} />
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill="#63cab7" />
      ))}
      {CAPABILITIES.map((cap, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const dist = r + 18;
        const x = cx + dist * Math.cos(angle);
        const y = cy + dist * Math.sin(angle);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize={8} fill="#9ca3af" fontFamily="'DM Mono', monospace">
            {cap.id}
          </text>
        );
      })}
    </svg>
  );
}

export default function ODTool() {
  const [orgName, setOrgName] = useState("");
  const [assessorName, setAssessorName] = useState("");
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [scores, setScores] = useState({});
  const [targets, setTargets] = useState({});
  const [notes, setNotes] = useState({});
  const [priorities, setPriorities] = useState({});
  const [actionPlans, setActionPlans] = useState({});
  const [view, setView] = useState("setup"); // setup | assess | plan | report
  const [activeCapability, setActiveCapability] = useState(null);
  const [filterDEI, setFilterDEI] = useState(false);
  const [filterPriority, setFilterPriority] = useState(null);

  const setScore = useCallback((subId, val) => setScores(s => ({ ...s, [subId]: val })), []);
  const setTarget = useCallback((subId, val) => setTargets(t => ({ ...t, [subId]: val })), []);
  const setNote = useCallback((subId, val) => setNotes(n => ({ ...n, [subId]: val })), []);
  const setPriority = useCallback((subId, val) => setPriorities(p => ({ ...p, [subId]: val })), []);
  const setActionPlan = useCallback((subId, val) => setActionPlans(a => ({ ...a, [subId]: val })), []);

  const getCapabilityAvg = (cap) => {
    const subs = cap.subcapabilities;
    const rated = subs.filter(s => scores[s.id]);
    return rated.length ? (rated.reduce((a, s) => a + scores[s.id], 0) / rated.length).toFixed(1) : null;
  };

  const totalAssessed = Object.keys(scores).length;
  const allSubs = CAPABILITIES.flatMap(c => c.subcapabilities);
  const totalSubs = allSubs.length;
  const criticalCount = allSubs.filter(s => priorities[s.id] === "Critical").length;
  const highCount = allSubs.filter(s => priorities[s.id] === "High").length;

  const navItems = [
    { id: "setup", label: "01 Setup", desc: "Organisation details" },
    { id: "assess", label: "02 Assess", desc: "Rate capabilities" },
    { id: "plan", label: "03 Plan", desc: "Set targets & actions" },
    { id: "report", label: "04 Report", desc: "Summary & export" },
  ];

  const styles = {
    app: {
      minHeight: "100vh",
      background: "#0a0f1a",
      color: "#e2e8f0",
      fontFamily: "'Georgia', serif",
      display: "flex",
    },
    sidebar: {
      width: 220,
      background: "#060c18",
      borderRight: "1px solid #1e2d45",
      display: "flex",
      flexDirection: "column",
      padding: "32px 0",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      height: "100vh",
      overflowY: "auto",
    },
    logo: {
      padding: "0 24px 32px",
      borderBottom: "1px solid #1e2d45",
      marginBottom: 24,
    },
    logoTitle: {
      fontSize: 11,
      fontFamily: "'DM Mono', monospace",
      letterSpacing: "0.2em",
      color: "#63cab7",
      textTransform: "uppercase",
      marginBottom: 4,
    },
    logoSub: { fontSize: 18, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2 },
    navItem: (active) => ({
      padding: "14px 24px",
      cursor: "pointer",
      background: active ? "#0f1f3d" : "transparent",
      borderLeft: active ? "3px solid #63cab7" : "3px solid transparent",
      transition: "all 0.15s",
    }),
    navLabel: (active) => ({
      fontSize: 11,
      fontFamily: "'DM Mono', monospace",
      letterSpacing: "0.12em",
      color: active ? "#63cab7" : "#64748b",
      fontWeight: 700,
    }),
    navDesc: { fontSize: 12, color: "#475569", marginTop: 2 },
    main: { flex: 1, overflowY: "auto", padding: "40px 48px" },
    pageTitle: {
      fontSize: 28,
      fontWeight: 700,
      color: "#f1f5f9",
      marginBottom: 6,
    },
    pageSub: { color: "#64748b", fontSize: 14, marginBottom: 40, fontFamily: "'DM Mono', monospace" },
    card: {
      background: "#0d1b2e",
      border: "1px solid #1e2d45",
      borderRadius: 12,
      padding: 28,
      marginBottom: 20,
    },
    label: {
      fontSize: 11,
      fontFamily: "'DM Mono', monospace",
      letterSpacing: "0.1em",
      color: "#64748b",
      textTransform: "uppercase",
      marginBottom: 8,
      display: "block",
    },
    input: {
      width: "100%",
      background: "#060c18",
      border: "1px solid #1e2d45",
      borderRadius: 8,
      padding: "10px 14px",
      color: "#e2e8f0",
      fontSize: 14,
      fontFamily: "Georgia, serif",
      outline: "none",
      boxSizing: "border-box",
    },
    capCard: (active, color) => ({
      background: active ? "#0f1f3d" : "#0d1b2e",
      border: `1px solid ${active ? color : "#1e2d45"}`,
      borderRadius: 10,
      padding: "16px 20px",
      cursor: "pointer",
      transition: "all 0.15s",
      marginBottom: 8,
      display: "flex",
      alignItems: "center",
      gap: 14,
    }),
    levelBtn: (selected, lvl) => ({
      width: 40,
      height: 40,
      borderRadius: 8,
      border: `2px solid ${selected ? LEVEL_COLORS[lvl] : "#1e2d45"}`,
      background: selected ? LEVEL_COLORS[lvl] + "22" : "transparent",
      color: selected ? LEVEL_COLORS[lvl] : "#475569",
      fontWeight: 700,
      fontSize: 14,
      cursor: "pointer",
      fontFamily: "'DM Mono', monospace",
      transition: "all 0.1s",
    }),
    btn: (variant = "primary") => ({
      padding: "10px 24px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontFamily: "'DM Mono', monospace",
      fontSize: 12,
      letterSpacing: "0.1em",
      fontWeight: 700,
      background: variant === "primary" ? "#63cab7" : variant === "danger" ? "#ef4444" : "#1e2d45",
      color: variant === "primary" ? "#0a0f1a" : variant === "danger" ? "#fff" : "#94a3b8",
      transition: "all 0.15s",
    }),
    progressBar: (pct, color = "#63cab7") => ({
      height: 6,
      borderRadius: 3,
      background: `linear-gradient(90deg, ${color} ${pct}%, #1e2d45 ${pct}%)`,
    }),
    statCard: {
      background: "#060c18",
      border: "1px solid #1e2d45",
      borderRadius: 10,
      padding: "20px 24px",
      flex: 1,
    },
    statNum: { fontSize: 36, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#63cab7" },
    statLabel: { fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginTop: 4 },
    tag: (color) => ({
      display: "inline-block",
      background: color + "22",
      border: `1px solid ${color}44`,
      color: color,
      borderRadius: 4,
      padding: "2px 8px",
      fontSize: 10,
      fontFamily: "'DM Mono', monospace",
      fontWeight: 700,
      letterSpacing: "0.08em",
    }),
    textarea: {
      width: "100%",
      background: "#060c18",
      border: "1px solid #1e2d45",
      borderRadius: 8,
      padding: "10px 14px",
      color: "#e2e8f0",
      fontSize: 13,
      fontFamily: "Georgia, serif",
      outline: "none",
      resize: "vertical",
      minHeight: 72,
      boxSizing: "border-box",
    },
    select: {
      background: "#060c18",
      border: "1px solid #1e2d45",
      borderRadius: 8,
      padding: "8px 14px",
      color: "#e2e8f0",
      fontSize: 13,
      fontFamily: "'DM Mono', monospace",
      outline: "none",
      cursor: "pointer",
    },
    divider: { borderTop: "1px solid #1e2d45", margin: "24px 0" },
    row: { display: "flex", gap: 12, flexWrap: "wrap" },
    subRow: {
      background: "#060c18",
      border: "1px solid #1e2d45",
      borderRadius: 10,
      padding: "16px 20px",
      marginBottom: 10,
    },
    priorityBtn: (selected, p) => {
      const colors = { Low: "#64748b", Medium: "#3b82f6", High: "#f97316", Critical: "#ef4444" };
      const c = colors[p];
      return {
        padding: "6px 14px",
        borderRadius: 6,
        border: `1.5px solid ${selected ? c : "#1e2d45"}`,
        background: selected ? c + "22" : "transparent",
        color: selected ? c : "#475569",
        fontSize: 11,
        fontFamily: "'DM Mono', monospace",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.1s",
      };
    },
  };

  // === SETUP PAGE ===
  const SetupPage = () => (
    <div>
      <div style={styles.pageTitle}>Organisation Setup</div>
      <div style={styles.pageSub}>Begin by entering the details of your partner NGO</div>

      <div style={{ ...styles.card, maxWidth: 560 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={styles.label}>Organisation Name</label>
          <input style={styles.input} value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. Praja Foundation" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={styles.label}>Lead Assessor</label>
          <input style={styles.input} value={assessorName} onChange={e => setAssessorName(e.target.value)} placeholder="e.g. Anita Sharma" />
        </div>
        <div>
          <label style={styles.label}>Assessment Date</label>
          <input type="date" style={styles.input} value={assessmentDate} onChange={e => setAssessmentDate(e.target.value)} />
        </div>
      </div>

      <div style={{ ...styles.card, maxWidth: 560, background: "#060c18", border: "1px solid #63cab733" }}>
        <div style={{ ...styles.tag("#63cab7"), marginBottom: 14 }}>ABOUT THIS TOOL</div>
        <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7 }}>
          This tool is based on the <strong style={{ color: "#e2e8f0" }}>Bridgespan Group's OD Assessment Guide</strong> — 13 capabilities, each broken into sub-capabilities rated from <strong style={{ color: "#ef4444" }}>Level 1</strong> (Nascent) to <strong style={{ color: "#22c55e" }}>Level 4</strong> (Advanced).
        </div>
        <div style={styles.divider} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["13 Capabilities", "Covering all org functions"], ["DEI Embedded", "Across 7 capabilities"], ["4-Level Scale", "Honest self-assessment"], ["Action Planning", "Per sub-capability"]].map(([t, d]) => (
            <div key={t}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#63cab7", fontFamily: "'DM Mono', monospace" }}>{t}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <button style={styles.btn("primary")} onClick={() => setView("assess")}>
        BEGIN ASSESSMENT →
      </button>
    </div>
  );

  // === ASSESS PAGE ===
  const AssessPage = () => {
    const cap = activeCapability !== null ? CAPABILITIES[activeCapability] : null;

    const filteredCaps = CAPABILITIES.filter(c => {
      if (filterDEI) return c.subcapabilities.some(s => s.dei);
      return true;
    });

    return (
      <div>
        <div style={styles.pageTitle}>Capability Assessment</div>
        <div style={styles.pageSub}>Rate each sub-capability from Level 1–4 · {totalAssessed}/{totalSubs} assessed</div>

        <div style={{ ...styles.progressBar((totalAssessed / totalSubs) * 100), marginBottom: 32 }} />

        <div style={styles.row}>
          {/* Capability list */}
          <div style={{ width: 260, flexShrink: 0 }}>
            <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => setFilterDEI(!filterDEI)}
                style={{ ...styles.btn(filterDEI ? "primary" : "secondary"), fontSize: 11, padding: "6px 14px" }}
              >
                {filterDEI ? "✓ DEI ONLY" : "DEI FILTER"}
              </button>
            </div>
            {filteredCaps.map((cap, i) => {
              const realIdx = CAPABILITIES.findIndex(c => c.id === cap.id);
              const avg = getCapabilityAvg(cap);
              const pct = avg ? (parseFloat(avg) / 4) * 100 : 0;
              return (
                <div key={cap.id} style={styles.capCard(activeCapability === realIdx, cap.color)}
                  onClick={() => setActiveCapability(realIdx)}>
                  <span style={{ fontSize: 16, color: cap.color }}>{cap.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>{cap.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {avg ? (
                        <>
                          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#1e2d45", overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: LEVEL_COLORS[Math.round(parseFloat(avg))], borderRadius: 2, transition: "width 0.3s" }} />
                          </div>
                          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: LEVEL_COLORS[Math.round(parseFloat(avg))] }}>{avg}</span>
                        </>
                      ) : (
                        <span style={{ fontSize: 10, color: "#374151", fontFamily: "'DM Mono', monospace" }}>not assessed</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sub-capability rating panel */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {cap === null ? (
              <div style={{ ...styles.card, textAlign: "center", padding: "60px 40px" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>◎</div>
                <div style={{ color: "#64748b", fontSize: 15 }}>Select a capability from the left to begin rating</div>
              </div>
            ) : (
              <div>
                <div style={{ ...styles.card, marginBottom: 16, borderColor: cap.color + "44" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                    <span style={{ fontSize: 22, color: cap.color }}>{cap.icon}</span>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>{cap.name}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>
                    {cap.subcapabilities.length} sub-capabilities · {cap.subcapabilities.filter(s => scores[s.id]).length} rated
                  </div>
                </div>

                {cap.subcapabilities.map(sub => (
                  <div key={sub.id} style={styles.subRow}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#cbd5e1", marginBottom: 4 }}>{sub.name}</div>
                        {sub.dei && <span style={styles.tag("#22c55e")}>DEI</span>}
                      </div>
                      <LevelBadge level={scores[sub.id]} />
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <div style={{ ...styles.label, marginBottom: 10 }}>Current Level</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[1, 2, 3, 4].map(lvl => (
                          <button key={lvl} style={styles.levelBtn(scores[sub.id] === lvl, lvl)}
                            onClick={() => setScore(sub.id, scores[sub.id] === lvl ? null : lvl)}>
                            L{lvl}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                        {[1, 2, 3, 4].map(lvl => (
                          <div key={lvl} style={{ fontSize: 10, color: "#475569", fontFamily: "'DM Mono', monospace", width: 40, textAlign: "center" }}>
                            {["Nascent", "Emerging", "Developing", "Advanced"][lvl - 1]}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={styles.label}>Assessment Notes</label>
                      <textarea
                        style={styles.textarea}
                        placeholder="Add context, evidence, or observations..."
                        value={notes[sub.id] || ""}
                        onChange={e => setNote(sub.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <button style={styles.btn("secondary")} onClick={() => setView("setup")}>← BACK</button>
          <button style={styles.btn("primary")} onClick={() => setView("plan")}>PROCEED TO ACTION PLAN →</button>
        </div>
      </div>
    );
  };

  // === PLAN PAGE ===
  const PlanPage = () => {
    const [planCap, setPlanCap] = useState(null);
    const cap = planCap !== null ? CAPABILITIES[planCap] : null;

    const subsWithGaps = CAPABILITIES.flatMap((c, ci) =>
      c.subcapabilities
        .filter(s => scores[s.id] && scores[s.id] < 4)
        .map(s => ({ ...s, capName: c.name, capColor: c.color, capIcon: c.icon, capIdx: ci, gap: 4 - scores[s.id] }))
    ).sort((a, b) => b.gap - a.gap);

    return (
      <div>
        <div style={styles.pageTitle}>Action Planning</div>
        <div style={styles.pageSub}>Set improvement targets and define actions for each sub-capability</div>

        <div style={styles.row}>
          {/* Gap list */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <div style={{ ...styles.label, marginBottom: 12 }}>CAPABILITIES ({CAPABILITIES.length})</div>
            {CAPABILITIES.map((c, ci) => {
              const rated = c.subcapabilities.filter(s => scores[s.id]);
              const withPlan = c.subcapabilities.filter(s => actionPlans[s.id] && actionPlans[s.id].trim()).length;
              return (
                <div key={c.id} style={styles.capCard(planCap === ci, c.color)} onClick={() => setPlanCap(ci)}>
                  <span style={{ fontSize: 16, color: c.color }}>{c.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 600, lineHeight: 1.3, marginBottom: 3 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>
                      {withPlan}/{c.subcapabilities.length} planned
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Planning panel */}
          <div style={{ flex: 1 }}>
            {!cap ? (
              <div style={{ ...styles.card, textAlign: "center", padding: "60px 40px" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>◆</div>
                <div style={{ color: "#64748b", fontSize: 15 }}>Select a capability to set targets and actions</div>

                {subsWithGaps.length > 0 && (
                  <div style={{ marginTop: 32, textAlign: "left" }}>
                    <div style={{ ...styles.label, marginBottom: 16 }}>TOP GAPS TO ADDRESS</div>
                    {subsWithGaps.slice(0, 5).map(s => (
                      <div key={s.id} style={{ ...styles.subRow, marginBottom: 8, cursor: "pointer" }}
                        onClick={() => setPlanCap(s.capIdx)}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ color: s.capColor, marginRight: 8 }}>{s.capIcon}</span>
                            <span style={{ fontSize: 13, color: "#cbd5e1" }}>{s.name}</span>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <LevelBadge level={scores[s.id]} />
                            <span style={{ fontSize: 11, color: "#ef4444", fontFamily: "'DM Mono', monospace" }}>gap: {s.gap}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ ...styles.card, borderColor: cap.color + "44", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 22, color: cap.color }}>{cap.icon}</span>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{cap.name}</div>
                  </div>
                </div>

                {cap.subcapabilities.map(sub => {
                  const currentLevel = scores[sub.id];
                  const targetLevel = targets[sub.id];
                  const priority = priorities[sub.id];
                  const plan = actionPlans[sub.id];

                  return (
                    <div key={sub.id} style={{ ...styles.subRow, marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#cbd5e1" }}>{sub.name}</div>
                          {sub.dei && <span style={{ ...styles.tag("#22c55e"), marginTop: 4 }}>DEI</span>}
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {currentLevel && <><LevelBadge level={currentLevel} /><span style={{ color: "#475569" }}>→</span></>}
                          <LevelBadge level={targetLevel} />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 24, marginBottom: 12, flexWrap: "wrap" }}>
                        <div>
                          <div style={styles.label}>Current Level</div>
                          <div style={{ display: "flex", gap: 6 }}>
                            {[1, 2, 3, 4].map(l => (
                              <button key={l} style={{ ...styles.levelBtn(currentLevel === l, l), width: 34, height: 34, fontSize: 12 }}
                                onClick={() => setScore(sub.id, currentLevel === l ? null : l)}>L{l}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div style={styles.label}>Target Level</div>
                          <div style={{ display: "flex", gap: 6 }}>
                            {[1, 2, 3, 4].map(l => (
                              <button key={l} style={{ ...styles.levelBtn(targetLevel === l, l), width: 34, height: 34, fontSize: 12 }}
                                onClick={() => setTarget(sub.id, targetLevel === l ? null : l)}>L{l}</button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <div style={styles.label}>Priority</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {PRIORITY_LABELS.map(p => (
                            <button key={p} style={styles.priorityBtn(priority === p, p)}
                              onClick={() => setPriority(sub.id, priority === p ? null : p)}>{p}</button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={styles.label}>Action Plan</label>
                        <textarea
                          style={styles.textarea}
                          placeholder="Key activities, responsible person, timeline, resources needed..."
                          value={plan || ""}
                          onChange={e => setActionPlan(sub.id, e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <button style={styles.btn("secondary")} onClick={() => setView("assess")}>← BACK</button>
          <button style={styles.btn("primary")} onClick={() => setView("report")}>VIEW REPORT →</button>
        </div>
      </div>
    );
  };

  // === REPORT PAGE ===
  const ReportPage = () => {
    const capSummaries = CAPABILITIES.map(cap => {
      const avg = getCapabilityAvg(cap);
      const prioritySubs = cap.subcapabilities.filter(s => priorities[s.id] === "Critical" || priorities[s.id] === "High");
      return { ...cap, avg, prioritySubs };
    });

    const overallAvg = (() => {
      const allRated = CAPABILITIES.flatMap(c => c.subcapabilities.filter(s => scores[s.id]).map(s => scores[s.id]));
      return allRated.length ? (allRated.reduce((a, b) => a + b, 0) / allRated.length).toFixed(2) : null;
    })();

    const actionItems = CAPABILITIES.flatMap(c =>
      c.subcapabilities.filter(s => actionPlans[s.id] && actionPlans[s.id].trim()).map(s => ({
        ...s, capName: c.name, capColor: c.color, capIcon: c.icon,
        current: scores[s.id], target: targets[s.id], priority: priorities[s.id], action: actionPlans[s.id]
      }))
    ).sort((a, b) => {
      const po = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return (po[a.priority] ?? 4) - (po[b.priority] ?? 4);
    });

    const handlePrint = () => window.print();

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <div style={styles.pageTitle}>OD Assessment Report</div>
            <div style={styles.pageSub}>{orgName || "Organisation"} · {assessmentDate}</div>
          </div>
          <button style={styles.btn("primary")} onClick={handlePrint}>⬇ PRINT / EXPORT</button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { num: overallAvg || "—", label: "OVERALL AVG LEVEL" },
            { num: `${totalAssessed}/${totalSubs}`, label: "SUB-CAPS RATED" },
            { num: criticalCount, label: "CRITICAL PRIORITIES" },
            { num: actionItems.length, label: "ACTION ITEMS" },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <div style={styles.statNum}>{s.num}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Radar + top findings */}
        <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ ...styles.card, flex: "0 0 280px" }}>
            <div style={styles.label}>CAPABILITY RADAR</div>
            <RadarChart scores={scores} />
            <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CAPABILITIES.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>
                  <span style={{ color: c.color }}>{c.icon}</span>{c.id}. {c.name.split(" ")[0]}
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={styles.card}>
              <div style={{ ...styles.label, marginBottom: 16 }}>CAPABILITY SCORES</div>
              {capSummaries.map(cap => (
                <div key={cap.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: cap.color, fontSize: 14 }}>{cap.icon}</span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{cap.name}</span>
                    </div>
                    {cap.avg ? (
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: LEVEL_COLORS[Math.round(parseFloat(cap.avg))] }}>
                        {cap.avg}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: "#374151" }}>—</span>
                    )}
                  </div>
                  {cap.avg && (
                    <div style={{ height: 5, borderRadius: 3, background: "#1e2d45", overflow: "hidden" }}>
                      <div style={{ width: `${(parseFloat(cap.avg) / 4) * 100}%`, height: "100%", background: LEVEL_COLORS[Math.round(parseFloat(cap.avg))], borderRadius: 3, transition: "width 0.5s" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Plan Table */}
        {actionItems.length > 0 && (
          <div style={styles.card}>
            <div style={{ ...styles.label, marginBottom: 20 }}>CONSOLIDATED ACTION PLAN ({actionItems.length} items)</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #1e2d45" }}>
                    {["Capability", "Sub-Capability", "Current", "Target", "Priority", "Action Plan"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", color: "#64748b", fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {actionItems.map((item, i) => {
                    const prColors = { Critical: "#ef4444", High: "#f97316", Medium: "#3b82f6", Low: "#64748b" };
                    return (
                      <tr key={item.id} style={{ borderBottom: "1px solid #1e2d45", background: i % 2 === 0 ? "#060c1822" : "transparent" }}>
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                          <span style={{ color: item.capColor }}>{item.capIcon}</span>
                          <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6 }}>{item.capName.split(" ")[0]}</span>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#cbd5e1", fontWeight: 600 }}>
                          {item.name}
                          {item.dei && <span style={{ ...styles.tag("#22c55e"), marginLeft: 6 }}>DEI</span>}
                        </td>
                        <td style={{ padding: "10px 12px" }}><LevelBadge level={item.current} /></td>
                        <td style={{ padding: "10px 12px" }}><LevelBadge level={item.target} /></td>
                        <td style={{ padding: "10px 12px" }}>
                          {item.priority && (
                            <span style={{ color: prColors[item.priority], fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700 }}>
                              {item.priority}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#94a3b8", fontSize: 12, maxWidth: 280 }}>{item.action}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notes summary */}
        {Object.keys(notes).some(k => notes[k]) && (
          <div style={{ ...styles.card, marginTop: 20 }}>
            <div style={{ ...styles.label, marginBottom: 16 }}>ASSESSMENT NOTES</div>
            {CAPABILITIES.map(cap =>
              cap.subcapabilities.filter(s => notes[s.id]).map(sub => (
                <div key={sub.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #1e2d45" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ color: cap.color }}>{cap.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1" }}>{sub.name}</span>
                    <LevelBadge level={scores[sub.id]} />
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8", paddingLeft: 24 }}>{notes[sub.id]}</div>
                </div>
              ))
            )}
          </div>
        )}

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <button style={styles.btn("secondary")} onClick={() => setView("plan")}>← BACK TO PLAN</button>
          <button style={styles.btn("secondary")} onClick={() => setView("assess")}>← EDIT ASSESSMENT</button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.app}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoTitle}>Bridgespan OD</div>
          <div style={styles.logoSub}>NGO Development Planner</div>
        </div>

        {orgName && (
          <div style={{ padding: "0 24px 20px", borderBottom: "1px solid #1e2d45", marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 4 }}>CURRENT NGO</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{orgName}</div>
          </div>
        )}

        {navItems.map(item => (
          <div key={item.id} style={styles.navItem(view === item.id)} onClick={() => setView(item.id)}>
            <div style={styles.navLabel(view === item.id)}>{item.label}</div>
            <div style={styles.navDesc}>{item.desc}</div>
          </div>
        ))}

        <div style={{ marginTop: "auto", padding: "24px", borderTop: "1px solid #1e2d45" }}>
          <div style={{ fontSize: 10, color: "#374151", fontFamily: "'DM Mono', monospace", lineHeight: 1.6 }}>
            Based on Bridgespan Group's OD Assessment Framework · PWIT India Initiative
          </div>
        </div>
      </div>

      <div style={styles.main}>
        {view === "setup" && <SetupPage />}
        {view === "assess" && <AssessPage />}
        {view === "plan" && <PlanPage />}
        {view === "report" && <ReportPage />}
      </div>
    </div>
  );
}
