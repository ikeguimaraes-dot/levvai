import { useState, useEffect } from "react";
import { supabase } from './supabase';
import AppShell from './components/layout/AppShell';
import VisaoGeral from './components/dashboard/VisaoGeral';
import { ADMIN_MASTER_EMAILS } from '../shared/auth-config.js';

const authenticatedFetch = async (url, options = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Sessão expirada. Entre novamente.');

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.access_token}`,
    },
  });
};

const GOLD = "#C8A96E";
const DARK = "#1A1A1A";
const LIGHT = "#F5F0E8";
const BG = "#FAFAF8";

const tabGroups = [
  { sector: "ESTRATÉGIA", color: "#C8A96E", tabs: [
    { id: "home", label: "Visão Geral" },
    { id: "plan", label: "Planejamento" },
    { id: "executive", label: "Dashboard CEO" },
  ]},
  { sector: "CULTURA & GOVERNANÇA", color: "#5D4037", tabs: [
    { id: "cultura", label: "Cultura" },
    { id: "atas", label: "Atas & Ações" },
  ]},
  { sector: "FINANCEIRO", color: "#4CAF50", tabs: [
    { id: "finance", label: "DRE & Catálogo" },
    { id: "cashflow", label: "Fluxo de Caixa" },
    { id: "budget", label: "Orçamento" },
  ]},
  { sector: "COMERCIAL", color: "#2196F3", tabs: [
    { id: "crm", label: "CRM & Leads" },
    { id: "comunicacao", label: "Comunicação" },
    { id: "journey", label: "Jornada Paciente" },
    { id: "nps", label: "NPS & Satisfação" },
  ]},
  { sector: "MARKETING", color: "#E91E63", tabs: [
    { id: "brand", label: "Marca" },
    { id: "icp", label: "ICP" },
    { id: "editorial", label: "Editorial" },
    { id: "marketing", label: "Dashboard Mkt" },
    { id: "competitors", label: "Concorrentes" },
  ]},
  { sector: "PESSOAS", color: "#9C27B0", tabs: [
    { id: "team", label: "Equipe" },
    { id: "associates", label: "Associados" },
    { id: "oneone", label: "1:1s" },
    { id: "avaliacao", label: "Avaliação" },
  ]},
  { sector: "OPERAÇÃO", color: "#FF9800", tabs: [
    { id: "agenda", label: "Agenda" },
    { id: "stock", label: "Estoque" },
    { id: "rituals", label: "Rotinas" },
    { id: "fornecedores", label: "Fornecedores" },
  ]},
  { sector: "JURÍDICO", color: "#607D8B", tabs: [
    { id: "compliance", label: "Compliance" },
    { id: "termos", label: "Termos Paciente" },
    { id: "contratos", label: "Contratos" },
  ]},
  { sector: "DOCS", color: "#795548", tabs: [
    { id: "docs", label: "Documentos" },
    { id: "usuarios", label: "Usuários" },
  ]},
];


const Card = ({ title, children, accent = false, className = "" }) => (
  <div className={className} style={{
    background: accent ? DARK : "white",
    borderRadius: 12,
    padding: "24px 28px",
    marginBottom: 16,
    border: accent ? "none" : "1px solid #E8E4DE",
    boxShadow: accent ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
  }}>
    {title && <div style={{
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: accent ? GOLD : GOLD,
      marginBottom: 14,
    }}>{title}</div>}
    <div style={{ color: accent ? "#E8E4DE" : "#333", fontSize: 14, lineHeight: 1.7 }}>
      {children}
    </div>
  </div>
);

const Metric = ({ label, value, sub, color = DARK }) => (
  <div style={{
    background: "white",
    borderRadius: 10,
    padding: "18px 20px",
    border: "1px solid #E8E4DE",
    flex: "1 1 140px",
    minWidth: 140,
  }}>
    <div style={{ fontSize: 11, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color, marginTop: 4, fontFamily: "'DM Serif Display', Georgia, serif" }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{sub}</div>}
  </div>
);

const Badge = ({ text, color = "#E8EAF6", textColor = "#333" }) => (
  <span style={{
    display: "inline-block",
    background: color,
    color: textColor,
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 4,
  }}>{text}</span>
);

const SplitRow = ({ label, assoc, levvai }) => (
  <div style={{ display: "flex", padding: "10px 0", borderBottom: "1px solid #f0ece6", alignItems: "center" }}>
    <div style={{ flex: 2, fontSize: 13, fontWeight: 500 }}>{label}</div>
    <div style={{ flex: 1, textAlign: "center" }}><Badge text={assoc} color="#F3E5F5" textColor="#6A1B9A" /></div>
    <div style={{ flex: 1, textAlign: "center" }}><Badge text={levvai} color="#E8F5E9" textColor="#2E7D32" /></div>
  </div>
);

const TableRow = ({ cells, header = false }) => (
  <div style={{
    display: "flex",
    borderBottom: header ? `2px solid ${GOLD}` : "1px solid #f0ece6",
    background: header ? DARK : "transparent",
  }}>
    {cells.map((c, i) => (
      <div key={i} style={{
        flex: typeof c === "object" ? c.flex || 1 : 1,
        padding: header ? "10px 12px" : "8px 12px",
        fontSize: header ? 11 : 13,
        fontWeight: header ? 700 : 400,
        color: header ? GOLD : "#444",
        letterSpacing: header ? "0.05em" : 0,
        textTransform: header ? "uppercase" : "none",
      }}>{typeof c === "object" ? c.text : c}</div>
    ))}
  </div>
);

const PersonCard = ({ name, role, color, kpis, responsibilities }) => (
  <div style={{
    background: "white", borderRadius: 12, overflow: "hidden",
    border: "1px solid #E8E4DE", marginBottom: 12,
  }}>
    <div style={{ background: color, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "white" }}>
        {name[0]}
      </div>
      <div>
        <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>{name}</div>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{role}</div>
      </div>
    </div>
    <div style={{ padding: "16px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Responsabilidades-chave</div>
      {responsibilities.map((r, i) => (
        <div key={i} style={{ fontSize: 12, color: "#555", padding: "3px 0", display: "flex", gap: 6 }}>
          <span style={{ color: GOLD }}>›</span> {r}
        </div>
      ))}
      {kpis && <>
        <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 12, marginBottom: 6 }}>KPIs</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {kpis.map((k, i) => <Badge key={i} text={k} color="#F5F0E8" textColor="#8B7355" />)}
        </div>
      </>}
    </div>
  </div>
);

// HOME TAB
// TREND CHART — SVG line chart with target
const TrendChart = ({ title, data, target, color = GOLD, unit = "", height = 120 }) => {
  const maxVal = Math.max(...data.map(d => d.value), target || 0) * 1.15;
  const minVal = 0;
  const w = 100;
  const h = 70;
  const padL = 0;
  const padR = 2;
  const padT = 5;
  const padB = 5;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const points = data.map((d, i) => ({
    x: padL + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padT + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH,
    ...d,
  }));

  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");
  const areaPath = `M${points[0].x},${h - padB} L${polyline} L${points[points.length - 1].x},${h - padB} Z`;
  const targetY = target ? padT + chartH - ((target - minVal) / (maxVal - minVal)) * chartH : null;
  const lastPoint = points[points.length - 1];
  const firstActual = points.filter(p => p.value > 0);
  const lastActual = firstActual.length > 0 ? firstActual[firstActual.length - 1] : null;

  return (
    <div style={{ background: "white", border: "1px solid #E8E4DE", borderRadius: 10, padding: "14px 16px", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: DARK }}>{title}</span>
        {lastActual && <span style={{ fontSize: 16, fontWeight: 800, color, fontFamily: "'DM Serif Display', Georgia, serif" }}>{lastActual.value.toLocaleString("pt-BR")}{unit}</span>}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${title.replace(/\s/g,"")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        {firstActual.length > 1 && (
          <path d={`M${firstActual[0].x},${h - padB} ${firstActual.map(p => `L${p.x},${p.y}`).join(" ")} L${firstActual[firstActual.length-1].x},${h - padB} Z`}
            fill={`url(#grad-${title.replace(/\s/g,"")})`} />
        )}
        {/* Target dashed line */}
        {targetY && (
          <>
            <line x1={padL} y1={targetY} x2={w - padR} y2={targetY} stroke="#ccc" strokeWidth="0.4" strokeDasharray="2,2" />
            <text x={w - padR - 1} y={targetY - 1.5} textAnchor="end" fontSize="3" fill="#bbb" fontFamily="sans-serif">Meta: {target.toLocaleString("pt-BR")}{unit}</text>
          </>
        )}
        {/* Actual line */}
        {firstActual.length > 1 && (
          <polyline points={firstActual.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {/* Projected line (dashed) */}
        {data.filter(d => d.projected).length > 0 && (
          <polyline points={points.filter((p, i) => data[i].projected || (i > 0 && data[i-1].projected === false && data[i].projected === undefined ? false : i === points.findIndex((_, j) => data[j].projected) - 1)).map(p => `${p.x},${p.y}`).join(" ")}
            fill="none" stroke={color} strokeWidth="0.6" strokeDasharray="2,1.5" opacity="0.5" />
        )}
        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            {p.value > 0 && <circle cx={p.x} cy={p.y} r="1.2" fill={data[i].projected ? "white" : color} stroke={color} strokeWidth="0.5" />}
            <text x={p.x} y={h - 1} textAnchor="middle" fontSize="3" fill="#bbb" fontFamily="sans-serif">{p.label}</text>
            {p.value > 0 && !data[i].projected && (
              <text x={p.x} y={p.y - 2.5} textAnchor="middle" fontSize="2.8" fill={color} fontWeight="bold" fontFamily="sans-serif">{p.value.toLocaleString("pt-BR")}{unit}</text>
            )}
          </g>
        ))}
        {/* Last actual dot highlight */}
        {lastActual && <circle cx={lastActual.x} cy={lastActual.y} r="2" fill={color} stroke="white" strokeWidth="0.5" />}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "#bbb" }}>
        <span>— Realizado</span>
        <span>- - Meta</span>
        {data.some(d => d.projected) && <span>· · · Projetado</span>}
      </div>
    </div>
  );
};

const MiniBar = ({ value, max, color = GOLD, label, sub }) => (
  <div style={{ flex: 1, minWidth: 60 }}>
    <div style={{ fontSize: 18, fontWeight: 800, color: DARK, fontFamily: "'DM Serif Display', Georgia, serif" }}>{label}</div>
    <div style={{ height: 6, background: "#E8E4DE", borderRadius: 3, marginTop: 4, overflow: "hidden" }}>
      <div style={{ height: 6, background: color, borderRadius: 3, width: `${Math.min(100, (value / max) * 100)}%`, transition: "width 0.5s" }} />
    </div>
    <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{sub}</div>
  </div>
);

const WeeklyTracker = () => {
  const [weeks, setWeeks] = useState([
    { week: "S1", date: "14-18/04", faturamento: 8500, pacientes: 5, seguidores: 286, posts: 20, leads: 8, nps: 0, ocupacao: 30 },
    { week: "S2", date: "21-25/04", faturamento: 0, pacientes: 0, seguidores: 0, posts: 0, leads: 0, nps: 0, ocupacao: 0 },
    { week: "S3", date: "28/04-02/05", faturamento: 0, pacientes: 0, seguidores: 0, posts: 0, leads: 0, nps: 0, ocupacao: 0 },
    { week: "S4", date: "05-09/05", faturamento: 0, pacientes: 0, seguidores: 0, posts: 0, leads: 0, nps: 0, ocupacao: 0 },
    { week: "S5", date: "12-16/05", faturamento: 0, pacientes: 0, seguidores: 0, posts: 0, leads: 0, nps: 0, ocupacao: 0 },
    { week: "S6", date: "19-23/05", faturamento: 0, pacientes: 0, seguidores: 0, posts: 0, leads: 0, nps: 0, ocupacao: 0 },
    { week: "S7", date: "26-30/05", faturamento: 0, pacientes: 0, seguidores: 0, posts: 0, leads: 0, nps: 0, ocupacao: 0 },
    { week: "S8", date: "02-06/06", faturamento: 0, pacientes: 0, seguidores: 0, posts: 0, leads: 0, nps: 0, ocupacao: 0 },
    { week: "S9", date: "09-13/06", faturamento: 0, pacientes: 0, seguidores: 0, posts: 0, leads: 0, nps: 0, ocupacao: 0 },
    { week: "S10", date: "16-20/06", faturamento: 0, pacientes: 0, seguidores: 0, posts: 0, leads: 0, nps: 0, ocupacao: 0 },
    { week: "S11", date: "23-27/06", faturamento: 0, pacientes: 0, seguidores: 0, posts: 0, leads: 0, nps: 0, ocupacao: 0 },
    { week: "S12", date: "30/06", faturamento: 0, pacientes: 0, seguidores: 0, posts: 0, leads: 0, nps: 0, ocupacao: 0 },
  ]);
  const [editingWeek, setEditingWeek] = useState(null);

  const targets = { faturamento: 60000, pacientes: 30, seguidores: 1000, posts: 70, leads: 50, nps: 85, ocupacao: 60 };
  const labels = { faturamento: "Faturamento", pacientes: "Pacientes", seguidores: "Seguidores IG", posts: "Posts", leads: "Leads", nps: "NPS", ocupacao: "Ocupação %" };
  const colors = { faturamento: GOLD, pacientes: "#4CAF50", seguidores: "#E91E63", posts: "#2196F3", leads: "#FF9800", nps: "#9C27B0", ocupacao: "#009688" };
  const formats = { faturamento: v => `R$${(v/1000).toFixed(0)}K`, pacientes: v => v, seguidores: v => v.toLocaleString("pt-BR"), posts: v => v, leads: v => v, nps: v => v || "—", ocupacao: v => `${v}%` };

  const updateWeek = (idx, field, val) => {
    setWeeks(weeks.map((w, i) => i === idx ? { ...w, [field]: Number(val) || 0 } : w));
  };

  const filledWeeks = weeks.filter(w => w.faturamento > 0 || w.pacientes > 0 || w.seguidores > 0);
  const metrics = ["faturamento", "pacientes", "seguidores", "posts"];

  return (
    <div>
      {/* SPARKLINE CHARTS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {metrics.map(metric => {
          const maxVal = Math.max(targets[metric], ...weeks.map(w => w[metric]));
          const data = weeks.map(w => w[metric]);
          const current = filledWeeks.length > 0 ? filledWeeks[filledWeeks.length - 1][metric] : 0;
          const pct = Math.round((current / targets[metric]) * 100);

          return (
            <div key={metric} style={{ background: "white", border: "1px solid #E8E4DE", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: colors[metric], letterSpacing: "0.05em" }}>{labels[metric].toUpperCase()}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: DARK, fontFamily: "'DM Serif Display', Georgia, serif" }}>{formats[metric](current)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#999" }}>Meta Q2</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#888" }}>{formats[metric](targets[metric])}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: pct >= 80 ? "#2E7D32" : pct >= 40 ? GOLD : "#E65100" }}>{pct}%</div>
                </div>
              </div>
              {/* MINI BAR CHART */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 50 }}>
                {data.map((v, i) => (
                  <div key={i} style={{
                    flex: 1,
                    background: v > 0 ? colors[metric] : "#f0ece6",
                    height: v > 0 ? `${Math.max(4, (v / maxVal) * 100)}%` : 4,
                    borderRadius: "2px 2px 0 0",
                    opacity: v > 0 ? 1 : 0.3,
                    transition: "height 0.3s",
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 8, color: "#ccc" }}>
                <span>S1</span><span>S4</span><span>S8</span><span>S12</span>
              </div>
              {/* PROGRESS BAR */}
              <div style={{ height: 4, background: "#f0ece6", borderRadius: 2, marginTop: 6 }}>
                <div style={{ height: 4, background: colors[metric], borderRadius: 2, width: `${Math.min(100, pct)}%`, transition: "width 0.5s" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* TABELA EDITÁVEL */}
      <Card title="Dados Semanais — Clique pra editar">
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 700 }}>
            {/* HEADER */}
            <div style={{ display: "flex", background: DARK, borderRadius: "8px 8px 0 0", padding: "8px 0" }}>
              <div style={{ width: 80, textAlign: "center", fontSize: 9, fontWeight: 700, color: GOLD }}>SEMANA</div>
              {Object.keys(labels).map(k => (
                <div key={k} style={{ flex: 1, textAlign: "center", fontSize: 8, fontWeight: 700, color: colors[k], letterSpacing: "0.03em" }}>{labels[k].toUpperCase()}</div>
              ))}
              <div style={{ width: 40 }} />
            </div>
            {/* ROWS */}
            {weeks.map((w, wi) => {
              const isEditing = editingWeek === wi;
              const isEmpty = !w.faturamento && !w.pacientes && !w.seguidores;
              return (
                <div key={wi} style={{
                  display: "flex", alignItems: "center", padding: "4px 0",
                  borderBottom: "1px solid #f0ece6",
                  background: isEditing ? "#FFF9E6" : isEmpty ? "#FAFAF8" : "white",
                  opacity: isEmpty && !isEditing ? 0.5 : 1,
                }}>
                  <div style={{ width: 80, textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: DARK }}>{w.week}</div>
                    <div style={{ fontSize: 8, color: "#bbb" }}>{w.date}</div>
                  </div>
                  {Object.keys(labels).map(k => (
                    <div key={k} style={{ flex: 1, textAlign: "center" }}>
                      {isEditing ? (
                        <input type="number" value={w[k] || ""} onChange={e => updateWeek(wi, k, e.target.value)}
                          style={{ width: "90%", padding: "4px", border: "1px solid #ddd", borderRadius: 4, fontSize: 11, textAlign: "center", fontFamily: "inherit", boxSizing: "border-box" }} />
                      ) : (
                        <span style={{ fontSize: 12, color: w[k] > 0 ? DARK : "#ddd", fontWeight: w[k] > 0 ? 600 : 400 }}>
                          {w[k] > 0 ? (k === "faturamento" ? `${(w[k]/1000).toFixed(1)}K` : k === "ocupacao" ? `${w[k]}%` : w[k]) : "—"}
                        </span>
                      )}
                    </div>
                  ))}
                  <div style={{ width: 40, textAlign: "center" }}>
                    <button onClick={() => setEditingWeek(isEditing ? null : wi)} style={{
                      background: "none", border: "none", cursor: "pointer", fontSize: 12,
                      color: isEditing ? "#2E7D32" : "#ccc", fontFamily: "inherit",
                    }}>{isEditing ? "✓" : "✎"}</button>
                  </div>
                </div>
              );
            })}
            {/* TARGETS ROW */}
            <div style={{ display: "flex", alignItems: "center", padding: "6px 0", background: LIGHT, borderRadius: "0 0 8px 8px" }}>
              <div style={{ width: 80, textAlign: "center", fontSize: 10, fontWeight: 700, color: GOLD }}>META Q2</div>
              {Object.keys(labels).map(k => (
                <div key={k} style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: 700, color: GOLD }}>
                  {k === "faturamento" ? "R$60K" : k === "ocupacao" ? "60%" : k === "nps" ? "85+" : targets[k]}
                </div>
              ))}
              <div style={{ width: 40 }} />
            </div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#999", marginTop: 8 }}>
          Clique no ✎ pra editar uma semana. Sylmara preenche toda segunda. Gráficos acima atualizam automaticamente.
        </div>
      </Card>

      {/* COMPARATIVO MENSAL */}
      <Card title="Evolução Mensal — Visão Macro">
        {[
          { mes: "Abril/26", fat: 35000, pac: 20, seg: 286, posts: 20, fase: "FUNDAÇÃO", color: "#E8EAF6" },
          { mes: "Maio/26", fat: 0, pac: 0, seg: 0, posts: 0, fase: "TRAÇÃO", color: "#E0F2F1" },
          { mes: "Junho/26", fat: 0, pac: 0, seg: 0, posts: 0, fase: "ACELERAÇÃO", color: "#E8F5E9" },
        ].map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < 2 ? "1px solid #f0ece6" : "none", alignItems: "center" }}>
            <div style={{ minWidth: 100 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{m.mes}</div>
              <Badge text={m.fase} color={m.color} textColor="#333" />
            </div>
            <div style={{ flex: 1, display: "flex", gap: 8 }}>
              {[
                { label: "Faturamento", val: m.fat, max: 60000, color: GOLD, fmt: v => `R$${(v/1000).toFixed(0)}K` },
                { label: "Pacientes", val: m.pac, max: 30, color: "#4CAF50", fmt: v => v },
                { label: "Seguidores", val: m.seg, max: 1000, color: "#E91E63", fmt: v => v },
                { label: "Posts", val: m.posts, max: 70, color: "#2196F3", fmt: v => v },
              ].map((metric, j) => (
                <div key={j} style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 9, color: "#999" }}>{metric.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: metric.val > 0 ? DARK : "#ddd" }}>{metric.val > 0 ? metric.fmt(metric.val) : "—"}</span>
                  </div>
                  <div style={{ height: 6, background: "#f0ece6", borderRadius: 3, marginTop: 2 }}>
                    <div style={{ height: 6, background: metric.val > 0 ? metric.color : "transparent", borderRadius: 3, width: `${Math.min(100, (metric.val / metric.max) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

const HomeTab = ({ shared }) => {
  const leads = shared.leads;
  const totalLeads = leads.length;
  const converted = leads.filter(l => ["atendido","retorno","fidelizado"].includes(l.status)).length;
  const convRate = totalLeads > 0 ? Math.round(converted / totalLeads * 100) : 0;
  const fidelizados = leads.filter(l => l.status === "fidelizado").length;

  const funnelStages = [
    { label: "Novos", count: leads.filter(l => l.status === "novo").length, color: "#1565C0" },
    { label: "Contato", count: leads.filter(l => l.status === "contato").length, color: "#283593" },
    { label: "Agendado", count: leads.filter(l => l.status === "agendado").length, color: "#E65100" },
    { label: "Atendido", count: leads.filter(l => l.status === "atendido").length, color: "#2E7D32" },
    { label: "Retorno", count: leads.filter(l => l.status === "retorno").length, color: "#6A1B9A" },
    { label: "VIP", count: fidelizados, color: GOLD },
    { label: "Perdido", count: leads.filter(l => l.status === "perdido").length, color: "#B71C1C" },
  ];
  const maxFunnel = Math.max(...funnelStages.map(s => s.count), 1);

  const monthlyTargets = [
    { month: "Abr", target: 30, current: 20, color: "#E8EAF6" },
    { month: "Mai", target: 45, current: 0, color: "#E0F2F1" },
    { month: "Jun", target: 60, current: 0, color: "#E8F5E9" },
  ];

  return (
    <div>
      {/* WELCOME */}
      <Card title="Dashboard — Instituto Levvai" accent>
        <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.8, margin: 0, color: "#ccc" }}>
          Visão em tempo real do instituto. Atualizado pela equipe na weekly toda terça.
          <span style={{ color: GOLD, fontWeight: 600 }}> Meta Q2: R$60K/mês, 30 pacientes, 1.000 seguidores.</span>
        </p>
      </Card>

      {/* KPIs ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
        <Metric label="Faturamento" value="R$20-50K" sub="Meta: R$60K" />
        <Metric label="Pacientes/Mês" value="~20" sub="Meta: 30" />
        <Metric label="Ticket Médio" value="~R$1.500" sub="Meta: R$2.000" />
        <Metric label="Conversão" value={`${convRate}%`} sub={`${converted}/${totalLeads} leads`} color={convRate >= 50 ? "#2E7D32" : "#E65100"} />
        <Metric label="Instagram" value="286" sub="Meta: 1.000" />
        <Metric label="NPS" value="—" sub="Meta: 85+" />
      </div>

      {/* CHARTS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>

        {/* FUNIL VISUAL */}
        <Card title="Funil de conversão">
          {funnelStages.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 55, fontSize: 10, fontWeight: 600, color: "#888", textAlign: "right" }}>{s.label}</div>
              <div style={{ flex: 1, height: 20, background: "#f5f0e8", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                <div style={{ height: "100%", background: s.color, borderRadius: 4, width: `${Math.max(8, (s.count / maxFunnel) * 100)}%`, transition: "width 0.5s", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6 }}>
                  {s.count > 0 && <span style={{ fontSize: 10, fontWeight: 800, color: "white" }}>{s.count}</span>}
                </div>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: "#999" }}>
            <span>Total: {totalLeads} leads</span>
            <span>Conversão: <strong style={{ color: GOLD }}>{convRate}%</strong></span>
          </div>
        </Card>

        {/* META FATURAMENTO Q2 */}
        <Card title="Meta faturamento Q2 (R$ mil)">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140, paddingBottom: 20 }}>
            {[
              { label: "Jan", value: 25, color: "#E8E4DE" },
              { label: "Fev", value: 30, color: "#E8E4DE" },
              { label: "Mar", value: 35, color: "#E8E4DE" },
              { label: "Abr", value: 40, color: GOLD },
              { label: "Mai", value: 0, color: "#f5f0e8", target: 50 },
              { label: "Jun", value: 0, color: "#f5f0e8", target: 60 },
            ].map((m, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                {m.target && <div style={{ fontSize: 9, color: "#ccc" }}>{m.target}K</div>}
                <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 100 }}>
                  <div style={{
                    width: "100%", borderRadius: "4px 4px 0 0",
                    background: m.value > 0 ? m.color : `repeating-linear-gradient(45deg, ${m.color}, ${m.color} 3px, transparent 3px, transparent 6px)`,
                    height: `${Math.max(4, ((m.value || m.target || 0) / 60) * 100)}%`,
                    transition: "height 0.5s",
                    border: m.value === 0 ? "1px dashed #ddd" : "none",
                  }} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: i === 3 ? GOLD : "#999" }}>{m.label}</div>
                {m.value > 0 && <div style={{ fontSize: 11, fontWeight: 800, color: DARK }}>{m.value}K</div>}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #f0ece6", paddingTop: 6, display: "flex", gap: 12, fontSize: 10, color: "#999" }}>
            <span>◼ Realizado</span>
            <span style={{ color: GOLD }}>◼ Mês atual</span>
            <span>▨ Meta</span>
          </div>
        </Card>
      </div>

      {/* PROGRESS BARS */}
      <Card title="Progresso Q2 — Abril 2026">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
          <MiniBar value={286} max={1000} label="286" sub="Seguidores → 1.000" color="#E91E63" />
          <MiniBar value={20} max={70} label="20" sub="Posts → 70" color="#2196F3" />
          <MiniBar value={20} max={30} label="~20" sub="Pacientes → 30" color="#4CAF50" />
          <MiniBar value={1} max={4} label="1/4" sub="OKRs scoring" color={GOLD} />
        </div>
      </Card>

      {/* QUICK VIEW */}

      {/* TREND LINES */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <TrendChart
          title="Faturamento mensal (R$ mil)"
          color="#4CAF50"
          target={60}
          unit="K"
          data={[
            { label: "Jan", value: 25 },
            { label: "Fev", value: 30 },
            { label: "Mar", value: 35 },
            { label: "Abr", value: 40 },
            { label: "Mai", value: 50, projected: true },
            { label: "Jun", value: 60, projected: true },
          ]}
        />
        <TrendChart
          title="Seguidores Instagram"
          color="#E91E63"
          target={1000}
          data={[
            { label: "Jan", value: 80 },
            { label: "Fev", value: 130 },
            { label: "Mar", value: 200 },
            { label: "Abr", value: 286 },
            { label: "Mai", value: 500, projected: true },
            { label: "Jun", value: 1000, projected: true },
          ]}
        />
        <TrendChart
          title="Pacientes atendidos / mês"
          color="#2196F3"
          target={30}
          data={[
            { label: "Jan", value: 8 },
            { label: "Fev", value: 12 },
            { label: "Mar", value: 15 },
            { label: "Abr", value: 20 },
            { label: "Mai", value: 25, projected: true },
            { label: "Jun", value: 30, projected: true },
          ]}
        />
        <TrendChart
          title="Ticket médio (R$)"
          color={GOLD}
          target={2000}
          data={[
            { label: "Jan", value: 1200 },
            { label: "Fev", value: 1350 },
            { label: "Mar", value: 1500 },
            { label: "Abr", value: 1600 },
            { label: "Mai", value: 1800, projected: true },
            { label: "Jun", value: 2000, projected: true },
          ]}
        />
      </div>

      {/* PORTFOLIO & OKRs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="Portfólio (14 produtos)">
          {["Harmonização facial", "Toxina botulínica", "Bioestimuladores (Radiesse)", "Levvai Lips (labial)", "Preenchimento corporal", "Levvai Glow (Profhilo)", "Protocolo capilar", "Levvai Lift (Fios PDO)", "Exossomos", "PRP (plasma)", "Levvai Slim (Tirzepatida)"].map((p, i) =>
            <div key={i} style={{ padding: "3px 0", fontSize: 12, display: "flex", gap: 6 }}><span style={{ color: GOLD }}>›</span> {p}</div>
          )}
        </Card>
        <Card title="OKRs Q2 — Sprint 90 dias">
          {[
            { obj: "O1", title: "Presença digital mínima viável", progress: 20 },
            { obj: "O2", title: "R$60K faturamento em junho", progress: 15 },
            { obj: "O3", title: "Formalizar posicionamento", progress: 25 },
            { obj: "O4", title: "Estruturar operação", progress: 30 },
          ].map((o, i) => (
            <div key={i} style={{ padding: "8px 0", borderBottom: i < 3 ? "1px solid #f0ece6" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: DARK }}><span style={{ color: GOLD, marginRight: 4 }}>{o.obj}</span>{o.title}</span>
                <span style={{ fontSize: 11, color: "#999" }}>{o.progress}%</span>
              </div>
              <div style={{ height: 4, background: "#f0ece6", borderRadius: 2, marginTop: 4 }}>
                <div style={{ height: 4, background: GOLD, borderRadius: 2, width: `${o.progress}%` }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* EVOLUÇÃO SEMANAL */}
      <Card title="Evolução Semanal — Acompanhamento Q2/2026" accent>
        <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Sylmara preenche toda segunda. CEO revisa na weekly terça. Gráficos atualizam automaticamente.</p>
      </Card>

      <WeeklyTracker />

      {/* INFO BAR */}
      <div style={{ background: LIGHT, borderRadius: 10, padding: "12px 16px", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "#888" }}>
        <span>Rua do Rocio, 288, cj 93 — Vila Olímpia, SP</span>
        <span>@institutolevvai</span>
        <span>+55 11 97821-2800</span>
      </div>
    </div>
  );
};

// PLAN TAB
const PlanTab = () => (
  <div>
    <Card title="Visão 12 Meses — 'De clínica nova a referência premium na Vila Olímpia'" accent>
      <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.8, margin: 0, color: "#ccc" }}>
        Faturamento de R$20-50K → R$150K/mês. Instagram de 286 → 8.000 seguidores.
        Lista de espera para novos pacientes. Referência em preenchimento labial,
        emagrecimento com Tirzepatida e regeneração com exossomos.
      </p>
    </Card>
    <Card title="Metas Trimestrais">
      <TableRow header cells={[{text:"Métrica",flex:2}, "Atual", "Q2 Jun/26", "Q3 Set/26", "Q4 Dez/26", "Q1 Mar/27"]} />
      {[
        ["Faturamento mensal", "R$20-50K", "R$60K", "R$90K", "R$120K", "R$150K"],
        ["Ticket médio", "~R$1.500", "R$2.000", "R$2.200", "R$2.500", "R$2.800"],
        ["Pacientes ativos/mês", "~15-20", "30", "45", "55", "65"],
        ["Seguidores IG", "286", "1.000", "2.500", "5.000", "8.000"],
        ["Posts acumulados", "20", "70", "150", "250", "350"],
        ["Ocupação agenda", "N/D", "60%", "70%", "80%", "85%"],
        ["NPS", "N/D", "85+", "90+", "90+", "90+"],
        ["Protocolos proprietários", "1", "4", "4", "5", "6"],
      ].map((r, i) => <TableRow key={i} cells={[{text:r[0],flex:2}, ...r.slice(1)]} />)}
    </Card>
    <Card title="Sprint Semanal — 12 Semanas">
      {[
        { phase: "FUNDAÇÃO", weeks: "S1-S4 (Abril)", color: "#E8EAF6", actions: "Workshop posicionamento, sessão de fotos, calendário editorial, site, WhatsApp Business, CRM, primeiro DRE, inaugurar WBR" },
        { phase: "TRAÇÃO", weeks: "S5-S8 (Maio)", color: "#E0F2F1", actions: "Campanha Levvai Lips, campanha Tirzepatida, ritmo de 5 posts/semana, testar tráfego pago, gravar depoimentos, repor estoque" },
        { phase: "ACELERAÇÃO", weeks: "S9-S11 (Junho)", color: "#E8F5E9", actions: "Protocolo Levvai Lift, evento Levvai Experience, campanha de indicação, push final 30 pacientes" },
        { phase: "REVISÃO", weeks: "S12 (Fim Jun)", color: "#FFF3E0", actions: "Fechar DRE, consolidar métricas Q2, apresentação board, planejar OKRs Q3, celebrar" },
      ].map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
          <div style={{ background: p.color, borderRadius: 8, padding: "8px 12px", minWidth: 100, textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: DARK }}>{p.phase}</div>
            <div style={{ fontSize: 10, color: "#777" }}>{p.weeks}</div>
          </div>
          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, paddingTop: 4 }}>{p.actions}</div>
        </div>
      ))}
    </Card>
    <Card title="Quick Wins — Primeiras 48h">
      {[
        "Criar Google Business Profile completo",
        "Ativar WhatsApp Business com catálogo",
        "Publicar 3 Reels esta semana",
        "Definir nomes dos 4 protocolos proprietários",
        "Fotografar 100% dos próximos 5 pacientes (antes/depois)",
        "Criar highlights: Quem somos, Procedimentos, Levvai Lips, Depoimentos",
        "Configurar link na bio (Linktree)",
        "Agendar WBR inaugural (terça, 9h)",
        "Enviar WhatsApp para base existente (Tirzepatida ou Levvai Lips)",
        "Pedir avaliação Google para 5 pacientes satisfeitos",
      ].map((q, i) => (
        <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid #f5f0e8", fontSize: 13, alignItems: "center" }}>
          <span style={{ color: GOLD, fontWeight: 800, fontSize: 12, minWidth: 24 }}>{(i+1).toString().padStart(2,"0")}</span>
          <span>{q}</span>
        </div>
      ))}
    </Card>
  </div>
);

// TEAM TAB
const TeamTab = () => (
  <div>
    <Card title="Organograma Funcional — v3.0">
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ color: "#999", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>BOARD CONSULTIVO</div>
        <Badge text="Rich — Governança & Visão Externa" color="#E8E4DE" />
        <div style={{ color: "#ccc", margin: "8px 0" }}>│</div>
        <div style={{ display: "inline-block", background: GOLD, color: "white", padding: "10px 24px", borderRadius: 8, fontWeight: 700, fontSize: 15 }}>IKE — CEO</div>
        <div style={{ color: "#999", fontSize: 11, marginTop: 4 }}>Levvai Weekly (terça) + WhatsApp emergências</div>
        <div style={{ color: "#ccc", margin: "8px 0" }}>┌────────┼────────┼────────┐</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
          {[
            { name: "LARA", role: "Dir. Clínica", color: "#E91E63" },
            { name: "SIRLÂNDIA", role: "Ger. Operacional", color: "#039BE5" },
            { name: "SYLMARA", role: "Administradora", color: "#7B1FA2" },
            { name: "Gi", role: "Social Media", color: "#43A047" },
          ].map((p, i) => (
            <div key={i} style={{ background: p.color, color: "white", padding: "8px 16px", borderRadius: 8, textAlign: "center", minWidth: 100 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>{p.role}</div>
            </div>
          ))}
        </div>
        <div style={{ color: "#ccc", margin: "12px 0" }}>│</div>
        <Badge text="ASSOCIADOS (futuro): Nutrólogo + Dermatologista" color={LIGHT} textColor={GOLD} />
      </div>
    </Card>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <PersonCard name="Ike (Henrique)" role="CEO — ~6-8h/semana" color={GOLD}
        responsibilities={["Liderar Levvai Weekly (terça)", "Planejamento estratégico e OKRs", "Captação de profissionais associados", "Supervisão de compliance e jurídico", "Interface com Luciano Gebara", "Board mensal com Rich", "Construir brand assets (site, naming)"]}
        kpis={["Faturamento", "Margem bruta", "OKRs 0.7+", "Compliance 100%"]} />
      <PersonCard name="Lara" role="Diretora Clínica & Face da Marca" color="#E91E63"
        responsibilities={["Executar todos os procedimentos", "Definir protocolos proprietários", "Documentação técnico-regulatória", "Validação técnica de associados", "Ser rosto do Levvai no IG", "Participar de gravações de Reels", "1:1 com Gi (sexta 16h)"]}
        kpis={["Ticket médio R$2K+", "NPS 85+", "Retorno 30%+", "Conteúdos 3+/sem"]} />
      <PersonCard name="Sirlândia" role="Gerente Operacional" color="#039BE5"
        responsibilities={["Converter leads em agendamentos (60%)", "Gerenciar agenda Lara + associados", "Enviar agenda semanal toda segunda (todos os profissionais)", "Enviar lista de manutenção diária (até 8:45h)", "Follow-up 24h e 7 dias pós-procedimento", "Coletar depoimentos e reviews Google", "Onboarding operacional de associados", "Manter CRM atualizado", "WhatsApp Business (<30min)"]}
        kpis={["Conversão 60%", "Ocupação 60%+", "No-show <10%", "Reviews 5/mês"]} />
      <PersonCard name="Sylmara" role="Administradora" color="#7B1FA2"
        responsibilities={["DRE mensal até dia 5", "Controle fluxo de caixa", "Check-in estoque quinzenal", "Compliance administrativo-legal", "Calcular e pagar split associados", "Interface com contador e Luciano", "Dashboard weekly toda segunda"]}
        kpis={["DRE dia 5 100%", "Margem 65-70%", "Estoque reduzir R$55K", "Inadimplência <3%"]} />
      <PersonCard name="Gi" role="Social Media" color="#43A047"
        responsibilities={["5 posts/semana (mínimo)", "Seguir 8 pilares editoriais", "Stories diários", "Gravar/editar Reels", "Conteúdo com associados (2x/mês)", "Enviar métricas IG sexta para CEO", "Cobertura total do Levvai Day"]}
        kpis={["5 posts/sem", "1.000 seg Q2", "Engajamento 5%+", "4 depoimentos/mês"]} />
      <PersonCard name="Rich" role="Conselheiro — Board" color="#78909C"
        responsibilities={["Board mensal com CEO (1º sábado)", "Analisar DRE e KPIs", "Questionar e validar direções", "Review trimestral de OKRs", "Trazer benchmarks externos"]}
        kpis={null} />
    </div>
  </div>
);

// FINANCE TAB
const products = [
  { tipo: "Protocolo", cat: "Toxina", nome: "Botox 200U", protocolo: "Toxina Botulínica Full Face", regiao: "Full Face / Hiperidrose", qtdUn: "Atende 2 clientes", valorCompra: 1325.07, custoUn: 662.53, precoSugerido: 3500, estoque: 5, estoqueMin: 3, obs: "Allergan. 200U. Armazenar 2-8°C." },
  { tipo: "Protocolo", cat: "Preenchedor", nome: "Evo H (1ml)", protocolo: "Preenchimento Corporal", regiao: "Corporal / Bumbum", qtdUn: "1ml", valorCompra: 950, custoUn: 950, precoSugerido: 2500, estoque: 15, estoqueMin: 5, obs: "Protocolo requer 5-10 seringas." },
  { tipo: "Protocolo", cat: "Preenchedor", nome: "Evo S (1ml)", protocolo: "Preenchimento Corporal", regiao: "Corporal / Bumbum", qtdUn: "1ml", valorCompra: 950, custoUn: 950, precoSugerido: 2500, estoque: 5, estoqueMin: 3, obs: "Similar ao Evo H." },
  { tipo: "Protocolo", cat: "Bioestimulador", nome: "Radiesse Duo (1,5ml)", protocolo: "Estímulo de Colágeno", regiao: "Full Face / Corporal", qtdUn: "1,5ml", valorCompra: 669, custoUn: 446, precoSugerido: 1800, estoque: 6, estoqueMin: 3, obs: "Merz. Efeito imediato + bio. 12-18m." },
  { tipo: "Protocolo", cat: "Preenchedor", nome: "Biogelis Volume (1ml)", protocolo: "Preenchimento Facial", regiao: "Harmonização, mandíbula, olheiras", qtdUn: "1ml", valorCompra: 410, custoUn: 205, precoSugerido: 1500, estoque: 8, estoqueMin: 4, obs: "Marca nacional. Abaixo de Juvederm." },
  { tipo: "Protocolo", cat: "Preenchedor", nome: "Juvederm Volbella (1ml)", protocolo: "Levvai Lips — Preench. Labial", regiao: "Facial / Labial", qtdUn: "1ml", valorCompra: 650, custoUn: 325, precoSugerido: 2200, estoque: 2, estoqueMin: 4, obs: "Allergan. PREMIUM. ESTOQUE BAIXO." },
  { tipo: "Protocolo", cat: "Preenchedor", nome: "Restylane Kysse (1ml)", protocolo: "Levvai Lips — Preench. Labial", regiao: "Labial", qtdUn: "1ml", valorCompra: 339, custoUn: 339, precoSugerido: 2000, estoque: 4, estoqueMin: 3, obs: "Galderma. PREMIUM. Excelente margem." },
  { tipo: "Protocolo", cat: "Skin Booster", nome: "Profhilo (2ml)", protocolo: "Levvai Glow — Biorremodelação", regiao: "Facial, corporal, colo, pescoço", qtdUn: "2ml", valorCompra: 750, custoUn: 375, precoSugerido: 1800, estoque: 4, estoqueMin: 3, obs: "IBSA. 2 sessões. Tendência 2026." },
  { tipo: "Protocolo", cat: "Capilar", nome: "Mesohyal Redenx", protocolo: "Protocolo Capilar", regiao: "Rosto, colo, mãos, pescoço", qtdUn: "1 ampola (kit 5)", valorCompra: 4000, custoUn: 800, precoSugerido: 2000, estoque: 1, estoqueMin: 2, obs: "Kit 5 ampolas. REPOR URGENTE." },
  { tipo: "Protocolo", cat: "Revitalização", nome: "Bioflash NCTC-109", protocolo: "Mesoterapia", regiao: "Couro cabeludo, rosto, colo", qtdUn: "1 ampola (kit ~10)", valorCompra: 2250, custoUn: 225, precoSugerido: 1000, estoque: 6, estoqueMin: 3, obs: "Protocolo 4-6 sessões." },
  { tipo: "Protocolo", cat: "Fios", nome: "Fios de PDO", protocolo: "Levvai Lift — Sustentação", regiao: "Facial, colo, pescoço", qtdUn: "1 unidade", valorCompra: 265.90, custoUn: 265.90, precoSugerido: 900, estoque: 10, estoqueMin: 5, obs: "Preço por fio. Protocolo 10-20 fios." },
  { tipo: "Protocolo", cat: "Regeneração", nome: "Kit Exomine", protocolo: "Regeneração Celular (Exossomos)", regiao: "Microagulhamento facial, capilar", qtdUn: "1 kit", valorCompra: 2200, custoUn: 2200, precoSugerido: 3500, estoque: 2, estoqueMin: 2, obs: "Tendência premium. Diferencial forte." },
  { tipo: "Protocolo", cat: "Autólogo", nome: "Kit PRP", protocolo: "Plasma Rico em Plaquetas", regiao: "Microagulhamento facial, capilar", qtdUn: "1 kit", valorCompra: 160, custoUn: 160, precoSugerido: 1200, estoque: 5, estoqueMin: 3, obs: "Excelente margem. Baixo custo." },
  { tipo: "Produto", cat: "Emagrecimento", nome: "Tirzepatida (60mg/2,4ml)", protocolo: "Levvai Slim — Injetável Semanal", regiao: "Emagrecimento", qtdUn: "2,4ml (60mg)", valorCompra: 1000, custoUn: 1000, precoSugerido: 2000, estoque: 48, estoqueMin: 10, obs: "Mounjaro. MAIOR ESTOQUE. Requer médico." },
];

const FINANCE_CATS = ["Toxina","Preenchedor","Bioestimulador","Skin Booster","Capilar","Revitalização","Fios","Regeneração","Autólogo","Emagrecimento","Outros"];
const FINANCE_EMPTY = { tipo:"Protocolo", cat:"Toxina", nome:"", protocolo:"", regiao:"", custo_un:"", preco_sugerido:"", estoque:"", estoque_min:"3", obs:"" };
const finLbl = { fontSize:9, fontWeight:700, color:"#999", marginBottom:2, letterSpacing:"0.05em" };
const finInp = { width:"100%", padding:"6px 8px", border:"1px solid #ddd", borderRadius:6, fontSize:12, fontFamily:"inherit", outline:"none", boxSizing:"border-box" };

const CatalogForm = ({ form, set }) => (
  <div>
    <div style={{ display:"flex", gap:10, marginBottom:10, flexWrap:"wrap" }}>
      <div style={{ flex:"0 0 110px" }}>
        <div style={finLbl}>TIPO</div>
        <select value={form.tipo} onChange={e => set({...form, tipo:e.target.value})} style={finInp}>
          <option>Protocolo</option>
          <option>Produto</option>
        </select>
      </div>
      <div style={{ flex:"0 0 140px" }}>
        <div style={finLbl}>CATEGORIA</div>
        <input list="fin-cats" value={form.cat} onChange={e => set({...form, cat:e.target.value})} style={finInp} />
        <datalist id="fin-cats">{FINANCE_CATS.map(c => <option key={c} value={c} />)}</datalist>
      </div>
      <div style={{ flex:"1 1 180px" }}>
        <div style={finLbl}>NOME *</div>
        <input value={form.nome} onChange={e => set({...form, nome:e.target.value})} placeholder="Ex: Botox 200U" style={finInp} />
      </div>
      <div style={{ flex:"1 1 200px" }}>
        <div style={finLbl}>PROTOCOLO / SERVIÇO</div>
        <input value={form.protocolo} onChange={e => set({...form, protocolo:e.target.value})} placeholder="Ex: Toxina Botulínica Full Face" style={finInp} />
      </div>
    </div>
    <div style={{ display:"flex", gap:10, marginBottom:10, flexWrap:"wrap", alignItems:"flex-end" }}>
      <div style={{ flex:"1 1 140px" }}>
        <div style={finLbl}>REGIÃO</div>
        <input value={form.regiao} onChange={e => set({...form, regiao:e.target.value})} placeholder="Ex: Full Face / Corporal" style={finInp} />
      </div>
      <div style={{ flex:"0 0 120px" }}>
        <div style={finLbl}>CUSTO UN. (R$) *</div>
        <input type="number" value={form.custo_un} onChange={e => set({...form, custo_un:e.target.value})} placeholder="0" style={{...finInp, textAlign:"right"}} />
      </div>
      <div style={{ flex:"0 0 140px" }}>
        <div style={finLbl}>PREÇO SUGERIDO (R$) *</div>
        <input type="number" value={form.preco_sugerido} onChange={e => set({...form, preco_sugerido:e.target.value})} placeholder="0" style={{...finInp, textAlign:"right"}} />
      </div>
      <div style={{ flex:"0 0 80px" }}>
        <div style={finLbl}>MARGEM</div>
        <div style={{ padding:"6px 8px", background:"white", border:"1px solid #eee", borderRadius:6, fontSize:12, textAlign:"right", color:+form.preco_sugerido>0?"#2E7D32":"#bbb", fontWeight:700 }}>
          {+form.preco_sugerido>0 ? `${Math.round((+form.preco_sugerido - +form.custo_un) / +form.preco_sugerido * 100)}%` : "—"}
        </div>
      </div>
      <div style={{ flex:"0 0 90px" }}>
        <div style={finLbl}>ESTOQUE</div>
        <input type="number" value={form.estoque} onChange={e => set({...form, estoque:e.target.value})} placeholder="0" style={{...finInp, textAlign:"center"}} />
      </div>
      <div style={{ flex:"0 0 90px" }}>
        <div style={finLbl}>ESTOQUE MÍN.</div>
        <input type="number" value={form.estoque_min} onChange={e => set({...form, estoque_min:e.target.value})} placeholder="3" style={{...finInp, textAlign:"center"}} />
      </div>
    </div>
    <div>
      <div style={finLbl}>OBSERVAÇÕES</div>
      <input value={form.obs} onChange={e => set({...form, obs:e.target.value})} placeholder="Fornecedor, armazenamento, validade..." style={finInp} />
    </div>
  </div>
);

const FinanceTab = () => {
  const [filter, setFilter] = useState("TODOS");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showNewForm, setShowNewForm] = useState(false);
  const [newForm, setNewForm] = useState(FINANCE_EMPTY);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    const { data } = await supabase.from('produtos').select('*').eq('ativo', true).order('tipo').order('cat');
    if (data) setProducts(data.map(p => ({
      ...p, custoUn: p.custo_un, precoSugerido: p.preco_sugerido, estoqueMin: p.estoque_min,
    })));
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({ tipo:p.tipo, cat:p.cat, nome:p.nome, protocolo:p.protocolo||"", regiao:p.regiao||"", custo_un:p.custo_un, preco_sugerido:p.preco_sugerido, estoque:p.estoque, estoque_min:p.estoque_min, obs:p.obs||"" });
    setShowNewForm(false);
  };

  const saveEdit = async (id) => {
    setSaving(true);
    const oldNome = products.find(p => p.id === id)?.nome;
    await supabase.from('produtos').update({
      tipo:editForm.tipo, cat:editForm.cat, nome:editForm.nome, protocolo:editForm.protocolo,
      regiao:editForm.regiao, custo_un:+editForm.custo_un, preco_sugerido:+editForm.preco_sugerido,
      estoque:+editForm.estoque, estoque_min:+editForm.estoque_min, obs:editForm.obs,
    }).eq('id', id);
    if (oldNome && editForm.nome && oldNome !== editForm.nome) {
      await supabase.from('tratamentos').update({ procedimento: editForm.nome }).eq('procedimento', oldNome);
      await supabase.from('fluxo_caixa').update({ procedimento: editForm.nome }).eq('procedimento', oldNome);
    }
    setEditingId(null);
    await reload();
    setSaving(false);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Remover este item do catálogo?")) return;
    await supabase.from('produtos').update({ ativo:false }).eq('id', id);
    await reload();
  };

  const saveNew = async () => {
    if (!newForm.nome || !newForm.custo_un || !newForm.preco_sugerido) return;
    setSaving(true);
    await supabase.from('produtos').insert({
      tipo:newForm.tipo, cat:newForm.cat, nome:newForm.nome, protocolo:newForm.protocolo,
      regiao:newForm.regiao, custo_un:+newForm.custo_un, preco_sugerido:+newForm.preco_sugerido,
      estoque:+newForm.estoque||0, estoque_min:+newForm.estoque_min||3, obs:newForm.obs, ativo:true,
    });
    setNewForm(FINANCE_EMPTY);
    setShowNewForm(false);
    await reload();
    setSaving(false);
  };

  const filtered = filter === "TODOS" ? products : products.filter(p => p.tipo === filter);
  const totalEstoque = products.reduce((a, p) => a + p.custoUn * p.estoque, 0);
  const totalProtocolos = products.filter(p => p.tipo === "Protocolo").reduce((a, p) => a + p.custoUn * p.estoque, 0);
  const totalProdutos = products.filter(p => p.tipo === "Produto").reduce((a, p) => a + p.custoUn * p.estoque, 0);
  const itemsRepor = products.filter(p => p.estoque <= p.estoqueMin).length;
  const margemMedia = products.length > 0 ? products.reduce((a, p) => a + (p.precoSugerido - p.custoUn) / p.precoSugerido, 0) / products.length : 0;
  const fmt = (v) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;
  const getStatus = (p) => {
    if (p.estoque <= p.estoqueMin) return { text: "REPOR", color: "#FFCDD2", tc: "#B71C1C" };
    if (p.estoque <= p.estoqueMin * 1.5) return { text: "ALERTA", color: "#FFF9C4", tc: "#F57F17" };
    return { text: "OK", color: "#E8F5E9", tc: "#2E7D32" };
  };
  const catColors = {
    "Toxina":"#E8EAF6","Preenchedor":"#E0F2F1","Bioestimulador":"#FFF3E0",
    "Skin Booster":"#F3E5F5","Capilar":"#FBE9E7","Revitalização":"#E8F5E9",
    "Fios":"#ECEFF1","Regeneração":"#FCE4EC","Autólogo":"#E1F5FE","Emagrecimento":"#FFF9C4",
  };

  if (loading) return <div style={{ padding: 32, textAlign: "center", color: "#aaa" }}>Carregando catálogo...</div>;

  return (
    <div>
      {/* RESUMO */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <Metric label="Valor Total Estoque" value={fmt(totalEstoque)} sub={`Protocolos: ${fmt(totalProtocolos)} | Produtos: ${fmt(totalProdutos)}`} />
        <Metric label="Itens Cadastrados" value={products.length} sub={`${products.filter(p=>p.tipo==="Protocolo").length} protocolos + ${products.filter(p=>p.tipo==="Produto").length} produtos`} />
        <Metric label="Margem Bruta Média" value={`${Math.round(margemMedia*100)}%`} color="#2E7D32" />
        <Metric label="Itens Críticos" value={itemsRepor} sub="estoque no mínimo ou abaixo" color="#B71C1C" />
      </div>

      {/* DRE */}
      <Card title="Estrutura DRE — 5 Blocos (padrão Meet & Eat / KPH)" accent>
        <div style={{ fontSize: 14, lineHeight: 2 }}>
          {[
            { block: "RECEITAS", items: "Procedimentos + Locação sala + Venda produtos", color: "#C8E6C9" },
            { block: "DEDUÇÕES", items: "Impostos + Taxas maquininha + Juros + Antecipação", color: "#FFCDD2" },
            { block: "CUSTOS VARIÁVEIS", items: "CMV + Materiais + Split associados + Comissões + Marketing (tráfego, influencers, eventos)", color: "#FFE0B2" },
            { block: "CUSTOS PESSOAS", items: "Pró-labore Lara + Sirlândia + Sylmara + Gi + Encargos + Benefícios", color: "#E1BEE7" },
            { block: "CUSTOS FIXOS", items: "Aluguel + Luz + Água + Internet + Contador + CRM + Seguro + Jurídico", color: "#B3E5FC" },
          ].map((b, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 4 }}>
              <Badge text={b.block} color={b.color} textColor="#333" />
              <span style={{ fontSize: 12, color: "#aaa" }}>{b.items}</span>
            </div>
          ))}
          <div style={{ marginTop: 8, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8 }}>
            <span style={{ color: GOLD, fontWeight: 700 }}>= EBITDA → = RESULTADO LÍQUIDO</span>
          </div>
        </div>
      </Card>

      {/* CATÁLOGO — GESTÃO COMPLETA */}
      <Card title="Catálogo de Produtos & Protocolos">
        {/* BOTÃO NOVO */}
        <button onClick={() => { setShowNewForm(!showNewForm); setEditingId(null); }} style={{
          width: "100%", padding: "10px", background: "white", border: `2px dashed ${GOLD}`,
          borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: GOLD,
          fontFamily: "inherit", marginBottom: 12,
        }}>+ Novo Produto / Protocolo</button>

        {showNewForm && (
          <div style={{ background: LIGHT, borderRadius: 10, padding: 16, marginBottom: 14, border: `1px solid ${GOLD}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 10, letterSpacing: "0.05em" }}>NOVO CADASTRO</div>
            <CatalogForm form={newForm} set={setNewForm} />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={saveNew} disabled={saving} style={{ padding: "8px 20px", background: GOLD, color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button onClick={() => { setShowNewForm(false); setNewForm(FINANCE_EMPTY); }} style={{ padding: "8px 14px", background: "white", color: "#888", border: "1px solid #ddd", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            </div>
          </div>
        )}

        {/* FILTRO */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {["TODOS", "Protocolo", "Produto"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? DARK : "white",
              color: filter === f ? GOLD : "#888",
              border: `1px solid ${filter === f ? DARK : "#ddd"}`,
              borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>{f} ({f === "TODOS" ? products.length : products.filter(p => p.tipo === f).length})</button>
          ))}
        </div>

        {/* CABEÇALHO */}
        <div style={{ display: "flex", background: DARK, borderRadius: "8px 8px 0 0", padding: "10px 0" }}>
          {[
            { l: "TIPO", f: 0.6 }, { l: "CATEGORIA", f: 0.8 }, { l: "PRODUTO", f: 1.2 },
            { l: "PROTOCOLO", f: 1.2 }, { l: "CUSTO UN.", f: 0.7 }, { l: "PREÇO", f: 0.7 },
            { l: "MARGEM", f: 0.6 }, { l: "ESTOQUE", f: 0.5 }, { l: "MÍN", f: 0.4 }, { l: "STATUS", f: 0.5 }, { l: "AÇÕES", f: 0.6 },
          ].map((h, i) => (
            <div key={i} style={{ flex: h.f, textAlign: "center", fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em", padding: "0 2px" }}>{h.l}</div>
          ))}
        </div>

        {/* LINHAS */}
        {filtered.map((p, i) => {
          const margem = Math.round((p.precoSugerido - p.custoUn) / p.precoSugerido * 100);
          const st = getStatus(p);
          const editing = editingId === p.id;
          return (
            <div key={p.id}>
              <div style={{
                display: "flex", padding: "8px 0", alignItems: "center",
                borderBottom: editing ? "none" : "1px solid #f0ece6",
                background: editing ? "#FFF8F0" : i % 2 === 0 ? "white" : "#FAFAF8",
              }}>
                <div style={{ flex: 0.6, textAlign: "center" }}>
                  <Badge text={p.tipo === "Protocolo" ? "PROT" : "PROD"}
                    color={p.tipo === "Protocolo" ? "#E8EAF6" : "#FFF9C4"}
                    textColor={p.tipo === "Protocolo" ? "#283593" : "#F57F17"} />
                </div>
                <div style={{ flex: 0.8, textAlign: "center" }}>
                  <Badge text={p.cat} color={catColors[p.cat] || "#eee"} textColor="#555" />
                </div>
                <div style={{ flex: 1.2, fontSize: 12, fontWeight: 700, padding: "0 4px" }}>{p.nome}</div>
                <div style={{ flex: 1.2, fontSize: 11, color: "#777", padding: "0 4px" }}>{p.protocolo}</div>
                <div style={{ flex: 0.7, textAlign: "center", fontSize: 12, fontWeight: 600, color: "#B71C1C" }}>{fmt(p.custoUn)}</div>
                <div style={{ flex: 0.7, textAlign: "center", fontSize: 12, fontWeight: 700, color: DARK }}>{fmt(p.precoSugerido)}</div>
                <div style={{ flex: 0.6, textAlign: "center" }}>
                  <Badge text={`${margem}%`} color={margem >= 70 ? "#E8F5E9" : margem >= 50 ? "#FFF9C4" : "#FFEBEE"}
                    textColor={margem >= 70 ? "#2E7D32" : margem >= 50 ? "#F57F17" : "#B71C1C"} />
                </div>
                <div style={{ flex: 0.5, textAlign: "center", fontSize: 13, fontWeight: 800,
                  color: p.estoque <= p.estoqueMin ? "#B71C1C" : DARK }}>{p.estoque}</div>
                <div style={{ flex: 0.4, textAlign: "center", fontSize: 11, color: "#999" }}>{p.estoqueMin}</div>
                <div style={{ flex: 0.5, textAlign: "center" }}>
                  <Badge text={st.text} color={st.color} textColor={st.tc} />
                </div>
                <div style={{ flex: 0.6, display: "flex", justifyContent: "center" }}>
                  <button onClick={() => editing ? setEditingId(null) : startEdit(p)} style={{
                    padding: "3px 9px", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    background: editing ? "#f0f0f0" : DARK, color: editing ? "#888" : GOLD,
                    border: "none", borderRadius: 5,
                  }}>{editing ? "✕" : "Editar"}</button>
                </div>
              </div>

              {editing && (
                <div style={{ background: "#FFF8F0", padding: 16, borderBottom: `2px solid ${GOLD}`, borderTop: `1px solid ${GOLD}30` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 10, letterSpacing: "0.05em" }}>EDITANDO: {p.nome}</div>
                  <CatalogForm form={editForm} set={setEditForm} />
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={() => saveEdit(p.id)} disabled={saving} style={{ padding: "8px 20px", background: GOLD, color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}>
                      {saving ? "Salvando..." : "Salvar alterações"}
                    </button>
                    <button onClick={() => setEditingId(null)} style={{ padding: "8px 14px", background: "white", color: "#888", border: "1px solid #ddd", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
                    <button onClick={() => deleteProduct(p.id)} style={{ padding: "8px 14px", background: "#FFEBEE", color: "#B71C1C", border: "1px solid #FFCDD2", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginLeft: "auto" }}>Remover do Catálogo</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* TOTAL */}
        <div style={{ display: "flex", padding: "12px 0", background: LIGHT, borderRadius: "0 0 8px 8px", marginTop: 1 }}>
          <div style={{ flex: 4.8, fontSize: 12, fontWeight: 800, paddingLeft: 8 }}>
            TOTAL: {filtered.length} itens | Valor em estoque: {fmt(filtered.reduce((a,p) => a + p.custoUn * p.estoque, 0))}
          </div>
          <div style={{ flex: 0.6, textAlign: "center", fontSize: 12, fontWeight: 800 }}>
            {filtered.length > 0 ? `${Math.round(filtered.reduce((a,p) => a + (p.precoSugerido-p.custoUn)/p.precoSugerido, 0) / filtered.length * 100)}% média` : "—"}
          </div>
          <div style={{ flex: 2.1 }} />
        </div>
      </Card>

      {/* LEGENDA */}
      <Card title="Legenda">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <Badge text="PROT = Protocolo (serviço)" color="#E8EAF6" textColor="#283593" />
          <Badge text="PROD = Produto (venda)" color="#FFF9C4" textColor="#F57F17" />
          <Badge text="OK = estoque saudável" color="#E8F5E9" textColor="#2E7D32" />
          <Badge text="ALERTA = monitorar" color="#FFF9C4" textColor="#F57F17" />
          <Badge text="REPOR = acionar fornecedor" color="#FFCDD2" textColor="#B71C1C" />
        </div>
        <div style={{ fontSize: 11, color: "#999", lineHeight: 1.6 }}>
          Status calculado automaticamente: REPOR (estoque ≤ mínimo), ALERTA (≤ 1,5× mínimo), OK (acima de 1,5×).
          Clique "Editar" para alterar preço, custo, estoque e demais campos. "Remover do Catálogo" oculta o item sem apagar permanentemente.
        </div>
      </Card>
    </div>
  );
};

// COMPETITORS TAB
const CompetitorsTab = () => (
  <div>
    <Card title="Mapa Competitivo — 6 Concorrentes Analisados">
      {[
        { name: "GTC Clinic (Taiz Campbell)", seg: "468K + 1M", loc: "Moema, SP", threat: "ALTO", color: "#FFCDD2", diff: "Quiet Beauty®, Daycare®, Fellow, palestrante global" },
        { name: "Giovana Falbo", seg: "12K", loc: "Itaim Bibi, SP", threat: "ALTO", color: "#FFCDD2", diff: "Site estruturado, antes/depois forte, mesma região" },
        { name: "Ritha Capelato", seg: "N/D", loc: "Maringá + Moema SP", threat: "MÉDIO-ALTO", color: "#FFE0B2", diff: "Academy 340+ aulas, Fellow, IMCAS Paris, 2 clínicas" },
        { name: "Dr. Ritchie Alves", seg: "100K", loc: "BH + SP", threat: "MÉDIO", color: "#FFF9C4", diff: "Professor Transformando Faces, fé + técnica, Hooks Magazine" },
        { name: "Dr. Murilo Cecílio", seg: "N/D", loc: "SP", threat: "MÉDIO", color: "#FFF9C4", diff: "Lipo papada, celebridades (BBB), storytelling pessoal" },
        { name: "Dr. Igor Alves", seg: "2M", loc: "BH", threat: "BAIXO-MÉDIO", color: "#E8F5E9", diff: "Maior do segmento, 30K+ formados, marca família" },
      ].map((c, i) => (
        <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #f0ece6", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{c.loc} — {c.seg} seg</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{c.diff}</div>
          </div>
          <Badge text={c.threat} color={c.color} textColor="#333" />
        </div>
      ))}
    </Card>
    <Card title="SWOT — Instituto Levvai">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { title: "FORÇAS", color: "#2E7D32", bg: "#E8F5E9", items: ["Portfólio mais amplo (facial+corporal+emagrecimento)", "Tirzepatida — nenhum concorrente tem", "Exossomos — tendência premium rara", "Marca institucional escalável", "Dupla habilitação odonto + médica", "Produtos premium (Allergan, Galderma, Merz)"] },
          { title: "FRAQUEZAS", color: "#C62828", bg: "#FFEBEE", items: ["Presença digital quase zero (20 posts/286 seg)", "Sem site próprio", "Sem conceitos proprietários formalizados", "Sem prova social em volume", "Marca pessoal da Lara não construída", "Estoque desequilibrado (R$48K em Tirzepatida)"] },
          { title: "OPORTUNIDADES", color: "#1565C0", bg: "#E3F2FD", items: ["Levvai Lips como sub-marca forte", "Emagrecimento estético (blue ocean)", "SEO 'clínica estética Vila Olímpia'", "Protocolos com naming próprio", "Exossomos como pilar editorial", "Cross-sell com ecossistema KPH"] },
          { title: "AMEAÇAS", color: "#E65100", bg: "#FFF3E0", items: ["GTC e Giovana dominam mesmo público SP", "Concorrentes com anos de conteúdo", "Regulamentação HOF (CRM/CFO)", "Redes low-cost (Botoclinic)", "Algoritmo IG instável", "Risco reputacional sem presença digital"] },
        ].map((q, i) => (
          <div key={i} style={{ background: q.bg, borderRadius: 8, padding: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: q.color, marginBottom: 8 }}>{q.title}</div>
            {q.items.map((item, j) => (
              <div key={j} style={{ fontSize: 12, color: "#555", padding: "2px 0" }}>› {item}</div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ASSOCIATES TAB
const AssociatesTab = () => {
  // Estado — Associados
  const [associados, setAssociados] = useState([]);
  const [repasses, setRepasses] = useState([]);
  const [loadingAssociados, setLoadingAssociados] = useState(true);

  useEffect(() => {
    const fetchAssociados = async () => {
      setLoadingAssociados(true);
      const { data: assocData, error: assocError } = await supabase
        .from('associados')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (!assocError && assocData) setAssociados(assocData);

      const { data: repasseData, error: repasseError } = await supabase
        .from('repasses_associados')
        .select('*')
        .order('mes', { ascending: false });

      if (!repasseError && repasseData) setRepasses(repasseData);

      setLoadingAssociados(false);
    };

    fetchAssociados();
  }, []);

  const salvarAssociado = async (associado) => {
    if (associado.id) {
      const { error } = await supabase
        .from('associados')
        .update(associado)
        .eq('id', associado.id);
      if (!error) setAssociados(prev => prev.map(a => a.id === associado.id ? associado : a));
    } else {
      const { data, error } = await supabase
        .from('associados')
        .insert([associado])
        .select()
        .single();
      if (!error && data) setAssociados(prev => [...prev, data]);
    }
  };

  const salvarRepasse = async (repasse) => {
    const liquido = (repasse.bruto * repasse.split_percentual) / 100;
    const repasseCompleto = { ...repasse, liquido };

    if (repasse.id) {
      const { error } = await supabase
        .from('repasses_associados')
        .update(repasseCompleto)
        .eq('id', repasse.id);
      if (!error) setRepasses(prev => prev.map(r => r.id === repasse.id ? repasseCompleto : r));
    } else {
      const { data, error } = await supabase
        .from('repasses_associados')
        .insert([repasseCompleto])
        .select()
        .single();
      if (!error && data) setRepasses(prev => [...prev, data]);
    }
  };

  const marcarRepassePago = async (repasseId) => {
    const { error } = await supabase
      .from('repasses_associados')
      .update({ pago: true, data_pagamento: new Date().toISOString().split('T')[0] })
      .eq('id', repasseId);
    if (!error) setRepasses(prev =>
      prev.map(r => r.id === repasseId ? { ...r, pago: true } : r)
    );
  };

  const entries = repasses;
  const associates = associados;

  const getSplit = (e) => {
    const assoc = associates.find(a => a.nome === e.associado);
    const pct = assoc?.split_percentual ?? 60;
    return { assoc: pct / 100, levvai: 1 - pct / 100 };
  };

  const totals = entries.reduce((acc, e) => {
    const s = getSplit(e);
    acc.bruto += e.valor;
    acc.assoc += e.valor * s.assoc;
    acc.levvai += e.valor * s.levvai;
    return acc;
  }, { bruto: 0, assoc: 0, levvai: 0 });

  const byAssoc = entries.reduce((acc, e) => {
    const s = getSplit(e);
    if (!acc[e.associado]) acc[e.associado] = { count: 0, bruto: 0, assoc: 0, levvai: 0 };
    acc[e.associado].count++;
    acc[e.associado].bruto += e.valor;
    acc[e.associado].assoc += e.valor * s.assoc;
    acc[e.associado].levvai += e.valor * s.levvai;
    return acc;
  }, {});

  const [showNewAssoc, setShowNewAssoc] = useState(false);
  const [newAssoc, setNewAssoc] = useState({ nome: "", especialidade: "", crm: "", dias: "", sala: "Sala Associados", contrato: "", status: "EM PROSPECÇÃO", splitModelo: "60/40", telefone: "", email: "", obs: "" });

  const addAssociate = () => { if (!newAssoc.nome || !newAssoc.especialidade) return; salvarAssociado({ ...newAssoc }); setNewAssoc({ nome: "", especialidade: "", crm: "", dias: "", sala: "Sala Associados", contrato: "", status: "EM PROSPECÇÃO", splitModelo: "60/40", telefone: "", email: "", obs: "" }); setShowNewAssoc(false); };
  const updateAssociate = (idx, field, value) => { const a = associados[idx]; if (a) salvarAssociado({ ...a, [field]: value }); };

  const fmt = (v) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

  const statusColors = {
    "VAGA ABERTA": { bg: "#FFCDD2", tc: "#B71C1C" },
    "EM PROSPECÇÃO": { bg: "#FFF9C4", tc: "#F57F17" },
    "EM SELEÇÃO": { bg: "#FFE0B2", tc: "#E65100" },
    "CONTRATAÇÃO": { bg: "#E3F2FD", tc: "#1565C0" },
    "ATIVO": { bg: "#E8F5E9", tc: "#2E7D32" },
    "ONBOARDING": { bg: "#F3E5F5", tc: "#6A1B9A" },
    "INATIVO": { bg: "#ECEFF1", tc: "#546E7A" },
  };

  return (
    <div>
      {/* CADASTRO DE ASSOCIADOS */}
      <Card title="Cadastro de Profissionais Associados">
        <div style={{ fontSize: 11, color: "#999", marginBottom: 14 }}>
          Registro de todos os associados (ativos, em prospecção e vagas). CEO atualiza status. Sylmara mantém dados contratuais.
        </div>

        {associates.map((a, idx) => (
          <div key={idx} style={{
            background: a.status === "ATIVO" ? "#FAFFF8" : "white",
            border: `1px solid ${a.status === "ATIVO" ? "#C8E6C9" : "#E8E4DE"}`,
            borderRadius: 10, padding: "16px 18px", marginBottom: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%",
                background: a.status === "ATIVO" ? "#4CAF50" : a.status === "VAGA ABERTA" ? "#EF5350" : GOLD,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: "white",
              }}>{a.nome ? a.nome[0].toUpperCase() : "?"}</div>
              <div style={{ flex: 1 }}>
                <input value={a.nome} onChange={e => updateAssociate(idx, "nome", e.target.value)}
                  placeholder="Nome do profissional"
                  style={{ width: "100%", border: "none", fontSize: 15, fontWeight: 700, fontFamily: "inherit", outline: "none", background: "transparent", padding: 0, boxSizing: "border-box" }} />
              </div>
              <select value={a.status} onChange={e => updateAssociate(idx, "status", e.target.value)}
                style={{ padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "inherit",
                  border: "none", cursor: "pointer",
                  background: (statusColors[a.status] || statusColors["EM PROSPECÇÃO"]).bg,
                  color: (statusColors[a.status] || statusColors["EM PROSPECÇÃO"]).tc,
                }}>
                {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "ESPECIALIDADE", field: "especialidade", placeholder: "Nutrologia, Dermatologia..." },
                { label: "CRM / CRO", field: "crm", placeholder: "CRM-SP 000000" },
                { label: "DIAS NA CLÍNICA", field: "dias", placeholder: "Qua e Sex" },
                { label: "SALA PRINCIPAL", field: "sala", placeholder: "Sala Associados" },
                { label: "MODELO SPLIT", field: "splitModelo", placeholder: "60/40" },
                { label: "CONTRATO ATÉ", field: "contrato", placeholder: "Dez/2026" },
                { label: "TELEFONE", field: "telefone", placeholder: "(11) 99999-0000" },
                { label: "E-MAIL", field: "email", placeholder: "dr@email.com" },
              ].map((f, fi) => (
                <div key={fi}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em", marginBottom: 2 }}>{f.label}</div>
                  <input value={a[f.field]} onChange={e => updateAssociate(idx, f.field, e.target.value)}
                    placeholder={f.placeholder}
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid #eee", borderRadius: 6, fontSize: 12,
                      fontFamily: "inherit", outline: "none", background: "#FAFAF8", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em", marginBottom: 2 }}>OBSERVAÇÕES</div>
              <input value={a.obs} onChange={e => updateAssociate(idx, "obs", e.target.value)}
                placeholder="Notas, especialidades específicas, red flags..."
                style={{ width: "100%", padding: "6px 8px", border: "1px solid #eee", borderRadius: 6, fontSize: 12,
                  fontFamily: "inherit", outline: "none", background: "#FAFAF8", boxSizing: "border-box" }} />
            </div>
          </div>
        ))}

        {/* ADD NEW */}
        {!showNewAssoc ? (
          <button onClick={() => setShowNewAssoc(true)} style={{
            width: "100%", padding: "12px", background: "white", border: `2px dashed ${GOLD}`,
            borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
            color: GOLD, fontFamily: "inherit",
          }}>+ Cadastrar novo associado</button>
        ) : (
          <div style={{ border: `1px solid ${GOLD}`, borderRadius: 10, padding: "16px 18px", background: LIGHT }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 10 }}>NOVO ASSOCIADO</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>NOME</div>
                <input value={newAssoc.nome} onChange={e => setNewAssoc({...newAssoc, nome: e.target.value})}
                  placeholder="Dr(a). Nome Completo"
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>ESPECIALIDADE</div>
                <select value={newAssoc.especialidade} onChange={e => setNewAssoc({...newAssoc, especialidade: e.target.value})}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                  <option value="">Selecione...</option>
                  {["Nutrologia","Dermatologia","Cirurgia Plástica","Endocrinologia","Medicina Estética","Odontologia","Fisioterapia Dermatofuncional","Outro"].map(e =>
                    <option key={e} value={e}>{e}</option>
                  )}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>CRM / CRO</div>
                <input value={newAssoc.crm} onChange={e => setNewAssoc({...newAssoc, crm: e.target.value})}
                  placeholder="CRM-SP 000000"
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addAssociate} style={{
                padding: "8px 20px", background: newAssoc.nome && newAssoc.especialidade ? GOLD : "#ddd",
                color: "white", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12,
                cursor: newAssoc.nome && newAssoc.especialidade ? "pointer" : "default", fontFamily: "inherit",
              }}>Cadastrar</button>
              <button onClick={() => setShowNewAssoc(false)} style={{
                padding: "8px 14px", background: "white", color: "#888", border: "1px solid #ddd",
                borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              }}>Cancelar</button>
            </div>
          </div>
        )}

        <div style={{ fontSize: 11, color: "#999", marginTop: 12, lineHeight: 1.6 }}>
          Pipeline: VAGA ABERTA → EM PROSPECÇÃO → EM SELEÇÃO → CONTRATAÇÃO → ONBOARDING → ATIVO.
          CEO define necessidade. Lara valida técnica. Luciano Gebara redige contrato. Unanimidade pra ativar.
        </div>
      </Card>

      <Card title="Tabela de Splits — Regras de Divisão" accent>
        <SplitRow label="ORIGEM DO PACIENTE" assoc="ASSOCIADO" levvai="LEVVAI" />
        <SplitRow label="Captado pelo Levvai (IG, site, indicação)" assoc="60%" levvai="40%" />
        <SplitRow label="Paciente próprio do associado" assoc="70%" levvai="30%" />
        <SplitRow label="Insumo fornecido pelo Levvai" assoc="55%" levvai="45%" />
        <SplitRow label="Cross-sell (Lara indica)" assoc="60%" levvai="40%" />
        <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
          Regra: Insumo Levvai (S) = 55/45 prevalece sobre origem. Fechamento dia 5, pagamento dia 10 mediante NF.
        </div>
      </Card>

      <Card title="Simulador de Repasse — Registro de Atendimentos">
        <div style={{ fontSize: 11, color: "#999", marginBottom: 12 }}>
          Exemplo com dados fictícios. Na planilha real (aba Repasse Associados), Sylmara preenche os dados azuis e as fórmulas calculam automaticamente.
        </div>

        {/* TABLE HEADER */}
        <div style={{ display: "flex", background: DARK, borderRadius: "8px 8px 0 0", padding: "10px 0" }}>
          {[
            { label: "ASSOCIADO", flex: 1.5 },
            { label: "PACIENTE", flex: 1.2 },
            { label: "ORIGEM", flex: 0.8 },
            { label: "PROCEDIMENTO", flex: 1.5 },
            { label: "VALOR", flex: 0.7 },
            { label: "INSUMO LV?", flex: 0.6 },
            { label: "% ASSOC", flex: 0.5 },
            { label: "% LEVVAI", flex: 0.5 },
            { label: "REPASSE", flex: 0.8 },
            { label: "LEVVAI", flex: 0.8 },
          ].map((h, i) => (
            <div key={i} style={{ flex: h.flex, textAlign: "center", fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em", padding: "0 4px" }}>
              {h.label}
            </div>
          ))}
        </div>

        {/* TABLE ROWS */}
        {entries.map((e, i) => {
          const s = getSplit(e.origem, e.insumo);
          return (
            <div key={i} style={{
              display: "flex", padding: "8px 0", alignItems: "center",
              borderBottom: "1px solid #f0ece6",
              background: i % 2 === 0 ? "white" : "#FAFAF8",
            }}>
              <div style={{ flex: 1.5, fontSize: 12, fontWeight: 600, padding: "0 4px" }}>{e.associado}</div>
              <div style={{ flex: 1.2, fontSize: 12, padding: "0 4px" }}>{e.paciente}</div>
              <div style={{ flex: 0.8, textAlign: "center" }}>
                <Badge text={e.origem}
                  color={e.origem === "LEVVAI" ? "#E3F2FD" : e.origem === "PROPRIO" ? "#F3E5F5" : "#FFF3E0"}
                  textColor={e.origem === "LEVVAI" ? "#1565C0" : e.origem === "PROPRIO" ? "#6A1B9A" : "#E65100"} />
              </div>
              <div style={{ flex: 1.5, fontSize: 12, padding: "0 4px" }}>{e.procedimento}</div>
              <div style={{ flex: 0.7, textAlign: "center", fontSize: 12, fontWeight: 600 }}>{fmt(e.valor)}</div>
              <div style={{ flex: 0.6, textAlign: "center" }}>
                <Badge text={e.insumo ? "SIM" : "NÃO"} color={e.insumo ? "#FFF9C4" : "#F5F5F5"} textColor={e.insumo ? "#F57F17" : "#999"} />
              </div>
              <div style={{ flex: 0.5, textAlign: "center", fontSize: 12, fontWeight: 700, color: "#6A1B9A" }}>{Math.round(s.assoc * 100)}%</div>
              <div style={{ flex: 0.5, textAlign: "center", fontSize: 12, fontWeight: 700, color: "#2E7D32" }}>{Math.round(s.levvai * 100)}%</div>
              <div style={{ flex: 0.8, textAlign: "center", fontSize: 12, fontWeight: 700, color: "#6A1B9A", background: "#F3E5F5", borderRadius: 4, padding: "2px 6px", margin: "0 2px" }}>
                {fmt(Math.round(e.valor * s.assoc))}
              </div>
              <div style={{ flex: 0.8, textAlign: "center", fontSize: 12, fontWeight: 700, color: "#2E7D32", background: "#E8F5E9", borderRadius: 4, padding: "2px 6px", margin: "0 2px" }}>
                {fmt(Math.round(e.valor * s.levvai))}
              </div>
            </div>
          );
        })}

        {/* TOTAL ROW */}
        <div style={{ display: "flex", padding: "12px 0", background: LIGHT, borderRadius: "0 0 8px 8px", marginTop: 1 }}>
          <div style={{ flex: 5, fontSize: 13, fontWeight: 800, paddingLeft: 8, color: DARK }}>TOTAL MÊS</div>
          <div style={{ flex: 0.7, textAlign: "center", fontSize: 13, fontWeight: 800 }}>{fmt(totals.bruto)}</div>
          <div style={{ flex: 1.1 }} />
          <div style={{ flex: 0.5 }} />
          <div style={{ flex: 0.8, textAlign: "center", fontSize: 13, fontWeight: 800, color: "#6A1B9A" }}>{fmt(Math.round(totals.assoc))}</div>
          <div style={{ flex: 0.8, textAlign: "center", fontSize: 13, fontWeight: 800, color: "#2E7D32" }}>{fmt(Math.round(totals.levvai))}</div>
        </div>
      </Card>

      {/* RESUMO POR ASSOCIADO */}
      <Card title="Resumo Mensal por Associado">
        <div style={{ display: "flex", background: DARK, borderRadius: "8px 8px 0 0", padding: "10px 0" }}>
          {["ASSOCIADO", "ATENDIMENTOS", "FAT. BRUTO", "REPASSE ASSOCIADO", "RECEITA LEVVAI", "SPLIT MÉDIO", "NF", "PAGO"].map((h, i) => (
            <div key={i} style={{ flex: i === 0 ? 1.5 : 1, textAlign: "center", fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em" }}>{h}</div>
          ))}
        </div>
        {Object.entries(byAssoc).map(([name, data], i) => (
          <div key={i} style={{ display: "flex", padding: "10px 0", borderBottom: "1px solid #f0ece6", alignItems: "center" }}>
            <div style={{ flex: 1.5, fontSize: 13, fontWeight: 600, paddingLeft: 8 }}>{name}</div>
            <div style={{ flex: 1, textAlign: "center", fontSize: 13 }}>{data.count}</div>
            <div style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 600 }}>{fmt(data.bruto)}</div>
            <div style={{ flex: 1, textAlign: "center" }}><Badge text={fmt(Math.round(data.assoc))} color="#F3E5F5" textColor="#6A1B9A" /></div>
            <div style={{ flex: 1, textAlign: "center" }}><Badge text={fmt(Math.round(data.levvai))} color="#E8F5E9" textColor="#2E7D32" /></div>
            <div style={{ flex: 1, textAlign: "center", fontSize: 12 }}>{Math.round(data.assoc / data.bruto * 100)}/{Math.round(data.levvai / data.bruto * 100)}</div>
            <div style={{ flex: 1, textAlign: "center" }}><Badge text="PENDENTE" color="#FFF9C4" textColor="#F57F17" /></div>
            <div style={{ flex: 1, textAlign: "center" }}><Badge text="—" color="#F5F5F5" textColor="#999" /></div>
          </div>
        ))}
        <div style={{ display: "flex", padding: "12px 0", background: GOLD, borderRadius: "0 0 8px 8px" }}>
          <div style={{ flex: 1.5, fontSize: 13, fontWeight: 800, color: "white", paddingLeft: 8 }}>TOTAL</div>
          <div style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 800, color: "white" }}>{entries.length}</div>
          <div style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 800, color: "white" }}>{fmt(totals.bruto)}</div>
          <div style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 800, color: "white" }}>{fmt(Math.round(totals.assoc))}</div>
          <div style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 800, color: "white" }}>{fmt(Math.round(totals.levvai))}</div>
          <div style={{ flex: 3 }} />
        </div>
        <div style={{ fontSize: 11, color: "#999", marginTop: 10, lineHeight: 1.6 }}>
          Fechamento: Sylmara até dia 5  →  Pagamento: até dia 10 mediante NF  →  Relatório para DRE (linha "Split associados")
        </div>
      </Card>

      {/* VAGAS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="Vaga 1: Nutrólogo (PRIORIDADE)">
          <div style={{ fontSize: 12, color: "#E65100", fontWeight: 600, marginBottom: 8 }}>Resolve: prescrição de Tirzepatida + protocolo Levvai Slim</div>
          {["CRM-SP ativo + RQE Nutrologia", "Experiência com Tirzepatida/Semaglutida", "Abordagem baseada em evidência", "Disponibilidade mín. 2 dias/semana", "Aceitar participar de conteúdo IG"].map((r, i) =>
            <div key={i} style={{ fontSize: 12, color: "#555", padding: "3px 0" }}>› {r}</div>
          )}
        </Card>
        <Card title="Vaga 2: Dermatologista">
          <div style={{ fontSize: 12, color: "#1565C0", fontWeight: 600, marginBottom: 8 }}>Resolve: protocolos de pele + recorrência mensal</div>
          {["CRM-SP ativo + RQE Dermatologia", "Domínio de bioestimuladores e skinboosters", "Experiência em estética (não só clínica)", "Entender que marca Levvai é institucional", "Disposição para colaborar com conteúdo"].map((r, i) =>
            <div key={i} style={{ fontSize: 12, color: "#555", padding: "3px 0" }}>› {r}</div>
          )}
        </Card>
      </div>

      <Card title="Processo de Seleção e Onboarding">
        {[
          { phase: "PROSPECÇÃO", time: "Sem 1-2", desc: "LinkedIn, rede da Lara, IG, grupos WhatsApp" },
          { phase: "SELEÇÃO", time: "Sem 3-4", desc: "Entrevista 1 (CEO: fit cultural) + Entrevista 2 (Lara: competência técnica). Unanimidade." },
          { phase: "CONTRATAÇÃO", time: "Sem 5", desc: "Briefing → Luciano Gebara redige contrato → assinatura" },
          { phase: "ONBOARDING", time: "Sem 6+", desc: "Tour dia 1, alinhamento protocolos, primeiro atendimento acompanhado, review dia 30 e 90" },
        ].map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #f0ece6" }}>
            <Badge text={p.phase} color={LIGHT} textColor={GOLD} />
            <div style={{ fontSize: 11, color: "#999", minWidth: 60 }}>{p.time}</div>
            <div style={{ fontSize: 13, flex: 1 }}>{p.desc}</div>
          </div>
        ))}
      </Card>

      <Card title="Termos Financeiros">
        {[
          ["Fechamento mensal", "Até dia 5. Sylmara envia relatório detalhado com atendimentos, origem e split."],
          ["Pagamento", "Até dia 10 via transferência, mediante NF emitida pelo associado."],
          ["Mínimo garantido", "Não há. Modelo 100% variável. Risco compartilhado."],
          ["Reajuste de split", "Revisão semestral ou quando fat. associado > R$30K/mês no Levvai."],
          ["Aviso prévio", "60 dias por qualquer parte. Pacientes em tratamento devem ser concluídos."],
          ["Não-captação", "12 meses após saída. Não pode captar pacientes do Levvai."],
        ].map(([label, desc], i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #f0ece6" }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: GOLD, minWidth: 130 }}>{label}</div>
            <div style={{ fontSize: 13, flex: 1, color: "#555" }}>{desc}</div>
          </div>
        ))}
      </Card>
    </div>
  );
};

// COMPLIANCE TAB
const ComplianceTab = () => (
  <div>
    <Card title="Matriz de Responsabilidades — Jurídico & Regulatório" accent>
      <div style={{ fontSize: 13, lineHeight: 1.8 }}>
        <div><span style={{ color: GOLD, fontWeight: 700 }}>Técnico-Regulatória:</span> LARA → supervisão CEO → escalonamento Luciano Gebara</div>
        <div><span style={{ color: GOLD, fontWeight: 700 }}>Administrativa-Legal:</span> SYLMARA → supervisão CEO → escalonamento Luciano Gebara</div>
        <div><span style={{ color: GOLD, fontWeight: 700 }}>Estratégico-Societária:</span> CEO (IKE) → Board (Rich) → Luciano Gebara</div>
      </div>
    </Card>
    <Card title="Alertas Prioritários — Resolver imediatamente">
      {[
        { item: "Habilitação para Tirzepatida", risk: "Exercício ilegal de medicina. Pode fechar a clínica.", who: "Lara + CEO → Luciano", level: "CRÍTICO", color: "#FFCDD2" },
        { item: "Termo de Uso de Imagem padronizado", risk: "Processo por uso indevido. Bloqueia SM.", who: "CEO → Luciano", level: "CRÍTICO", color: "#FFCDD2" },
        { item: "Vínculos trabalhistas (Sirlândia, SM)", risk: "Ação trabalhista futura.", who: "Sylmara + CEO → Luciano", level: "CRÍTICO", color: "#FFCDD2" },
        { item: "Seguro RC Profissional", risk: "Lara responde com patrimônio pessoal.", who: "Sylmara cota, CEO aprova", level: "ALTO", color: "#FFE0B2" },
        { item: "LGPD — Política de Privacidade", risk: "Multa ANPD + exposição reputacional.", who: "CEO → Luciano", level: "ALTO", color: "#FFE0B2" },
        { item: "Alvará Sanitário / COVISA", risk: "Interdição em fiscalização surpresa.", who: "Lara + Sylmara", level: "ALTO", color: "#FFE0B2" },
        { item: "Formalizar Ike como CEO", risk: "Sem poder legal para assinar.", who: "CEO → Luciano", level: "ALTO", color: "#FFE0B2" },
      ].map((a, i) => (
        <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid #f0ece6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge text={a.level} color={a.color} textColor="#B71C1C" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>{a.item}</span>
          </div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Risco: {a.risk}</div>
          <div style={{ fontSize: 12, color: GOLD, marginTop: 2 }}>Responsável: {a.who}</div>
        </div>
      ))}
    </Card>
  </div>
);

// BRAND TAB
const BrandTab = () => (
  <div>
    <Card title="3 Opções de Posicionamento — Para Lara Validar" accent>
      <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>
        Essência identificada: resultado natural + ciência + experiência premium.
        ICP: Mulher 30-50, executiva, classe A/B, quer praticidade e resultado.
      </p>
    </Card>
    {[
      { letter: "A", name: "Quiet Confidence", tagline: "Resultados que falam por você.", color: "#E8EAF6", desc: "Tom sofisticado, contido. A beleza que ninguém percebe. Menos é mais. Referência: GTC/Taiz Campbell.", manifesto: "Existem lugares que prometem te transformar. O Levvai promete te revelar. Aqui, a ciência trabalha em silêncio.", rec: true },
      { letter: "B", name: "Sci-Beauty", tagline: "Ciência e precisão a serviço da sua beleza natural.", color: "#E0F2F1", desc: "Tom autoritário com empatia. Educa antes de vender. Referência: Ritha Capelato.", manifesto: "Beleza não é achismo. É ciência. Cada milímetro importa. Cada protocolo tem fundamento. Cada produto tem evidência." },
      { letter: "C", name: "Your Best Version", tagline: "A melhor versão de você começa aqui.", color: "#FFF3E0", desc: "Tom acolhedor, empoderador. Histórias reais. Referência: Giovana Falbo/Glossier.", manifesto: "Você já é bonita. A gente só cuida do que o tempo e a rotina tiraram. Sem exagero. Sem pressão. Só você, elevada." },
    ].map((o, i) => (
      <div key={i} style={{ background: "white", borderRadius: 12, overflow: "hidden", border: "1px solid #E8E4DE", marginBottom: 12 }}>
        <div style={{ background: o.color, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800 }}>{o.letter}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{o.name} {o.rec && <Badge text="RECOMENDADA" color={GOLD} textColor="white" />}</div>
            <div style={{ fontSize: 13, color: "#666", fontStyle: "italic" }}>"{o.tagline}"</div>
          </div>
        </div>
        <div style={{ padding: "16px 24px" }}>
          <div style={{ fontSize: 13, color: "#777", marginBottom: 10 }}>{o.desc}</div>
          <div style={{ background: LIGHT, borderRadius: 8, padding: 14, fontSize: 14, lineHeight: 1.8, color: "#444", fontStyle: "italic" }}>
            {o.manifesto}
          </div>
        </div>
      </div>
    ))}
  </div>
);

// RITUALS TAB
const RitualsTab = () => (
  <div>
    <Card title="Calendário Mensal de Rituais">
      {[
        { when: "Toda segunda até 18h", what: "Sylmara envia Dashboard Weekly", who: "Sylmara", dur: "30min", color: "#E1BEE7" },
        { when: "Toda segunda até 10h", what: "Sirlândia envia agenda\nsemanal de todos os profissionais", who: "Sirlândia", dur: "15min", color: "#B3E5FC" },
        { when: "Diário até 8:45h", what: "Sirlândia envia lista\nde manutenção do dia", who: "Sirlândia", dur: "10min", color: "#B3E5FC" },
        { when: "Toda terça 9h-10:30h", what: "LEVVAI WEEKLY", who: "Todos", dur: "60-90min", color: "#FFF9C4" },
        { when: "Toda sexta 16h", what: "1:1 Lara × Gi", who: "Lara + Gi", dur: "20min", color: "#F8BBD0" },
        { when: "Toda sexta até 18h", what: "Gi envia métricas IG para CEO", who: "Gi", dur: "15min", color: "#C8E6C9" },
        { when: "Dia 1 e 15", what: "Check-in de Estoque", who: "Sylmara", dur: "15min", color: "#E1BEE7" },
        { when: "Até dia 5", what: "Fechamento DRE + Repasse Associados", who: "Sylmara", dur: "3h", color: "#E1BEE7" },
        { when: "1º sábado", what: "Board Mensal CEO + Rich", who: "Ike + Rich", dur: "60min", color: "#C8A96E" },
        { when: "3º sábado", what: "LEVVAI DAY (mini-evento)", who: "Lara + Sirlândia + Gi", dur: "4-6h", color: "#FFE0B2" },
      ].map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #f0ece6", alignItems: "center" }}>
          <div style={{ background: r.color, borderRadius: 6, padding: "6px 10px", minWidth: 130, textAlign: "center", fontSize: 11, fontWeight: 700 }}>{r.when}</div>
          <div style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{r.what}</div>
          <div style={{ fontSize: 11, color: "#999", minWidth: 80 }}>{r.who}</div>
          <Badge text={r.dur} />
        </div>
      ))}
    </Card>
    <Card title="Levvai Day — Mini-Evento Mensal">
      <div style={{ background: "#FFE0B2", borderRadius: 8, padding: 16, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Conceito</div>
        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
          Um sábado por mês (3º sábado) com tema rotativo. Manhã: 3-5 pacientes com condição especial.
          Tarde: open house com drink, tour e avaliação express gratuita. Gi cobre tudo em tempo real.
        </div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 8 }}>TEMAS ROTATIVOS</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {["Levvai Glow Day", "Levvai Lips Day", "Levvai Slim Day", "Skin Day", "Levvai Lift Day", "Exosome Day"].map((t, i) =>
          <Badge key={i} text={t} color={LIGHT} textColor={GOLD} />
        )}
      </div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 12 }}>
        Investimento: R$500-1.500/evento | ROI: 3-5 novos pacientes + 10-15 conteúdos
      </div>
    </Card>
    <Card title="Cadência Trimestral e Anual">
      {[
        { when: "Fim do trimestre", items: ["Review de OKRs (scoring + próximo ciclo)", "Check compliance regulatório", "Revisão de precificação", "Revisão descritivo de cargos"] },
        { when: "Janeiro (anual)", items: ["Planejamento estratégico anual (off-site)", "Revisão jurídica com Luciano Gebara", "Avaliação anual de associados"] },
      ].map((c, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <Badge text={c.when} color={i === 0 ? "#E8F5E9" : GOLD} textColor={i === 0 ? "#2E7D32" : "white"} />
          {c.items.map((item, j) => (
            <div key={j} style={{ fontSize: 13, color: "#555", padding: "4px 0 4px 16px" }}>› {item}</div>
          ))}
        </div>
      ))}
    </Card>
  </div>
);

// DOCS TAB
const CARGOS = [
  'CEO — Admin Master',
  'Dir. Clínica',
  'Ger. Operacional',
  'Administradora',
  'Social Media',
  'Conselheiro',
  'Associado',
  'Visualizador',
];

const CARGO_COLORS = {
  'CEO — Admin Master': '#C8A96E',
  'Dir. Clínica': '#E91E63',
  'Ger. Operacional': '#039BE5',
  'Administradora': '#7B1FA2',
  'Social Media': '#43A047',
  'Conselheiro': '#78909C',
  'Associado': '#FF9800',
  'Visualizador': '#607D8B',
};

const UsuariosTab = ({ shared }) => {
  const currentUserEmail = shared?.currentUserEmail || '';
  const isAdminMaster = ADMIN_MASTER_EMAILS.includes(currentUserEmail);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');

  // Novo usuário
  const [newEmail, setNewEmail] = useState('');
  const [newNome, setNewNome] = useState('');
  const [newCargo, setNewCargo] = useState('Visualizador');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // Edição
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCargo, setEditCargo] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editFoto, setEditFoto] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    const res = await authenticatedFetch('/api/admin-users');
    const data = await res.json();
    const normalized = (data.users || []).map(u => {
      if (ADMIN_MASTER_EMAILS.includes(u.email) && u.user_metadata?.cargo !== 'CEO — Admin Master') {
        return { ...u, user_metadata: { ...u.user_metadata, cargo: 'CEO — Admin Master' } };
      }
      return u;
    });
    setUsers(normalized);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const openUser = (u) => {
    setSelectedUser(u);
    setEditNome(u.user_metadata?.nome || '');
    setEditEmail(u.email || '');
    setEditCargo(ADMIN_MASTER_EMAILS.includes(u.email) ? 'CEO — Admin Master' : (u.user_metadata?.cargo || 'Visualizador'));
    setEditFoto(u.user_metadata?.foto || '');
    setEditPassword('');
    setEditMsg('');
  };

  const handleFotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditFoto(reader.result);
    reader.readAsDataURL(file);
  };

  const saveEdit = async () => {
    if (!selectedUser) return;
    setEditSaving(true);
    setEditMsg('');
    const body = {
      userId: selectedUser.id,
      nome: editNome,
      cargo: ADMIN_MASTER_EMAILS.includes(selectedUser.email) ? 'CEO — Admin Master' : editCargo,
      foto: editFoto,
    };
    if (isAdminMaster && editPassword) body.password = editPassword;
    if (isAdminMaster && editEmail && editEmail !== selectedUser.email) body.email = editEmail;
    const res = await authenticatedFetch('/api/admin-users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error) {
      setEditMsg(`Erro: ${data.error}`);
    } else {
      setEditMsg('Salvo com sucesso!');
      loadUsers();
      setSelectedUser({
        ...selectedUser,
        email: editEmail || selectedUser.email,
        user_metadata: { nome: editNome, cargo: body.cargo, foto: editFoto },
      });
    }
    setEditSaving(false);
  };

  const createUser = async () => {
    if (!newEmail || !newPassword || !newNome) return;
    setSaving(true);
    setMsg('');
    const res = await authenticatedFetch('/api/admin-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail.trim(), password: newPassword, nome: newNome, cargo: newCargo }),
    });
    const data = await res.json();
    if (data.error) {
      setMsg(`Erro: ${data.error}`);
    } else {
      setMsg('Usuário criado com sucesso!');
      setNewEmail(''); setNewNome(''); setNewPassword(''); setNewCargo('Visualizador');
      setShowForm(false);
      loadUsers();
    }
    setSaving(false);
  };

  const deleteUser = async (userId, email) => {
    if (!confirm(`Remover acesso de ${email}?`)) return;
    const res = await authenticatedFetch('/api/admin-users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (!res.ok) { setMsg(`Erro: ${data.error || 'Não foi possível remover o acesso.'}`); return; }
    if (selectedUser?.id === userId) setSelectedUser(null);
    loadUsers();
  };

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {/* LISTA */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Card title="Gestão de Usuários — Acesso ao Portal" accent>
          <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>
            Clique num usuário para ver detalhes e editar.
            {isAdminMaster
              ? ' Você tem acesso de Admin Master — pode editar tudo.'
              : ' Apenas Admin Masters podem resetar senhas e editar e-mails.'}
          </p>
        </Card>

        <Card title={`Usuários com acesso (${users.length})`}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>Carregando...</div>
          ) : (
            <>
              <div style={{ display: 'flex', padding: '6px 0', borderBottom: `2px solid ${GOLD}`, marginBottom: 4 }}>
                <div style={{ flex: 0.5, fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: '0.05em' }}></div>
                <div style={{ flex: 2, fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: '0.05em' }}>NOME</div>
                <div style={{ flex: 2.5, fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: '0.05em' }}>E-MAIL</div>
                <div style={{ flex: 1.5, fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: '0.05em' }}>CARGO</div>
                <div style={{ flex: 1, fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: '0.05em' }}>STATUS</div>
              </div>

              {users.map((u, i) => {
                const nome = u.user_metadata?.nome || u.email.split('@')[0];
                const cargo = ADMIN_MASTER_EMAILS.includes(u.email) ? 'CEO — Admin Master' : (u.user_metadata?.cargo || '—');
                const color = CARGO_COLORS[cargo] || '#888';
                const foto = u.user_metadata?.foto;
                const isSelected = selectedUser?.id === u.id;

                return (
                  <div key={i} onClick={() => openUser(u)} style={{
                    display: 'flex', alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid #f0ece6',
                    cursor: 'pointer',
                    background: isSelected ? '#FFF9EE' : 'transparent',
                    borderLeft: isSelected ? `3px solid ${GOLD}` : '3px solid transparent',
                    paddingLeft: isSelected ? 6 : 0,
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ flex: 0.5 }}>
                      {foto ? (
                        <img src={foto} alt={nome} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', background: color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 800, color: 'white',
                        }}>{nome[0].toUpperCase()}</div>
                      )}
                    </div>
                    <div style={{ flex: 2, fontSize: 13, fontWeight: 700, color: DARK }}>{nome}</div>
                    <div style={{ flex: 2.5, fontSize: 12, color: '#666' }}>{u.email}</div>
                    <div style={{ flex: 1.5 }}>
                      <Badge text={cargo} color={`${color}20`} textColor={color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Badge
                        text={u.email_confirmed_at ? 'ATIVO' : 'PENDENTE'}
                        color={u.email_confirmed_at ? '#E8F5E9' : '#FFF9C4'}
                        textColor={u.email_confirmed_at ? '#2E7D32' : '#F57F17'}
                      />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </Card>

        {isAdminMaster && (
          <Card title="Adicionar Novo Usuário">
            {!showForm ? (
              <button onClick={() => setShowForm(true)} style={{
                width: '100%', padding: '12px', background: 'white',
                border: `2px dashed ${GOLD}`, borderRadius: 10, cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: GOLD, fontFamily: 'inherit',
              }}>+ Adicionar usuário</button>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 }}>NOME</div>
                    <input value={newNome} onChange={e => setNewNome(e.target.value)} placeholder="Nome completo"
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 }}>E-MAIL</div>
                    <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@levvai.com.br" type="email"
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 }}>CARGO</div>
                    <select value={newCargo} onChange={e => setNewCargo(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', background: 'white', boxSizing: 'border-box' }}>
                      {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 }}>SENHA INICIAL</div>
                    <input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" type="password"
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
                {msg && <div style={{ fontSize: 12, color: msg.startsWith('Erro') ? '#B71C1C' : '#2E7D32', marginBottom: 8 }}>{msg}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={createUser} disabled={saving} style={{
                    padding: '8px 24px', background: newEmail && newPassword && newNome ? GOLD : '#ddd',
                    color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  }}>{saving ? 'Criando...' : 'Criar usuário'}</button>
                  <button onClick={() => { setShowForm(false); setMsg(''); }} style={{
                    padding: '8px 16px', background: 'white', color: '#888', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  }}>Cancelar</button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* PAINEL LATERAL */}
      {selectedUser && (
        <div style={{ width: 320, flexShrink: 0 }}>
          <Card title="Detalhes do Usuário">
            {/* FOTO / AVATAR */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                {editFoto ? (
                  <img src={editFoto} alt={editNome} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${GOLD}` }} />
                ) : (
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: CARGO_COLORS[editCargo] || '#888',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, fontWeight: 800, color: 'white',
                    border: `3px solid ${GOLD}`,
                  }}>{editNome ? editNome[0].toUpperCase() : selectedUser.email[0].toUpperCase()}</div>
                )}
                {isAdminMaster && (
                  <label style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 22, height: 22, borderRadius: '50%',
                    background: GOLD, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: 'white', border: '2px solid white',
                  }}>
                    ✎
                    <input type="file" accept="image/*" onChange={handleFotoUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: DARK, marginTop: 8 }}>{editNome || selectedUser.email}</div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{selectedUser.email}</div>
              <Badge text={ADMIN_MASTER_EMAILS.includes(selectedUser.email) ? 'CEO — Admin Master' : editCargo}
                color={`${CARGO_COLORS[editCargo] || '#888'}25`} textColor={CARGO_COLORS[editCargo] || '#888'} />
            </div>

            {/* INFO */}
            <div style={{ fontSize: 11, color: '#999', marginBottom: 12, lineHeight: 2, background: LIGHT, borderRadius: 8, padding: '8px 12px' }}>
              <div>Criado: <strong style={{ color: DARK }}>{new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}</strong></div>
              <div>Último acesso: <strong style={{ color: DARK }}>{selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleDateString('pt-BR') : 'Nunca'}</strong></div>
              <div>Status: <Badge text={selectedUser.email_confirmed_at ? 'ATIVO' : 'PENDENTE'} color={selectedUser.email_confirmed_at ? '#E8F5E9' : '#FFF9C4'} textColor={selectedUser.email_confirmed_at ? '#2E7D32' : '#F57F17'} /></div>
            </div>

            {/* EDIÇÃO */}
            <div style={{ borderTop: '1px solid #f0ece6', paddingTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: '0.05em', marginBottom: 10 }}>EDITAR</div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 }}>NOME</div>
                <input value={editNome} onChange={e => setEditNome(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {isAdminMaster && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 }}>E-MAIL</div>
                  <input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email"
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              )}

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 }}>CARGO</div>
                {ADMIN_MASTER_EMAILS.includes(selectedUser.email) ? (
                  <div style={{ padding: '7px 10px', background: LIGHT, borderRadius: 6, fontSize: 12, color: GOLD, fontWeight: 700 }}>
                    CEO — Admin Master (fixo)
                  </div>
                ) : (
                  <select value={editCargo} onChange={e => setEditCargo(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: 'white', boxSizing: 'border-box' }}>
                    {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </div>

              {isAdminMaster ? (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 }}>NOVA SENHA</div>
                  <input value={editPassword} onChange={e => setEditPassword(e.target.value)}
                    type="password" placeholder="Deixe em branco pra manter"
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ) : (
                <div style={{ marginBottom: 12, background: '#FFF9C4', borderRadius: 6, padding: '8px 10px', fontSize: 11, color: '#F57F17' }}>
                  🔒 Reset de senha disponível apenas para Admin Masters
                </div>
              )}

              {editMsg && <div style={{ fontSize: 11, color: editMsg.startsWith('Erro') ? '#B71C1C' : '#2E7D32', marginBottom: 8 }}>{editMsg}</div>}

              <button onClick={saveEdit} disabled={editSaving} style={{
                width: '100%', padding: '9px', background: GOLD, color: 'white',
                border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: 6,
              }}>{editSaving ? 'Salvando...' : 'Salvar alterações'}</button>

              {isAdminMaster && !ADMIN_MASTER_EMAILS.includes(selectedUser.email) && (
                <button onClick={() => deleteUser(selectedUser.id, selectedUser.email)} style={{
                  width: '100%', padding: '9px', background: 'white', color: '#B71C1C',
                  border: '1px solid #FFCDD2', borderRadius: 8, fontWeight: 600, fontSize: 12,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Remover acesso</button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const DocsTab = () => {
  const [viewMode, setViewMode] = useState("all");

  const sections = [
    { sector: "ARQUIVOS PARA DOWNLOAD", color: GOLD, docs: [
      { name: "Levvai_Plataforma_Gestao.xlsx", desc: "Plataforma financeira — 7 abas: Dashboard Weekly, DRE Mensal, KPI Tracker, Pauta Weekly, Repasse Associados, Catálogo Produtos, Rotinas e Rituais. 446 fórmulas.", tag: "XLSX", color: "#E8F5E9" },
      { name: "Levvai_Planejamento_Estrategico_2026.xlsx", desc: "Raio-X do instituto, visão 12 meses (R$20-50K → R$150K), OKRs Q2 sprint 90 dias, sprint semanal 12 semanas, funil financeiro, governança, Quick Wins 48h", tag: "XLSX", color: "#E8F5E9" },
      { name: "Levvai_SWOT_Concorrentes_Pilares_2026.xlsx", desc: "6 concorrentes mapeados (GTC, Giovana Falbo, Ritha, Ritchie, Murilo, Igor), SWOT completa, 8 pilares editoriais", tag: "XLSX", color: "#E8F5E9" },
      { name: "Levvai_Precificacao_Protocolos_2026.xlsx", desc: "14 produtos com custo Levvai, faixa mercado SP premium, preço sugerido, margem bruta, estoque", tag: "XLSX", color: "#E8F5E9" },
      { name: "Levvai_Descritivo_Cargos_v3_Consolidado.docx", desc: "6 cargos: CEO (Ike), Dir. Clínica (Lara), Ger. Operacional (Sirlândia), Administradora (Sylmara), Social Media (Gi), Conselheiro (Rich). Com missão, responsabilidades, KPIs, cadeia de decisão.", tag: "DOCX", color: "#E3F2FD" },
      { name: "Levvai_Checklist_Regulatoria_Compliance.docx", desc: "3 camadas (técnico-regulatória, admin-legal, estratégico-societária) + 7 alertas prioritários + cadência de revisão", tag: "DOCX", color: "#E3F2FD" },
      { name: "Levvai_Programa_Profissionais_Associados.docx", desc: "Critérios seleção nutrólogo + dermato, modelo split (60/40, 70/30, 55/45), 11 cláusulas contrato (briefing Luciano Gebara), processo 4 fases", tag: "DOCX", color: "#E3F2FD" },
      { name: "Levvai_Manifesto_Marca_Opcoes.docx", desc: "3 opções: A (Quiet Confidence), B (Sci-Beauty), C (Your Best Version). Comparativo + recomendação CEO: A com elementos de B. Aguardando validação Lara.", tag: "DOCX", color: "#E3F2FD" },
      { name: "Levvai_Portal_Gestao.jsx", desc: "Portal interativo com 29 abas em 9 setores. React + Vite. Pronto para Vercel.", tag: "JSX", color: "#FFF3E0" },
      { name: "levvai-portal-vercel.zip", desc: "Projeto completo para deploy na Vercel. Inclui package.json, vite.config, README com instruções.", tag: "ZIP", color: "#F3E5F5" },
    ]},
    { sector: "CONTEÚDO DO PORTAL — 29 ABAS EM 9 SETORES", color: "#5D4037", docs: [] },
  ];

  const portalContent = [
    { sector: "ESTRATÉGIA", color: "#C8A96E", items: [
      { tab: "Visão Geral", content: "Métricas principais, portfólio de 14 produtos, 4 protocolos proprietários (Lips, Glow, Slim, Lift), OKRs Q2" },
      { tab: "Planejamento", content: "Visão 12 meses com metas trimestrais, sprint semanal 12 semanas (Fundação→Tração→Aceleração→Revisão), Quick Wins 48h" },
      { tab: "Dashboard CEO", content: "8 métricas executivas, OKRs com scoring, alertas críticos. Visão pra board mensal com Rich" },
    ]},
    { sector: "CULTURA & GOVERNANÇA", color: "#5D4037", items: [
      { tab: "Cultura", content: "Propósito, 6 valores, estrutura de governança, cadeia de decisão (10 tipos), rituais, código de conduta 10 regras, regra de ouro" },
      { tab: "Atas & Ações", content: "Registro de weekly/board com decisões, ações, responsável, prazo, status. Painel de pendências." },
    ]},
    { sector: "FINANCEIRO", color: "#4CAF50", items: [
      { tab: "DRE & Catálogo", content: "DRE 5 blocos (padrão Meet & Eat), catálogo 14 produtos com tipo/categoria/custo/preço/margem/estoque, filtros, resumo" },
      { tab: "Fluxo de Caixa", content: "Entradas/saídas com saldo, registro de movimentações, integrável com Conta Azul via Pluga" },
      { tab: "Orçamento", content: "Simulador interativo: seleciona procedimentos, ajusta quantidade, desconto (max 30%), parcelas, visão interna de margem" },
    ]},
    { sector: "COMERCIAL", color: "#2196F3", items: [
      { tab: "CRM & Leads", content: "Pipeline 7 estágios, base de clientes com busca e ficha completa (CPF, nascimento, e-mail), cadastro, agendamento integrado com Agenda" },
      { tab: "Comunicação", content: "3 canais (WhatsApp, e-mail, telefone), 12 templates, automações por status, régua de tempo por cliente, histórico de disparos" },
      { tab: "Jornada Paciente", content: "10 etapas: Descoberta → Contato → Agendamento → Recepção → Consulta → Procedimento → Pós → Retorno → Fidelização → Embaixadora" },
      { tab: "NPS & Satisfação", content: "Score NPS calculado, registro de feedbacks com nota 0-10, promotores/neutros/detratores, regras de coleta" },
    ]},
    { sector: "MARKETING", color: "#E91E63", items: [
      { tab: "Marca", content: "3 opções de manifesto com tagline, tom de voz, pilares, comparativo. Recomendação: Opção A (Quiet Confidence)" },
      { tab: "ICP", content: "Perfil demográfico e comportamental, persona Mariana (38 anos, executiva), o que quer vs não quer, como usar" },
      { tab: "Editorial", content: "Calendário semanal editável, 8 pilares com cores, distribuição ideal seg-sex, navegação por semanas" },
      { tab: "Dashboard Mkt", content: "CAC, LTV, LTV/CAC, ROI. Tabela por canal (7 canais). Métricas Instagram (6 indicadores)" },
      { tab: "Concorrentes", content: "6 concorrentes com seguidores, localização, diferencial, nível de ameaça. SWOT em 4 quadrantes" },
    ]},
    { sector: "PESSOAS", color: "#9C27B0", items: [
      { tab: "Equipe", content: "Organograma visual, 6 PersonCards com responsabilidades e KPIs, regra de ouro do CEO" },
      { tab: "Associados", content: "Cadastro com pipeline (vaga aberta→ativo), repasse com simulador, split automático por origem, resumo mensal, termos financeiros" },
      { tab: "1:1s", content: "Registro de sessões com tópicos, ações com checkbox, participantes. Lara×Gi toda sexta." },
      { tab: "Avaliação", content: "Avaliação trimestral por KPIs do cargo. 4 membros. Score 1-5. Escala: Excepcional → Crítico" },
    ]},
    { sector: "OPERAÇÃO", color: "#FF9800", items: [
      { tab: "Agenda", content: "4 salas (Lara, Associados, Consultório, Soroterapia), profissionais cadastráveis, calendário com datas reais, simulador de capacidade 3 cenários, Levvai Day" },
      { tab: "Estoque", content: "Registro entrada/saída, posição atual com filtros (OK/ALERTA/REPOR), cadastro de novos produtos, 9 regras de gestão" },
      { tab: "Rotinas", content: "Rotina semanal por pessoa (seg-sáb), calendário mensal 9 rituais, cadência trimestral/anual, conceito Levvai Day" },
      { tab: "Fornecedores", content: "7 fornecedores cadastrados (Allergan, Galderma, Merz, IBSA...), contato, prazo, pagamento, cadastro de novos" },
    ]},
    { sector: "JURÍDICO", color: "#607D8B", items: [
      { tab: "Compliance", content: "Matriz de responsabilidades 3 camadas, 7 alertas prioritários ranqueados (Tirzepatida #1)" },
      { tab: "Termos Paciente", content: "6 documentos: TCLE, Uso de Imagem, LGPD, Anamnese, Tirzepatida, Menores. Prontos para revisão Luciano Gebara" },
      { tab: "Contratos", content: "9 contratos mapeados com status, vencimento, responsável. Alertas automáticos." },
    ]},
  ];

  const pendentes = [
    { item: "Manifesto definitivo — Lara validar opção A, B ou C", status: "AGUARDANDO", priority: "ALTA" },
    { item: "Resolver habilitação Tirzepatida com Luciano Gebara", status: "PENDENTE", priority: "CRÍTICO" },
    { item: "Termo de Uso de Imagem — Luciano redigir versão final", status: "PENDENTE", priority: "CRÍTICO" },
    { item: "Regularizar vínculos trabalhistas (Sirlândia, Gi)", status: "PENDENTE", priority: "ALTO" },
    { item: "Cotar e contratar Seguro RC Profissional", status: "PENDENTE", priority: "ALTO" },
    { item: "Formalizar Ike como administrador no contrato social", status: "PENDENTE", priority: "ALTO" },
    { item: "Implementar CRM (Clinicorp, Dental Office ou similar)", status: "NA FILA", priority: "MÉDIO" },
    { item: "Criar site/landing page do Levvai", status: "NA FILA", priority: "MÉDIO" },
    { item: "Configurar automatizações Pluga (Conta Azul → Sheets)", status: "NA FILA", priority: "MÉDIO" },
    { item: "Criar Google Business Profile completo", status: "QUICK WIN", priority: "FÁCIL" },
  ];

  return (
    <div>
      <Card title="Central de Documentos — Instituto Levvai" accent>
        <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>
          Todos os documentos, arquivos e conteúdos gerados para o Instituto Levvai.
          Portal com 29 abas em 9 setores + 10 arquivos para download + planilha financeira.
        </p>
      </Card>

      {/* ARQUIVOS */}
      <Card title="Arquivos para Download">
        {sections[0].docs.map((d, i) => (
          <div key={i} style={{ background: "white", borderRadius: 10, padding: "14px 18px", marginBottom: 6, border: "1px solid #E8E4DE", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ background: d.color, borderRadius: 6, padding: "6px 10px", fontSize: 10, fontWeight: 800, color: "#333", minWidth: 40, textAlign: "center" }}>{d.tag}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: DARK, fontFamily: "monospace" }}>{d.name}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{d.desc}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* MAPA DO PORTAL */}
      <Card title="Mapa do Portal — 29 Abas em 9 Setores">
        {portalContent.map((s, si) => (
          <div key={si} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: s.color, letterSpacing: "0.05em" }}>{s.sector}</span>
              <span style={{ fontSize: 10, color: "#bbb" }}>{s.items.length} abas</span>
            </div>
            {s.items.map((item, ii) => (
              <div key={ii} style={{ display: "flex", gap: 8, padding: "5px 0 5px 20px", borderBottom: "1px solid #f5f0e8" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: DARK, minWidth: 120 }}>{item.tab}</span>
                <span style={{ fontSize: 11, color: "#888" }}>{item.content}</span>
              </div>
            ))}
          </div>
        ))}
      </Card>

      {/* PENDENTES */}
      <Card title="Pendentes — Ações fora do Portal">
        {pendentes.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f0ece6" }}>
            <Badge text={p.priority} color={p.priority === "CRÍTICO" ? "#FFCDD2" : p.priority === "ALTO" ? "#FFE0B2" : p.priority === "FÁCIL" ? "#E8F5E9" : "#FFF9C4"} textColor={p.priority === "CRÍTICO" ? "#B71C1C" : p.priority === "ALTO" ? "#E65100" : p.priority === "FÁCIL" ? "#2E7D32" : "#F57F17"} />
            <div style={{ flex: 1, fontSize: 13 }}>{p.item}</div>
            <Badge text={p.status} color={p.status === "AGUARDANDO" ? "#E3F2FD" : p.status === "QUICK WIN" ? "#E8F5E9" : LIGHT} textColor="#666" />
          </div>
        ))}
      </Card>

      {/* STATS */}
      <Card title="Números desta Plataforma">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "Abas no Portal", value: "29" },
            { label: "Setores", value: "9" },
            { label: "Linhas de código", value: "4.500+" },
            { label: "Arquivos gerados", value: "10" },
            { label: "Produtos cadastrados", value: "14" },
            { label: "Concorrentes mapeados", value: "6" },
            { label: "Termos jurídicos", value: "6" },
            { label: "Templates mensagem", value: "12" },
            { label: "Cargos descritos", value: "6" },
            { label: "Fórmulas na planilha", value: "446" },
            { label: "KPIs definidos", value: "21" },
            { label: "Regras de conduta", value: "10" },
          ].map((s, i) => (
            <div key={i} style={{ background: LIGHT, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: DARK, fontFamily: "'DM Serif Display', Georgia, serif" }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#999", fontWeight: 600, letterSpacing: "0.03em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// BUDGET TAB
const BudgetTab = () => {
  const [paciente, setPaciente] = useState("");
  const [items, setItems] = useState([]);
  const [desconto, setDesconto] = useState(0);
  const [parcelas, setParcelas] = useState(1);
  const [showMargin, setShowMargin] = useState(false);
  const [products, setProducts] = useState([]);

  const fallbackProducts = [
    { nome: 'Botox Full Face', cat: 'Toxina', custoUn: 620, precoSugerido: 1800, protocolo: 'Aplicação full face' },
    { nome: 'Levvai Lips', cat: 'Preenchedor', custoUn: 690, precoSugerido: 1900, protocolo: 'Preenchimento labial' },
    { nome: 'Levvai Glow', cat: 'Skin Booster', custoUn: 780, precoSugerido: 2200, protocolo: 'Protocolo de revitalização' },
    { nome: 'Levvai Lift', cat: 'Fios', custoUn: 95, precoSugerido: 260, protocolo: 'Valor por fio' },
    { nome: 'Bioestimulador', cat: 'Bioestimulador', custoUn: 920, precoSugerido: 2600, protocolo: 'Sessão de bioestimulação' },
  ];

  useEffect(() => {
    supabase.from('produtos').select('*').eq('ativo', true).order('cat').order('nome')
      .then(({ data }) => {
        if (data?.length) setProducts(data.map(p => ({
          ...p, custoUn: p.custo_un, precoSugerido: p.preco_sugerido, estoqueMin: p.estoque_min,
        })));
        else setProducts(fallbackProducts);
      });
  }, []);

  const addItem = (product) => {
    const existing = items.find(i => i.nome === product.nome);
    if (existing) {
      setItems(items.map(i => i.nome === product.nome ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setItems([...items, { ...product, qty: 1 }]);
    }
  };

  const removeItem = (nome) => setItems(items.filter(i => i.nome !== nome));
  const updateQty = (nome, qty) => setItems(items.map(i => i.nome === nome ? { ...i, qty: Math.max(1, qty) } : i));

  const subtotal = items.reduce((a, i) => a + i.precoSugerido * i.qty, 0);
  const descontoVal = subtotal * (desconto / 100);
  const total = subtotal - descontoVal;
  const valorParcela = parcelas > 0 ? total / parcelas : total;
  const custoTotal = items.reduce((a, i) => a + i.custoUn * i.qty, 0);
  const margemBruta = total - custoTotal;
  const margemPct = total > 0 ? (margemBruta / total) * 100 : 0;

  const fmt = (v) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;

  const catColors = {
    "Toxina": "#E8EAF6", "Preenchedor": "#E0F2F1", "Bioestimulador": "#FFF3E0",
    "Skin Booster": "#F3E5F5", "Capilar": "#FBE9E7", "Revitalização": "#E8F5E9",
    "Fios": "#ECEFF1", "Regeneração": "#FCE4EC", "Autólogo": "#E1F5FE", "Emagrecimento": "#FFF9C4",
  };

  return (
    <div>
      <Card title="Simulador de Orçamento — Instituto Levvai" accent>
        <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>
          Selecione os procedimentos, ajuste quantidade e desconto. Visão do paciente (preço) e visão interna (margem).
        </p>
      </Card>

      {/* DADOS DO PACIENTE */}
      <Card title="Dados do Orçamento">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 200px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>PACIENTE</div>
            <input value={paciente} onChange={e => setPaciente(e.target.value)}
              placeholder="Nome da paciente"
              style={{ width: "100%", padding: "8px 12px", border: `1px solid #ddd`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: "0 0 100px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>DESCONTO %</div>
            <input type="number" value={desconto} onChange={e => setDesconto(Math.min(30, Math.max(0, Number(e.target.value))))}
              min="0" max="30" style={{ width: "100%", padding: "8px 12px", border: `1px solid #ddd`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", textAlign: "center", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div className="discount-simulator">
            <div className="discount-simulator-top">
              <span>SIMULAR DESCONTO</span>
              <strong>{desconto}% · economia de {fmt(descontoVal)}</strong>
            </div>
            <input aria-label="Simular desconto" type="range" min="0" max="30" step="1" value={desconto} onChange={e => setDesconto(Number(e.target.value))} />
            <div className="discount-presets">
              {[0, 5, 10, 15, 20, 30].map(valor => (
                <button key={valor} className={desconto === valor ? 'is-active' : ''} onClick={() => setDesconto(valor)}>{valor}%</button>
              ))}
            </div>
          </div>
          <div style={{ flex: "0 0 100px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>PARCELAS</div>
            <select value={parcelas} onChange={e => setParcelas(Number(e.target.value))}
              style={{ width: "100%", padding: "8px 12px", border: `1px solid #ddd`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: "white", boxSizing: "border-box" }}>
              {[1,2,3,4,5,6,8,10,12].map(n => <option key={n} value={n}>{n}x {n === 1 ? "(à vista)" : ""}</option>)}
            </select>
          </div>
          <div style={{ flex: "0 0 140px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>VISÃO INTERNA</div>
            <button onClick={() => setShowMargin(!showMargin)} style={{
              width: "100%", padding: "8px 12px", border: `1px solid ${showMargin ? GOLD : "#ddd"}`,
              borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              background: showMargin ? DARK : "white", color: showMargin ? GOLD : "#888",
            }}>{showMargin ? "Margem visível" : "Mostrar margem"}</button>
          </div>
        </div>
      </Card>

      {/* SELETOR DE PROCEDIMENTOS */}
      <Card title="Adicionar Procedimentos">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {products.map((p, i) => (
            <button key={i} onClick={() => addItem(p)} style={{
              background: "white", border: `1px solid #E8E4DE`, borderRadius: 8,
              padding: "8px 12px", cursor: "pointer", textAlign: "left",
              transition: "all 0.15s", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 8,
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = LIGHT; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "#E8E4DE"; e.currentTarget.style.background = "white"; }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: catColors[p.cat] || "#ddd", border: "1px solid rgba(0,0,0,0.1)" }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: DARK }}>{p.nome}</div>
                <div style={{ fontSize: 10, color: "#999" }}>{p.cat} — {fmt(p.precoSugerido)}</div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* ORÇAMENTO */}
      {items.length > 0 && (
        <Card title={`Orçamento${paciente ? ` — ${paciente}` : ""}`}>
          {/* HEADER */}
          <div style={{ display: "flex", background: DARK, borderRadius: "8px 8px 0 0", padding: "10px 0" }}>
            {[
              { l: "PROCEDIMENTO", f: 2.5 },
              { l: "CATEGORIA", f: 1 },
              { l: "PREÇO UN.", f: 0.8 },
              { l: "QTD", f: 0.5 },
              { l: "SUBTOTAL", f: 0.8 },
              ...(showMargin ? [{ l: "CUSTO", f: 0.7 }, { l: "MARGEM", f: 0.7 }] : []),
              { l: "", f: 0.3 },
            ].map((h, i) => (
              <div key={i} style={{ flex: h.f, textAlign: "center", fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em" }}>{h.l}</div>
            ))}
          </div>

          {/* ITEMS */}
          {items.map((item, i) => {
            const itemTotal = item.precoSugerido * item.qty;
            const itemCusto = item.custoUn * item.qty;
            const itemMargem = itemTotal > 0 ? ((itemTotal - itemCusto) / itemTotal * 100) : 0;
            return (
              <div key={i} style={{
                display: "flex", padding: "10px 0", alignItems: "center",
                borderBottom: "1px solid #f0ece6", background: i % 2 === 0 ? "white" : "#FAFAF8",
              }}>
                <div style={{ flex: 2.5, paddingLeft: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{item.nome}</div>
                  <div style={{ fontSize: 10, color: "#999" }}>{item.protocolo}</div>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <Badge text={item.cat} color={catColors[item.cat]} textColor="#555" />
                </div>
                <div style={{ flex: 0.8, textAlign: "center", fontSize: 13 }}>{fmt(item.precoSugerido)}</div>
                <div style={{ flex: 0.5, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <button onClick={() => updateQty(item.nome, item.qty - 1)} style={{
                    width: 22, height: 22, borderRadius: "50%", border: "1px solid #ddd", background: "white",
                    cursor: "pointer", fontSize: 14, lineHeight: "20px", fontFamily: "inherit", padding: 0,
                  }}>-</button>
                  <span style={{ fontSize: 14, fontWeight: 800, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.nome, item.qty + 1)} style={{
                    width: 22, height: 22, borderRadius: "50%", border: "1px solid #ddd", background: "white",
                    cursor: "pointer", fontSize: 14, lineHeight: "20px", fontFamily: "inherit", padding: 0,
                  }}>+</button>
                </div>
                <div style={{ flex: 0.8, textAlign: "center", fontSize: 13, fontWeight: 700 }}>{fmt(itemTotal)}</div>
                {showMargin && <>
                  <div style={{ flex: 0.7, textAlign: "center", fontSize: 12, color: "#B71C1C" }}>{fmt(itemCusto)}</div>
                  <div style={{ flex: 0.7, textAlign: "center" }}>
                    <Badge text={`${Math.round(itemMargem)}%`}
                      color={itemMargem >= 70 ? "#E8F5E9" : itemMargem >= 50 ? "#FFF9C4" : "#FFEBEE"}
                      textColor={itemMargem >= 70 ? "#2E7D32" : itemMargem >= 50 ? "#F57F17" : "#B71C1C"} />
                  </div>
                </>}
                <div style={{ flex: 0.3, textAlign: "center" }}>
                  <button onClick={() => removeItem(item.nome)} style={{
                    background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#ccc", padding: 4, fontFamily: "inherit",
                  }}>x</button>
                </div>
              </div>
            );
          })}

          {/* TOTALS */}
          <div style={{ background: LIGHT, borderRadius: "0 0 8px 8px", padding: "16px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#888" }}>Subtotal ({items.reduce((a,i) => a+i.qty, 0)} itens)</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{fmt(subtotal)}</span>
            </div>
            {desconto > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#E65100" }}>Desconto ({desconto}%)</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#E65100" }}>- {fmt(descontoVal)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: `2px solid ${GOLD}`, marginTop: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: DARK }}>TOTAL</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: DARK, fontFamily: "'DM Serif Display', Georgia, serif" }}>{fmt(total)}</span>
            </div>
            {parcelas > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#888" }}>ou {parcelas}x de</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>{fmt(valorParcela)}</span>
              </div>
            )}

            {/* MARGEM INTERNA */}
            {showMargin && (
              <div style={{ marginTop: 12, padding: "12px 14px", background: DARK, borderRadius: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: "0.1em", marginBottom: 8 }}>VISÃO INTERNA (CEO / SYLMARA)</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#aaa" }}>Custo total produtos</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#EF9A9A" }}>{fmt(custoTotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#aaa" }}>Margem bruta R$</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#81C784" }}>{fmt(margemBruta)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#aaa" }}>Margem bruta %</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: margemPct >= 60 ? "#81C784" : "#FFB74D" }}>{Math.round(margemPct)}%</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {items.length === 0 && (
        <Card>
          <div style={{ textAlign: "center", padding: "30px 0", color: "#ccc" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
            <div style={{ fontSize: 14 }}>Clique nos procedimentos acima para montar o orçamento</div>
          </div>
        </Card>
      )}

      {/* INSTRUÇÕES */}
      <Card title="Como Usar">
        {[
          "Sirlândia ou Lara usam na consulta de avaliação para montar o orçamento com o paciente.",
          "Clique nos procedimentos para adicionar. Ajuste quantidade com + e -.",
          "Desconto máximo: 30% (CEO aprova na weekly se acima de 10%).",
          "Botão 'Mostrar margem' ativa visão interna — NUNCA mostrar para o paciente.",
          "Fios de PDO: adicionar quantidade real (ex: 15 fios = qty 15).",
          "Parcelas: na planilha real, considerar taxa da maquininha na DRE (linha Deduções).",
          "Este simulador usa os preços sugeridos do Catálogo. Para alterar, atualize na planilha.",
        ].map((r, i) => (
          <div key={i} style={{ fontSize: 12, color: "#777", padding: "4px 0", display: "flex", gap: 6 }}>
            <span style={{ color: GOLD }}>›</span> {r}
          </div>
        ))}
      </Card>
    </div>
  );
};

// STOCK TAB
const StockTab = () => {
  const [stock, setStock] = useState([]);
  const [stockLoading, setStockLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [moveType, setMoveType] = useState("ENTRADA");
  const [moveQty, setMoveQty] = useState(1);
  const [moveObs, setMoveObs] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [newProd, setNewProd] = useState({ tipo: "Protocolo", cat: "", nome: "", custoUn: 0, precoSugerido: 0, estoqueMin: 3 });
  const [showNewForm, setShowNewForm] = useState(false);

  const mapProduto = (p) => ({
    ...p,
    custoUn: p.custo_un ?? p.custoUn ?? 0,
    precoSugerido: p.preco_sugerido ?? p.precoSugerido ?? 0,
    estoqueMin: p.estoque_min ?? p.estoqueMin ?? 3,
    movimentos: [],
  });

  useEffect(() => {
    supabase.from('produtos').select('*').eq('ativo', true).order('cat')
      .then(({ data }) => {
        setStock(Array.isArray(data) ? data.map(mapProduto) : []);
        setStockLoading(false);
      });
  }, []);

  const getStatus = (p) => {
    if (p.estoque <= 0) return { text: "ZERADO", color: "#D32F2F", bg: "#FFCDD2" };
    if (p.estoque <= p.estoqueMin) return { text: "REPOR", color: "#B71C1C", bg: "#FFCDD2" };
    if (p.estoque <= p.estoqueMin * 1.5) return { text: "ALERTA", color: "#F57F17", bg: "#FFF9C4" };
    return { text: "OK", color: "#2E7D32", bg: "#E8F5E9" };
  };

  const registrarMovimento = async () => {
    if (!selectedProduct || moveQty <= 0) return;
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2,"0")}/${(now.getMonth()+1).toString().padStart(2,"0")}`;
    const prod = stock.find(p => p.nome === selectedProduct);
    if (!prod) return;
    const newEstoque = moveType === "ENTRADA" ? prod.estoque + moveQty : Math.max(0, prod.estoque - moveQty);
    await supabase.from('produtos').update({ estoque: newEstoque }).eq('id', prod.id);
    setStock(stock.map(p => {
      if (p.nome === selectedProduct) {
        return {
          ...p,
          estoque: newEstoque,
          movimentos: [{ date: dateStr, type: moveType, qty: moveQty, obs: moveObs, saldo: newEstoque }, ...p.movimentos].slice(0, 20),
        };
      }
      return p;
    }));
    setMoveQty(1);
    setMoveObs("");
    setSelectedProduct(null);
  };

  const addNewProduct = async () => {
    if (!newProd.nome || !newProd.cat) return;
    const { data, error } = await supabase.from('produtos').insert({
      tipo: newProd.tipo, cat: newProd.cat, nome: newProd.nome,
      custo_un: newProd.custoUn || 0, preco_sugerido: newProd.precoSugerido || 0,
      estoque_min: newProd.estoqueMin || 3, estoque: 0,
      obs: 'Cadastrado pelo Estoque', ativo: true,
    }).select().single();
    if (!error && data) setStock(prev => [...prev, mapProduto(data)]);
    setNewProd({ tipo: "Protocolo", cat: "", nome: "", custoUn: 0, precoSugerido: 0, estoqueMin: 3 });
    setShowNewForm(false);
  };

  const totalEstoque = stock.reduce((a, p) => a + p.custoUn * p.estoque, 0);
  const zerados = stock.filter(p => p.estoque <= 0).length;
  const repor = stock.filter(p => p.estoque > 0 && p.estoque <= p.estoqueMin).length;
  const alerta = stock.filter(p => p.estoque > p.estoqueMin && p.estoque <= p.estoqueMin * 1.5).length;

  const filtered = filterStatus === "TODOS" ? stock :
    filterStatus === "REPOR" ? stock.filter(p => p.estoque <= p.estoqueMin) :
    filterStatus === "ALERTA" ? stock.filter(p => p.estoque > p.estoqueMin && p.estoque <= p.estoqueMin * 1.5) :
    stock.filter(p => p.estoque > p.estoqueMin * 1.5);

  const fmt = (v) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;

  const catColors = {
    "Toxina": "#E8EAF6", "Preenchedor": "#E0F2F1", "Bioestimulador": "#FFF3E0",
    "Skin Booster": "#F3E5F5", "Capilar": "#FBE9E7", "Revitalização": "#E8F5E9",
    "Fios": "#ECEFF1", "Regeneração": "#FCE4EC", "Autólogo": "#E1F5FE", "Emagrecimento": "#FFF9C4",
  };

  if (stockLoading) return <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Carregando estoque...</div>;

  return (
    <div>
      {/* RESUMO */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <Metric label="Valor Total Estoque" value={fmt(totalEstoque)} sub={`${stock.length} itens cadastrados`} />
        <Metric label="Críticos (REPOR)" value={repor + zerados} color="#B71C1C" sub={zerados > 0 ? `${zerados} zerados` : "acionar fornecedor"} />
        <Metric label="Em Alerta" value={alerta} color="#F57F17" sub="monitorar reposição" />
        <Metric label="Saudáveis" value={stock.length - repor - zerados - alerta} color="#2E7D32" sub="estoque adequado" />
      </div>

      {/* REGISTRO DE MOVIMENTO */}
      <Card title="Registrar Movimento de Estoque">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 200px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>PRODUTO</div>
            <select value={selectedProduct || ""} onChange={e => setSelectedProduct(e.target.value || null)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "white", boxSizing: "border-box" }}>
              <option value="">Selecione...</option>
              {stock.map((p, i) => <option key={i} value={p.nome}>{p.nome} (estoque: {p.estoque})</option>)}
            </select>
          </div>
          <div style={{ flex: "0 0 120px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>TIPO</div>
            <div style={{ display: "flex", gap: 4 }}>
              {["ENTRADA", "SAÍDA"].map(t => (
                <button key={t} onClick={() => setMoveType(t)} style={{
                  flex: 1, padding: "8px 4px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", border: "1px solid",
                  background: moveType === t ? (t === "ENTRADA" ? "#2E7D32" : "#B71C1C") : "white",
                  color: moveType === t ? "white" : "#888",
                  borderColor: moveType === t ? "transparent" : "#ddd",
                }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: "0 0 70px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>QTD</div>
            <input type="number" value={moveQty} onChange={e => setMoveQty(Math.max(1, Number(e.target.value)))}
              min="1" style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, textAlign: "center", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>OBSERVAÇÃO</div>
            <input value={moveObs} onChange={e => setMoveObs(e.target.value)} placeholder="NF, lote, paciente..."
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          </div>
          <button onClick={registrarMovimento} style={{
            padding: "10px 24px", background: selectedProduct ? GOLD : "#ddd", color: "white", border: "none",
            borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: selectedProduct ? "pointer" : "default",
            fontFamily: "inherit", opacity: selectedProduct ? 1 : 0.5,
          }}>Registrar</button>
        </div>
      </Card>

      {/* POSIÇÃO DE ESTOQUE */}
      <Card title="Posição de Estoque Atual">
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {["TODOS", "REPOR", "ALERTA", "OK"].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)} style={{
              background: filterStatus === f ? DARK : "white",
              color: filterStatus === f ? GOLD : "#888",
              border: `1px solid ${filterStatus === f ? DARK : "#ddd"}`,
              borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>{f} ({f === "TODOS" ? stock.length : f === "REPOR" ? repor + zerados : f === "ALERTA" ? alerta : stock.length - repor - zerados - alerta})</button>
          ))}
        </div>

        {/* TABLE HEADER */}
        <div style={{ display: "flex", background: DARK, borderRadius: "8px 8px 0 0", padding: "10px 0" }}>
          {[
            { l: "TIPO", f: 0.5 }, { l: "CATEGORIA", f: 0.8 }, { l: "PRODUTO", f: 1.5 },
            { l: "CUSTO UN.", f: 0.7 }, { l: "ESTOQUE", f: 0.6 }, { l: "MÍNIMO", f: 0.5 },
            { l: "STATUS", f: 0.6 }, { l: "VALOR ESTOQUE", f: 0.8 }, { l: "ÚLT. MOVIMENTO", f: 1 },
          ].map((h, i) => (
            <div key={i} style={{ flex: h.f, textAlign: "center", fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em", padding: "0 2px" }}>{h.l}</div>
          ))}
        </div>

        {filtered.map((p, i) => {
          const st = getStatus(p);
          const lastMove = p.movimentos && p.movimentos.length > 0 ? p.movimentos[0] : null;
          return (
            <div key={i} style={{
              display: "flex", padding: "8px 0", alignItems: "center",
              borderBottom: "1px solid #f0ece6",
              background: st.text === "REPOR" || st.text === "ZERADO" ? "#FFF5F5" : i % 2 === 0 ? "white" : "#FAFAF8",
            }}>
              <div style={{ flex: 0.5, textAlign: "center" }}>
                <Badge text={p.tipo === "Protocolo" ? "PROT" : "PROD"}
                  color={p.tipo === "Protocolo" ? "#E8EAF6" : "#FFF9C4"}
                  textColor={p.tipo === "Protocolo" ? "#283593" : "#F57F17"} />
              </div>
              <div style={{ flex: 0.8, textAlign: "center" }}>
                <Badge text={p.cat} color={catColors[p.cat] || "#eee"} textColor="#555" />
              </div>
              <div style={{ flex: 1.5, fontSize: 12, fontWeight: 700, padding: "0 6px" }}>{p.nome}</div>
              <div style={{ flex: 0.7, textAlign: "center", fontSize: 12, color: "#888" }}>{fmt(p.custoUn)}</div>
              <div style={{ flex: 0.6, textAlign: "center", fontSize: 16, fontWeight: 900,
                color: st.text === "OK" ? DARK : st.color }}>{p.estoque}</div>
              <div style={{ flex: 0.5, textAlign: "center", fontSize: 11, color: "#bbb" }}>{p.estoqueMin}</div>
              <div style={{ flex: 0.6, textAlign: "center" }}>
                <Badge text={st.text} color={st.bg} textColor={st.color} />
              </div>
              <div style={{ flex: 0.8, textAlign: "center", fontSize: 12, fontWeight: 600 }}>{fmt(p.custoUn * p.estoque)}</div>
              <div style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#999" }}>
                {lastMove ? (
                  <span>
                    <span style={{ color: lastMove.type === "ENTRADA" ? "#2E7D32" : "#B71C1C", fontWeight: 700 }}>
                      {lastMove.type === "ENTRADA" ? "+" : "-"}{lastMove.qty}
                    </span>
                    {" "}{lastMove.date} {lastMove.obs && `(${lastMove.obs})`}
                  </span>
                ) : "—"}
              </div>
            </div>
          );
        })}

        <div style={{ display: "flex", padding: "12px 8px", background: LIGHT, borderRadius: "0 0 8px 8px" }}>
          <div style={{ flex: 4, fontSize: 12, fontWeight: 800 }}>TOTAL: {filtered.length} itens</div>
          <div style={{ flex: 0.6, textAlign: "center", fontSize: 13, fontWeight: 900 }}>{filtered.reduce((a,p) => a + p.estoque, 0)}</div>
          <div style={{ flex: 1.1 }} />
          <div style={{ flex: 0.8, textAlign: "center", fontSize: 12, fontWeight: 800 }}>{fmt(filtered.reduce((a,p) => a + p.custoUn * p.estoque, 0))}</div>
          <div style={{ flex: 1 }} />
        </div>
      </Card>

      {/* CADASTRO NOVO PRODUTO */}
      <Card title="Cadastrar Novo Produto">
        {!showNewForm ? (
          <button onClick={() => setShowNewForm(true)} style={{
            width: "100%", padding: "14px", background: "white", border: `2px dashed ${GOLD}`,
            borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600,
            color: GOLD, fontFamily: "inherit",
          }}>+ Cadastrar novo produto ou protocolo</button>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              <div style={{ flex: "0 0 120px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>TIPO</div>
                <select value={newProd.tipo} onChange={e => setNewProd({...newProd, tipo: e.target.value})}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                  <option value="Protocolo">Protocolo</option>
                  <option value="Produto">Produto</option>
                </select>
              </div>
              <div style={{ flex: "0 0 140px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>CATEGORIA</div>
                <select value={newProd.cat} onChange={e => setNewProd({...newProd, cat: e.target.value})}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                  <option value="">Selecione...</option>
                  {["Toxina","Preenchedor","Bioestimulador","Skin Booster","Capilar","Revitalização","Fios","Regeneração","Autólogo","Emagrecimento","Dermatologia","Nutrição","Outro"].map(c =>
                    <option key={c} value={c}>{c}</option>
                  )}
                </select>
              </div>
              <div style={{ flex: "1 1 180px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>NOME DO PRODUTO</div>
                <input value={newProd.nome} onChange={e => setNewProd({...newProd, nome: e.target.value})}
                  placeholder="Ex: Sculptra 2 frascos"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              <div style={{ flex: "0 0 130px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>CUSTO UNITÁRIO R$</div>
                <input type="number" value={newProd.custoUn || ""} onChange={e => setNewProd({...newProd, custoUn: Number(e.target.value)})}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, textAlign: "center", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: "0 0 130px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>PREÇO SUGERIDO R$</div>
                <input type="number" value={newProd.precoSugerido || ""} onChange={e => setNewProd({...newProd, precoSugerido: Number(e.target.value)})}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, textAlign: "center", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: "0 0 100px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>ESTOQUE MÍN.</div>
                <input type="number" value={newProd.estoqueMin} onChange={e => setNewProd({...newProd, estoqueMin: Number(e.target.value)})}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, textAlign: "center", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <button onClick={addNewProduct} style={{
                  padding: "9px 20px", background: newProd.nome && newProd.cat ? GOLD : "#ddd", color: "white",
                  border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: newProd.nome && newProd.cat ? "pointer" : "default",
                  fontFamily: "inherit", opacity: newProd.nome && newProd.cat ? 1 : 0.5,
                }}>Cadastrar</button>
                <button onClick={() => setShowNewForm(false)} style={{
                  padding: "9px 16px", background: "white", color: "#888", border: "1px solid #ddd",
                  borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                }}>Cancelar</button>
              </div>
            </div>
            {newProd.custoUn > 0 && newProd.precoSugerido > 0 && (
              <div style={{ fontSize: 12, color: "#888" }}>
                Margem estimada: <strong style={{ color: "#2E7D32" }}>{Math.round((newProd.precoSugerido - newProd.custoUn) / newProd.precoSugerido * 100)}%</strong>
                {" "}({fmt(newProd.precoSugerido - newProd.custoUn)} por unidade)
              </div>
            )}
          </div>
        )}
      </Card>

      {/* REGRAS */}
      <Card title="Regras de Gestão de Estoque">
        {[
          "Sylmara faz check-in quinzenal (dia 1 e 15) — atualiza estoque na planilha e no portal.",
          "ENTRADA: nova compra de fornecedor. Registrar com NF e lote na observação.",
          "SAÍDA: uso em procedimento. Registrar com nome do paciente ou 'Levvai Day' etc.",
          "Status REPOR: acionar fornecedor imediatamente. Sinalizar na weekly (Bloco 1).",
          "Status ALERTA: planejar reposição. Não precisa ação urgente.",
          "Novos produtos: cadastrar quando associado (nutrólogo/dermato) trouxer itens novos.",
          "Categorias 'Dermatologia' e 'Nutrição' já disponíveis para quando associados entrarem.",
          "Validade: anotar na observação do movimento de entrada. Sylmara monitora.",
          "Preço sugerido de novos produtos: CEO aprova na weekly antes de usar no orçamento.",
        ].map((r, i) => (
          <div key={i} style={{ fontSize: 12, color: "#777", padding: "4px 0", display: "flex", gap: 6 }}>
            <span style={{ color: GOLD }}>›</span> {r}
          </div>
        ))}
      </Card>
    </div>
  );
};

// AGENDA TAB
const AgendaTab = ({ shared }) => {
  const rooms = [
    { id: "maca1", name: "Sala da Lara", icon: "▣", color: "#E8EAF6", desc: "Exclusiva da Lara. Harmonização, preenchimento, toxina, fios, bioestimuladores. Equipada para procedimentos faciais e corporais.", capacity: "1 paciente por vez", avg: "45-90 min" },
    { id: "maca2", name: "Sala Associados", icon: "▣", color: "#E0F2F1", desc: "Sala para profissionais associados (nutrólogo, dermatologista, futuros). Procedimentos estéticos, corporais, PRP, microagulhamento.", capacity: "1 paciente por vez", avg: "45-90 min" },
    { id: "consultorio", name: "Sala 3 — Consultório", icon: "▢", color: "#FFF3E0", desc: "Consultas médicas (avaliação, retorno, prescrição Tirzepatida, nutrólogo, dermato)", capacity: "1 paciente por vez", avg: "20-40 min" },
    { id: "soro", name: "Área de Soroterapia", icon: "◎", color: "#F3E5F5", desc: "Soroterapia, aplicações IV, protocolos de hidratação e vitaminas", capacity: "2-3 pacientes simultâneos", avg: "30-60 min" },
  ];

  const colorOptions = ["#E91E63", "#FF9800", "#2196F3", "#4CAF50", "#9C27B0", "#009688", "#795548", "#607D8B"];

  // Estado — Profissionais da Agenda
  const [profissionais, setProfissionais] = useState([]);
  const [loadingProfissionais, setLoadingProfissionais] = useState(true);

  useEffect(() => {
    const fetchProfissionais = async () => {
      setLoadingProfissionais(true);
      const { data, error } = await supabase
        .from('profissionais')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (!error && data) setProfissionais(data);
      setLoadingProfissionais(false);
    };

    fetchProfissionais();
  }, []);

  const salvarProfissional = async (profissional) => {
    if (profissional.id) {
      const { error } = await supabase
        .from('profissionais')
        .update(profissional)
        .eq('id', profissional.id);
      if (!error) setProfissionais(prev => prev.map(p => p.id === profissional.id ? profissional : p));
    } else {
      const { data, error } = await supabase
        .from('profissionais')
        .insert([profissional])
        .select()
        .single();
      if (!error && data) setProfissionais(prev => [...prev, data]);
    }
  };

  const desativarProfissional = async (profissionalId) => {
    const { error } = await supabase
      .from('profissionais')
      .update({ ativo: false })
      .eq('id', profissionalId);
    if (!error) setProfissionais(prev => prev.filter(p => p.id !== profissionalId));
  };

  const professionals = profissionais;
  const [showAddProf, setShowAddProf] = useState(false);
  const [newProf, setNewProf] = useState({ name: "", specialty: "", color: "#4CAF50", rooms: ["maca2"], days: "" });

  const addProfessional = async () => {
    if (!newProf.name) return;
    await salvarProfissional({ ...newProf, ativo: true });
    setNewProf({ name: "", specialty: "", color: colorOptions[professionals.length % colorOptions.length], rooms: ["maca2"], days: "" });
    setShowAddProf(false);
  };

  const toggleProfRoom = (room) => {
    setNewProf({ ...newProf, rooms: newProf.rooms.includes(room) ? newProf.rooms.filter(r => r !== room) : [...newProf.rooms, room] });
  };

  const toggleActive = async (idx) => {
    const p = profissionais[idx];
    if (!p?.id) return;
    if (p.ativo) {
      await desativarProfissional(p.id);
    } else {
      await salvarProfissional({ ...p, ativo: true });
    }
  };

  const days = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA"];
  const hours = ["9:00","9:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30"];

  // DATE-BASED CALENDAR
  const [weekOffset, setWeekOffset] = useState(0);
  const getWeekDates = (offset) => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };
  const weekDates = getWeekDates(weekOffset);
  const monthNames = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  const formatDate = (d) => `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}`;
  const weekLabel = `${formatDate(weekDates[0])} — ${formatDate(weekDates[4])}`;
  const monthLabel = `${monthNames[weekDates[0].getMonth()]} ${weekDates[0].getFullYear()}`;

  const [selectedDay, setSelectedDay] = useState(0);
  const [slots, setSlots] = useState({});
  const [slotDbIds, setSlotDbIds] = useState({});
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedProf, setSelectedProf] = useState("Lara");
  const [selectedProc, setSelectedProc] = useState("");
  const [selectedPac, setSelectedPac] = useState("");

  const loadSlots = async () => {
    const from = new Date(); from.setMonth(from.getMonth() - 2);
    const to = new Date(); to.setMonth(to.getMonth() + 6);
    const { data } = await supabase.from('agendamentos').select('*')
      .gte('data', from.toISOString().split('T')[0])
      .lte('data', to.toISOString().split('T')[0]);
    if (!Array.isArray(data)) return;
    const newSlots = {}, newIds = {};
    data.forEach(row => {
      const key = `${row.data}-${row.sala}-${row.horario}`;
      newSlots[key] = { prof: row.profissional, proc: row.procedimento, pac: row.paciente, fromCRM: row.from_crm, origem: row.origem };
      newIds[key] = row.id;
    });
    setSlots(newSlots);
    setSlotDbIds(newIds);
  };

  useEffect(() => { loadSlots(); }, []);

  const slotKey = (day, room, hour) => {
    const d = weekDates[day];
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return `${ds}-${room}-${hours[hour]}`;
  };

  const bookSlot = async () => {
    if (!selectedRoom || selectedHour === null) return;
    setBookingLoading(true);
    const d = weekDates[selectedDay];
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const key = `${dateStr}-${selectedRoom}-${hours[selectedHour]}`;
    const { data, error } = await supabase.from('agendamentos').insert({
      data: dateStr, horario: hours[selectedHour], sala: selectedRoom,
      profissional: selectedProf, procedimento: selectedProc || 'Consulta',
      paciente: selectedPac || 'Paciente', from_crm: false,
    }).select().single();
    if (!error && data) {
      setSlots(prev => ({ ...prev, [key]: { prof: selectedProf, proc: selectedProc || 'Consulta', pac: selectedPac || 'Paciente', fromCRM: false } }));
      setSlotDbIds(prev => ({ ...prev, [key]: data.id }));
    }
    setSelectedRoom(null); setSelectedHour(null); setSelectedProc(''); setSelectedPac('');
    setBookingLoading(false);
  };

  const removeSlot = async (key) => {
    const id = slotDbIds[key];
    if (id) await supabase.from('agendamentos').delete().eq('id', id);
    setSlots(prev => { const s = { ...prev }; delete s[key]; return s; });
    setSlotDbIds(prev => { const s = { ...prev }; delete s[key]; return s; });
  };

  const profColors = professionals.reduce((acc, p) => ({ ...acc, [p.name]: p.color }), {});

  // Capacity calculator
  const hoursPerDay = 10;
  const avgProcMin = 60;
  const slotsPerRoomPerDay = Math.floor(hoursPerDay * 60 / avgProcMin);
  const procedureRooms = 2;
  const consultRoom = 1;
  const avgConsultMin = 30;
  const consultsPerDay = Math.floor(hoursPerDay * 60 / avgConsultMin);

  return (
    <div>
      {/* MAPA DE ESPAÇOS */}
      <Card title="Mapa da Clínica — 4 Espaços" accent>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {rooms.map((r, i) => (
            <div key={i} style={{ background: r.color, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>{r.icon}</span>
                <span style={{ fontWeight: 800, fontSize: 14, color: DARK }}>{r.name}</span>
              </div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: 6 }}>{r.desc}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Badge text={r.capacity} color="rgba(0,0,0,0.06)" textColor="#555" />
                <Badge text={`Média: ${r.avg}`} color="rgba(0,0,0,0.06)" textColor="#555" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* CAPACIDADE */}
      {/* PROFISSIONAIS */}
      <Card title="Profissionais da Clínica">
        <div style={{ fontSize: 11, color: "#999", marginBottom: 12 }}>
          Cadastre e gerencie os profissionais que atendem na clínica. Ativos aparecem na agenda de agendamento.
        </div>

        {professionals.map((p, idx) => (
          <div key={idx} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", marginBottom: 6,
            background: p.active ? "white" : "#FAFAF8",
            border: `1px solid ${p.active ? p.color + "40" : "#eee"}`,
            borderRadius: 10, borderLeft: `4px solid ${p.color}`,
            opacity: p.active ? 1 : 0.7,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%", background: p.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 800, color: "white", flexShrink: 0,
            }}>{p.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>{p.specialty}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                {p.rooms.map(r => {
                  const room = rooms.find(rm => rm.id === r);
                  return room ? <Badge key={r} text={room.name} color={room.color} textColor="#555" /> : null;
                })}
                <Badge text={p.days} color="#F5F0E8" textColor="#8B7355" />
              </div>
            </div>
            <button onClick={() => toggleActive(idx)} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
              border: "none", cursor: "pointer", fontFamily: "inherit",
              background: p.active ? "#E8F5E9" : "#FFEBEE",
              color: p.active ? "#2E7D32" : "#B71C1C",
            }}>{p.active ? "ATIVO" : "INATIVO"}</button>
          </div>
        ))}

        {/* ADD */}
        {!showAddProf ? (
          <button onClick={() => setShowAddProf(true)} style={{
            width: "100%", padding: "12px", background: "white", border: `2px dashed ${GOLD}`,
            borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
            color: GOLD, fontFamily: "inherit", marginTop: 6,
          }}>+ Cadastrar novo profissional</button>
        ) : (
          <div style={{ border: `1px solid ${GOLD}`, borderRadius: 10, padding: "14px 16px", background: LIGHT, marginTop: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 10 }}>NOVO PROFISSIONAL</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ flex: "1 1 180px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>NOME</div>
                <input value={newProf.name} onChange={e => setNewProf({...newProf, name: e.target.value})}
                  placeholder="Dr(a). Nome"
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: "1 1 200px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>ESPECIALIDADE</div>
                <input value={newProf.specialty} onChange={e => setNewProf({...newProf, specialty: e.target.value})}
                  placeholder="Nutrologia, Dermatologia..."
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: "0 0 120px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>DIAS</div>
                <input value={newProf.days} onChange={e => setNewProf({...newProf, days: e.target.value})}
                  placeholder="Qua e Sex"
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 4 }}>SALAS (clique para selecionar)</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {rooms.map(r => (
                  <button key={r.id} onClick={() => toggleProfRoom(r.id)} style={{
                    padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                    background: newProf.rooms.includes(r.id) ? r.color : "white",
                    border: `1px solid ${newProf.rooms.includes(r.id) ? "transparent" : "#ddd"}`,
                    color: newProf.rooms.includes(r.id) ? "#333" : "#999",
                  }}>{r.name}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 4 }}>COR NA AGENDA</div>
              <div style={{ display: "flex", gap: 4 }}>
                {colorOptions.map(c => (
                  <button key={c} onClick={() => setNewProf({...newProf, color: c})} style={{
                    width: 28, height: 28, borderRadius: "50%", background: c, border: newProf.color === c ? "3px solid #333" : "2px solid #eee",
                    cursor: "pointer", padding: 0,
                  }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addProfessional} style={{
                padding: "8px 20px", background: newProf.name ? GOLD : "#ddd", color: "white",
                border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12,
                cursor: newProf.name ? "pointer" : "default", fontFamily: "inherit",
              }}>Cadastrar</button>
              <button onClick={() => setShowAddProf(false)} style={{
                padding: "8px 14px", background: "white", color: "#888", border: "1px solid #ddd",
                borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              }}>Cancelar</button>
            </div>
          </div>
        )}
      </Card>

      <Card title="Simulador de Capacidade Máxima">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "CENÁRIO ATUAL\n(só Lara)", daily: "Sala Lara: ~6-8 procedimentos\nConsultório: ~4-6 consultas\nTotal: ~10-14 atendimentos/dia", monthly: "220-308 atend/mês\n(22 dias úteis)", revenue: "R$44K-62K/mês\n(ticket R$2K)" , color: "#FFF3E0" },
            { label: "COM NUTRÓLOGO\n(Lara + 1 associado)", daily: "Sala Lara + Associados: ~12-16 proc\nConsultório: ~10-14 consultas\nSoroterapia: ~6-8\nTotal: ~28-38 atend/dia", monthly: "616-836 atend/mês", revenue: "R$90K-130K/mês", color: "#E8F5E9" },
            { label: "CAPACIDADE MÁXIMA\n(Lara + 2 associados)", daily: "Sala Lara + Associados: ~16-20 proc\nConsultório: ~16-20 consultas\nSoroterapia: ~8-12\nTotal: ~40-52 atend/dia", monthly: "880-1.144 atend/mês", revenue: "R$150K-200K/mês", color: "#E3F2FD" },
          ].map((c, i) => (
            <div key={i} style={{ background: c.color, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: DARK, marginBottom: 8, whiteSpace: "pre-line" }}>{c.label}</div>
              <div style={{ fontSize: 11, color: "#555", lineHeight: 1.7, whiteSpace: "pre-line", marginBottom: 8 }}>{c.daily}</div>
              <div style={{ fontSize: 11, color: "#777", whiteSpace: "pre-line" }}>{c.monthly}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, marginTop: 6 }}>{c.revenue}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#999" }}>
          Premissas: 9h-19h (10h úteis), procedimento médio 60min, consulta média 30min, soroterapia 45min (2-3 cadeiras).
          Receita estimada com ticket médio de R$2.000 procedimento e R$800 consulta.
        </div>
      </Card>

      {/* AGENDA VISUAL */}
      <Card title="Agenda Semanal">
        {/* WEEK NAVIGATOR */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <button onClick={() => setWeekOffset(weekOffset - 1)} style={{
            width: 36, height: 36, borderRadius: 8, border: "1px solid #ddd", background: "white",
            cursor: "pointer", fontSize: 18, fontFamily: "inherit", color: GOLD, fontWeight: 700,
          }}>‹</button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: DARK }}>{weekLabel}</div>
            <div style={{ fontSize: 11, color: "#999" }}>{monthLabel} {weekOffset === 0 && "— semana atual"}</div>
          </div>
          <button onClick={() => setWeekOffset(weekOffset + 1)} style={{
            width: 36, height: 36, borderRadius: 8, border: "1px solid #ddd", background: "white",
            cursor: "pointer", fontSize: 18, fontFamily: "inherit", color: GOLD, fontWeight: 700,
          }}>›</button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} style={{
              padding: "6px 12px", borderRadius: 6, border: "1px solid #ddd", background: LIGHT,
              cursor: "pointer", fontSize: 10, fontFamily: "inherit", color: GOLD, fontWeight: 700,
            }}>HOJE</button>
          )}
        </div>

        {/* Day selector with actual dates */}
        <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
          {weekDates.map((date, i) => {
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <button key={i} onClick={() => setSelectedDay(i)} style={{
                flex: 1, padding: "8px 4px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
                border: isToday ? `2px solid ${GOLD}` : "1px solid",
                background: selectedDay === i ? DARK : "white",
                color: selectedDay === i ? GOLD : "#888",
                borderColor: selectedDay === i ? DARK : isToday ? GOLD : "#ddd",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700 }}>{days[i]}</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{date.getDate()}</div>
                <div style={{ fontSize: 9 }}>{monthNames[date.getMonth()]}</div>
                {isToday && <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD, margin: "2px auto 0" }} />}
              </button>
            );
          })}
        </div>

        {/* Grid: rooms × hours */}
        <div style={{ overflowX: "auto" }}>
          {/* Header row */}
          <div style={{ display: "flex", minWidth: 800 }}>
            <div style={{ width: 120, minWidth: 120, padding: "8px 4px", fontSize: 9, fontWeight: 700, color: GOLD, textAlign: "center" }}>HORÁRIO</div>
            {rooms.map(r => (
              <div key={r.id} style={{ flex: 1, padding: "8px 4px", fontSize: 9, fontWeight: 700, color: GOLD, textAlign: "center", background: r.color, borderRadius: "6px 6px 0 0" }}>
                {r.name}
              </div>
            ))}
          </div>

          {/* Time slots */}
          {hours.map((h, hi) => (
            <div key={hi} style={{ display: "flex", minWidth: 800, borderBottom: "1px solid #f0ece6" }}>
              <div style={{ width: 120, minWidth: 120, padding: "6px 8px", fontSize: 11, fontWeight: 600, color: "#888", textAlign: "center",
                background: hi % 2 === 0 ? "#FAFAF8" : "white" }}>{h}</div>
              {rooms.map(r => {
                const key = slotKey(selectedDay, r.id, hi);
                const booked = slots[key];
                return (
                  <div key={r.id} style={{
                    flex: 1, padding: "4px", minHeight: 32,
                    background: booked ? `${profColors[booked.prof] || "#999"}15` : hi % 2 === 0 ? "#FAFAF8" : "white",
                    cursor: booked ? "default" : "pointer",
                    borderLeft: "1px solid #f0ece6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  onClick={() => {
                    if (!booked) { setSelectedRoom(r.id); setSelectedHour(hi); }
                  }}>
                    {booked ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, width: "100%" }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: profColors[booked.prof] || "#999", flexShrink: 0,
                          boxShadow: booked.fromCRM ? "0 0 0 2px #FFF3E0" : "none",
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: profColors[booked.prof], whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {booked.prof} {booked.fromCRM && <span style={{ fontSize: 7, color: "#E65100" }}>via CRM</span>}
                          </div>
                          <div style={{ fontSize: 8, color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {booked.pac} — {booked.proc}
                            {booked.origem && <span style={{ color: "#C8A96E" }}> ({booked.origem})</span>}
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); removeSlot(key); }} style={{
                          background: "none", border: "none", cursor: "pointer", fontSize: 10, color: "#ccc", padding: 2, fontFamily: "inherit", flexShrink: 0,
                        }}>×</button>
                        <a href={(() => {
                          const date = weekDates[selectedDay];
                          const ano = date.getFullYear();
                          const mes = String(date.getMonth() + 1).padStart(2, '0');
                          const dia = String(date.getDate()).padStart(2, '0');
                          const [hora, min] = hours[hi].split(':');
                          const horaFimNum = String(parseInt(hora) + 1).padStart(2, '0');
                          const dataInicio = `${ano}${mes}${dia}T${hora}${min}00`;
                          const dataFim = `${ano}${mes}${dia}T${horaFimNum}${min}00`;
                          const titulo = encodeURIComponent(`${booked.proc} — ${booked.pac}`);
                          const local = encodeURIComponent('Rua do Rocio, 288, cj 93 — Vila Olímpia, SP');
                          const detalhes = encodeURIComponent(`Paciente: ${booked.pac}\nProcedimento: ${booked.proc}\nProfissional: ${booked.prof}`);
                          return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${dataInicio}/${dataFim}&details=${detalhes}&location=${local}`;
                        })()} target="_blank" rel="noopener noreferrer" title="Adicionar ao Google Calendar"
                          onClick={(e) => e.stopPropagation()}
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 4, background: "#E8F5E9", textDecoration: "none", fontSize: 12, flexShrink: 0 }}>📅</a>
                      </div>
                    ) : (
                      selectedRoom === r.id && selectedHour === hi ? (
                        <div style={{ fontSize: 10, color: GOLD, fontWeight: 700 }}>SELECIONADO</div>
                      ) : (
                        <div style={{ fontSize: 10, color: "#ddd" }}>+</div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Booking form */}
        {selectedRoom !== null && selectedHour !== null && (
          <div style={{ background: LIGHT, borderRadius: 10, padding: "14px 16px", marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 8 }}>
              AGENDAR — {rooms.find(r => r.id === selectedRoom)?.name} — {hours[selectedHour]} — {days[selectedDay]} {formatDate(weekDates[selectedDay])}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "0 0 140px" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#999", marginBottom: 3 }}>PROFISSIONAL</div>
                <select value={selectedProf} onChange={e => setSelectedProf(e.target.value)}
                  style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                  {professionals.filter(p => p.rooms.includes(selectedRoom)).map(p =>
                    <option key={p.name} value={p.name}>{p.name}</option>
                  )}
                </select>
              </div>
              <div style={{ flex: "1 1 160px" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#999", marginBottom: 3 }}>PACIENTE</div>
                <input value={selectedPac} onChange={e => setSelectedPac(e.target.value)} placeholder="Nome"
                  style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: "1 1 160px" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#999", marginBottom: 3 }}>PROCEDIMENTO</div>
                <select value={selectedProc} onChange={e => setSelectedProc(e.target.value)}
                  style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                  <option value="">Selecione...</option>
                  {(selectedRoom === "soro" ?
                    ["Soroterapia vitamínica", "Hidratação IV", "Detox IV", "Reposição vitamina C"] :
                    selectedRoom === "consultorio" ?
                    ["Consulta avaliação", "Retorno", "Consulta nutrólogo", "Prescrição Tirzepatida", "Consulta dermato"] :
                    ["Botox Full Face", "Preenchimento labial", "Preenchimento facial", "Radiesse", "Profhilo", "Fios de PDO", "Exossomos", "PRP", "Preenchimento corporal", "Microagulhamento"]
                  ).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <button onClick={bookSlot} disabled={bookingLoading} style={{
                padding: "8px 20px", background: bookingLoading ? '#ddd' : GOLD, color: "white", border: "none",
                borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: bookingLoading ? 'default' : "pointer", fontFamily: "inherit",
              }}>{bookingLoading ? 'Salvando...' : 'Agendar'}</button>
              <button onClick={() => { setSelectedRoom(null); setSelectedHour(null); }} style={{
                padding: "8px 14px", background: "white", color: "#888", border: "1px solid #ddd",
                borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              }}>Cancelar</button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
          {professionals.map(p => (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
              <span style={{ fontSize: 11, color: "#888" }}>{p.name}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#f0ece6" }} />
            <span style={{ fontSize: 11, color: "#888" }}>Disponível (clique para agendar)</span>
          </div>
        </div>
      </Card>

      {/* REGRAS DE ALOCAÇÃO */}
      <Card title="Regras de Alocação de Salas">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {rooms.map((r, i) => (
            <div key={i} style={{ background: r.color, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: DARK, marginBottom: 6 }}>{r.name}</div>
              {(r.id === "maca1" ? [
                "Exclusiva da Lara — procedimentos estéticos faciais e corporais",
                "Associados só usam em situação excepcional com aprovação da Lara",
                "Tempo mínimo entre pacientes: 15min (higienização)",
                "Equipamentos: cadeira reclinável, foco cirúrgico, mesa auxiliar",
              ] : r.id === "maca2" ? [
                "Sala principal para profissionais associados",
                "Nutrólogo: procedimentos e aplicações de Tirzepatida",
                "Dermatologista: procedimentos de pele, peelings, laser",
                "Lara pode usar quando associados não estão agendados",
                "Tempo mínimo entre pacientes: 15min (higienização)",
              ] : r.id === "consultorio" ? [
                "Consultas de avaliação (Lara): 30min/paciente",
                "Retornos: 20min/paciente",
                "Nutrólogo: dias fixos (ex: qua/sex quando entrar)",
                "Dermato: consultas iniciais antes de procedimentos",
                "Prescrição Tirzepatida: nutrólogo obrigatório",
              ] : [
                "Capacidade: 2-3 cadeiras simultâneas",
                "Não requer médico presente durante infusão",
                "Sirlândia supervisiona e monitora",
                "Protocolos: soroterapia vitamínica, detox, hidratação",
                "Potencial de receita recorrente com ticket menor",
                "Futuro: nutrólogo prescreve, equipe aplica",
              ]).map((rule, j) => (
                <div key={j} style={{ fontSize: 11, color: "#555", padding: "2px 0", display: "flex", gap: 4 }}>
                  <span style={{ color: GOLD, flexShrink: 0 }}>›</span> {rule}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>

      {/* LEVVAI DAY */}
      <Card title="Configuração do Levvai Day (3º Sábado)">
        <div style={{ background: "#FFE0B2", borderRadius: 8, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 6 }}>Alocação de salas no Levvai Day</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              { room: "Sala da Lara", use: "Procedimentos temáticos (3-5 pacientes agendados)", time: "9h-13h" },
              { room: "Sala Associados", use: "Procedimentos complementares ou associado convidado", time: "9h-13h" },
              { room: "Consultório", use: "Avaliações express gratuitas (open house)", time: "14h-16h" },
              { room: "Soroterapia", use: "Experiência VIP — soro + acompanhamento", time: "9h-16h" },
            ].map((s, i) => (
              <div key={i} style={{ flex: "1 1 180px", background: "rgba(255,255,255,0.6)", borderRadius: 6, padding: "8px 10px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: DARK }}>{s.room}</div>
                <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{s.use}</div>
                <Badge text={s.time} color="rgba(0,0,0,0.08)" textColor="#888" />
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#999" }}>
          Sirlândia monta lista de convidados 2 semanas antes. Gi cobre em tempo real. CEO define tema na weekly anterior.
        </div>
      </Card>

      <Card title="Instruções Operacionais">
        {[
          "Sirlândia gerencia a agenda de todas as salas via CRM (quando implementado).",
          "Toda segunda: Sirlândia envia agenda consolidada da semana (todos os profissionais, todas as salas) para CEO e equipe.",
          "Diário até 8:45h: Sirlândia envia lista de manutenção do dia (limpeza, reposição, equipamentos, pendências).",
          "Bloqueio de 15min entre procedimentos na Sala da Lara e Sala Associados para higienização.",
          "Consultas de avaliação são gratuitas — não bloquear mais que 3 por dia.",
          "Nutrólogo e dermato: agendar dias fixos para criar previsibilidade (ex: qua e sex).",
          "Soroterapia não precisa da Lara — Sirlândia pode acompanhar com supervisão remota.",
          "Terça-feira 9h-10:30h = Levvai Weekly. NENHUM agendamento neste horário.",
          "Sexta 16h-16:30h = 1:1 Lara × SM. Não agendar paciente pra Lara neste slot.",
          "Levvai Day: tema e lista de convidados definidos na weekly do mês anterior.",
          "Meta Q2: ocupação de 60% da capacidade → ~8-10 atendimentos/dia.",
        ].map((r, i) => (
          <div key={i} style={{ fontSize: 12, color: "#777", padding: "4px 0", display: "flex", gap: 6 }}>
            <span style={{ color: GOLD }}>›</span> {r}
          </div>
        ))}
      </Card>
    </div>
  );
};

// CRM & LEADS TAB
const STATUS_COLORS = {
  lead:       { bg: '#E3F2FD', tc: '#1565C0', label: 'Lead' },
  contato:    { bg: '#E8EAF6', tc: '#283593', label: '1º Contato' },
  agendado:   { bg: '#FFF3E0', tc: '#E65100', label: 'Agendado' },
  atendido:   { bg: '#E8F5E9', tc: '#2E7D32', label: 'Atendido' },
  retorno:    { bg: '#F3E5F5', tc: '#6A1B9A', label: 'Retorno' },
  fidelizado: { bg: '#C8A96E', tc: 'white',   label: 'Fidelizado ★' },
  perdido:    { bg: '#FFEBEE', tc: '#B71C1C', label: 'Perdido' },
};

const PROCEDIMENTOS = [
  'Botox Full Face', 'Levvai Lips', 'Harmonização Facial',
  'Levvai Slim (Tirzepatida)', 'Levvai Glow (Profhilo)',
  'Levvai Lift (Fios PDO)', 'Preenchimento Corporal',
  'Exossomos', 'PRP', 'Radiesse', 'Bioflash NCTC',
  'Soroterapia', 'Consulta Avaliação', 'Retorno', 'Outro',
];

const STATUS_TRAT = {
  pendente:     { bg: '#FFF9C4', tc: '#F57F17' },
  em_andamento: { bg: '#E3F2FD', tc: '#1565C0' },
  finalizado:   { bg: '#E8F5E9', tc: '#2E7D32' },
  cancelado:    { bg: '#FFEBEE', tc: '#B71C1C' },
};

const today = () => new Date().toISOString().slice(0, 10);

const FichaPaciente = ({ paciente, onClose, onUpdate }) => {
  const [tab, setTab] = useState('sobre');
  const [tratamentos, setTratamentos] = useState([]);
  const [prontuarios, setProntuarios] = useState([]);
  const [propostas, setPropostas] = useState([]);
  const [observacoes, setObservacoes] = useState([]);
  const [produtosDB, setProdutosDB] = useState([]);
  const [associadosDB, setAssociadosDB] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ ...paciente });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [newTrat, setNewTrat] = useState({ data: today(), horario: '09:00', procedimento: '', produto: '', regiao: '', sessao: 1, total_sessoes: 1, profissional: 'Lara', valor: '', observacoes: '', status: 'pendente', forma_pagamento: 'pix', status_pagamento: 'pendente', data_pagamento: '' });
  const [newPront, setNewPront] = useState({ data: today(), titulo: '', conteudo: '', profissional: 'Lara' });
  const [newObs, setNewObs] = useState({ data: today(), conteudo: '', autor: 'Sirlândia', tipo: 'geral' });
  const [newProp, setNewProp] = useState({ data: today(), titulo: '', itens: [], valor_total: '', desconto: 0, parcelas: 1, observacoes: '', status: 'rascunho' });
  const [comProntuario, setComProntuario] = useState(false);
  const [newProntuarioInline, setNewProntuarioInline] = useState({ titulo: '', conteudo: '' });
  const [propostaConverting, setPropostaConverting] = useState(null);
  const [convertForm, setConvertForm] = useState({ procedimento: '', valor: '', forma_pagamento: 'pix', status_pagamento: 'pendente', data_pagamento: '', observacoes: '' });
  const [editingTrat, setEditingTrat] = useState(null);
  const [editTratForm, setEditTratForm] = useState({});

  const loadSub = async (resource, setter) => {
    const { data } = await supabase.from(resource).select('*').eq('paciente_id', paciente.id).order('data', { ascending: false });
    setter(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    supabase.from('produtos').select('*').eq('ativo', true).order('cat')
      .then(({ data }) => setProdutosDB(Array.isArray(data) ? data : []));
    supabase.from('associados').select('id, nome, especialidade').eq('ativo', true).order('nome')
      .then(({ data }) => setAssociadosDB(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        loadSub('tratamentos', setTratamentos),
        loadSub('prontuarios', setProntuarios),
        loadSub('propostas', setPropostas),
        loadSub('observacoes', setObservacoes),
      ]);
      setLoading(false);
    };
    load();
  }, [paciente.id]);

  const saveEdit = async () => {
    setSaving(true);
    const { data, error } = await supabase.from('pacientes').update({ ...editData, updated_at: new Date() }).eq('id', paciente.id).select().single();
    if (!error) { onUpdate(data); setEditing(false); }
    setSaving(false);
  };

  const addItem = async (resource, body, setter, resetFn) => {
    const { data, error } = await supabase.from(resource).insert({ ...body, paciente_id: paciente.id }).select().single();
    if (!error) {
      setter(prev => [data, ...prev]);
      resetFn();
      setShowForm(false);
    }
  };

  const gerarLinkGoogleCalendar = (trat) => {
    const data = trat.data || today();
    const [ano, mes, dia] = data.split('-');
    const horario = trat.horario || '09:00';
    const [hora, min] = horario.split(':');
    const horaFimNum = (parseInt(hora) + 1).toString().padStart(2, '0');
    const dataInicio = `${ano}${mes}${dia}T${hora}${min}00`;
    const dataFim = `${ano}${mes}${dia}T${horaFimNum}${min}00`;
    const titulo = encodeURIComponent(`${trat.procedimento} — ${paciente.nome}`);
    const local = encodeURIComponent('Rua do Rocio, 288, cj 93 — Vila Olímpia, SP');
    const detalhes = encodeURIComponent(
      `Paciente: ${paciente.nome}\nTelefone: ${paciente.telefone || '—'}\nProcedimento: ${trat.procedimento}\nProfissional: ${trat.profissional || 'Lara'}\nProduto: ${trat.produto || '—'}\nSessão: ${trat.sessao || 1}/${trat.total_sessoes || 1}\nValor: ${trat.valor ? 'R$' + Number(trat.valor).toLocaleString('pt-BR') : '—'}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${dataInicio}/${dataFim}&details=${detalhes}&location=${local}`;
  };

  const deleteItem = async (resource, id, setter) => {
    if (!confirm('Remover este registro?')) return;
    if (resource === 'tratamentos') {
      await supabase.from('fluxo_caixa').delete().eq('tratamento_id', id).eq('origem', 'crm');
    }
    await supabase.from(resource).delete().eq('id', id);
    setter(prev => prev.filter(i => i.id !== id));
  };

  const salvarTratamentoComProntuario = async () => {
    const { data: novoTratamento, error } = await supabase.from('tratamentos').insert({ ...newTrat, paciente_id: paciente.id }).select().single();
    if (error) return;
    setTratamentos(prev => [novoTratamento, ...prev]);
    if (comProntuario && newProntuarioInline.titulo) {
      const { data: novoPront } = await supabase.from('prontuarios').insert({ paciente_id: paciente.id, data: newTrat.data, titulo: newProntuarioInline.titulo, conteudo: newProntuarioInline.conteudo, profissional: newTrat.profissional }).select().single();
      if (novoPront) setProntuarios(prev => [novoPront, ...prev]);
    }
    setNewTrat({ data: today(), horario: '09:00', procedimento: '', produto: '', regiao: '', sessao: 1, total_sessoes: 1, profissional: 'Lara', valor: '', observacoes: '', status: 'pendente', forma_pagamento: 'pix', status_pagamento: 'pendente', data_pagamento: '' });
    setComProntuario(false);
    setNewProntuarioInline({ titulo: '', conteudo: '' });
    setShowForm(false);
  };

  const converterPropostaEmVenda = async () => {
    if (!propostaConverting) return;
    const { data: novoTrat, error } = await supabase.from('tratamentos').insert({
      paciente_id: paciente.id, data: today(),
      procedimento: convertForm.procedimento || propostaConverting.titulo || 'Procedimento',
      valor: convertForm.valor || propostaConverting.valor_total,
      forma_pagamento: convertForm.forma_pagamento,
      status_pagamento: convertForm.status_pagamento,
      data_pagamento: convertForm.data_pagamento || null,
      profissional: 'Lara', status: 'finalizado',
      observacoes: convertForm.observacoes,
    }).select().single();
    if (error) return;
    setTratamentos(prev => [novoTrat, ...prev]);
    const { data: propostaAtualizada } = await supabase.from('propostas').update({ status: 'aprovada' }).eq('id', propostaConverting.id).select().single();
    if (propostaAtualizada) setPropostas(prev => prev.map(p => p.id === propostaConverting.id ? propostaAtualizada : p));
    setPropostaConverting(null);
    setConvertForm({ procedimento: '', valor: '', forma_pagamento: 'pix', status_pagamento: 'pendente', data_pagamento: '', observacoes: '' });
  };

  const updateTratStatus = async (trat, newStatus, newStatusPag) => {
    const body = {};
    if (newStatus !== undefined) body.status = newStatus;
    if (newStatusPag !== undefined) body.status_pagamento = newStatusPag;
    const { data } = await supabase.from('tratamentos').update(body).eq('id', trat.id).select().single();
    if (data) setTratamentos(prev => prev.map(t => t.id === trat.id ? data : t));
  };

  const atualizarTratamento = async () => {
    const { data, error } = await supabase.from('tratamentos').update(editTratForm).eq('id', editingTrat).select().single();
    if (!error && data) {
      const fluxoUpdate = {};
      if (editTratForm.valor !== undefined) fluxoUpdate.valor = editTratForm.valor;
      if (editTratForm.procedimento !== undefined) fluxoUpdate.procedimento = editTratForm.procedimento;
      if (editTratForm.data !== undefined) { fluxoUpdate.data = editTratForm.data; fluxoUpdate.data_vencimento = editTratForm.data; }
      if (editTratForm.forma_pagamento !== undefined) fluxoUpdate.forma_pagamento = editTratForm.forma_pagamento;
      if (editTratForm.status_pagamento !== undefined) fluxoUpdate.status = editTratForm.status_pagamento === 'pago' ? 'pago' : 'em_aberto';
      if (editTratForm.data_pagamento !== undefined) fluxoUpdate.data_pagamento = editTratForm.data_pagamento || null;
      if (Object.keys(fluxoUpdate).length > 0) {
        await supabase.from('fluxo_caixa').update(fluxoUpdate).eq('tratamento_id', editingTrat).eq('origem', 'crm');
      }
      setTratamentos(prev => prev.map(t => t.id === editingTrat ? data : t));
      setEditingTrat(null);
      setEditTratForm({});
    }
  };

  const st = STATUS_COLORS[paciente.status] || STATUS_COLORS.lead;
  const tabs = [
    { id: 'sobre',       label: 'Sobre' },
    { id: 'tratamentos', label: `Tratamentos (${tratamentos.length})` },
    { id: 'prontuario',  label: `Prontuário (${prontuarios.length})` },
    { id: 'propostas',   label: `Propostas (${propostas.length})` },
    { id: 'observacoes', label: `Obs. (${observacoes.length})` },
  ];

  const inputStyle = { width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3, letterSpacing: '0.05em' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 860, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

        {/* HEADER */}
        <div style={{ background: DARK, borderRadius: '16px 16px 0 0', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: st.bg === 'white' ? GOLD : st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: st.tc, flexShrink: 0 }}>
            {(paciente.nome || '?')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{paciente.nome}</div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
              {paciente.telefone && `${paciente.telefone} · `}
              {paciente.email && `${paciente.email} · `}
              <Badge text={st.label} color={st.bg} textColor={st.tc} />
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 22, cursor: 'pointer', fontFamily: 'inherit', padding: 4 }}>✕</button>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', borderBottom: '2px solid #f0ece6', padding: '0 24px' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setShowForm(false); }} style={{
              padding: '12px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', border: 'none', background: 'none',
              color: tab === t.id ? GOLD : '#999',
              borderBottom: tab === t.id ? `3px solid ${GOLD}` : '3px solid transparent',
              marginBottom: -2,
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ padding: '20px 24px', maxHeight: '65vh', overflowY: 'auto' }}>

          {/* ABA SOBRE */}
          {tab === 'sobre' && (
            <div>
              {!editing ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {[
                      ['E-MAIL', paciente.email || '—'],
                      ['TELEFONE', paciente.telefone || '—'],
                      ['CPF', paciente.cpf || '—'],
                      ['NASCIMENTO', paciente.data_nascimento || '—'],
                      ['SEXO', paciente.sexo || '—'],
                      ['ORIGEM', paciente.origem || '—'],
                      ['INDICADO POR', paciente.indicado_por || '—'],
                      ['STATUS', st.label],
                      ['CADASTRO', new Date(paciente.created_at).toLocaleDateString('pt-BR')],
                    ].map(([l, v], i) => (
                      <div key={i} style={{ background: LIGHT, borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: '0.05em' }}>{l}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: DARK, marginTop: 2 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {paciente.observacoes_gerais && (
                    <div style={{ background: '#FAFAF8', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#555', lineHeight: 1.7 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, marginBottom: 4 }}>OBSERVAÇÕES GERAIS</div>
                      {paciente.observacoes_gerais}
                    </div>
                  )}
                  <button onClick={() => { setEditing(true); setEditData({ ...paciente }); }} style={{
                    marginTop: 12, padding: '8px 20px', background: DARK, color: GOLD,
                    border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                  }}>Editar dados</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    {[
                      ['NOME', 'nome', 'text'],
                      ['E-MAIL', 'email', 'email'],
                      ['TELEFONE', 'telefone', 'text'],
                      ['CPF', 'cpf', 'text'],
                      ['NASCIMENTO', 'data_nascimento', 'text'],
                      ['SEXO', 'sexo', 'text'],
                      ['INDICADO POR', 'indicado_por', 'text'],
                    ].map(([l, f, t]) => (
                      <div key={f}>
                        <div style={labelStyle}>{l}</div>
                        <input value={editData[f] || ''} onChange={e => setEditData({ ...editData, [f]: e.target.value })} type={t} style={inputStyle} />
                      </div>
                    ))}
                    <div>
                      <div style={labelStyle}>ORIGEM</div>
                      <select value={editData.origem || 'Instagram'} onChange={e => setEditData({ ...editData, origem: e.target.value })} style={inputStyle}>
                        {['Instagram', 'Google', 'Indicação', 'WhatsApp', 'Tráfego Pago', 'Levvai Day', 'Associado', 'Outro'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={labelStyle}>STATUS</div>
                      <select value={editData.status || 'lead'} onChange={e => setEditData({ ...editData, status: e.target.value })} style={inputStyle}>
                        {Object.entries(STATUS_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={labelStyle}>OBSERVAÇÕES GERAIS</div>
                    <textarea value={editData.observacoes_gerais || ''} onChange={e => setEditData({ ...editData, observacoes_gerais: e.target.value })}
                      rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={saveEdit} disabled={saving} style={{ padding: '8px 24px', background: GOLD, color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button onClick={() => setEditing(false)} style={{ padding: '8px 16px', background: 'white', color: '#888', border: '1px solid #ddd', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ABA TRATAMENTOS */}
          {tab === 'tratamentos' && (
            <div>
              {!showForm ? (
                <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '10px', background: 'white', border: `2px dashed ${GOLD}`, borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: GOLD, fontFamily: 'inherit', marginBottom: 14 }}>
                  + Registrar tratamento
                </button>
              ) : (
                <div style={{ background: LIGHT, borderRadius: 10, padding: 14, marginBottom: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div><div style={labelStyle}>DATA</div><input type="date" value={newTrat.data} onChange={e => setNewTrat({ ...newTrat, data: e.target.value })} style={inputStyle} /></div>
                    <div><div style={labelStyle}>HORÁRIO</div><input type="time" value={newTrat.horario || '09:00'} onChange={e => setNewTrat({ ...newTrat, horario: e.target.value })} style={inputStyle} /></div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={labelStyle}>PROCEDIMENTO</div>
                      <select value={newTrat.procedimento} onChange={e => setNewTrat({ ...newTrat, procedimento: e.target.value })} style={inputStyle}>
                        <option value="">Selecione...</option>
                        {produtosDB.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div><div style={labelStyle}>PRODUTO USADO</div><input value={newTrat.produto} onChange={e => setNewTrat({ ...newTrat, produto: e.target.value })} placeholder="Ex: Juvederm 1ml" style={inputStyle} /></div>
                    <div><div style={labelStyle}>REGIÃO</div><input value={newTrat.regiao} onChange={e => setNewTrat({ ...newTrat, regiao: e.target.value })} placeholder="Ex: Labial" style={inputStyle} /></div>
                    <div>
                      <div style={labelStyle}>PROFISSIONAL</div>
                      {associadosDB.length > 0 ? (
                        <select value={newTrat.profissional} onChange={e => setNewTrat({ ...newTrat, profissional: e.target.value })} style={inputStyle}>
                          <option value="">Selecionar profissional...</option>
                          {associadosDB.map(a => (
                            <option key={a.id} value={a.nome}>{a.nome}{a.especialidade ? ` — ${a.especialidade}` : ''}</option>
                          ))}
                        </select>
                      ) : (
                        <input value={newTrat.profissional} onChange={e => setNewTrat({ ...newTrat, profissional: e.target.value })} style={inputStyle} />
                      )}
                    </div>
                    <div><div style={labelStyle}>SESSÃO Nº</div><input type="number" value={newTrat.sessao} onChange={e => setNewTrat({ ...newTrat, sessao: Number(e.target.value) })} style={inputStyle} /></div>
                    <div><div style={labelStyle}>TOTAL SESSÕES</div><input type="number" value={newTrat.total_sessoes} onChange={e => setNewTrat({ ...newTrat, total_sessoes: Number(e.target.value) })} style={inputStyle} /></div>
                    <div><div style={labelStyle}>VALOR (R$)</div><input type="number" value={newTrat.valor} onChange={e => setNewTrat({ ...newTrat, valor: e.target.value })} style={inputStyle} /></div>
                    <div>
                      <div style={labelStyle}>FORMA DE PAGAMENTO</div>
                      <select value={newTrat.forma_pagamento} onChange={e => setNewTrat({ ...newTrat, forma_pagamento: e.target.value })} style={inputStyle}>
                        {['pix','dinheiro','débito','crédito 1x','crédito 2x','crédito 3x','crédito 4x','crédito 5x','crédito 6x','crédito 10x','crédito 12x','transferência','cortesia'].map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={labelStyle}>STATUS PAGAMENTO</div>
                      <select value={newTrat.status_pagamento} onChange={e => setNewTrat({ ...newTrat, status_pagamento: e.target.value })} style={inputStyle}>
                        {['pendente','pago','parcial','isento'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div><div style={labelStyle}>DATA PAGAMENTO</div><input type="date" value={newTrat.data_pagamento || ''} onChange={e => setNewTrat({ ...newTrat, data_pagamento: e.target.value })} style={inputStyle} /></div>
                  </div>
                  <div style={{ marginBottom: 8 }}><div style={labelStyle}>OBSERVAÇÕES</div><textarea value={newTrat.observacoes} onChange={e => setNewTrat({ ...newTrat, observacoes: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer', color: '#555' }}>
                      <input type="checkbox" checked={comProntuario} onChange={e => setComProntuario(e.target.checked)} />
                      Registrar entrada no prontuário
                    </label>
                  </div>
                  {comProntuario && (
                    <div style={{ background: '#E8F5E9', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                      <div style={{ marginBottom: 6 }}><div style={labelStyle}>TÍTULO DO PRONTUÁRIO</div><input value={newProntuarioInline.titulo} onChange={e => setNewProntuarioInline({ ...newProntuarioInline, titulo: e.target.value })} placeholder="Ex: Aplicação Botox — fronte" style={inputStyle} /></div>
                      <div><div style={labelStyle}>ANOTAÇÕES CLÍNICAS</div><textarea value={newProntuarioInline.conteudo} onChange={e => setNewProntuarioInline({ ...newProntuarioInline, conteudo: e.target.value })} rows={2} placeholder="Detalhes do procedimento, observações..." style={{ ...inputStyle, resize: 'vertical' }} /></div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={salvarTratamentoComProntuario} style={{ padding: '8px 20px', background: GOLD, color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Salvar</button>
                    <button onClick={() => setShowForm(false)} style={{ padding: '8px 14px', background: 'white', color: '#888', border: '1px solid #ddd', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                  </div>
                </div>
              )}

              {loading ? <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>Carregando...</div> : (
                tratamentos.length === 0 ? <div style={{ textAlign: 'center', padding: 20, color: '#ccc', fontSize: 13 }}>Nenhum tratamento registrado.</div> :
                <div>
                  <div style={{ display: 'flex', background: DARK, borderRadius: '8px 8px 0 0', padding: '8px 0' }}>
                    {['DATA', 'TRATAMENTO', 'VALOR', 'PAGAMENTO', 'FORMA', 'STATUS PAG.', 'STATUS TRAT.', ''].map((h, i) => (
                      <div key={i} style={{ flex: i === 1 ? 2 : i === 7 ? 0.7 : 1, fontSize: 9, fontWeight: 700, color: GOLD, textAlign: 'center', padding: '0 4px' }}>{h}</div>
                    ))}
                  </div>
                  {tratamentos.map((t, i) => {
                    if (editingTrat === t.id) {
                      const ef = editTratForm;
                      const setEf = patch => setEditTratForm(prev => ({ ...prev, ...patch }));
                      return (
                        <div key={i} style={{ background: '#FFF9F0', borderBottom: `2px solid ${GOLD}`, padding: 14 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                            <div><div style={labelStyle}>DATA</div><input type="date" value={ef.data || ''} onChange={e => setEf({ data: e.target.value })} style={inputStyle} /></div>
                            <div><div style={labelStyle}>HORÁRIO</div><input type="time" value={ef.horario || '09:00'} onChange={e => setEf({ horario: e.target.value })} style={inputStyle} /></div>
                            <div style={{ gridColumn: 'span 2' }}>
                              <div style={labelStyle}>PROCEDIMENTO</div>
                              <select value={ef.procedimento || ''} onChange={e => setEf({ procedimento: e.target.value })} style={inputStyle}>
                                <option value="">Selecione...</option>
                                {produtosDB.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
                                <option value="Outro">Outro</option>
                              </select>
                            </div>
                            <div><div style={labelStyle}>PRODUTO USADO</div><input value={ef.produto || ''} onChange={e => setEf({ produto: e.target.value })} style={inputStyle} /></div>
                            <div><div style={labelStyle}>REGIÃO</div><input value={ef.regiao || ''} onChange={e => setEf({ regiao: e.target.value })} style={inputStyle} /></div>
                            <div>
                              <div style={labelStyle}>PROFISSIONAL</div>
                              {associadosDB.length > 0 ? (
                                <select value={ef.profissional || ''} onChange={e => setEf({ profissional: e.target.value })} style={inputStyle}>
                                  <option value="">Selecionar...</option>
                                  {associadosDB.map(a => <option key={a.id} value={a.nome}>{a.nome}{a.especialidade ? ` — ${a.especialidade}` : ''}</option>)}
                                </select>
                              ) : (
                                <input value={ef.profissional || ''} onChange={e => setEf({ profissional: e.target.value })} style={inputStyle} />
                              )}
                            </div>
                            <div><div style={labelStyle}>SESSÃO Nº</div><input type="number" value={ef.sessao || 1} onChange={e => setEf({ sessao: Number(e.target.value) })} style={inputStyle} /></div>
                            <div><div style={labelStyle}>TOTAL SESSÕES</div><input type="number" value={ef.total_sessoes || 1} onChange={e => setEf({ total_sessoes: Number(e.target.value) })} style={inputStyle} /></div>
                            <div><div style={labelStyle}>VALOR (R$)</div><input type="number" value={ef.valor || ''} onChange={e => setEf({ valor: e.target.value })} style={inputStyle} /></div>
                            <div>
                              <div style={labelStyle}>FORMA PAGAMENTO</div>
                              <select value={ef.forma_pagamento || 'pix'} onChange={e => setEf({ forma_pagamento: e.target.value })} style={inputStyle}>
                                {['pix','dinheiro','débito','crédito 1x','crédito 2x','crédito 3x','crédito 4x','crédito 5x','crédito 6x','crédito 10x','crédito 12x','transferência','cortesia'].map(f => <option key={f}>{f}</option>)}
                              </select>
                            </div>
                            <div>
                              <div style={labelStyle}>STATUS PAGAMENTO</div>
                              <select value={ef.status_pagamento || 'pendente'} onChange={e => setEf({ status_pagamento: e.target.value })} style={inputStyle}>
                                {['pendente','pago','parcial','isento'].map(s => <option key={s}>{s}</option>)}
                              </select>
                            </div>
                            <div><div style={labelStyle}>DATA PAGAMENTO</div><input type="date" value={ef.data_pagamento || ''} onChange={e => setEf({ data_pagamento: e.target.value })} style={inputStyle} /></div>
                            <div>
                              <div style={labelStyle}>STATUS TRATAMENTO</div>
                              <select value={ef.status || 'pendente'} onChange={e => setEf({ status: e.target.value })} style={inputStyle}>
                                {['pendente','em_andamento','finalizado','cancelado'].map(s => <option key={s}>{s}</option>)}
                              </select>
                            </div>
                          </div>
                          <div style={{ marginBottom: 10 }}><div style={labelStyle}>OBSERVAÇÕES</div><textarea value={ef.observacoes || ''} onChange={e => setEf({ observacoes: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={atualizarTratamento} style={{ padding: '8px 20px', background: GOLD, color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Salvar alterações</button>
                            <button onClick={() => { setEditingTrat(null); setEditTratForm({}); }} style={{ padding: '8px 14px', background: 'white', color: '#888', border: '1px solid #ddd', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                          </div>
                        </div>
                      );
                    }
                    const pgColors = { pago: { bg: '#E8F5E9', tc: '#2E7D32' }, pendente: { bg: '#FFF9C4', tc: '#F57F17' }, parcial: { bg: '#E3F2FD', tc: '#1565C0' }, isento: { bg: '#F3E5F5', tc: '#6A1B9A' } };
                    const pg = pgColors[t.status_pagamento] || pgColors.pendente;
                    return (
                      <div key={i} style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #f0ece6', alignItems: 'center', background: i % 2 === 0 ? 'white' : '#FAFAF8' }}>
                        <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#888' }}>{new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                        <div style={{ flex: 2, fontSize: 12, fontWeight: 600, paddingLeft: 4 }}>{t.procedimento}</div>
                        <div style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 700, color: DARK }}>{t.valor ? `R$${Number(t.valor).toLocaleString('pt-BR')}` : '—'}</div>
                        <div style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#777' }}>{t.data_pagamento ? new Date(t.data_pagamento + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</div>
                        <div style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#777' }}>{t.forma_pagamento || '—'}</div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <select value={t.status_pagamento || 'pendente'} onChange={e => updateTratStatus(t, undefined, e.target.value)}
                            style={{ padding: '3px 6px', borderRadius: 10, fontSize: 9, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: pg.bg, color: pg.tc }}>
                            <option value="pendente">Pendente</option>
                            <option value="pago">Pago</option>
                            <option value="parcial">Parcial</option>
                            <option value="isento">Isento</option>
                          </select>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <select value={t.status} onChange={e => updateTratStatus(t, e.target.value, undefined)}
                            style={{ padding: '3px 6px', borderRadius: 10, fontSize: 9, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: STATUS_TRAT[t.status]?.bg || '#eee', color: STATUS_TRAT[t.status]?.tc || '#333' }}>
                            <option value="pendente">Pendente</option>
                            <option value="em_andamento">Em andamento</option>
                            <option value="finalizado">Finalizado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>
                        <div style={{ flex: 0.7, textAlign: 'center', display: 'flex', gap: 4, justifyContent: 'center' }}>
                          <a href={gerarLinkGoogleCalendar(t)} target="_blank" rel="noopener noreferrer"
                            title="Adicionar ao Google Calendar"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, background: '#E8F5E9', textDecoration: 'none', fontSize: 13 }}>
                            📅
                          </a>
                          <button onClick={() => { setEditingTrat(t.id); setEditTratForm({ ...t }); }} title="Editar tratamento" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, background: '#FFF3E0', border: 'none', cursor: 'pointer', fontSize: 13 }}>✏️</button>
                          <button onClick={() => deleteItem('tratamentos', t.id, setTratamentos)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ddd', fontFamily: 'inherit' }}>✕</button>
                        </div>
                      </div>
                    );
                  })}
                  {/* TOTAIS FINANCEIROS */}
                  <div style={{ background: LIGHT, borderRadius: '0 0 8px 8px', padding: '10px 12px', display: 'flex', gap: 20 }}>
                    {[
                      { label: 'Total procedimentos', value: `R$${tratamentos.reduce((a, t) => a + (Number(t.valor) || 0), 0).toLocaleString('pt-BR')}`, color: DARK },
                      { label: 'Pago', value: `R$${tratamentos.filter(t => t.status_pagamento === 'pago').reduce((a, t) => a + (Number(t.valor) || 0), 0).toLocaleString('pt-BR')}`, color: '#2E7D32' },
                      { label: 'Pendente', value: `R$${tratamentos.filter(t => t.status_pagamento === 'pendente').reduce((a, t) => a + (Number(t.valor) || 0), 0).toLocaleString('pt-BR')}`, color: '#F57F17' },
                    ].map((s, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#999' }}>{s.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ABA PRONTUÁRIO */}
          {tab === 'prontuario' && (
            <div>
              {!showForm ? (
                <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '10px', background: 'white', border: `2px dashed ${GOLD}`, borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: GOLD, fontFamily: 'inherit', marginBottom: 14 }}>
                  + Novo registro de prontuário
                </button>
              ) : (
                <div style={{ background: LIGHT, borderRadius: 10, padding: 14, marginBottom: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div><div style={labelStyle}>DATA</div><input type="date" value={newPront.data} onChange={e => setNewPront({ ...newPront, data: e.target.value })} style={inputStyle} /></div>
                    <div style={{ gridColumn: 'span 2' }}><div style={labelStyle}>TÍTULO</div><input value={newPront.titulo} onChange={e => setNewPront({ ...newPront, titulo: e.target.value })} placeholder="Ex: Avaliação inicial harmonização" style={inputStyle} /></div>
                    <div><div style={labelStyle}>PROFISSIONAL</div><input value={newPront.profissional} onChange={e => setNewPront({ ...newPront, profissional: e.target.value })} style={inputStyle} /></div>
                  </div>
                  <div style={{ marginBottom: 8 }}><div style={labelStyle}>CONTEÚDO CLÍNICO</div><textarea value={newPront.conteudo} onChange={e => setNewPront({ ...newPront, conteudo: e.target.value })} rows={5} placeholder="Anamnese, evolução, intercorrências, orientações..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} /></div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => addItem('prontuarios', newPront, setProntuarios, () => setNewPront({ data: today(), titulo: '', conteudo: '', profissional: 'Lara' }))} style={{ padding: '8px 20px', background: GOLD, color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Salvar</button>
                    <button onClick={() => setShowForm(false)} style={{ padding: '8px 14px', background: 'white', color: '#888', border: '1px solid #ddd', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                  </div>
                </div>
              )}
              {loading ? <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>Carregando...</div> :
                prontuarios.length === 0 ? <div style={{ textAlign: 'center', padding: 20, color: '#ccc', fontSize: 13 }}>Nenhum prontuário registrado.</div> :
                prontuarios.map((p, i) => (
                  <div key={i} style={{ background: 'white', border: '1px solid #E8E4DE', borderRadius: 10, padding: '14px 16px', marginBottom: 8, borderLeft: `4px solid ${GOLD}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{p.titulo}</div>
                        <div style={{ fontSize: 11, color: '#999', marginTop: 1 }}>{new Date(p.data + 'T12:00:00').toLocaleDateString('pt-BR')} · {p.profissional}</div>
                      </div>
                      <button onClick={() => deleteItem('prontuarios', p.id, setProntuarios)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ddd', fontFamily: 'inherit' }}>✕</button>
                    </div>
                    <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8, whiteSpace: 'pre-wrap', background: '#FAFAF8', borderRadius: 6, padding: '10px 12px' }}>{p.conteudo}</div>
                  </div>
                ))
              }
            </div>
          )}

          {/* ABA PROPOSTAS */}
          {tab === 'propostas' && (
            <div>
              {!showForm ? (
                <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '10px', background: 'white', border: `2px dashed ${GOLD}`, borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: GOLD, fontFamily: 'inherit', marginBottom: 14 }}>
                  + Nova proposta / orçamento
                </button>
              ) : (
                <div style={{ background: LIGHT, borderRadius: 10, padding: 14, marginBottom: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div><div style={labelStyle}>DATA</div><input type="date" value={newProp.data} onChange={e => setNewProp({ ...newProp, data: e.target.value })} style={inputStyle} /></div>
                    <div style={{ gridColumn: 'span 2' }}><div style={labelStyle}>TÍTULO</div><input value={newProp.titulo} onChange={e => setNewProp({ ...newProp, titulo: e.target.value })} placeholder="Ex: Protocolo harmonização completo" style={inputStyle} /></div>
                  </div>

                  {/* ITENS DO ORÇAMENTO */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: GOLD, marginBottom: 6 }}>ITENS DO ORÇAMENTO</div>
                    {(newProp.itens || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ flex: 2, fontSize: 12, fontWeight: 600 }}>{item.nome}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>x{item.qty}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: DARK }}>R${(item.preco * item.qty).toLocaleString('pt-BR')}</div>
                        <button onClick={() => setNewProp({ ...newProp, itens: newProp.itens.filter((_, i) => i !== idx) })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ddd', fontFamily: 'inherit' }}>✕</button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <select onChange={e => {
                        const prod = produtosDB.find(p => p.id === e.target.value);
                        if (!prod) return;
                        const itens = newProp.itens || [];
                        const exists = itens.findIndex(i => i.id === prod.id);
                        if (exists >= 0) {
                          setNewProp({ ...newProp, itens: itens.map((it, idx) => idx === exists ? { ...it, qty: it.qty + 1 } : it) });
                        } else {
                          setNewProp({ ...newProp, itens: [...itens, { id: prod.id, nome: prod.nome, preco: prod.preco_sugerido, custo: prod.custo_un, qty: 1 }] });
                        }
                        e.target.value = '';
                      }} defaultValue="" style={{ flex: 1, ...inputStyle }}>
                        <option value="">+ Adicionar produto do catálogo...</option>
                        {produtosDB.map(p => <option key={p.id} value={p.id}>{p.nome} — R${Number(p.preco_sugerido).toLocaleString('pt-BR')}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div>
                      <div style={labelStyle}>VALOR TOTAL (R$)</div>
                      <input type="number" value={newProp.valor_total}
                        onChange={e => setNewProp({ ...newProp, valor_total: e.target.value })}
                        placeholder={newProp.itens?.length ? String((newProp.itens || []).reduce((a, i) => a + i.preco * i.qty, 0)) : '0'}
                        style={inputStyle} />
                    </div>
                    <div><div style={labelStyle}>DESCONTO (%)</div><input type="number" value={newProp.desconto} onChange={e => setNewProp({ ...newProp, desconto: e.target.value })} style={inputStyle} /></div>
                    <div><div style={labelStyle}>PARCELAS</div>
                      <select value={newProp.parcelas} onChange={e => setNewProp({ ...newProp, parcelas: Number(e.target.value) })} style={inputStyle}>
                        {[1,2,3,4,5,6,8,10,12].map(n => <option key={n} value={n}>{n}x {n === 1 ? '(à vista)' : ''}</option>)}
                      </select>
                    </div>
                    <div><div style={labelStyle}>STATUS</div>
                      <select value={newProp.status} onChange={e => setNewProp({ ...newProp, status: e.target.value })} style={inputStyle}>
                        {['rascunho','enviada','aprovada','recusada'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}><div style={labelStyle}>OBSERVAÇÕES</div><textarea value={newProp.observacoes} onChange={e => setNewProp({ ...newProp, observacoes: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => {
                      const totalItens = (newProp.itens || []).reduce((a, i) => a + i.preco * i.qty, 0);
                      const valorFinal = newProp.valor_total || totalItens;
                      addItem('propostas', { ...newProp, valor_total: valorFinal }, setPropostas, () => setNewProp({ data: today(), titulo: '', itens: [], valor_total: '', desconto: 0, parcelas: 1, observacoes: '', status: 'rascunho' }));
                    }} style={{ padding: '8px 20px', background: GOLD, color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Salvar</button>
                    <button onClick={() => setShowForm(false)} style={{ padding: '8px 14px', background: 'white', color: '#888', border: '1px solid #ddd', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                  </div>
                </div>
              )}

              {loading ? <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>Carregando...</div> :
                propostas.length === 0 ? <div style={{ textAlign: 'center', padding: 20, color: '#ccc', fontSize: 13 }}>Nenhuma proposta registrada.</div> :
                propostas.map((p, i) => {
                  const descVal = Number(p.valor_total) * (Number(p.desconto) / 100);
                  const total = Number(p.valor_total) - descVal;
                  const stColors = { rascunho: { bg: '#F5F5F5', tc: '#999' }, enviada: { bg: '#E3F2FD', tc: '#1565C0' }, aprovada: { bg: '#E8F5E9', tc: '#2E7D32' }, recusada: { bg: '#FFEBEE', tc: '#B71C1C' } };
                  const sc = stColors[p.status] || stColors.rascunho;
                  const itens = p.itens || [];

                  const printProposta = () => {
                    const win = window.open('', '_blank');
                    win.document.write(`<!DOCTYPE html><html><head><title>Orçamento — ${paciente.nome}</title>
                    <style>
                      body { font-family: 'Helvetica Neue', sans-serif; padding: 40px 50px; color: #333; font-size: 13px; line-height: 1.8; }
                      .header { text-align: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #C8A96E; }
                      .logo { font-size: 28px; font-weight: 800; color: #1A1A1A; letter-spacing: 4px; }
                      .sub { font-size: 11px; color: #999; margin-top: 4px; }
                      h2 { font-size: 16px; color: #C8A96E; font-weight: 700; margin: 20px 0 8px; }
                      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
                      .info-item { background: #F5F0E8; padding: 8px 12px; border-radius: 6px; }
                      .info-label { font-size: 9px; font-weight: 700; color: #C8A96E; letter-spacing: 1px; }
                      .info-value { font-size: 13px; font-weight: 600; }
                      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                      th { background: #1A1A1A; color: #C8A96E; font-size: 10px; font-weight: 700; padding: 8px 10px; text-align: left; letter-spacing: 1px; }
                      td { padding: 8px 10px; border-bottom: 1px solid #f0ece6; font-size: 12px; }
                      tr:nth-child(even) td { background: #FAFAF8; }
                      .total-row { background: #F5F0E8 !important; font-weight: 800; font-size: 14px; }
                      .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 10px; color: #999; text-align: center; }
                      .assinatura { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
                      .assin-line { border-top: 1px solid #333; padding-top: 6px; font-size: 11px; text-align: center; color: #666; }
                      @media print { body { padding: 20px 30px; } }
                    </style></head><body>
                    <div class="header">
                      <div class="logo">LEVVAI</div>
                      <div class="sub">Instituto Levvai · Rua do Rocio, 288, cj 93 — Vila Olímpia, SP · @institutolevvai</div>
                    </div>
                    <h2>ORÇAMENTO</h2>
                    <div class="info-grid">
                      <div class="info-item"><div class="info-label">PACIENTE</div><div class="info-value">${paciente.nome}</div></div>
                      <div class="info-item"><div class="info-label">DATA</div><div class="info-value">${new Date(p.data + 'T12:00:00').toLocaleDateString('pt-BR')}</div></div>
                      <div class="info-item"><div class="info-label">TELEFONE</div><div class="info-value">${paciente.telefone || '—'}</div></div>
                      <div class="info-item"><div class="info-label">STATUS</div><div class="info-value">${p.status.toUpperCase()}</div></div>
                    </div>
                    ${p.titulo ? `<h2>${p.titulo}</h2>` : ''}
                    <table>
                      <thead><tr><th>PROCEDIMENTO / PRODUTO</th><th>QTD</th><th>VALOR UNIT.</th><th>SUBTOTAL</th></tr></thead>
                      <tbody>
                        ${itens.length > 0 ? itens.map(it => `<tr><td>${it.nome}</td><td>${it.qty}</td><td>R$${Number(it.preco).toLocaleString('pt-BR')}</td><td>R$${(it.preco * it.qty).toLocaleString('pt-BR')}</td></tr>`).join('') : `<tr><td colspan="4" style="text-align:center;color:#999">Sem itens detalhados</td></tr>`}
                      </tbody>
                    </table>
                    <table style="max-width:300px;margin-left:auto">
                      <tbody>
                        <tr><td>Subtotal</td><td style="text-align:right;font-weight:600">R$${Number(p.valor_total).toLocaleString('pt-BR')}</td></tr>
                        ${Number(p.desconto) > 0 ? `<tr><td style="color:#E65100">Desconto (${p.desconto}%)</td><td style="text-align:right;color:#E65100">- R$${descVal.toLocaleString('pt-BR')}</td></tr>` : ''}
                        <tr class="total-row"><td><strong>TOTAL</strong></td><td style="text-align:right"><strong>R$${total.toLocaleString('pt-BR')}</strong></td></tr>
                        ${p.parcelas > 1 ? `<tr><td style="color:#888">Parcelamento</td><td style="text-align:right;color:#888">${p.parcelas}x de R$${(total/p.parcelas).toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr>` : ''}
                      </tbody>
                    </table>
                    ${p.observacoes ? `<div style="background:#FFF9C4;padding:10px 14px;border-radius:6px;font-size:11px;color:#666;margin-top:10px"><strong>Observações:</strong> ${p.observacoes}</div>` : ''}
                    <div class="assinatura">
                      <div class="assin-line">Assinatura do Paciente</div>
                      <div class="assin-line">Dra. Lara — Instituto Levvai</div>
                    </div>
                    <div class="footer">
                      Orçamento válido por 30 dias · Instituto Levvai · (11) 97821-2800 · @institutolevvai<br>
                      Este orçamento não constitui contrato. Sujeito a avaliação clínica prévia.
                    </div>
                    </body></html>`);
                    win.document.close();
                    setTimeout(() => win.print(), 400);
                  };

                  return (
                    <div key={i} style={{ background: 'white', border: '1px solid #E8E4DE', borderRadius: 10, padding: '14px 16px', marginBottom: 8, borderLeft: '4px solid #2196F3' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{p.titulo || 'Orçamento'}</div>
                          <div style={{ fontSize: 11, color: '#999', marginTop: 1 }}>{new Date(p.data + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Badge text={p.status} color={sc.bg} textColor={sc.tc} />
                          {p.status !== 'aprovada' ? (
                            <button onClick={() => { setPropostaConverting(p); setConvertForm({ procedimento: p.titulo || '', valor: p.valor_total || '', forma_pagamento: 'pix', status_pagamento: 'pendente', data_pagamento: '', observacoes: '' }); }} style={{ padding: '5px 12px', background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✓ Converter em Venda</button>
                          ) : (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#2E7D32' }}>✓ Venda realizada</span>
                          )}
                          <button onClick={printProposta} style={{ padding: '5px 12px', background: DARK, color: GOLD, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🖨 Imprimir / PDF</button>
                          <button onClick={() => deleteItem('propostas', p.id, setPropostas)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ddd', fontFamily: 'inherit' }}>✕</button>
                        </div>
                      </div>
                      {itens.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          {itens.map((it, j) => (
                            <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0', borderBottom: '1px solid #f5f0e8' }}>
                              <span>{it.nome} x{it.qty}</span>
                              <span style={{ fontWeight: 600 }}>R${(it.preco * it.qty).toLocaleString('pt-BR')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                        <div>Valor: <strong>R${Number(p.valor_total).toLocaleString('pt-BR')}</strong></div>
                        {Number(p.desconto) > 0 && <div style={{ color: '#E65100' }}>Desconto: {p.desconto}%</div>}
                        <div style={{ color: GOLD, fontWeight: 700 }}>Total: R${total.toLocaleString('pt-BR')}</div>
                        {p.parcelas > 1 && <div style={{ color: '#888' }}>{p.parcelas}x de R${(total/p.parcelas).toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</div>}
                      </div>
                      {p.observacoes && <div style={{ fontSize: 11, color: '#888', marginTop: 6, fontStyle: 'italic' }}>{p.observacoes}</div>}
                    </div>
                  );
                })
              }
            </div>
          )}

          {/* ABA OBSERVAÇÕES */}
          {tab === 'observacoes' && (
            <div>
              {!showForm ? (
                <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '10px', background: 'white', border: `2px dashed ${GOLD}`, borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: GOLD, fontFamily: 'inherit', marginBottom: 14 }}>
                  + Nova observação
                </button>
              ) : (
                <div style={{ background: LIGHT, borderRadius: 10, padding: 14, marginBottom: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div><div style={labelStyle}>DATA</div><input type="date" value={newObs.data} onChange={e => setNewObs({ ...newObs, data: e.target.value })} style={inputStyle} /></div>
                    <div><div style={labelStyle}>AUTOR</div><input value={newObs.autor} onChange={e => setNewObs({ ...newObs, autor: e.target.value })} style={inputStyle} /></div>
                    <div><div style={labelStyle}>TIPO</div>
                      <select value={newObs.tipo} onChange={e => setNewObs({ ...newObs, tipo: e.target.value })} style={inputStyle}>
                        {['geral', 'clínico', 'comercial', 'financeiro', 'alerta'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}><div style={labelStyle}>OBSERVAÇÃO</div><textarea value={newObs.conteudo} onChange={e => setNewObs({ ...newObs, conteudo: e.target.value })} rows={3} placeholder="Anotação importante sobre o paciente..." style={{ ...inputStyle, resize: 'vertical' }} /></div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => addItem('observacoes', newObs, setObservacoes, () => setNewObs({ data: today(), conteudo: '', autor: 'Sirlândia', tipo: 'geral' }))} style={{ padding: '8px 20px', background: GOLD, color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Salvar</button>
                    <button onClick={() => setShowForm(false)} style={{ padding: '8px 14px', background: 'white', color: '#888', border: '1px solid #ddd', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                  </div>
                </div>
              )}
              {loading ? <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>Carregando...</div> :
                observacoes.length === 0 ? <div style={{ textAlign: 'center', padding: 20, color: '#ccc', fontSize: 13 }}>Nenhuma observação registrada.</div> :
                observacoes.map((o, i) => {
                  const tipoColors = { geral: '#E8EAF6', 'clínico': '#E8F5E9', comercial: '#FFF3E0', financeiro: '#E0F2F1', alerta: '#FFCDD2' };
                  return (
                    <div key={i} style={{ background: 'white', border: '1px solid #E8E4DE', borderRadius: 10, padding: '12px 14px', marginBottom: 6, borderLeft: `4px solid ${GOLD}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Badge text={o.tipo} color={tipoColors[o.tipo] || '#eee'} textColor='#555' />
                          <span style={{ fontSize: 11, color: '#999' }}>{new Date(o.data + 'T12:00:00').toLocaleDateString('pt-BR')} · {o.autor}</span>
                        </div>
                        <button onClick={() => deleteItem('observacoes', o.id, setObservacoes)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ddd', fontFamily: 'inherit' }}>✕</button>
                      </div>
                      <div style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>{o.conteudo}</div>
                    </div>
                  );
                })
              }
            </div>
          )}

        </div>
      </div>

      {/* MODAL: Converter Proposta em Venda */}
      {propostaConverting && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 14, padding: 24, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: DARK, marginBottom: 4 }}>Converter Proposta em Venda</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>Confirme os dados do tratamento que será gerado.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 }}>PROCEDIMENTO</div>
                <input value={convertForm.procedimento} onChange={e => setConvertForm({ ...convertForm, procedimento: e.target.value })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 }}>VALOR (R$)</div>
                <input type="number" value={convertForm.valor} onChange={e => setConvertForm({ ...convertForm, valor: e.target.value })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 }}>FORMA DE PAGAMENTO</div>
                <select value={convertForm.forma_pagamento} onChange={e => setConvertForm({ ...convertForm, forma_pagamento: e.target.value })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }}>
                  {['pix','dinheiro','débito','crédito 1x','crédito 2x','crédito 3x','crédito 6x','crédito 10x','crédito 12x','transferência','cortesia'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 }}>STATUS PAGAMENTO</div>
                <select value={convertForm.status_pagamento} onChange={e => setConvertForm({ ...convertForm, status_pagamento: e.target.value })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }}>
                  {['pendente','pago','parcial','isento'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 }}>DATA PAGAMENTO</div>
                <input type="date" value={convertForm.data_pagamento} onChange={e => setConvertForm({ ...convertForm, data_pagamento: e.target.value })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 }}>OBSERVAÇÕES</div>
                <textarea value={convertForm.observacoes} onChange={e => setConvertForm({ ...convertForm, observacoes: e.target.value })} rows={2} style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setPropostaConverting(null)} style={{ padding: '8px 16px', background: 'white', color: '#888', border: '1px solid #ddd', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
              <button onClick={converterPropostaEmVenda} style={{ padding: '8px 20px', background: '#2E7D32', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>✓ Confirmar Venda</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CRMTab = ({ shared }) => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [initialFilter, setInitialFilter] = useState('TODOS');
  const [newPac, setNewPac] = useState({ nome: '', telefone: '', email: '', cpf: '', data_nascimento: '', sexo: '', origem: 'Instagram', indicado_por: '', status: 'lead', observacoes_gerais: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('pacientes').select('*').order('created_at', { ascending: false });
    setPacientes(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createPaciente = async () => {
    if (!newPac.nome) return;
    setSaving(true);
    const { data, error } = await supabase.from('pacientes').insert(newPac).select().single();
    if (!error) {
      setPacientes(prev => [data, ...prev]);
      setNewPac({ nome: '', telefone: '', email: '', cpf: '', data_nascimento: '', sexo: '', origem: 'Instagram', indicado_por: '', status: 'lead', observacoes_gerais: '' });
      setShowNew(false);
    }
    setSaving(false);
  };

  const filtered = pacientes
    .filter(p => filterStatus === 'TODOS' || p.status === filterStatus)
    .filter(p => initialFilter === 'TODOS' || (p.nome || '').trim().toLocaleUpperCase('pt-BR').startsWith(initialFilter))
    .filter(p => !search || (p.nome || '').toLowerCase().includes(search.toLowerCase()) || (p.telefone || '').includes(search) || (p.email || '').toLowerCase().includes(search.toLowerCase()));

  const initials = [...new Set(pacientes.map(p => (p.nome || '').trim().charAt(0).toLocaleUpperCase('pt-BR')).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const birthdayInfo = (date) => {
    if (!date) return null;
    const clean = String(date).slice(0, 10);
    const parts = clean.includes('-') ? clean.split('-') : clean.split('/').reverse();
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (!month || !day) return null;
    const now = new Date();
    let next = new Date(now.getFullYear(), month - 1, day);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (next < todayStart) next = new Date(now.getFullYear() + 1, month - 1, day);
    const days = Math.round((next - todayStart) / 86400000);
    return { days, label: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}` };
  };
  const birthdays = pacientes.map(p => ({ ...p, birthday: birthdayInfo(p.data_nascimento) }))
    .filter(p => p.birthday && p.birthday.days <= 30)
    .sort((a, b) => a.birthday.days - b.birthday.days);

  const counts = Object.keys(STATUS_COLORS).reduce((acc, k) => ({ ...acc, [k]: pacientes.filter(p => p.status === k).length }), {});

  const inputStyle = { width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 9, fontWeight: 700, color: '#999', marginBottom: 3 };

  return (
    <div>
      {selected && (
        <FichaPaciente
          paciente={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updated) => {
            setPacientes(prev => prev.map(p => p.id === updated.id ? updated : p));
            setSelected(updated);
          }}
        />
      )}

      {/* FUNIL */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {[{ id: 'TODOS', label: 'Todos', bg: LIGHT, tc: GOLD }, ...Object.entries(STATUS_COLORS).map(([k, v]) => ({ id: k, label: v.label, bg: v.bg, tc: v.tc }))].map(s => (
          <button key={s.id} onClick={() => setFilterStatus(s.id)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', border: 'none',
            background: filterStatus === s.id ? DARK : s.bg,
            color: filterStatus === s.id ? GOLD : s.tc,
          }}>
            {s.label} ({s.id === 'TODOS' ? pacientes.length : counts[s.id] || 0})
          </button>
        ))}
      </div>

      {/* SEARCH + ADD */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, telefone ou e-mail..."
            style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#ccc', fontSize: 14 }}>⌕</span>
        </div>
        <button onClick={() => setShowNew(!showNew)} style={{ padding: '10px 20px', background: GOLD, color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          + Novo paciente
        </button>
      </div>

      <div className="crm-tools-grid">
        <div className="alphabet-filter">
          <div className="crm-tool-label">Lista por inicial</div>
          <div className="alphabet-buttons">
            <button className={initialFilter === 'TODOS' ? 'is-active' : ''} onClick={() => setInitialFilter('TODOS')}>Todos</button>
            {initials.map(letter => (
              <button key={letter} className={initialFilter === letter ? 'is-active' : ''} onClick={() => setInitialFilter(letter)}>{letter}</button>
            ))}
          </div>
        </div>
        <div className="birthday-panel">
          <div className="crm-tool-label">Aniversários · próximos 30 dias</div>
          {birthdays.length ? birthdays.slice(0, 4).map(p => (
            <button key={p.id} onClick={() => setSelected(p)} className="birthday-person">
              <span className="birthday-icon">🎂</span>
              <span><strong>{p.nome}</strong><small>{p.birthday.label}</small></span>
              <em>{p.birthday.days === 0 ? 'Hoje' : `em ${p.birthday.days}d`}</em>
            </button>
          )) : <div className="birthday-empty">Nenhum aniversário nos próximos 30 dias.</div>}
        </div>
      </div>

      {/* FORM NOVO */}
      {showNew && (
        <Card title="Cadastrar Novo Paciente / Lead">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div style={{ gridColumn: 'span 2' }}><div style={labelStyle}>NOME COMPLETO *</div><input value={newPac.nome} onChange={e => setNewPac({ ...newPac, nome: e.target.value })} placeholder="Nome completo" style={inputStyle} /></div>
            <div><div style={labelStyle}>STATUS</div>
              <select value={newPac.status} onChange={e => setNewPac({ ...newPac, status: e.target.value })} style={inputStyle}>
                {Object.entries(STATUS_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div><div style={labelStyle}>TELEFONE</div><input value={newPac.telefone} onChange={e => setNewPac({ ...newPac, telefone: e.target.value })} placeholder="(11) 99999-0000" style={inputStyle} /></div>
            <div><div style={labelStyle}>E-MAIL</div><input value={newPac.email} onChange={e => setNewPac({ ...newPac, email: e.target.value })} type="email" style={inputStyle} /></div>
            <div><div style={labelStyle}>CPF</div><input value={newPac.cpf} onChange={e => setNewPac({ ...newPac, cpf: e.target.value })} placeholder="000.000.000-00" style={inputStyle} /></div>
            <div><div style={labelStyle}>NASCIMENTO</div><input type="date" value={newPac.data_nascimento} onChange={e => setNewPac({ ...newPac, data_nascimento: e.target.value })} style={inputStyle} /></div>
            <div><div style={labelStyle}>SEXO</div>
              <select value={newPac.sexo} onChange={e => setNewPac({ ...newPac, sexo: e.target.value })} style={inputStyle}>
                <option value="">—</option><option>Feminino</option><option>Masculino</option><option>Outro</option>
              </select>
            </div>
            <div><div style={labelStyle}>ORIGEM</div>
              <select value={newPac.origem} onChange={e => setNewPac({ ...newPac, origem: e.target.value })} style={inputStyle}>
                {['Instagram', 'Google', 'Indicação', 'WhatsApp', 'Tráfego Pago', 'Levvai Day', 'Associado', 'Outro'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div><div style={labelStyle}>INDICADO POR</div><input value={newPac.indicado_por} onChange={e => setNewPac({ ...newPac, indicado_por: e.target.value })} placeholder="Nome de quem indicou" style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: 10 }}><div style={labelStyle}>OBSERVAÇÕES</div><textarea value={newPac.observacoes_gerais} onChange={e => setNewPac({ ...newPac, observacoes_gerais: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={createPaciente} disabled={saving} style={{ padding: '8px 24px', background: newPac.nome ? GOLD : '#ddd', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Salvando...' : 'Cadastrar'}
            </button>
            <button onClick={() => setShowNew(false)} style={{ padding: '8px 16px', background: 'white', color: '#888', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
          </div>
        </Card>
      )}

      {/* LISTA */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Carregando pacientes...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#ccc', fontSize: 14 }}>
          {pacientes.length === 0 ? 'Nenhum paciente cadastrado. Clique em "+ Novo paciente" para começar.' : 'Nenhum resultado encontrado.'}
        </div>
      ) : (
        <Card title={`${filtered.length} paciente(s)`}>
          <div style={{ display: 'flex', background: DARK, borderRadius: '8px 8px 0 0', padding: '8px 0' }}>
            {['NOME', 'TELEFONE', 'ORIGEM', 'STATUS', 'ÚLT. ATUALIZAÇÃO'].map((h, i) => (
              <div key={i} style={{ flex: i === 0 ? 2 : 1, fontSize: 9, fontWeight: 700, color: GOLD, textAlign: 'center', letterSpacing: '0.05em' }}>{h}</div>
            ))}
          </div>
          {filtered.map((p, i) => {
            const st = STATUS_COLORS[p.status] || STATUS_COLORS.lead;
            return (
              <div key={i} onClick={() => setSelected(p)} style={{
                display: 'flex', alignItems: 'center', padding: '10px 0',
                borderBottom: '1px solid #f0ece6', cursor: 'pointer',
                background: i % 2 === 0 ? 'white' : '#FAFAF8',
                transition: 'background 0.1s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#FFF9EE'}
              onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#FAFAF8'}>
                <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: st.bg === 'white' ? GOLD : st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: st.tc, flexShrink: 0 }}>
                    {(p.nome || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{p.nome}</div>
                    {p.email && <div style={{ fontSize: 11, color: '#999' }}>{p.email}</div>}
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#666' }}>{p.telefone || '—'}</div>
                <div style={{ flex: 1, textAlign: 'center' }}><Badge text={p.origem} color={LIGHT} textColor='#888' /></div>
                <div style={{ flex: 1, textAlign: 'center' }}><Badge text={st.label} color={st.bg} textColor={st.tc} /></div>
                <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#aaa' }}>
                  {new Date(p.updated_at || p.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
};

// PIPELINE LEGADO — preservado para referência interna (não exposto na UI)
const _CRMPipelineTab = ({ shared }) => {
  const pipelineStages = [
    { id: "novo", label: "NOVO LEAD", color: "#E3F2FD", tc: "#1565C0", icon: "●" },
    { id: "contato", label: "1º CONTATO", color: "#E8EAF6", tc: "#283593", icon: "●" },
    { id: "agendado", label: "AGENDADO", color: "#FFF3E0", tc: "#E65100", icon: "●" },
    { id: "atendido", label: "ATENDIDO", color: "#E8F5E9", tc: "#2E7D32", icon: "●" },
    { id: "retorno", label: "RETORNO", color: "#F3E5F5", tc: "#6A1B9A", icon: "●" },
    { id: "fidelizado", label: "FIDELIZADO", color: "#C8A96E", tc: "white", icon: "★" },
    { id: "perdido", label: "PERDIDO", color: "#FFEBEE", tc: "#B71C1C", icon: "✕" },
  ];

  const leads = shared.leads;
  const setLeads = shared.setLeads;

  const [showNewLead, setShowNewLead] = useState(false);
  const [newLead, setNewLead] = useState({ nome: "", tel: "", email: "", cpf: "", nascimento: "", origem: "Instagram", interesse: "", status: "novo", data: "", obs: "", agendamento: null, historico: [] });
  const [filterStage, setFilterStage] = useState("TODOS");
  const [schedulingIdx, setSchedulingIdx] = useState(null);
  const [schedForm, setSchedForm] = useState({ day: 0, room: "maca1", hour: 4, prof: "Lara" });
  const [viewMode, setViewMode] = useState("pipeline"); // pipeline or base
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedClient, setExpandedClient] = useState(null);

  const dayNames = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA"];
  const hourNames = ["9:00","9:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30"];
  const roomNames = { maca1: "Sala da Lara", maca2: "Sala Associados", consultorio: "Consultório", soro: "Soroterapia" };

  const addLead = () => {
    if (!newLead.nome) return;
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2,"0")}/${(now.getMonth()+1).toString().padStart(2,"0")}`;
    setLeads([{ ...newLead, data: dateStr, historico: [{ date: dateStr, action: "Cadastrado no CRM", by: "Sirlândia" }] }, ...leads]);
    setNewLead({ nome: "", tel: "", email: "", cpf: "", nascimento: "", origem: "Instagram", interesse: "", status: "novo", data: "", obs: "", agendamento: null, historico: [] });
    setShowNewLead(false);
  };

  const updateLeadStatus = (idx, newStatus) => {
    if (newStatus === "agendado") {
      setSchedulingIdx(idx);
    } else {
      setLeads(leads.map((l, i) => i === idx ? { ...l, status: newStatus } : l));
    }
  };

  const confirmSchedule = () => {
    if (schedulingIdx === null) return;
    const lead = leads[schedulingIdx];
    const slotKey = `${schedForm.day}-${schedForm.room}-${schedForm.hour}`;
    // Book the slot in shared agenda
    shared.setSlots({ ...shared.slots, [slotKey]: { prof: schedForm.prof, proc: lead.interesse, pac: lead.nome, fromCRM: true, origem: lead.origem } });
    // Update lead status and link agendamento
    setLeads(leads.map((l, i) => i === schedulingIdx ? {
      ...l, status: "agendado",
      agendamento: { ...schedForm },
      obs: `${l.obs ? l.obs + " | " : ""}Agendado: ${dayNames[schedForm.day]} ${hourNames[schedForm.hour]} — ${roomNames[schedForm.room]} — ${schedForm.prof}`
    } : l));
    setSchedulingIdx(null);
  };

  const updateLeadObs = (idx, obs) => {
    setLeads(leads.map((l, i) => i === idx ? { ...l, obs } : l));
  };

  const filtered = filterStage === "TODOS" ? leads : leads.filter(l => l.status === filterStage);

  const countByStage = (stage) => leads.filter(l => l.status === stage).length;
  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 ? Math.round(leads.filter(l => ["atendido", "retorno", "fidelizado"].includes(l.status)).length / totalLeads * 100) : 0;

  return (
    <div>
      {/* SECTION: OPERAÇÃO INTERNA */}
      <div style={{ background: DARK, borderRadius: 10, padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(200,169,110,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>◉</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "white" }}>Operação Interna</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Pipeline, leads, agendamento e fontes de captação — visão da Sirlândia e CEO</div>
        </div>
      </div>

      {/* VIEW MODE TOGGLE */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "white", borderRadius: 10, padding: 4, border: "1px solid #E8E4DE" }}>
        {[
          { id: "pipeline", label: "Pipeline de Leads", count: leads.length },
          { id: "base", label: "Base de Clientes", count: leads.filter(l => ["atendido","retorno","fidelizado"].includes(l.status)).length },
          { id: "cadastro", label: "+ Novo Cadastro", count: null },
        ].map(v => (
          <button key={v.id} onClick={() => { setViewMode(v.id); if (v.id === "cadastro") setShowNewLead(true); }}
            style={{
              flex: 1, padding: "10px 8px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", border: "none",
              background: viewMode === v.id ? DARK : "transparent",
              color: viewMode === v.id ? GOLD : "#888",
            }}>{v.label}{v.count !== null && ` (${v.count})`}</button>
        ))}
      </div>

      {/* CADASTRO DE NOVO CLIENTE */}
      {(showNewLead || viewMode === "cadastro") && (
        <Card title="Cadastro de Novo Cliente / Lead">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
            {[
              { label: "NOME COMPLETO", field: "nome", placeholder: "Maria da Silva", type: "text", span: 2 },
              { label: "TELEFONE (WHATSAPP)", field: "tel", placeholder: "(11) 99999-0000", type: "text", span: 1 },
              { label: "E-MAIL", field: "email", placeholder: "maria@email.com", type: "email", span: 1 },
              { label: "CPF", field: "cpf", placeholder: "000.000.000-00", type: "text", span: 1 },
              { label: "DATA DE NASCIMENTO", field: "nascimento", placeholder: "DD/MM/AAAA", type: "text", span: 1 },
            ].map((f, i) => (
              <div key={i} style={{ gridColumn: f.span === 2 ? "span 2" : "span 1" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em", marginBottom: 3 }}>{f.label}</div>
                <input value={newLead[f.field]} onChange={e => setNewLead({...newLead, [f.field]: e.target.value})}
                  placeholder={f.placeholder} type={f.type}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em", marginBottom: 3 }}>ORIGEM</div>
              <select value={newLead.origem} onChange={e => setNewLead({...newLead, origem: e.target.value})}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                {["Instagram", "Google", "Indicação", "WhatsApp orgânico", "Tráfego pago", "Levvai Day", "Associado", "Outro"].map(o =>
                  <option key={o} value={o}>{o}</option>
                )}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em", marginBottom: 3 }}>INTERESSE</div>
              <select value={newLead.interesse} onChange={e => setNewLead({...newLead, interesse: e.target.value})}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                <option value="">Selecione...</option>
                {["Levvai Lips (labial)", "Botox Full Face", "Harmonização facial", "Levvai Slim (emagrecimento)", "Levvai Glow (Profhilo)", "Levvai Lift (fios)", "Preenchimento corporal", "Exossomos", "PRP", "Dermatologia", "Nutrição", "Soroterapia", "Avaliação geral", "Outro"].map(p =>
                  <option key={p} value={p}>{p}</option>
                )}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em", marginBottom: 3 }}>STATUS</div>
              <select value={newLead.status} onChange={e => setNewLead({...newLead, status: e.target.value})}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                {pipelineStages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em", marginBottom: 3 }}>OBSERVAÇÕES</div>
            <input value={newLead.obs} onChange={e => setNewLead({...newLead, obs: e.target.value})}
              placeholder="Indicada pela Fernanda. Quer fazer avaliação esta semana..."
              style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { addLead(); setViewMode("pipeline"); }} style={{
              padding: "10px 24px", background: newLead.nome ? GOLD : "#ddd", color: "white",
              border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: newLead.nome ? "pointer" : "default", fontFamily: "inherit",
            }}>Cadastrar</button>
            <button onClick={() => { setShowNewLead(false); setViewMode("pipeline"); }} style={{
              padding: "10px 16px", background: "white", color: "#888", border: "1px solid #ddd",
              borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}>Cancelar</button>
          </div>
        </Card>
      )}

      {/* BASE DE CLIENTES */}
      {viewMode === "base" && (
        <>
          <Card title="Base de Clientes Cadastrados">
            <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, telefone ou interesse..."
                  style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#ccc", fontSize: 14 }}>⌕</span>
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>{leads.filter(l => ["atendido","retorno","fidelizado"].includes(l.status)).length} clientes ativos</div>
            </div>

            {leads
              .filter(l => ["atendido","retorno","fidelizado"].includes(l.status))
              .filter(l => !searchTerm || l.nome.toLowerCase().includes(searchTerm.toLowerCase()) || l.tel.includes(searchTerm) || l.interesse.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((l, idx) => {
                const realIdx = leads.indexOf(l);
                const stage = pipelineStages.find(s => s.id === l.status);
                const isExpanded = expandedClient === realIdx;
                return (
                  <div key={idx} style={{
                    background: "white", border: "1px solid #E8E4DE", borderRadius: 10,
                    marginBottom: 6, overflow: "hidden",
                    borderLeft: `4px solid ${l.status === "fidelizado" ? GOLD : stage?.tc || "#888"}`,
                  }}>
                    <div onClick={() => setExpandedClient(isExpanded ? null : realIdx)}
                      style={{ display: "flex", gap: 12, padding: "12px 14px", cursor: "pointer", alignItems: "center" }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: l.status === "fidelizado" ? GOLD : stage?.color || "#eee",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, fontWeight: 800, color: l.status === "fidelizado" ? "white" : stage?.tc || "#333",
                        flexShrink: 0,
                      }}>{l.nome[0]}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>{l.nome}</span>
                          {l.status === "fidelizado" && <Badge text="★ VIP" color={GOLD} textColor="white" />}
                          <Badge text={stage?.label} color={stage?.color} textColor={stage?.tc} />
                        </div>
                        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                          {l.tel} {l.email && `• ${l.email}`} • {l.interesse}
                        </div>
                      </div>
                      <span style={{ fontSize: 14, color: "#ccc", transform: isExpanded ? "rotate(180deg)" : "none", transition: "0.2s" }}>▾</span>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: "0 14px 14px", borderTop: "1px solid #f0ece6" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, padding: "12px 0" }}>
                          {[
                            { label: "Telefone", value: l.tel || "—" },
                            { label: "E-mail", value: l.email || "—" },
                            { label: "CPF", value: l.cpf || "—" },
                            { label: "Nascimento", value: l.nascimento || "—" },
                            { label: "Origem", value: l.origem },
                            { label: "Interesse", value: l.interesse },
                            { label: "Cadastro", value: l.data },
                            { label: "Status", value: stage?.label },
                          ].map((f, fi) => (
                            <div key={fi}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em" }}>{f.label}</div>
                              <div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>{f.value}</div>
                            </div>
                          ))}
                        </div>
                        {l.obs && (
                          <div style={{ background: "#FAFAF8", borderRadius: 6, padding: "8px 10px", fontSize: 12, color: "#666", marginBottom: 8 }}>
                            <span style={{ fontWeight: 700, color: "#999", fontSize: 10 }}>OBS: </span>{l.obs}
                          </div>
                        )}
                        {l.agendamento && (
                          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                            <Badge text={`📅 Último agendamento`} color="#FFF3E0" textColor="#E65100" />
                            <Badge text={roomNames[l.agendamento.room]} color="#E0F2F1" textColor="#00695C" />
                            <Badge text={l.agendamento.prof} color="#FCE4EC" textColor="#C62828" />
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => shared.navigateTo("comunicacao")} style={{
                            padding: "6px 14px", background: "#E8F5E9", color: "#2E7D32", border: "none",
                            borderRadius: 6, fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                          }}>Enviar WhatsApp</button>
                          <button onClick={() => shared.navigateTo("comunicacao")} style={{
                            padding: "6px 14px", background: "#E3F2FD", color: "#1565C0", border: "none",
                            borderRadius: 6, fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                          }}>Enviar E-mail</button>
                          <button onClick={() => shared.navigateTo("agenda")} style={{
                            padding: "6px 14px", background: "#FFF3E0", color: "#E65100", border: "none",
                            borderRadius: 6, fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                          }}>Agendar</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

            {leads.filter(l => ["atendido","retorno","fidelizado"].includes(l.status)).length === 0 && (
              <div style={{ textAlign: "center", padding: "30px", color: "#ccc" }}>
                <div style={{ fontSize: 13 }}>Nenhum cliente na base ainda. Cadastre leads e mova para "Atendido" conforme forem atendidos.</div>
              </div>
            )}
          </Card>

          {/* MÉTRICAS DA BASE */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <Metric label="Total na Base" value={leads.filter(l => ["atendido","retorno","fidelizado"].includes(l.status)).length} sub="clientes atendidos" />
            <Metric label="Fidelizados (VIP)" value={countByStage("fidelizado")} color={GOLD} sub="programa de indicação" />
            <Metric label="Retorno Pendente" value={countByStage("retorno")} color="#6A1B9A" sub="agendar próxima sessão" />
            <Metric label="Origem #1" value={(() => { const origins = {}; leads.filter(l=>["atendido","retorno","fidelizado"].includes(l.status)).forEach(l => { origins[l.origem] = (origins[l.origem]||0)+1; }); const top = Object.entries(origins).sort((a,b)=>b[1]-a[1])[0]; return top ? top[0] : "—"; })()} sub="canal que mais converte" />
          </div>
        </>
      )}

      {/* PIPELINE VIEW */}
      {viewMode === "pipeline" && (
        <>

      {/* FUNIL VISUAL */}
      <Card title="Funil de Conversão" accent>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {pipelineStages.filter(s => s.id !== "perdido").map((s, i) => {
            const count = countByStage(s.id);
            const width = Math.max(60, 100 - i * 6);
            return (
              <div key={s.id} style={{
                flex: 1, textAlign: "center", padding: "10px 4px",
                background: s.color, borderRadius: 8, position: "relative",
              }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.tc, fontFamily: "'DM Serif Display', Georgia, serif" }}>{count}</div>
                <div style={{ fontSize: 8, fontWeight: 700, color: s.tc, letterSpacing: "0.05em", marginTop: 2 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          <span>Total de leads: {totalLeads}</span>
          <span>Taxa de conversão: <strong style={{ color: GOLD }}>{conversionRate}%</strong></span>
          <span>Perdidos: {countByStage("perdido")}</span>
        </div>
      </Card>

      {/* PIPELINE FILTERS */}
      <Card title="Pipeline de Leads">
        <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
          <button onClick={() => setFilterStage("TODOS")} style={{
            background: filterStage === "TODOS" ? DARK : "white", color: filterStage === "TODOS" ? GOLD : "#888",
            border: `1px solid ${filterStage === "TODOS" ? DARK : "#ddd"}`, borderRadius: 20,
            padding: "5px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>TODOS ({totalLeads})</button>
          {pipelineStages.map(s => (
            <button key={s.id} onClick={() => setFilterStage(s.id)} style={{
              background: filterStage === s.id ? s.color : "white",
              color: filterStage === s.id ? s.tc : "#888",
              border: `1px solid ${filterStage === s.id ? "transparent" : "#ddd"}`,
              borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>{s.label} ({countByStage(s.id)})</button>
          ))}
        </div>

        {/* + NEW LEAD */}
        <button onClick={() => setViewMode("cadastro")} style={{
          width: "100%", padding: "10px", background: "white", border: `2px dashed ${GOLD}`,
          borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
          color: GOLD, fontFamily: "inherit", marginBottom: 12,
        }}>+ Cadastrar novo lead</button>

        {/* SCHEDULING MODAL */}
        {schedulingIdx !== null && (
          <div style={{ background: "#FFF3E0", border: `2px solid ${GOLD}`, borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: DARK, marginBottom: 4 }}>
              Agendar: {leads[schedulingIdx]?.nome} — {leads[schedulingIdx]?.interesse}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10, alignItems: "flex-end" }}>
              <div style={{ flex: "0 0 120px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>DIA</div>
                <select value={schedForm.day} onChange={e => setSchedForm({...schedForm, day: Number(e.target.value)})}
                  style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                  {dayNames.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div style={{ flex: "0 0 100px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>HORÁRIO</div>
                <select value={schedForm.hour} onChange={e => setSchedForm({...schedForm, hour: Number(e.target.value)})}
                  style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                  {hourNames.map((h, i) => <option key={i} value={i}>{h}</option>)}
                </select>
              </div>
              <div style={{ flex: "0 0 140px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>SALA</div>
                <select value={schedForm.room} onChange={e => setSchedForm({...schedForm, room: e.target.value})}
                  style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                  {Object.entries(roomNames).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div style={{ flex: "0 0 120px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>PROFISSIONAL</div>
                <select value={schedForm.prof} onChange={e => setSchedForm({...schedForm, prof: e.target.value})}
                  style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                  <option value="Lara">Lara</option>
                  <option value="Nutrólogo">Nutrólogo</option>
                  <option value="Dermato">Dermato</option>
                </select>
              </div>
              <button onClick={confirmSchedule} style={{ padding: "8px 20px", background: GOLD, color: "white", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                Confirmar
              </button>
              <button onClick={() => setSchedulingIdx(null)} style={{ padding: "8px 14px", background: "white", color: "#888", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                Cancelar
              </button>
            </div>
            <div style={{ fontSize: 10, color: "#999" }}>
              Ao confirmar, o horário será reservado na aba Agenda e o paciente receberá confirmação via aba Comunicação.
            </div>
          </div>
        )}

        {/* LEAD CARDS */}
        {filtered.map((l, idx) => {
          const stage = pipelineStages.find(s => s.id === l.status) || pipelineStages[0];
          const realIdx = leads.indexOf(l);
          return (
            <div key={idx} style={{
              background: "white", border: "1px solid #E8E4DE", borderRadius: 10,
              borderLeft: `4px solid ${stage.tc}`, marginBottom: 6, overflow: "hidden",
            }}>
              <div style={{ display: "flex", gap: 12, padding: "12px 14px", alignItems: "flex-start" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", background: stage.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: stage.tc, flexShrink: 0,
                }}>{l.nome[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{l.nome}</span>
                    <Badge text={l.origem} color="#F5F0E8" textColor="#8B7355" />
                    <span style={{ fontSize: 10, color: "#bbb" }}>{l.data}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#888" }}>{l.tel}</span>
                    {l.email && <><span style={{ fontSize: 11, color: "#aaa" }}>•</span><span style={{ fontSize: 12, color: "#888" }}>{l.email}</span></>}
                    <span style={{ fontSize: 11, color: "#aaa" }}>•</span>
                    <span style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>{l.interesse}</span>
                  </div>
                  <input value={l.obs} onChange={e => updateLeadObs(realIdx, e.target.value)}
                    placeholder="Observações, próximo passo..."
                    style={{ width: "100%", padding: "4px 8px", border: "1px solid #f0ece6", borderRadius: 4,
                      fontSize: 11, color: "#777", fontFamily: "inherit", outline: "none", background: "#FAFAF8", boxSizing: "border-box" }} />
                  {l.agendamento && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <Badge text={`📅 ${dayNames[l.agendamento.day]} ${hourNames[l.agendamento.hour]}`} color="#FFF3E0" textColor="#E65100" />
                      <Badge text={roomNames[l.agendamento.room]} color="#E0F2F1" textColor="#00695C" />
                      <Badge text={l.agendamento.prof} color="#FCE4EC" textColor="#C62828" />
                      <button onClick={() => shared.navigateTo("agenda")} style={{
                        background: "none", border: "none", cursor: "pointer", fontSize: 10, color: GOLD, fontWeight: 700, fontFamily: "inherit", textDecoration: "underline",
                      }}>Ver na Agenda →</button>
                    </div>
                  )}
                </div>
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <select value={l.status} onChange={e => updateLeadStatus(realIdx, e.target.value)}
                    style={{
                      padding: "5px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, fontFamily: "inherit",
                      border: "none", cursor: "pointer",
                      background: stage.color, color: stage.tc,
                    }}>
                    {pipelineStages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <button onClick={() => shared.navigateTo("comunicacao")} style={{
                    background: "none", border: "none", cursor: "pointer", fontSize: 9, color: "#2E7D32", fontWeight: 600, fontFamily: "inherit",
                  }}>💬 Enviar msg</button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px", color: "#ccc", fontSize: 13 }}>
            Nenhum lead neste estágio
          </div>
        )}
      </Card>

      {/* RÉGUA DE CRM */}
      {/* ORIGENS DE LEAD */}
      <Card title="Fontes de Captação — De onde vêm os leads?">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { source: "Instagram", type: "ORGÂNICO", desc: "DMs, comentários, Stories. Gi monitora e encaminha pra Sirlândia.", kpi: "Meta: 5 leads/semana", color: "#FCE4EC" },
            { source: "Google (SEO + Maps)", type: "ORGÂNICO", desc: "Busca 'clínica estética Vila Olímpia'. Google Business Profile.", kpi: "Meta: 3 leads/semana", color: "#E3F2FD" },
            { source: "Tráfego Pago", type: "INVESTIMENTO", desc: "Meta Ads e Google Ads. Landing page com WhatsApp direto.", kpi: "CAC alvo: R$80-150", color: "#FFF3E0" },
            { source: "Indicação", type: "ORGÂNICO", desc: "Paciente indica amiga. Programa de referral com benefício.", kpi: "Meta: 30% dos novos", color: "#E8F5E9" },
            { source: "Levvai Day", type: "EVENTO", desc: "Open house mensal. Avaliação express gratuita gera leads quentes.", kpi: "Meta: 3-5 leads/evento", color: "#FFE0B2" },
            { source: "WhatsApp Orgânico", type: "ORGÂNICO", desc: "Número da clínica. Sirlândia responde em até 30min.", kpi: "Meta: resposta <30min", color: "#E0F2F1" },
            { source: "Associados", type: "PARCEIRO", desc: "Pacientes que os associados trazem (split 70/30).", kpi: "Rastrear por associado", color: "#F3E5F5" },
            { source: "Cross-sell Interno", type: "INTERNO", desc: "Lara indica associado, ou paciente de dermato faz Lips.", kpi: "Meta: 1 cross-sell/paciente", color: "#E8EAF6" },
          ].map((s, i) => (
            <div key={i} style={{ background: s.color, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: DARK }}>{s.source}</span>
                <Badge text={s.type} color="rgba(0,0,0,0.06)" textColor="#888" />
              </div>
              <div style={{ fontSize: 11, color: "#555", lineHeight: 1.5, marginBottom: 4 }}>{s.desc}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: GOLD }}>{s.kpi}</div>
            </div>
          ))}
        </div>
      </Card>

        </>
      )}

      {/* LINK TO COMUNICAÇÃO TAB */}
      <div style={{ background: LIGHT, borderRadius: 10, padding: "16px 20px", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>Templates, régua de follow-up e disparos</div>
          <div style={{ fontSize: 11, color: "#888" }}>Toda comunicação com paciente está centralizada na aba Comunicação.</div>
        </div>
        <button onClick={() => shared.navigateTo("comunicacao")} style={{
          padding: "8px 20px", background: GOLD, color: "white", border: "none",
          borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
        }}>Ir para Comunicação →</button>
      </div>
    </div>
  );
};

// COMUNICAÇÃO TAB
const ComunicacaoTab = ({ shared }) => {
  const leads = shared.leads;
  const [selectedLead, setSelectedLead] = useState(null);
  const [channel, setChannel] = useState("whatsapp");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [callLog, setCallLog] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);

  const pipelineStages = [
    { id: "novo", label: "NOVO LEAD", color: "#E3F2FD", tc: "#1565C0" },
    { id: "contato", label: "1º CONTATO", color: "#E8EAF6", tc: "#283593" },
    { id: "agendado", label: "AGENDADO", color: "#FFF3E0", tc: "#E65100" },
    { id: "atendido", label: "ATENDIDO", color: "#E8F5E9", tc: "#2E7D32" },
    { id: "retorno", label: "RETORNO", color: "#F3E5F5", tc: "#6A1B9A" },
    { id: "fidelizado", label: "FIDELIZADO", color: "#C8A96E", tc: "white" },
    { id: "perdido", label: "PERDIDO", color: "#FFEBEE", tc: "#B71C1C" },
  ];

  const templates = [
    { id: "welcome", stage: "Boas-vindas", trigger: "NOVO LEAD", channel: "whatsapp", msg: "Oi [nome]! Tudo bem? Sou a Sirlândia, do Instituto Levvai. Vi que você se interessou por [procedimento]. Posso te ajudar com informações? A Dra. Lara tem horários disponíveis esta semana para uma avaliação gratuita 😊" },
    { id: "followup24", stage: "Follow-up 24h", trigger: "SEM RESPOSTA", channel: "whatsapp", msg: "Oi [nome], tudo bem? Só passando pra ver se conseguiu dar uma olhada nas informações que enviei. Se tiver qualquer dúvida, estou por aqui! A agenda da Dra. Lara está abrindo pra próxima semana." },
    { id: "confirm48", stage: "Confirmação 48h", trigger: "AGENDADO", channel: "whatsapp", auto: true, msg: "Oi [nome]! Confirmando sua consulta no Instituto Levvai: 📅 [data] às [hora]. Nosso endereço: Rua do Rocio, 288, cj 93 — Vila Olímpia. Qualquer coisa me avisa! Te esperamos 💛" },
    { id: "confirm24", stage: "Lembrete 24h", trigger: "AGENDADO", channel: "whatsapp", auto: true, msg: "Oi [nome]! Só lembrando que amanhã você tem consulta no Instituto Levvai às [hora]. Estamos te esperando! 💛" },
    { id: "confirm2h", stage: "Lembrete 2h", trigger: "AGENDADO", channel: "whatsapp", auto: true, msg: "Oi [nome]! Estamos te esperando hoje às [hora] no Instituto Levvai. Até já! 😊" },
    { id: "pos24", stage: "Pós-atendimento 24h", trigger: "ATENDIDO", channel: "whatsapp", auto: true, msg: "Oi [nome]! Como você está se sentindo depois do procedimento? Lembre-se das orientações que a Dra. Lara passou. Se tiver qualquer dúvida ou desconforto, me avisa que encaminho pra ela. Cuide-se! 💛" },
    { id: "review7", stage: "Pedido de review", trigger: "7 DIAS PÓS", channel: "whatsapp", msg: "Oi [nome]! Tudo bem? Sua opinião é super importante pra gente. Poderia deixar uma avaliação no nosso Google? Leva 1 minutinho: [link]. Muito obrigada! 🙏" },
    { id: "return30", stage: "Retorno 30 dias", trigger: "30 DIAS PÓS", channel: "whatsapp", msg: "Oi [nome]! Já faz 30 dias do seu [procedimento]. Como está se sentindo com o resultado? A Dra. Lara recomenda uma avaliação de acompanhamento. Quer que eu veja um horário pra você?" },
    { id: "reactivate", stage: "Reativação", trigger: "60 DIAS SEM CONTATO", channel: "whatsapp", msg: "Oi [nome]! Faz um tempo que não nos falamos. Temos uma novidade no Instituto Levvai que acho que vai te interessar: [novidade]. Quer saber mais?" },
    { id: "levvaiday", stage: "Convite Levvai Day", trigger: "EVENTO MENSAL", channel: "whatsapp", msg: "Oi [nome]! Você está convidada para o [tema] Day no Instituto Levvai! 📅 [data], das 9h às 16h. Condições especiais + avaliação express gratuita. Posso reservar seu horário?" },
    { id: "email_confirm", stage: "Confirmação formal", trigger: "AGENDADO", channel: "email", msg: "Assunto: Confirmação — Instituto Levvai\n\nOlá [nome],\n\nConfirmamos seu agendamento:\n📅 Data: [data]\n⏰ Horário: [hora]\n👩‍⚕️ Profissional: [profissional]\n📍 Rua do Rocio, 288, cj 93 — Vila Olímpia, SP\n\nOrientações:\n• Chegar 10 minutos antes\n• Trazer documento com foto\n• Pele limpa, sem maquiagem (se procedimento facial)\n\nQualquer dúvida: (11) XXXXX-XXXX\n\nAtenciosamente,\nEquipe Instituto Levvai" },
    { id: "email_pos", stage: "Pós-atendimento formal", trigger: "ATENDIDO", channel: "email", msg: "Assunto: Cuidados pós-procedimento — Instituto Levvai\n\nOlá [nome],\n\nFoi um prazer te atender hoje!\n\nSeus cuidados pós-procedimento:\n[orientações personalizadas]\n\nPróximo passo: retorno em [X dias].\nA Sirlândia vai entrar em contato para agendar.\n\nSe tiver qualquer dúvida ou desconforto, nos avise.\n\nCom carinho,\nDra. Lara e equipe Instituto Levvai" },
  ];

  const fillTemplate = (template, lead) => {
    if (!lead) return template.msg;
    return template.msg
      .replace(/\[nome\]/g, lead.nome)
      .replace(/\[procedimento\]/g, lead.interesse || "procedimento")
      .replace(/\[data\]/g, lead.agendamento ? "conforme agendado" : "[data]")
      .replace(/\[hora\]/g, lead.agendamento ? "conforme agendado" : "[hora]");
  };

  const selectTemplate = (t) => {
    setSelectedTemplate(t);
    setChannel(t.channel);
    setMessageText(fillTemplate(t, selectedLead ? leads.find((l,i) => i === selectedLead) : null));
  };

  const sendMessage = () => {
    if (!messageText || selectedLead === null) return;
    const lead = leads[selectedLead];
    const now = new Date();
    const ts = `${now.getDate().toString().padStart(2,"0")}/${(now.getMonth()+1).toString().padStart(2,"0")} ${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
    setSentMessages([{ to: lead.nome, channel, msg: messageText.substring(0, 80) + "...", time: ts, template: selectedTemplate?.stage || "Manual" }, ...sentMessages]);
    setMessageText("");
    setSelectedTemplate(null);
  };

  const logCall = () => {
    if (selectedLead === null) return;
    const lead = leads[selectedLead];
    const now = new Date();
    const ts = `${now.getDate().toString().padStart(2,"0")}/${(now.getMonth()+1).toString().padStart(2,"0")} ${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
    setCallLog([{ to: lead.nome, time: ts, status: "Registrada" }, ...callLog]);
  };

  const autoTriggers = templates.filter(t => t.auto);
  const scheduledLeads = leads.filter(l => l.status === "agendado" && l.agendamento);

  return (
    <div>
      <Card title="Central de Comunicação — Instituto Levvai" accent>
        <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>
          WhatsApp, e-mail e telefone. Selecione o paciente, escolha o template ou escreva manualmente, e dispare.
          Mensagens automáticas são enviadas quando o lead muda de status no CRM.
        </p>
      </Card>

      {/* AUTOMAÇÕES ATIVAS */}
      <Card title="Automações — Disparos automáticos por status">
        <div style={{ fontSize: 11, color: "#999", marginBottom: 10 }}>
          Quando o status do lead muda no CRM, esses disparos são acionados automaticamente. Sirlândia recebe alerta pra personalizar e enviar.
        </div>
        {autoTriggers.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0ece6" }}>
            <Badge text={t.trigger} color="#FFF3E0" textColor="#E65100" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{t.stage}</div>
              <div style={{ fontSize: 10, color: "#999" }}>{t.msg.substring(0, 70)}...</div>
            </div>
            <Badge text={t.channel === "whatsapp" ? "WhatsApp" : "E-mail"} color={t.channel === "whatsapp" ? "#E8F5E9" : "#E3F2FD"} textColor={t.channel === "whatsapp" ? "#2E7D32" : "#1565C0"} />
            <Badge text="AUTO" color="#C8A96E" textColor="white" />
          </div>
        ))}
        {scheduledLeads.length > 0 && (
          <div style={{ background: "#FFF3E0", borderRadius: 8, padding: "10px 14px", marginTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#E65100", marginBottom: 4 }}>
              {scheduledLeads.length} paciente(s) agendado(s) — confirmações pendentes:
            </div>
            {scheduledLeads.map((l, i) => (
              <div key={i} style={{ fontSize: 12, color: "#555", padding: "2px 0" }}>
                › {l.nome} — {l.interesse} — ações: confirmação 48h, lembrete 24h, lembrete 2h
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* COMPOSITOR DE MENSAGEM */}
      <Card title="Enviar Mensagem">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          {/* Select patient */}
          <div style={{ flex: "1 1 200px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#999", marginBottom: 3 }}>PACIENTE</div>
            <select value={selectedLead ?? ""} onChange={e => { setSelectedLead(e.target.value === "" ? null : Number(e.target.value)); setMessageText(""); setSelectedTemplate(null); }}
              style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8, fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
              <option value="">Selecione o paciente...</option>
              {leads.map((l, i) => <option key={i} value={i}>{l.nome} — {l.interesse} ({l.status})</option>)}
            </select>
          </div>
          {/* Channel selector */}
          <div style={{ flex: "0 0 200px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#999", marginBottom: 3 }}>CANAL</div>
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { id: "whatsapp", label: "WhatsApp", color: "#2E7D32", bg: "#E8F5E9" },
                { id: "email", label: "E-mail", color: "#1565C0", bg: "#E3F2FD" },
                { id: "phone", label: "Telefone", color: "#E65100", bg: "#FFF3E0" },
              ].map(c => (
                <button key={c.id} onClick={() => setChannel(c.id)} style={{
                  flex: 1, padding: "7px 4px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit", border: "1px solid",
                  background: channel === c.id ? c.bg : "white",
                  color: channel === c.id ? c.color : "#999",
                  borderColor: channel === c.id ? c.color : "#ddd",
                }}>{c.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Phone log */}
        {channel === "phone" && selectedLead !== null && (
          <div style={{ background: "#FFF3E0", borderRadius: 8, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#E65100", marginBottom: 6 }}>
              Ligar para: {leads[selectedLead]?.nome} — {leads[selectedLead]?.tel}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <a href={`tel:${leads[selectedLead]?.tel?.replace(/\D/g,"")}`} style={{
                padding: "8px 20px", background: "#E65100", color: "white", borderRadius: 8,
                fontWeight: 700, fontSize: 12, textDecoration: "none", fontFamily: "inherit",
              }}>Ligar agora</a>
              <button onClick={logCall} style={{
                padding: "8px 16px", background: "white", color: "#E65100", border: "1px solid #E65100",
                borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              }}>Registrar ligação</button>
            </div>
          </div>
        )}

        {/* Template selector */}
        {channel !== "phone" && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#999", marginBottom: 6 }}>TEMPLATES {channel === "whatsapp" ? "WHATSAPP" : "E-MAIL"}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
              {templates.filter(t => t.channel === channel).map((t, i) => (
                <button key={i} onClick={() => selectTemplate(t)} style={{
                  padding: "6px 12px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                  background: selectedTemplate?.id === t.id ? GOLD : "white",
                  color: selectedTemplate?.id === t.id ? "white" : "#666",
                  border: `1px solid ${selectedTemplate?.id === t.id ? GOLD : "#ddd"}`,
                }}>{t.stage}</button>
              ))}
              <button onClick={() => { setSelectedTemplate(null); setMessageText(""); }} style={{
                padding: "6px 12px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                background: !selectedTemplate ? DARK : "white",
                color: !selectedTemplate ? GOLD : "#888",
                border: `1px solid ${!selectedTemplate ? DARK : "#ddd"}`,
              }}>Mensagem livre</button>
            </div>

            {/* Message editor */}
            <textarea value={messageText} onChange={e => setMessageText(e.target.value)}
              placeholder={selectedLead !== null ? `Escreva a mensagem para ${leads[selectedLead]?.nome}...` : "Selecione um paciente primeiro..."}
              rows={channel === "email" ? 10 : 4}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <div style={{ fontSize: 10, color: "#bbb" }}>
                {messageText.length > 0 && `${messageText.length} caracteres`}
                {selectedTemplate?.auto && <span style={{ color: "#E65100", fontWeight: 700 }}> — este template é disparado automaticamente</span>}
              </div>
              <button onClick={sendMessage} disabled={!messageText || selectedLead === null} style={{
                padding: "10px 28px", background: messageText && selectedLead !== null ? (channel === "whatsapp" ? "#2E7D32" : "#1565C0") : "#ddd",
                color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13,
                cursor: messageText && selectedLead !== null ? "pointer" : "default", fontFamily: "inherit",
              }}>{channel === "whatsapp" ? "Enviar WhatsApp" : "Enviar E-mail"}</button>
            </div>
          </>
        )}
      </Card>

      {/* HISTÓRICO */}
      {/* RÉGUA DE TEMPO POR CLIENTE */}
      <Card title="Régua de Tempo — Último contato por cliente">
        <div style={{ fontSize: 11, color: "#999", marginBottom: 12 }}>
          Visão rápida de quando foi o último contato com cada paciente. Vermelho = atrasado no follow-up. Verde = em dia.
        </div>

        {leads.map((l, idx) => {
          const stage = pipelineStages.find(s => s.id === l.status);
          const lastMsg = sentMessages.find(m => m.to === l.nome);
          const lastCall = callLog.find(c => c.to === l.nome);
          const lastContact = lastMsg || lastCall;

          // Simulate days since contact based on lead data
          const daysSinceStr = l.data;
          const dayParts = daysSinceStr?.split("/");
          const leadDate = dayParts ? new Date(2026, parseInt(dayParts[1])-1, parseInt(dayParts[0])) : new Date();
          const now = new Date();
          const daysSince = Math.floor((now - leadDate) / (1000 * 60 * 60 * 24));

          const isOverdue = (l.status === "novo" && daysSince > 0) ||
                           (l.status === "contato" && daysSince > 2) ||
                           (l.status === "atendido" && daysSince > 7) ||
                           (l.status === "retorno" && daysSince > 30);

          const nextAction = l.status === "novo" ? "Responder em 30min" :
                            l.status === "contato" ? "Agendar avaliação" :
                            l.status === "agendado" ? "Enviar confirmação" :
                            l.status === "atendido" ? (daysSince < 2 ? "Pós 24h" : daysSince < 8 ? "Pedir review Google" : "Lembrete retorno 30d") :
                            l.status === "retorno" ? "Agendar próxima sessão" :
                            l.status === "fidelizado" ? "Convite Levvai Day / Aniversário" :
                            l.status === "perdido" ? (daysSince < 31 ? "Última tentativa" : daysSince < 61 ? "Reativação" : "Base fria") : "";

          return (
            <div key={idx} style={{
              display: "flex", gap: 10, padding: "10px 12px", marginBottom: 4,
              background: isOverdue ? "#FFF5F5" : "white",
              border: `1px solid ${isOverdue ? "#FFCDD2" : "#f0ece6"}`,
              borderRadius: 8, alignItems: "center",
              borderLeft: `4px solid ${isOverdue ? "#EF5350" : stage?.tc || "#ccc"}`,
            }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: stage?.color || "#eee", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, color: stage?.tc || "#333",
              }}>{l.nome[0]}</div>

              {/* Client info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{l.nome}</span>
                  <Badge text={stage?.label} color={stage?.color} textColor={stage?.tc} />
                </div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>{l.interesse}</div>
              </div>

              {/* Last contact */}
              <div style={{ textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", letterSpacing: "0.05em" }}>ÚLTIMO CONTATO</div>
                {lastContact ? (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: DARK }}>{lastContact.time}</div>
                    <div style={{ fontSize: 9, color: "#999" }}>
                      {lastContact.type === "call" ? "📞 Ligação" : lastContact.channel === "whatsapp" ? "💬 WhatsApp" : "📧 E-mail"}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#bbb" }}>{l.data || "—"}</div>
                    <div style={{ fontSize: 9, color: "#bbb" }}>Cadastro</div>
                  </>
                )}
              </div>

              {/* Last message preview */}
              <div style={{ flex: 1.2, minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", letterSpacing: "0.05em" }}>ÚLTIMA MSG</div>
                <div style={{ fontSize: 11, color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {lastMsg ? `${lastMsg.template}: ${lastMsg.msg}` : l.obs || "Nenhuma mensagem enviada"}
                </div>
              </div>

              {/* Days indicator */}
              <div style={{ textAlign: "center", minWidth: 50 }}>
                <div style={{
                  fontSize: 18, fontWeight: 900, fontFamily: "'DM Serif Display', Georgia, serif",
                  color: isOverdue ? "#EF5350" : daysSince <= 1 ? "#2E7D32" : daysSince <= 7 ? GOLD : "#FF9800",
                }}>{daysSince}</div>
                <div style={{ fontSize: 8, color: "#999" }}>dias</div>
              </div>

              {/* Next action */}
              <div style={{ minWidth: 110, textAlign: "right" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: isOverdue ? "#EF5350" : GOLD, letterSpacing: "0.03em" }}>
                  {isOverdue ? "⚠ ATRASADO" : "PRÓXIMA AÇÃO"}
                </div>
                <div style={{ fontSize: 10, color: "#666", marginTop: 1 }}>{nextAction}</div>
              </div>
            </div>
          );
        })}

        {/* LEGENDA */}
        <div style={{ display: "flex", gap: 12, marginTop: 12, paddingTop: 10, borderTop: "1px solid #f0ece6" }}>
          {[
            { color: "#2E7D32", label: "Em dia (0-1 dias)" },
            { color: GOLD, label: "Atenção (2-7 dias)" },
            { color: "#FF9800", label: "Monitorar (8-30 dias)" },
            { color: "#EF5350", label: "Atrasado (acima do prazo)" },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.color }} />
              <span style={{ fontSize: 10, color: "#888" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* HISTÓRICO DE DISPAROS */}
      <Card title="Histórico de Disparos">
        {sentMessages.length === 0 && callLog.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#ccc", fontSize: 13 }}>Nenhuma comunicação registrada ainda. Selecione um paciente e envie uma mensagem acima.</div>
        ) : (
          <>
            {[...sentMessages.map(m => ({ ...m, type: "msg" })), ...callLog.map(c => ({ ...c, type: "call" }))].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0ece6" }}>
                <Badge text={item.type === "call" ? "📞" : item.channel === "whatsapp" ? "💬" : "📧"}
                  color={item.type === "call" ? "#FFF3E0" : item.channel === "whatsapp" ? "#E8F5E9" : "#E3F2FD"} textColor="#333" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{item.to}</div>
                  <div style={{ fontSize: 10, color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.type === "call" ? "Ligação registrada" : `${item.template}: ${item.msg}`}
                  </div>
                </div>
                <span style={{ fontSize: 10, color: "#bbb", flexShrink: 0 }}>{item.time}</span>
              </div>
            ))}
          </>
        )}
      </Card>

      {/* RÉGUA DE FOLLOW-UP */}
      <Card title="Régua de Relacionamento — Timing de cada etapa">
        {[
          { stage: "NOVO LEAD", color: "#E3F2FD", timing: "Em até 30 minutos", actions: ["Responder WhatsApp/DM com boas-vindas", "Identificar interesse e registrar no CRM", "Oferecer avaliação gratuita"] },
          { stage: "1º CONTATO", color: "#E8EAF6", timing: "Até 24h após", actions: ["Se não respondeu: 2ª mensagem", "Se respondeu: agendar avaliação", "Se não agendou em 48h: follow-up semanal"] },
          { stage: "AGENDADO", color: "#FFF3E0", timing: "48h + 24h + 2h antes", actions: ["Confirmação automática 48h antes", "Lembrete 24h antes", "Última confirmação 2h antes", "Se cancelou: reagendar na hora"] },
          { stage: "ATENDIDO", color: "#E8F5E9", timing: "24h + 7 dias + 30 dias", actions: ["Pós-atendimento 24h (como se sentiu?)", "Pedir review Google em 7 dias", "Pedir depoimento em 7 dias", "Lembrete retorno em 30 dias"] },
          { stage: "FIDELIZADO", color: "#F5F0E8", timing: "Mensal + datas especiais", actions: ["Lista VIP — acesso antecipado", "Mensagem no aniversário", "Programa de indicação", "Convite Levvai Day"] },
          { stage: "PERDIDO", color: "#FFEBEE", timing: "30 + 60 + 90 dias", actions: ["30 dias: última tentativa", "60 dias: reativação com novidade", "90 dias: mover para base fria"] },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0ece6", alignItems: "flex-start" }}>
            <Badge text={s.stage} color={s.color} textColor="#333" />
            <div style={{ fontSize: 10, color: "#999", minWidth: 90 }}>{s.timing}</div>
            <div style={{ flex: 1, fontSize: 11, color: "#555" }}>{s.actions.join(" → ")}</div>
          </div>
        ))}
      </Card>

      {/* REGRAS */}
      <Card title="Regras de Comunicação">
        {[
          "Lead novo = resposta em 30 MINUTOS. Sem exceção.",
          "Primeiro contato sempre por texto, nunca áudio.",
          "Gi encaminha DMs pra Sirlândia. Gi não responde sobre preço.",
          "Nunca discutir preço por WhatsApp. Levar pra avaliação gratuita.",
          "Follow-up é obrigatório. 80% convertem entre o 2º e 5º contato.",
          "Personalizar TODA mensagem com nome e procedimento. Zero genérico.",
          "E-mail: usar pra confirmações formais e pós-atendimento com orientações.",
          "Telefone: usar pra no-shows (ligar no mesmo dia) e reativação.",
          "CEO valida novos templates na weekly antes de entrarem em uso.",
          "Registrar toda comunicação no histórico. Sem registro = não aconteceu.",
        ].map((r, i) => (
          <div key={i} style={{ fontSize: 12, color: "#555", padding: "5px 0", display: "flex", gap: 6, borderBottom: "1px solid #f5f0e8" }}>
            <span style={{ color: GOLD, fontWeight: 800, fontSize: 12, minWidth: 22 }}>{(i+1).toString().padStart(2,"0")}</span>
            {r}
          </div>
        ))}
      </Card>
    </div>
  );
};

// TERMOS DO PACIENTE TAB
const TermosTab = () => {
  const [activeDoc, setActiveDoc] = useState("tcle");
  const docs = [
    { id: "tcle", name: "TCLE — Termo de Consentimento", desc: "Consentimento livre e esclarecido para procedimentos estéticos" },
    { id: "imagem", name: "Termo de Uso de Imagem", desc: "Autorização para uso de fotos/vídeos antes e depois" },
    { id: "lgpd", name: "Termo LGPD", desc: "Consentimento para tratamento de dados pessoais e sensíveis" },
    { id: "anamnese", name: "Ficha de Anamnese", desc: "Histórico médico, alergias, medicamentos em uso" },
    { id: "tirze", name: "Termo Específico — Tirzepatida", desc: "Consentimento específico para protocolo de emagrecimento" },
    { id: "menores", name: "Termo Responsável Legal", desc: "Autorização para pacientes de 16-17 anos (acompanhados)" },
  ];

  const templates = {
    tcle: { title: "TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO", sections: [
      { heading: "IDENTIFICAÇÃO DO PACIENTE", fields: ["Nome completo", "CPF", "RG", "Data de nascimento", "Endereço", "Telefone", "E-mail"] },
      { heading: "PROCEDIMENTO", fields: ["Tipo de procedimento", "Região de aplicação", "Produto utilizado (nome, lote, validade)", "Profissional responsável (nome, CRM/CRO)", "Número de sessões previstas"] },
      { heading: "INFORMAÇÕES AO PACIENTE", content: "Declaro que fui informado(a) de forma clara e objetiva sobre:\n• A natureza do procedimento proposto, seus benefícios e limitações\n• Os riscos e possíveis complicações (edema, equimose, assimetria, infecção, reação alérgica, necrose vascular, nódulos)\n• As alternativas terapêuticas disponíveis\n• Que o resultado pode variar de pessoa para pessoa\n• A necessidade de seguir as orientações pós-procedimento\n• O direito de revogar este consentimento a qualquer momento antes do procedimento\n• Que fotografias de antes e depois serão realizadas para documentação clínica (uso interno)" },
      { heading: "CONTRAINDICAÇÕES DECLARADAS", content: "Declaro que informei ao profissional sobre:\n• Gestação ou suspeita de gestação / amamentação\n• Alergias conhecidas\n• Doenças autoimunes\n• Uso de anticoagulantes\n• Tratamentos dermatológicos em curso\n• Histórico de queloides\n• Procedimentos estéticos prévios na mesma região" },
      { heading: "CONSENTIMENTO", content: "Declaro que li e compreendi todas as informações acima, que tive a oportunidade de esclarecer minhas dúvidas com o profissional responsável, e que consinto livremente com a realização do procedimento proposto." },
      { heading: "ASSINATURAS", fields: ["Data", "Assinatura do paciente", "Nome do profissional", "CRM/CRO", "Assinatura do profissional"] },
    ]},
    imagem: { title: "TERMO DE AUTORIZAÇÃO DE USO DE IMAGEM", sections: [
      { heading: "IDENTIFICAÇÃO", fields: ["Nome completo", "CPF", "RG", "Data de nascimento"] },
      { heading: "AUTORIZAÇÃO", content: "Autorizo o Instituto Levvai (CNPJ: [CNPJ]), representado por Dra. Lara [sobrenome] (CRO: [número]), a captar, armazenar e utilizar minha imagem (fotografias e/ou vídeos) obtida(s) durante meu(s) atendimento(s), para as seguintes finalidades:" },
      { heading: "FINALIDADES AUTORIZADAS", content: "[ ] Documentação clínica interna (prontuário)\n[ ] Publicação em redes sociais do Instituto Levvai (@institutolevvai)\n[ ] Material educativo e científico\n[ ] Material publicitário (site, anúncios, impressos)\n[ ] Apresentações em congressos e eventos científicos\n\nObs: Mesmo com autorização, o Instituto Levvai preservará minha identidade, não divulgando meu nome completo sem autorização adicional expressa." },
      { heading: "CONDIÇÕES", content: "• Esta autorização é válida por prazo indeterminado, podendo ser revogada a qualquer momento mediante comunicação por escrito\n• As imagens não serão compartilhadas com terceiros fora das finalidades acima\n• Não haverá qualquer remuneração pela cessão de uso de imagem\n• O Instituto Levvai se compromete a não utilizar as imagens de forma depreciativa" },
      { heading: "ASSINATURAS", fields: ["Data", "Assinatura do paciente", "Testemunha (Sirlândia)", "Assinatura do profissional"] },
    ]},
    lgpd: { title: "TERMO DE CONSENTIMENTO — PROTEÇÃO DE DADOS (LGPD)", sections: [
      { heading: "CONTROLADOR", content: "Instituto Levvai — CNPJ: [CNPJ]\nRua do Rocio, 288, cj 93 — Vila Olímpia, São Paulo, SP\nResponsável: [Nome do responsável legal]\nContato DPO: [e-mail]" },
      { heading: "DADOS COLETADOS", content: "Dados pessoais: nome, CPF, RG, data de nascimento, endereço, telefone, e-mail\nDados sensíveis: histórico de saúde, alergias, medicamentos, fotografias clínicas\nDados de navegação: quando aplicável (cookies do site)" },
      { heading: "FINALIDADES", content: "• Prestação de serviços de saúde e estética\n• Prontuário médico/odontológico (obrigação legal — CFM/CFO)\n• Agendamento e comunicação sobre consultas e procedimentos\n• Envio de informações sobre novos serviços (mediante consentimento)\n• Emissão de notas fiscais e cumprimento de obrigações tributárias\n• Defesa em processos judiciais ou administrativos" },
      { heading: "COMPARTILHAMENTO", content: "Seus dados podem ser compartilhados com:\n• Profissionais associados que realizarem seu atendimento\n• Laboratórios (quando necessário para exames)\n• Contador e assessoria jurídica (dados fiscais)\n• Autoridades sanitárias e regulatórias (quando exigido por lei)\n\nSeus dados NUNCA serão vendidos ou compartilhados para fins de marketing com terceiros." },
      { heading: "SEUS DIREITOS (Art. 18 LGPD)", content: "Você tem direito a:\n• Confirmar a existência de tratamento de dados\n• Acessar seus dados\n• Corrigir dados incompletos ou desatualizados\n• Solicitar anonimização, bloqueio ou eliminação\n• Solicitar portabilidade\n• Revogar consentimento a qualquer momento\n\nPara exercer seus direitos: [e-mail do DPO]" },
      { heading: "RETENÇÃO", content: "Dados de prontuário: 20 anos após último atendimento (obrigação legal)\nDados de marketing: até revogação do consentimento\nDados fiscais: 5 anos (obrigação tributária)" },
      { heading: "CONSENTIMENTO", fields: ["[ ] Consinto com o tratamento dos meus dados para as finalidades descritas", "[ ] Autorizo o envio de comunicações sobre novos serviços via WhatsApp/e-mail", "Data", "Assinatura do paciente"] },
    ]},
    anamnese: { title: "FICHA DE ANAMNESE — AVALIAÇÃO INICIAL", sections: [
      { heading: "DADOS PESSOAIS", fields: ["Nome completo", "Data de nascimento / Idade", "CPF", "Profissão", "Telefone / WhatsApp", "E-mail", "Endereço completo", "Como conheceu o Instituto Levvai?"] },
      { heading: "HISTÓRICO MÉDICO", content: "Está em tratamento médico atualmente? [ ] Sim [ ] Não — Qual?\nFaz uso de medicamentos? [ ] Sim [ ] Não — Quais?\nTem alergias conhecidas? [ ] Sim [ ] Não — Quais?\nJá teve reação a anestésicos? [ ] Sim [ ] Não\nÉ portador(a) de:\n[ ] Diabetes [ ] Hipertensão [ ] Doenças autoimunes [ ] Problemas cardíacos\n[ ] Doenças de pele [ ] Herpes recorrente [ ] Queloides [ ] HIV/Hepatite\n[ ] Problemas de coagulação [ ] Epilepsia [ ] Outros: ___________" },
      { heading: "SAÚDE DA MULHER", content: "Está grávida ou suspeita? [ ] Sim [ ] Não\nEstá amamentando? [ ] Sim [ ] Não\nUsa anticoncepcional? [ ] Sim [ ] Não — Qual?\nData da última menstruação: ___/___/______" },
      { heading: "HISTÓRICO ESTÉTICO", content: "Já realizou procedimentos estéticos? [ ] Sim [ ] Não\nSe sim, quais e quando?\n[ ] Toxina botulínica — Data: ___ — Local: ___\n[ ] Preenchimento — Data: ___ — Local: ___ — Produto: ___\n[ ] Bioestimuladores — Data: ___ — Local: ___\n[ ] Fios de PDO — Data: ___ — Local: ___\n[ ] Cirurgia plástica — Data: ___ — Qual: ___\n[ ] Peeling — Data: ___ — Tipo: ___\n[ ] Outros: ___________\n\nTeve alguma complicação? [ ] Sim [ ] Não — Qual?" },
      { heading: "QUEIXA PRINCIPAL E EXPECTATIVAS", fields: ["O que te trouxe ao Instituto Levvai?", "Quais áreas gostaria de tratar?", "Qual resultado espera?", "Tem alguma referência visual?"] },
      { heading: "OBSERVAÇÕES DO PROFISSIONAL", fields: ["Avaliação clínica", "Plano de tratamento proposto", "Número de sessões", "Intervalo entre sessões", "Valor total estimado"] },
      { heading: "ASSINATURAS", fields: ["Data", "Assinatura do paciente", "Assinatura do profissional"] },
    ]},
    tirze: { title: "TERMO DE CONSENTIMENTO — PROTOCOLO LEVVAI SLIM (TIRZEPATIDA)", sections: [
      { heading: "IDENTIFICAÇÃO", fields: ["Nome completo", "CPF", "Data de nascimento", "Peso atual", "Altura", "IMC"] },
      { heading: "SOBRE O PROTOCOLO", content: "O Protocolo Levvai Slim utiliza Tirzepatida (princípio ativo do Mounjaro®), um agonista duplo dos receptores GIP e GLP-1, aprovado para tratamento de diabetes tipo 2 e obesidade. O uso para fins estéticos de emagrecimento é considerado off-label.\n\nO protocolo consiste em aplicações subcutâneas semanais com doses progressivas, acompanhado por médico prescritor (nutrólogo ou endocrinologista)." },
      { heading: "RISCOS E EFEITOS COLATERAIS", content: "Efeitos comuns (>10%): náusea, diarreia, diminuição do apetite, vômito, constipação, dor abdominal\nEfeitos incomuns (1-10%): refluxo, fadiga, tontura, reação no local da injeção\nEfeitos raros (<1%): pancreatite, hipoglicemia (em diabéticos), reações alérgicas graves\n\nCONTRAINDICAÇÕES ABSOLUTAS:\n• Histórico pessoal ou familiar de carcinoma medular da tireoide\n• Síndrome de neoplasia endócrina múltipla tipo 2 (MEN 2)\n• Gestação ou amamentação\n• Pancreatite aguda" },
      { heading: "ACOMPANHAMENTO OBRIGATÓRIO", content: "• Consulta médica prévia com nutrólogo/endocrinologista (OBRIGATÓRIO)\n• Exames laboratoriais antes do início (hemograma, glicemia, HbA1c, função tireoidiana, lipídico, hepático, renal)\n• Retornos quinzenais no primeiro mês, mensais depois\n• O paciente NÃO deve ajustar a dose por conta própria\n• Em caso de efeitos adversos graves: ligar imediatamente para [telefone emergência]" },
      { heading: "CONSENTIMENTO", content: "Declaro que:\n• Fui avaliado(a) por médico prescritor habilitado\n• Compreendo que este é um uso off-label do medicamento\n• Fui informado(a) sobre todos os riscos e efeitos colaterais\n• Me comprometo a seguir o acompanhamento médico\n• Informei todos os medicamentos que uso atualmente\n• Não estou grávida/amamentando" },
      { heading: "ASSINATURAS", fields: ["Data", "Assinatura do paciente", "Nome do médico prescritor", "CRM + RQE", "Assinatura do médico"] },
    ]},
    menores: { title: "TERMO DE CONSENTIMENTO — RESPONSÁVEL LEGAL (16-17 ANOS)", sections: [
      { heading: "DADOS DO MENOR", fields: ["Nome completo", "Data de nascimento", "RG/CPF", "Idade"] },
      { heading: "DADOS DO RESPONSÁVEL LEGAL", fields: ["Nome completo", "CPF", "RG", "Grau de parentesco", "Telefone", "E-mail"] },
      { heading: "CONSENTIMENTO", content: "Eu, [responsável], na qualidade de responsável legal pelo menor acima identificado, declaro que:\n\n• Autorizo a realização do procedimento: [procedimento]\n• Estarei presente durante todo o atendimento\n• Fui informado(a) sobre os riscos, benefícios e alternativas\n• O menor também foi informado e concorda com o procedimento\n• Compreendo que procedimentos estéticos em menores requerem avaliação cuidadosa" },
      { heading: "OBSERVAÇÃO", content: "O Instituto Levvai não realiza procedimentos estéticos invasivos em menores de 16 anos. Pacientes de 16-17 anos são atendidos exclusivamente com presença e consentimento do responsável legal." },
      { heading: "ASSINATURAS", fields: ["Data", "Assinatura do responsável legal", "Assinatura do menor", "Assinatura do profissional", "Testemunha"] },
    ]},
  };

  const currentDoc = templates[activeDoc];

  return (
    <div>
      <Card title="Termos e Documentos do Paciente" accent>
        <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>
          Todos os termos que o paciente assina antes do procedimento. Sirlândia imprime e coleta assinatura.
          Luciano Gebara deve revisar e validar antes de entrarem em uso oficial.
        </p>
      </Card>

      <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
        {docs.map(d => (
          <button key={d.id} onClick={() => setActiveDoc(d.id)} style={{
            padding: "8px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", border: "1px solid",
            background: activeDoc === d.id ? DARK : "white",
            color: activeDoc === d.id ? GOLD : "#888",
            borderColor: activeDoc === d.id ? DARK : "#ddd",
          }}>{d.name}</button>
        ))}
      </div>

      <Card title={currentDoc.title}>
        <div style={{ background: "#FAFAF8", border: "1px solid #E8E4DE", borderRadius: 8, padding: "20px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: GOLD, letterSpacing: "0.15em" }}>INSTITUTO</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: DARK, fontFamily: "'DM Serif Display', Georgia, serif" }}>LEVVAI</div>
            <div style={{ fontSize: 10, color: "#999", marginTop: 4 }}>Rua do Rocio, 288, cj 93 — Vila Olímpia, SP | CNPJ: [CNPJ]</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: DARK, textAlign: "center", marginBottom: 20, padding: "10px", background: LIGHT, borderRadius: 6 }}>
            {currentDoc.title}
          </div>
          {currentDoc.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, letterSpacing: "0.05em", marginBottom: 6, borderBottom: `1px solid ${GOLD}40`, paddingBottom: 4 }}>{s.heading}</div>
              {s.content && s.content.split("\n").map((line, j) => (
                <div key={j} style={{ fontSize: 12, color: "#444", lineHeight: 1.8, paddingLeft: line.startsWith("•") || line.startsWith("[") ? 12 : 0 }}>{line}</div>
              ))}
              {s.fields && s.fields.map((f, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", padding: "6px 0", borderBottom: "1px dotted #ddd" }}>
                  <span style={{ fontSize: 12, color: "#666", minWidth: 200 }}>{f}:</span>
                  <span style={{ flex: 1, borderBottom: "1px solid #ccc", minHeight: 20 }} />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
          <Badge text="MINUTA — Luciano Gebara deve revisar" color="#FFF3E0" textColor="#E65100" />
          <button onClick={() => {
            const printWin = window.open("", "_blank");
            const doc = currentDoc;
            printWin.document.write(`<!DOCTYPE html><html><head><title>${doc.title}</title><style>
              body{font-family:'Helvetica Neue',sans-serif;padding:40px 50px;color:#333;font-size:13px;line-height:1.8}
              .header{text-align:center;margin-bottom:30px;padding-bottom:15px;border-bottom:2px solid #C8A96E}
              .header .inst{font-size:11px;font-weight:600;color:#C8A96E;letter-spacing:3px}
              .header .name{font-size:28px;font-weight:800;color:#1A1A1A;font-family:Georgia,serif}
              .header .addr{font-size:10px;color:#999;margin-top:4px}
              .title{font-size:15px;font-weight:800;text-align:center;background:#F5F0E8;padding:10px;border-radius:6px;margin:20px 0;color:#1A1A1A}
              .section{margin-bottom:16px}
              .section h3{font-size:12px;font-weight:800;color:#C8A96E;letter-spacing:1px;border-bottom:1px solid #C8A96E40;padding-bottom:4px;margin-bottom:8px}
              .field{display:flex;padding:5px 0;border-bottom:1px dotted #ddd}
              .field span:first-child{min-width:180px;color:#666}
              .field span:last-child{flex:1;border-bottom:1px solid #ccc;min-height:18px}
              .badge{display:inline-block;background:#FFF3E0;color:#E65100;font-size:10px;padding:2px 8px;border-radius:4px;font-weight:600;margin-top:20px}
              @media print{body{padding:20px 30px}.badge{display:none}}
            </style></head><body>`);
            printWin.document.write(`<div class="header"><div class="inst">INSTITUTO</div><div class="name">LEVVAI</div><div class="addr">Rua do Rocio, 288, cj 93 — Vila Olímpia, SP | CNPJ: [CNPJ]</div></div>`);
            printWin.document.write(`<div class="title">${doc.title}</div>`);
            doc.sections.forEach(s => {
              printWin.document.write(`<div class="section"><h3>${s.heading}</h3>`);
              if (s.content) s.content.split("\n").forEach(line => printWin.document.write(`<div style="padding-left:${line.startsWith("•")||line.startsWith("[")?12:0}px">${line}</div>`));
              if (s.fields) s.fields.forEach(f => printWin.document.write(`<div class="field"><span>${f}:</span><span></span></div>`));
              printWin.document.write(`</div>`);
            });
            printWin.document.write(`<div class="badge">MINUTA — Luciano Gebara deve revisar antes do uso oficial</div>`);
            printWin.document.write(`</body></html>`);
            printWin.document.close();
            setTimeout(() => printWin.print(), 300);
          }} style={{
            padding: "8px 20px", background: DARK, color: GOLD, border: "none",
            borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 6,
          }}>🖨 Imprimir Termo</button>
        </div>
      </Card>

      <Card title="Regras de Uso dos Termos">
        {[
          "TCLE: obrigatório antes de QUALQUER procedimento. Sem assinatura = não atende.",
          "Uso de Imagem: coletar na primeira consulta. Sem termo = Gi NÃO pode postar antes/depois.",
          "LGPD: coletar na primeira consulta. Obrigatório por lei.",
          "Anamnese: preencher na primeira consulta. Atualizar a cada 6 meses ou quando houver mudança.",
          "Tirzepatida: OBRIGATÓRIO termo específico + prescrição médica. Sem médico prescritor = não aplica.",
          "Menores: somente 16-17 anos, com responsável PRESENTE. Abaixo de 16 = não atende.",
          "Sirlândia imprime, coleta assinatura e arquiva. Digitalizar e guardar no prontuário.",
          "Luciano Gebara DEVE revisar todos os termos antes de entrarem em uso oficial.",
          "Atualizar termos anualmente ou quando houver mudança regulatória.",
        ].map((r, i) => (
          <div key={i} style={{ fontSize: 12, color: "#555", padding: "5px 0", display: "flex", gap: 6, borderBottom: "1px solid #f5f0e8" }}>
            <span style={{ color: GOLD, fontWeight: 800, minWidth: 22 }}>{(i+1).toString().padStart(2,"0")}</span> {r}
          </div>
        ))}
      </Card>
    </div>
  );
};

// ATAS & AÇÕES TAB
const AtasTab = () => {
  // Estado — Atas
  const [atas, setAtas] = useState([]);
  const [acoesAta, setAcoesAta] = useState([]);
  const [loadingAtas, setLoadingAtas] = useState(true);

  useEffect(() => {
    const fetchAtas = async () => {
      setLoadingAtas(true);

      const { data: atasData, error: atasError } = await supabase
        .from('atas')
        .select('*')
        .order('data', { ascending: false });

      if (!atasError && atasData) setAtas(atasData);

      const { data: acoesData, error: acoesError } = await supabase
        .from('acoes_ata')
        .select('*')
        .order('prazo', { ascending: true });

      if (!acoesError && acoesData) setAcoesAta(acoesData);

      setLoadingAtas(false);
    };

    fetchAtas();
  }, []);

  const salvarAta = async (ata) => {
    if (ata.id) {
      const { error } = await supabase
        .from('atas')
        .update(ata)
        .eq('id', ata.id);
      if (!error) setAtas(prev => prev.map(a => a.id === ata.id ? ata : a));
    } else {
      const { data, error } = await supabase
        .from('atas')
        .insert([ata])
        .select()
        .single();
      if (!error && data) setAtas(prev => [data, ...prev]);
    }
  };

  const salvarAcaoAta = async (acao) => {
    if (acao.id) {
      const { error } = await supabase
        .from('acoes_ata')
        .update(acao)
        .eq('id', acao.id);
      if (!error) setAcoesAta(prev => prev.map(a => a.id === acao.id ? acao : a));
    } else {
      const { data, error } = await supabase
        .from('acoes_ata')
        .insert([acao])
        .select()
        .single();
      if (!error && data) setAcoesAta(prev => [...prev, data]);
    }
  };

  const concluirAcao = async (acaoId) => {
    const { error } = await supabase
      .from('acoes_ata')
      .update({ status: 'concluida' })
      .eq('id', acaoId);
    if (!error) setAcoesAta(prev =>
      prev.map(a => a.id === acaoId ? { ...a, status: 'concluida' } : a)
    );
  };

  // Ações abertas por ata (para exibir no painel)
  const acoesPorAta = (ataId) => acoesAta.filter(a => a.ata_id === ataId);
  const acoesAbertas = acoesAta.filter(a => a.status === 'aberta');

  const meetings = atas;
  const [showNewMeeting, setShowNewMeeting] = useState(false);

  const updateActionStatus = async (meetIdx, actIdx, status) => {
    const a = acoesAta[actIdx];
    if (a?.id) await salvarAcaoAta({ ...a, status });
  };
  const allActions = acoesAta.map((a, i) => ({ ...a, meetIdx: atas.findIndex(m => m.id === a.ata_id), actIdx: i }));
  const pendentes = acoesAta.filter(a => a.status === 'pendente' || a.status === 'aberta');
  const atrasadas = acoesAta.filter(a => a.status === 'atrasada');

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <Metric label="Total de Ações" value={allActions.length} />
        <Metric label="Pendentes" value={pendentes.length} color="#E65100" />
        <Metric label="Atrasadas" value={atrasadas.length} color="#B71C1C" />
        <Metric label="Concluídas" value={allActions.filter(a => a.status === "concluida").length} color="#2E7D32" />
      </div>

      <Card title="Painel de Ações Pendentes" accent>
        {pendentes.length === 0 ? <p style={{ color: "#aaa" }}>Nenhuma ação pendente!</p> : pendentes.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <Badge text={a.resp} color="#F5F0E8" textColor={GOLD} />
            <div style={{ flex: 1, fontSize: 12, color: "#ddd" }}>{a.acao}</div>
            <span style={{ fontSize: 10, color: "#888" }}>Prazo: {a.prazo}</span>
            <select value={a.status} onChange={e => updateActionStatus(a.meetIdx, a.actIdx, e.target.value)} style={{
              padding: "4px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit",
              background: "#FFF3E0", color: "#E65100",
            }}>
              <option value="pendente">PENDENTE</option>
              <option value="concluida">CONCLUÍDA</option>
              <option value="atrasada">ATRASADA</option>
              <option value="cancelada">CANCELADA</option>
            </select>
          </div>
        ))}
      </Card>

      {meetings.map((m, mi) => (
        <Card key={mi} title={`${m.type === "weekly" ? "Levvai Weekly" : "Board Mensal"} — ${m.date}`}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>Presentes: {m.presentes}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 4 }}>DECISÕES</div>
          {m.decisoes.map((d, di) => <div key={di} style={{ fontSize: 12, color: "#555", padding: "3px 0 3px 12px" }}>› {d}</div>)}
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginTop: 10, marginBottom: 4 }}>AÇÕES</div>
          {acoesPorAta(m.id).map((a, ai) => (
            <div key={ai} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f0ece6" }}>
              <Badge text={a.resp} color={LIGHT} textColor={GOLD} />
              <div style={{ flex: 1, fontSize: 12 }}>{a.acao}</div>
              <span style={{ fontSize: 10, color: "#bbb" }}>{a.prazo}</span>
              <select value={a.status} onChange={e => updateActionStatus(mi, ai, e.target.value)} style={{
                padding: "3px 6px", borderRadius: 10, fontSize: 9, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit",
                background: a.status === "concluida" ? "#E8F5E9" : a.status === "atrasada" ? "#FFCDD2" : "#FFF9C4",
                color: a.status === "concluida" ? "#2E7D32" : a.status === "atrasada" ? "#B71C1C" : "#F57F17",
              }}>
                <option value="pendente">PENDENTE</option>
                <option value="concluida">CONCLUÍDA</option>
                <option value="atrasada">ATRASADA</option>
                <option value="cancelada">CANCELADA</option>
              </select>
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
};

// DASHBOARD EXECUTIVO TAB
const ExecutiveTab = ({ shared }) => {
  const leads = shared.leads;
  const totalLeads = leads.length;
  const converted = leads.filter(l => ["atendido","retorno","fidelizado"].includes(l.status)).length;
  const convRate = totalLeads > 0 ? Math.round(converted / totalLeads * 100) : 0;

  const [monthlyData, setMonthlyData] = useState([
    { mes: "Jan/26", fat: 22000, pac: 12, ticket: 1833, seg: 180, posts: 5, nps: null, ocupacao: null },
    { mes: "Fev/26", fat: 28000, pac: 15, ticket: 1867, seg: 210, posts: 8, nps: null, ocupacao: null },
    { mes: "Mar/26", fat: 35000, pac: 18, ticket: 1944, seg: 245, posts: 13, nps: null, ocupacao: null },
    { mes: "Abr/26", fat: null, pac: null, ticket: null, seg: 286, posts: 20, nps: null, ocupacao: null },
    { mes: "Mai/26", fat: null, pac: null, ticket: null, seg: null, posts: null, nps: null, ocupacao: null },
    { mes: "Jun/26", fat: null, pac: null, ticket: null, seg: null, posts: null, nps: null, ocupacao: null },
  ]);

  const targets = { fat: [30000,35000,40000,50000,55000,60000], pac: [15,18,20,25,28,30], ticket: [1800,1850,1900,1950,1980,2000], seg: [200,300,500,700,850,1000], posts: [10,20,35,50,60,70] };
  const fmt = (v) => v !== null ? `R$${Math.round(v/1000)}K` : "—";

  const updateCell = (rowIdx, field, value) => {
    setMonthlyData(monthlyData.map((m, i) => i === rowIdx ? { ...m, [field]: value === "" ? null : Number(value) } : m));
  };

  const maxFat = Math.max(...monthlyData.map(m => m.fat || 0), ...targets.fat, 1);
  const maxPac = Math.max(...monthlyData.map(m => m.pac || 0), ...targets.pac, 1);
  const maxSeg = Math.max(...monthlyData.map(m => m.seg || 0), ...targets.seg, 1);

  const trend = (arr, field) => {
    const vals = arr.filter(m => m[field] !== null).map(m => m[field]);
    if (vals.length < 2) return { dir: "—", color: "#999" };
    const last = vals[vals.length - 1];
    const prev = vals[vals.length - 2];
    if (last > prev) return { dir: "▲", color: "#2E7D32", pct: `+${Math.round((last-prev)/prev*100)}%` };
    if (last < prev) return { dir: "▼", color: "#B71C1C", pct: `${Math.round((last-prev)/prev*100)}%` };
    return { dir: "●", color: GOLD, pct: "0%" };
  };

  const fatTrend = trend(monthlyData, "fat");
  const pacTrend = trend(monthlyData, "pac");
  const segTrend = trend(monthlyData, "seg");

  return (
    <div>
      <Card title="Dashboard CEO & Board — Evolução Mensal" accent>
        <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Sylmara preenche até dia 5. CEO revisa antes do board com Rich. Gráficos atualizam automaticamente.</p>
      </Card>

      {/* KPIs WITH TRENDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
        <Metric label="Faturamento" value={fmt(monthlyData.filter(m=>m.fat).slice(-1)[0]?.fat || 0)} sub={<span style={{ color: fatTrend.color }}>{fatTrend.dir} {fatTrend.pct}</span>} />
        <Metric label="Pacientes" value={monthlyData.filter(m=>m.pac).slice(-1)[0]?.pac || "—"} sub={<span style={{ color: pacTrend.color }}>{pacTrend.dir} {pacTrend.pct}</span>} />
        <Metric label="Ticket Médio" value={`R$${monthlyData.filter(m=>m.ticket).slice(-1)[0]?.ticket || "—"}`} sub="Meta: R$2.000" />
        <Metric label="Conversão" value={`${convRate}%`} color={convRate >= 50 ? "#2E7D32" : "#E65100"} sub={`${converted}/${totalLeads} leads`} />
        <Metric label="Seguidores" value={monthlyData.filter(m=>m.seg).slice(-1)[0]?.seg || "—"} sub={<span style={{ color: segTrend.color }}>{segTrend.dir} {segTrend.pct}</span>} />
        <Metric label="NPS" value="—" sub="Meta: 85+" />
      </div>

      {/* FATURAMENTO CHART */}
      <Card title="Evolução do faturamento (R$ mil)">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 160, paddingBottom: 24, position: "relative" }}>
          {/* Target line at 60K */}
          <div style={{ position: "absolute", bottom: `${(60000/maxFat)*140 + 24}px`, left: 0, right: 0, borderTop: "2px dashed #E8E4DE", zIndex: 1 }}>
            <span style={{ position: "absolute", right: 0, top: -14, fontSize: 9, color: "#bbb" }}>Meta R$60K</span>
          </div>
          {monthlyData.map((m, i) => {
            const target = targets.fat[i];
            const actual = m.fat;
            const isCurrentMonth = m.mes === "Abr/26";
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: actual ? DARK : "#ccc" }}>{actual ? `${Math.round(actual/1000)}K` : ""}</div>
                <div style={{ width: "100%", display: "flex", gap: 2, justifyContent: "center", alignItems: "flex-end", height: 120 }}>
                  {/* Target bar */}
                  <div style={{ width: "35%", borderRadius: "3px 3px 0 0", height: `${(target/maxFat)*100}%`, background: `repeating-linear-gradient(45deg, #f0ece6, #f0ece6 2px, transparent 2px, transparent 4px)`, border: "1px dashed #ddd" }} />
                  {/* Actual bar */}
                  <div style={{ width: "45%", borderRadius: "3px 3px 0 0", height: actual ? `${(actual/maxFat)*100}%` : "3%", background: actual ? (isCurrentMonth ? GOLD : (actual >= target ? "#4CAF50" : "#FF9800")) : "#f5f0e8", transition: "height 0.5s" }} />
                </div>
                <div style={{ fontSize: 10, fontWeight: isCurrentMonth ? 700 : 400, color: isCurrentMonth ? GOLD : "#999" }}>{m.mes.split("/")[0]}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 10, color: "#999", borderTop: "1px solid #f0ece6", paddingTop: 6 }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#4CAF50", marginRight: 4 }} />Atingiu meta</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#FF9800", marginRight: 4 }} />Abaixo da meta</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: GOLD, marginRight: 4 }} />Mês atual</span>
          <span>▨ Meta</span>
        </div>
      </Card>

      {/* DUAL CHARTS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {/* PACIENTES */}
        <Card title="Pacientes por mês">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100 }}>
            {monthlyData.map((m, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: m.pac ? DARK : "#ccc" }}>{m.pac || ""}</div>
                <div style={{ width: "70%", borderRadius: "3px 3px 0 0", height: m.pac ? `${(m.pac/maxPac)*70}px` : 3, background: m.pac ? (m.pac >= targets.pac[i] ? "#4CAF50" : "#2196F3") : "#f0ece6", transition: "height 0.5s" }} />
                <div style={{ fontSize: 9, color: "#999", marginTop: 2 }}>{m.mes.split("/")[0]}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "#999", textAlign: "center", marginTop: 6 }}>Meta Jun: <strong>30</strong></div>
        </Card>

        {/* SEGUIDORES */}
        <Card title="Seguidores Instagram">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100 }}>
            {monthlyData.map((m, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: m.seg ? DARK : "#ccc" }}>{m.seg || ""}</div>
                <div style={{ width: "70%", borderRadius: "3px 3px 0 0", height: m.seg ? `${(m.seg/maxSeg)*70}px` : 3, background: m.seg ? "#E91E63" : "#f0ece6", transition: "height 0.5s" }} />
                <div style={{ fontSize: 9, color: "#999", marginTop: 2 }}>{m.mes.split("/")[0]}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "#999", textAlign: "center", marginTop: 6 }}>Meta Jun: <strong>1.000</strong></div>
        </Card>
      </div>

      {/* EDITABLE MONTHLY TABLE */}
      <Card title="Tabela de Acompanhamento Mensal — Sylmara preenche">
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "flex", background: DARK, borderRadius: "8px 8px 0 0", padding: "8px 0", minWidth: 700 }}>
            {["MÊS", "FATURAMENTO", "PACIENTES", "TICKET MÉDIO", "SEGUIDORES", "POSTS", "NPS", "OCUPAÇÃO"].map((h, i) => (
              <div key={i} style={{ flex: i === 0 ? 0.8 : 1, textAlign: "center", fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em" }}>{h}</div>
            ))}
          </div>
          {monthlyData.map((m, mi) => (
            <div key={mi} style={{ display: "flex", padding: "4px 0", borderBottom: "1px solid #f0ece6", alignItems: "center", background: mi % 2 === 0 ? "white" : "#FAFAF8", minWidth: 700 }}>
              <div style={{ flex: 0.8, textAlign: "center", fontSize: 12, fontWeight: 700, color: DARK }}>{m.mes}</div>
              {["fat", "pac", "ticket", "seg", "posts", "nps", "ocupacao"].map((field, fi) => {
                const target = field === "fat" ? targets.fat[mi] : field === "pac" ? targets.pac[mi] : field === "seg" ? targets.seg[mi] : field === "posts" ? targets.posts[mi] : null;
                const val = m[field];
                const isAbove = target && val && val >= target;
                return (
                  <div key={fi} style={{ flex: 1, textAlign: "center", padding: "0 4px" }}>
                    <input
                      type="number"
                      value={val !== null && val !== undefined ? val : ""}
                      onChange={e => updateCell(mi, field, e.target.value)}
                      placeholder={target ? `meta: ${field === "fat" ? Math.round(target/1000)+"K" : target}` : "—"}
                      style={{
                        width: "100%", padding: "4px 6px", border: `1px solid ${val !== null ? (isAbove ? "#C8E6C9" : "#FFE0B2") : "#eee"}`,
                        borderRadius: 4, fontSize: 12, textAlign: "center", fontFamily: "inherit",
                        background: val !== null ? (isAbove ? "#F1F8E9" : "white") : "#FAFAF8",
                        color: val !== null ? DARK : "#ccc", outline: "none", boxSizing: "border-box",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
          {/* TARGETS ROW */}
          <div style={{ display: "flex", padding: "6px 0", background: LIGHT, borderRadius: "0 0 8px 8px", minWidth: 700 }}>
            <div style={{ flex: 0.8, textAlign: "center", fontSize: 10, fontWeight: 700, color: GOLD }}>META Q2</div>
            {[60, 30, 2000, 1000, 70, 85, "60%"].map((t, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 700, color: GOLD }}>{typeof t === "number" && i === 0 ? `R$${t}K` : t}</div>
            ))}
          </div>
        </div>
      </Card>

      {/* PROCEDURE MIX */}
      <Card title="Mix de Procedimentos — Quais protocolos mais faturam?">
        {[
          { proc: "Harmonização Facial", pct: 30, valor: "~R$10K", color: "#E91E63" },
          { proc: "Levvai Lips", pct: 20, valor: "~R$7K", color: "#9C27B0" },
          { proc: "Botox Full Face", pct: 18, valor: "~R$6K", color: "#2196F3" },
          { proc: "Levvai Slim (Tirzepatida)", pct: 12, valor: "~R$4K", color: "#FF9800" },
          { proc: "Levvai Glow (Profhilo)", pct: 10, valor: "~R$3.5K", color: "#4CAF50" },
          { proc: "Outros", pct: 10, valor: "~R$3.5K", color: "#607D8B" },
        ].map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #f0ece6" }}>
            <div style={{ width: 100, fontSize: 12, fontWeight: 600 }}>{p.proc}</div>
            <div style={{ flex: 1, height: 16, background: "#f5f0e8", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${p.pct}%`, background: p.color, borderRadius: 4, transition: "width 0.5s" }} />
            </div>
            <div style={{ width: 35, fontSize: 12, fontWeight: 700, color: DARK, textAlign: "right" }}>{p.pct}%</div>
            <div style={{ width: 60, fontSize: 11, color: "#888", textAlign: "right" }}>{p.valor}</div>
          </div>
        ))}
      </Card>

      {/* OKRs */}
      {/* TREND LINES — VISÃO BOARD */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <TrendChart title="Evolução faturamento (R$ mil)" color="#4CAF50" target={60} unit="K"
          data={[{label:"Jan",value:25},{label:"Fev",value:30},{label:"Mar",value:35},{label:"Abr",value:40},{label:"Mai",value:50,projected:true},{label:"Jun",value:60,projected:true}]} />
        <TrendChart title="Evolução seguidores IG" color="#E91E63" target={1000}
          data={[{label:"Jan",value:80},{label:"Fev",value:130},{label:"Mar",value:200},{label:"Abr",value:286},{label:"Mai",value:500,projected:true},{label:"Jun",value:1000,projected:true}]} />
        <TrendChart title="Pacientes / mês" color="#2196F3" target={30}
          data={[{label:"Jan",value:8},{label:"Fev",value:12},{label:"Mar",value:15},{label:"Abr",value:20},{label:"Mai",value:25,projected:true},{label:"Jun",value:30,projected:true}]} />
        <TrendChart title="Ticket médio (R$)" color={GOLD} target={2000}
          data={[{label:"Jan",value:1200},{label:"Fev",value:1350},{label:"Mar",value:1500},{label:"Abr",value:1600},{label:"Mai",value:1800,projected:true},{label:"Jun",value:2000,projected:true}]} />
      </div>

      <Card title="OKRs Q2/2026 — Scoring">
        {[
          { obj: "O1: Presença digital mínima viável", krs: ["60 posts acumulados", "1.000 seguidores", "Site live", "10 depoimentos"], target: "0.7" },
          { obj: "O2: R$60K faturamento em junho", krs: ["30 pacientes/mês", "Ticket R$2K", "Girar estoque Tirzepatida", "2 Levvai Days realizados"], target: "0.7" },
          { obj: "O3: Posicionamento formalizado", krs: ["4 protocolos nomeados", "Manifesto validado", "Tabela de preços publicada", "ICP definido"], target: "0.7" },
          { obj: "O4: Estrutura operacional rodando", krs: ["CRM implementado", "DRE mensal fechando", "Booking online ativo", "WBR semanal 100%"], target: "0.7" },
        ].map((o, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{o.obj}</span>
              <Badge text={`Meta: ${o.target}`} color={LIGHT} textColor={GOLD} />
            </div>
            {o.krs.map((kr, j) => (
              <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0 4px 16px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", border: "2px solid #ddd", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#666", flex: 1 }}>{kr}</span>
                <span style={{ fontSize: 11, color: "#ccc" }}>— /1.0</span>
              </div>
            ))}
          </div>
        ))}
      </Card>

      {/* ALERTAS */}
      <Card title="Alertas Críticos">
        {[
          { level: "CRÍTICO", item: "Tirzepatida — resolver habilitação com Luciano", color: "#FFCDD2" },
          { level: "CRÍTICO", item: "Termo de Uso de Imagem — Luciano redigir", color: "#FFCDD2" },
          { level: "ALTO", item: "Seguro RC Profissional — Sylmara cotar", color: "#FFE0B2" },
          { level: "MÉDIO", item: "Formalizar Ike como CEO no contrato social", color: "#FFF9C4" },
          { level: "MÉDIO", item: "Deploy portal na Vercel", color: "#FFF9C4" },
        ].map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f0ece6" }}>
            <Badge text={a.level} color={a.color} textColor="#333" />
            <span style={{ fontSize: 12, color: "#555" }}>{a.item}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

// FLUXO DE CAIXA TAB
const CashflowTab = () => {
  // Estado — Fluxo de Caixa
  const [fluxoCaixa, setFluxoCaixa] = useState([]);
  const [loadingFluxo, setLoadingFluxo] = useState(true);
  const [mesSelecionado, setMesSelecionado] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchFluxoCaixa();
  }, [mesSelecionado]);

  const fetchFluxoCaixa = async () => {
    setLoadingFluxo(true);
    const [ano, mes] = mesSelecionado.split('-').map(Number);
    const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(ano, mes, 0).getDate();
    const fim = `${ano}-${String(mes).padStart(2, '0')}-${ultimoDia}`;

    const { data, error } = await supabase
      .from('fluxo_caixa')
      .select('*')
      .gte('data_vencimento', inicio)
      .lte('data_vencimento', fim)
      .order('data_vencimento', { ascending: true });

    if (!error && data) {
      // Auto-geração: se não tem recorrentes no mês, gera automaticamente
      const temRecorrentes = data.some(f => f.origem === 'recorrencia');
      if (!temRecorrentes) {
        await supabase.rpc('gerar_despesas_recorrentes', { ano, mes });
        // Rebusca após gerar
        const { data: dataAtualizada } = await supabase
          .from('fluxo_caixa')
          .select('*')
          .gte('data_vencimento', inicio)
          .lte('data_vencimento', fim)
          .order('data_vencimento', { ascending: true });
        if (dataAtualizada) setFluxoCaixa(dataAtualizada);
      } else {
        setFluxoCaixa(data);
      }
    }
    setLoadingFluxo(false);
  };

  // Confirmar status (campo que Sylmara usa)
  const confirmarStatus = async (id, novoStatus) => {
    const update = {
      status: novoStatus,
      ...(novoStatus === 'pago' ? { data_pagamento: new Date().toISOString().split('T')[0] } : {})
    };
    const { error } = await supabase
      .from('fluxo_caixa')
      .update(update)
      .eq('id', id);
    if (!error) setFluxoCaixa(prev =>
      prev.map(f => f.id === id ? { ...f, ...update } : f)
    );
  };

  // Registrar despesa avulsa
  const registrarDespesa = async (despesa) => {
    const { numParcelas, dataprimeira, ...resto } = despesa;

    // Compra parcelada
    if (numParcelas && numParcelas > 1) {
      const { error } = await supabase.rpc('registrar_parcelas', {
        p_fornecedor: resto.fornecedor,
        p_descricao: resto.descricao,
        p_categoria: resto.categoria,
        p_valor_total: resto.valor,
        p_num_parcelas: parseInt(numParcelas),
        p_data_primeira: dataprimeira
      });
      if (!error) await fetchFluxoCaixa();
      return;
    }

    // Despesa simples (à vista)
    const { data, error } = await supabase
      .from('fluxo_caixa')
      .insert([{
        ...resto,
        tipo: 'despesa',
        origem: 'manual',
        recorrente: resto.recorrente || false
      }])
      .select()
      .single();

    if (!error && data) setFluxoCaixa(prev => [...prev, data]);
  };

  // Excluir entrada manual
  const excluirEntrada = async (id) => {
    const { error } = await supabase
      .from('fluxo_caixa')
      .delete()
      .eq('id', id);
    if (!error) setFluxoCaixa(prev => prev.filter(f => f.id !== id));
  };

  // Gerar despesas recorrentes do próximo mês
  const gerarRecorrentes = async (ano, mes) => {
    const { data, error } = await supabase
      .rpc('gerar_despesas_recorrentes', { ano, mes });
    if (!error) {
      await fetchFluxoCaixa();
      return data; // número de entradas geradas
    }
  };

  // Totalizadores do mês
  const totalReceitas = fluxoCaixa
    .filter(f => f.tipo === 'receita')
    .reduce((acc, f) => acc + (f.valor || 0), 0);

  const totalDespesas = fluxoCaixa
    .filter(f => f.tipo === 'despesa')
    .reduce((acc, f) => acc + (f.valor || 0), 0);

  const resultadoBruto = totalReceitas - totalDespesas;

  const receitasPorForma = fluxoCaixa
    .filter(f => f.tipo === 'receita')
    .reduce((acc, f) => {
      const forma = f.forma_pagamento || 'outro';
      acc[forma] = (acc[forma] || 0) + (f.valor || 0);
      return acc;
    }, {});

  // Compat aliases para o render existente
  const entries = fluxoCaixa.map(f => ({
    id: f.id,
    date: f.data,
    desc: f.descricao,
    tipo: f.tipo === 'receita' ? 'entrada' : 'saida',
    valor: f.valor || 0,
    cat: f.categoria,
    status: f.status,
  }));
  const loading = loadingFluxo;
  const [showNew, setShowNew] = useState(false);
  const emptyEntry = { date: "", desc: "", tipo: "entrada", valor: 0, cat: "Insumos", fornecedor: "", numParcelas: 1, recorrente: false, dataprimeira: "" };
  const [newEntry, setNewEntry] = useState(emptyEntry);

  const addEntry = async () => {
    if (!newEntry.desc || !newEntry.valor) return;
    const today = new Date().toISOString().split('T')[0];
    await registrarDespesa({
      data: newEntry.date || today,
      data_vencimento: newEntry.date || today,
      descricao: newEntry.desc,
      fornecedor: newEntry.fornecedor || null,
      valor: Number(newEntry.valor),
      categoria: newEntry.cat,
      status: 'em_aberto',
      recorrente: newEntry.recorrente,
      numParcelas: newEntry.numParcelas,
      dataprimeira: newEntry.dataprimeira || newEntry.date || today,
    });
    setNewEntry(emptyEntry);
    setShowNew(false);
  };

  const totalEntradas = totalReceitas;
  const totalSaidas = totalDespesas;
  const saldo = resultadoBruto;
  const fmt = (v) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;

  if (loading) return <div style={{ padding: 32, textAlign: "center", color: "#aaa" }}>Carregando movimentações...</div>;

  const receitas = fluxoCaixa.filter(f => f.tipo === 'receita');
  const despesas = fluxoCaixa.filter(f => f.tipo === 'despesa');
  const subtotalReceitas = receitas.reduce((acc, f) => acc + (f.valor || 0), 0);
  const subtotalDespesas = despesas.reduce((acc, f) => acc + (f.valor || 0), 0);

  const statusColor = (s) => {
    if (s === 'pago') return { bg: '#E8F5E9', text: '#2E7D32' };
    if (s === 'vencido') return { bg: '#FFEBEE', text: '#B71C1C' };
    return { bg: '#FFF9C4', text: '#F57F17' };
  };

  const colLabel = (label) => (
    <span style={{ fontSize: 9, fontWeight: 700, color: "#999", textTransform: "uppercase" }}>{label}</span>
  );

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <Metric label="Entradas" value={fmt(totalEntradas)} color="#2E7D32" sub="receitas do período" />
        <Metric label="Saídas" value={fmt(totalSaidas)} color="#B71C1C" sub="custos e despesas" />
        <Metric label="Saldo" value={fmt(saldo)} color={saldo >= 0 ? "#2E7D32" : "#B71C1C"} sub={saldo >= 0 ? "positivo" : "NEGATIVO — atenção"} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #E8E4DE", borderRadius: 10, padding: "10px 14px" }}>
          <span style={{ fontSize: 11, color: "#888" }}>Mês:</span>
          <input type="month" value={mesSelecionado} onChange={e => setMesSelecionado(e.target.value)}
            style={{ border: "1px solid #ddd", borderRadius: 6, padding: "4px 8px", fontSize: 12, fontFamily: "inherit", outline: "none" }} />
        </div>
      </div>

      {/* SEÇÃO 1 — ENTRADAS */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#2E7D32", fontWeight: 900 }}>↑</div>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#2E7D32" }}>ENTRADAS</span>
            <span style={{ fontSize: 11, color: "#aaa" }}>{receitas.length} registros</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 900, color: "#2E7D32" }}>+ {fmt(subtotalReceitas)}</span>
        </div>

        <div style={{ background: "white", border: "1px solid #E8E4DE", borderRadius: 10, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 110px 90px 110px", gap: 0, background: "#F5F0E8", padding: "7px 14px" }}>
            {["DATA", "PACIENTE", "PROCEDIMENTO", "FORMA PGTO", "VALOR", "STATUS"].map((h, i) => (
              <span key={i} style={{ fontSize: 9, fontWeight: 700, color: "#8B7355" }}>{h}</span>
            ))}
          </div>

          {receitas.length === 0 ? (
            <div style={{ padding: "20px 14px", textAlign: "center", color: "#ccc", fontSize: 12 }}>
              Nenhuma receita registrada neste período
            </div>
          ) : receitas.map((f) => (
            <div key={f.id} style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 110px 90px 110px", gap: 0, padding: "9px 14px", borderBottom: "1px solid #f5f0e8", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#888" }}>{f.data}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{f.paciente_nome || f.descricao || '—'}</span>
              <span style={{ fontSize: 11, color: "#666" }}>{f.procedimento || f.categoria || '—'}</span>
              <span style={{ fontSize: 11, color: "#888" }}>{f.forma_pagamento || '—'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2E7D32" }}>+ {fmt(f.valor || 0)}</span>
              <select value={f.status || 'em_aberto'} onChange={e => confirmarStatus(f.id, e.target.value)}
                style={{
                  padding: "3px 6px", borderRadius: 10, fontSize: 10, fontWeight: 700, border: "none",
                  cursor: "pointer", fontFamily: "inherit", outline: "none",
                  background: statusColor(f.status).bg, color: statusColor(f.status).text,
                }}>
                <option value="pago">PAGO</option>
                <option value="em_aberto">EM ABERTO</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO 2 — SAÍDAS */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#FFEBEE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#B71C1C", fontWeight: 900 }}>↓</div>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#B71C1C" }}>SAÍDAS</span>
            <span style={{ fontSize: 11, color: "#aaa" }}>{despesas.length} registros</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 900, color: "#B71C1C" }}>- {fmt(subtotalDespesas)}</span>
        </div>

        <div style={{ background: "white", border: "1px solid #E8E4DE", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 100px 90px 110px", gap: 0, background: "#FFF5F5", padding: "7px 14px" }}>
            {["VENCIMENTO", "FORNECEDOR", "DESCRIÇÃO", "CATEGORIA", "VALOR", "STATUS"].map((h, i) => (
              <span key={i} style={{ fontSize: 9, fontWeight: 700, color: "#B71C1C" }}>{h}</span>
            ))}
          </div>

          {despesas.length === 0 ? (
            <div style={{ padding: "20px 14px", textAlign: "center", color: "#ccc", fontSize: 12 }}>
              Nenhuma despesa registrada neste período
            </div>
          ) : despesas.map((f) => (
            <div key={f.id} style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 100px 90px 110px", gap: 0, padding: "9px 14px", borderBottom: "1px solid #fff5f5", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#888" }}>{f.data_vencimento || f.data || '—'}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{f.fornecedor || '—'}</span>
              <span style={{ fontSize: 11, color: "#666" }}>{f.descricao || '—'}</span>
              <Badge text={f.categoria || '—'} color={LIGHT} textColor="#888" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#B71C1C" }}>- {fmt(f.valor || 0)}</span>
              <select value={f.status || 'em_aberto'} onChange={e => confirmarStatus(f.id, e.target.value)}
                style={{
                  padding: "3px 6px", borderRadius: 10, fontSize: 10, fontWeight: 700, border: "none",
                  cursor: "pointer", fontFamily: "inherit", outline: "none",
                  background: statusColor(f.status).bg, color: statusColor(f.status).text,
                }}>
                <option value="pago">PAGO</option>
                <option value="em_aberto">EM ABERTO</option>
                <option value="vencido">VENCIDO</option>
              </select>
            </div>
          ))}
        </div>

        {/* Formulário nova despesa */}
        {!showNew ? (
          <button onClick={() => setShowNew(true)} style={{
            width: "100%", padding: "10px", background: "white", border: `2px dashed #E57373`,
            borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#B71C1C", fontFamily: "inherit",
          }}>+ Registrar saída</button>
        ) : (
          <div style={{ background: "#FFF5F5", border: "1px solid #FFCDD2", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#B71C1C", marginBottom: 10 }}>NOVA SAÍDA</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
              {/* Data — vencimento (simples) ou 1ª parcela */}
              <div style={{ flex: "0 0 130px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>
                  {newEntry.numParcelas > 1 ? "DATA 1ª PARCELA" : "VENCIMENTO"}
                </div>
                <input type="date" value={newEntry.numParcelas > 1 ? newEntry.dataprimeira : newEntry.date}
                  onChange={e => newEntry.numParcelas > 1
                    ? setNewEntry({...newEntry, dataprimeira: e.target.value})
                    : setNewEntry({...newEntry, date: e.target.value})}
                  style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: "1 1 130px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>FORNECEDOR</div>
                <input value={newEntry.fornecedor || ""} onChange={e => setNewEntry({...newEntry, fornecedor: e.target.value})} placeholder="Allergan, aluguel..."
                  style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: "1 1 150px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>DESCRIÇÃO</div>
                <input value={newEntry.desc} onChange={e => setNewEntry({...newEntry, desc: e.target.value})} placeholder="NF 1234, Botox Allergan..."
                  style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: "0 0 110px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>CATEGORIA</div>
                <select value={newEntry.cat} onChange={e => setNewEntry({...newEntry, cat: e.target.value})}
                  style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                  {["Insumos", "Procedimento", "Aluguel", "Energia", "Água", "Internet", "Salário", "Repasse", "Marketing", "Contabilidade", "Equipamentos", "Impostos", "Serviços", "Outros"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: "0 0 90px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>VALOR R$</div>
                <input type="number" value={newEntry.valor || ""} onChange={e => setNewEntry({...newEntry, valor: Number(e.target.value)})}
                  style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", textAlign: "center", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: "0 0 70px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>Nº PARCELAS</div>
                <input type="number" min="1" max="48" value={newEntry.numParcelas}
                  onChange={e => setNewEntry({...newEntry, numParcelas: Math.max(1, parseInt(e.target.value) || 1)})}
                  style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", textAlign: "center", boxSizing: "border-box" }} />
              </div>
            </div>

            {/* Preview parcelamento */}
            {newEntry.numParcelas > 1 && newEntry.valor > 0 && (
              <div style={{ marginTop: 8, padding: "6px 10px", background: "#FFF3E0", borderRadius: 6, fontSize: 11, color: "#E65100" }}>
                {newEntry.numParcelas}x de {fmt(newEntry.valor / newEntry.numParcelas)} — vencimentos mensais a partir de {newEntry.dataprimeira || "data não selecionada"}
              </div>
            )}

            {/* Checkbox recorrente — só quando parcela única */}
            {newEntry.numParcelas === 1 && (
              <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 12, color: "#555", cursor: "pointer" }}>
                <input type="checkbox" checked={newEntry.recorrente}
                  onChange={e => setNewEntry({...newEntry, recorrente: e.target.checked})}
                  style={{ width: 14, height: 14, cursor: "pointer" }} />
                Despesa recorrente (se repete todo mês)
              </label>
            )}

            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <button onClick={addEntry} style={{ padding: "8px 16px", background: "#B71C1C", color: "white", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                {newEntry.numParcelas > 1 ? `Parcelar em ${newEntry.numParcelas}x` : "Adicionar"}
              </button>
              <button onClick={() => { setShowNew(false); setNewEntry(emptyEntry); }} style={{ padding: "8px 12px", background: "white", color: "#888", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// JORNADA DO PACIENTE TAB
const JourneyTab = () => (
  <div>
    <Card title="Jornada do Paciente — Instituto Levvai" accent>
      <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Do primeiro contato até se tornar embaixadora da marca. Cada etapa tem responsável, ação e ferramenta.</p>
    </Card>
    {[
      { step: "01", title: "DESCOBERTA", desc: "Paciente descobre o Levvai", where: "Instagram, Google, indicação, Levvai Day", who: "Gi + Sirlândia", actions: ["Post/Reel desperta interesse", "Google 'clínica estética Vila Olímpia'", "Amiga indica", "Levvai Day — avaliação express"], emotion: "Curiosidade", color: "#E3F2FD" },
      { step: "02", title: "PRIMEIRO CONTATO", desc: "Paciente manda mensagem", where: "DM Instagram, WhatsApp, formulário site", who: "Sirlândia (< 30min)", actions: ["Responder com template boas-vindas", "Identificar interesse", "Oferecer avaliação gratuita", "Registrar no CRM com origem"], emotion: "Expectativa", color: "#E8EAF6" },
      { step: "03", title: "AGENDAMENTO", desc: "Consulta de avaliação marcada", where: "WhatsApp → CRM → Agenda", who: "Sirlândia", actions: ["Agendar no CRM (vira slot na Agenda)", "Enviar confirmação automática", "Lembrete 48h + 24h + 2h", "Enviar localização e orientações"], emotion: "Comprometimento", color: "#FFF3E0" },
      { step: "04", title: "RECEPÇÃO", desc: "Paciente chega na clínica", where: "Recepção — Rua do Rocio 288, cj 93", who: "Sirlândia", actions: ["Receber com nome ('Oi Maria, que bom ter você aqui!')", "Oferecer água/café", "Coletar TCLE + Uso de Imagem + LGPD + Anamnese", "Fotografar antes", "Encaminhar pra Sala da Lara ou Consultório"], emotion: "Acolhimento", color: "#F3E5F5" },
      { step: "05", title: "CONSULTA / AVALIAÇÃO", desc: "Lara avalia e propõe plano", where: "Consultório ou Sala da Lara", who: "Lara", actions: ["Anamnese detalhada", "Avaliação facial/corporal", "Apresentar plano de tratamento", "Montar orçamento (aba Orçamento)", "Explicar protocolos proprietários", "Alinhar expectativas"], emotion: "Confiança", color: "#E8F5E9" },
      { step: "06", title: "PROCEDIMENTO", desc: "Paciente realiza o procedimento", where: "Sala da Lara ou Sala Associados", who: "Lara / Associado", actions: ["Confirmar TCLE assinado", "Executar procedimento", "Fotografar depois", "Orientações pós-procedimento (verbal + impresso)", "Registrar no prontuário"], emotion: "Transformação", color: "#C8E6C9" },
      { step: "07", title: "PÓS-ATENDIMENTO", desc: "Follow-up nas primeiras 24h-7 dias", where: "WhatsApp + CRM", who: "Sirlândia", actions: ["24h: 'Como você está?' (automático)", "7 dias: Pedir review Google", "7 dias: Pedir depoimento/vídeo", "Registrar resultado no CRM"], emotion: "Cuidado", color: "#E0F2F1" },
      { step: "08", title: "RETORNO", desc: "Paciente volta pra próxima sessão", where: "WhatsApp → Agenda", who: "Sirlândia + Lara", actions: ["Lembrete 30 dias (automático)", "Agendar próxima sessão", "Oferecer cross-sell", "Perguntar: 'Conhece alguém que gostaria?'"], emotion: "Fidelização", color: "#FFF9C4" },
      { step: "09", title: "FIDELIZAÇÃO", desc: "Paciente vira cliente recorrente", where: "CRM — status Fidelizado", who: "Sirlândia + Gi", actions: ["Entrar na lista VIP", "Convite Levvai Day", "Mensagem aniversário", "Programa de indicação", "Protocolo de manutenção com condição"], emotion: "Pertencimento", color: LIGHT },
      { step: "10", title: "EMBAIXADORA", desc: "Paciente indica e gera conteúdo", where: "Instagram + boca a boca", who: "Gi + Lara", actions: ["Depoimento em vídeo", "Marcar @institutolevvai", "Indicar amigas (programa referral)", "Participar de conteúdo como case"], emotion: "Orgulho", color: "#C8A96E" },
    ].map((s, i) => (
      <div key={i} style={{ display: "flex", gap: 12, marginBottom: 8 }}>
        <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: DARK, margin: "0 auto" }}>{s.step}</div>
          {i < 9 && <div style={{ width: 2, height: 20, background: "#E8E4DE", margin: "4px auto" }} />}
        </div>
        <Card title={s.title} >
          <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{s.desc}</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            <Badge text={`📍 ${s.where}`} color={s.color} textColor="#555" />
            <Badge text={`👤 ${s.who}`} color={LIGHT} textColor={GOLD} />
            <Badge text={`💭 ${s.emotion}`} color="white" textColor="#888" />
          </div>
          {s.actions.map((a, j) => (
            <div key={j} style={{ fontSize: 11, color: "#555", padding: "2px 0", display: "flex", gap: 4 }}>
              <span style={{ color: GOLD }}>›</span> {a}
            </div>
          ))}
        </Card>
      </div>
    ))}
  </div>
);

// CALENDÁRIO EDITORIAL TAB
const EditorialTab = () => {
  const pilares = [
    { id: "transf", name: "Transformação", color: "#E91E63", desc: "Antes/depois, resultados" },
    { id: "ciencia", name: "Ciência Leve", color: "#2196F3", desc: "Educativo, protocolos" },
    { id: "lips", name: "Levvai Lips", color: "#E91E63", desc: "Sub-marca labial" },
    { id: "slim", name: "Levvai Slim", color: "#FF9800", desc: "Emagrecimento" },
    { id: "bastid", name: "Bastidores", color: "#9C27B0", desc: "Dia a dia da clínica" },
    { id: "lara", name: "Lara Pessoal", color: "#E91E63", desc: "Marca pessoal" },
    { id: "inova", name: "Inovação", color: "#009688", desc: "Tendências, novidades" },
    { id: "depoi", name: "Depoimentos", color: "#4CAF50", desc: "Prova social" },
  ];

  const weekDays = ["SEG", "TER", "QUA", "QUI", "SEX"];
  const [weekOffset, setWeekOffset] = useState(0);
  // Estado — Editorial
  const [editorial, setEditorial] = useState([]);
  const [loadingEditorial, setLoadingEditorial] = useState(true);

  useEffect(() => {
    const fetchEditorial = async () => {
      setLoadingEditorial(true);
      const { data, error } = await supabase
        .from('editorial_calendario')
        .select('*')
        .order('data', { ascending: true });

      if (!error && data) setEditorial(data);
      setLoadingEditorial(false);
    };

    fetchEditorial();
  }, []);

  const salvarPost = async (post) => {
    if (post.id) {
      const { error } = await supabase
        .from('editorial_calendario')
        .update(post)
        .eq('id', post.id);
      if (!error) setEditorial(prev => prev.map(p => p.id === post.id ? post : p));
    } else {
      const { data, error } = await supabase
        .from('editorial_calendario')
        .insert([post])
        .select()
        .single();
      if (!error && data) setEditorial(prev => [...prev, data]);
    }
  };

  const atualizarStatusPost = async (postId, novoStatus) => {
    const { error } = await supabase
      .from('editorial_calendario')
      .update({ status: novoStatus })
      .eq('id', postId);
    if (!error) setEditorial(prev =>
      prev.map(p => p.id === postId ? { ...p, status: novoStatus } : p)
    );
  };

  const excluirPost = async (postId) => {
    const { error } = await supabase
      .from('editorial_calendario')
      .delete()
      .eq('id', postId);
    if (!error) setEditorial(prev => prev.filter(p => p.id !== postId));
  };

  // Posts por semana (para o grid editorial)
  const postsPorData = (dataStr) => editorial.filter(p => p.data === dataStr);
  const postsDoMes = (ano, mes) => editorial.filter(p => {
    const d = new Date(p.data);
    return d.getFullYear() === ano && d.getMonth() + 1 === mes;
  });

  const posts = editorial.reduce((acc, p) => { if (p.data) acc[p.data] = [...(acc[p.data] || []), p]; return acc; }, {});
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ pilar: "transf", format: "Reel", desc: "" });

  const savePost = async (key) => {
    await salvarPost(editForm);
    setEditing(null);
  };

  return (
    <div>
      <Card title="Calendário Editorial — Visão Semanal" accent>
        <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Gi preenche. Lara valida sexta no 1:1. CEO aprova na weekly. Meta: 5 posts/semana.</p>
      </Card>

      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {pilares.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
            <span style={{ fontSize: 10, color: "#888" }}>{p.name}</span>
          </div>
        ))}
      </div>

      <Card title={`Semana ${weekOffset + 1}`}>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          <button onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: GOLD }}>‹</button>
          <div style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 700, color: DARK, lineHeight: "32px" }}>Semana {weekOffset + 1}</div>
          <button onClick={() => setWeekOffset(weekOffset + 1)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: GOLD }}>›</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
          {weekDays.map((day, di) => {
            const key = `${weekOffset}-${di}`;
            const post = posts[key];
            const pilar = post ? pilares.find(p => p.id === post.pilar) : null;
            const isEditing = editing === key;

            return (
              <div key={di} style={{ background: "white", border: "1px solid #E8E4DE", borderRadius: 8, overflow: "hidden", minHeight: 140 }}>
                <div style={{ background: DARK, padding: "6px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GOLD }}>{day}</div>
                </div>
                {isEditing ? (
                  <div style={{ padding: "8px" }}>
                    <select value={editForm.pilar} onChange={e => setEditForm({...editForm, pilar: e.target.value})}
                      style={{ width: "100%", padding: "4px", fontSize: 10, marginBottom: 4, borderRadius: 4, border: "1px solid #ddd", fontFamily: "inherit", boxSizing: "border-box" }}>
                      {pilares.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select value={editForm.format} onChange={e => setEditForm({...editForm, format: e.target.value})}
                      style={{ width: "100%", padding: "4px", fontSize: 10, marginBottom: 4, borderRadius: 4, border: "1px solid #ddd", fontFamily: "inherit", boxSizing: "border-box" }}>
                      {["Reel", "Carrossel", "Foto", "Stories", "Live"].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <input value={editForm.desc} onChange={e => setEditForm({...editForm, desc: e.target.value})} placeholder="Descrição..."
                      style={{ width: "100%", padding: "4px", fontSize: 10, borderRadius: 4, border: "1px solid #ddd", fontFamily: "inherit", marginBottom: 4, boxSizing: "border-box" }} />
                    <button onClick={() => savePost(key)} style={{ width: "100%", padding: "4px", fontSize: 10, background: GOLD, color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "inherit" }}>Salvar</button>
                  </div>
                ) : post ? (
                  <div onClick={() => { setEditing(key); setEditForm(post); }} style={{ padding: "8px", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: pilar?.color || "#ccc" }} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: pilar?.color || "#888" }}>{pilar?.name}</span>
                    </div>
                    <Badge text={post.format} color={LIGHT} textColor="#888" />
                    <div style={{ fontSize: 10, color: "#666", marginTop: 4, lineHeight: 1.4 }}>{post.desc}</div>
                  </div>
                ) : (
                  <div onClick={() => { setEditing(key); setEditForm({ pilar: "transf", format: "Reel", desc: "" }); }}
                    style={{ padding: "20px 8px", textAlign: "center", cursor: "pointer", color: "#ddd", fontSize: 20 }}>+</div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Distribuição Semanal Ideal">
        {[
          { day: "Segunda", pilar: "Transformação ou Ciência", format: "Reel ou Carrossel", tip: "Começa a semana com impacto visual" },
          { day: "Terça", pilar: "Levvai Lips ou Slim", format: "Reel", tip: "Protocolo proprietário em foco" },
          { day: "Quarta", pilar: "Lara Pessoal ou Inovação", format: "Reel + Stories", tip: "Gravar com Lara (dia de Reels)" },
          { day: "Quinta", pilar: "Bastidores ou Depoimentos", format: "Reel ou Foto", tip: "Humaniza a marca" },
          { day: "Sexta", pilar: "Livre (pilar que faltou)", format: "Qualquer", tip: "1:1 com Lara 16h — validar semana seguinte" },
        ].map((d, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0ece6", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: DARK, minWidth: 60 }}>{d.day}</span>
            <Badge text={d.pilar} color={LIGHT} textColor={GOLD} />
            <Badge text={d.format} color="#E3F2FD" textColor="#1565C0" />
            <span style={{ fontSize: 11, color: "#999" }}>{d.tip}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

// NPS & SATISFAÇÃO TAB
const NpsTab = () => {
  // Estado — NPS
  const [feedbacksNps, setFeedbacksNps] = useState([]);
  const [loadingNps, setLoadingNps] = useState(true);

  useEffect(() => {
    const fetchNps = async () => {
      setLoadingNps(true);
      const { data, error } = await supabase
        .from('feedbacks_nps')
        .select('*')
        .order('data', { ascending: false });

      if (!error && data) setFeedbacksNps(data);
      setLoadingNps(false);
    };

    fetchNps();
  }, []);

  const salvarFeedbackNps = async (feedback) => {
    if (feedback.id) {
      const { error } = await supabase
        .from('feedbacks_nps')
        .update(feedback)
        .eq('id', feedback.id);
      if (!error) setFeedbacksNps(prev => prev.map(f => f.id === feedback.id ? feedback : f));
    } else {
      const { data, error } = await supabase
        .from('feedbacks_nps')
        .insert([feedback])
        .select()
        .single();
      if (!error && data) setFeedbacksNps(prev => [data, ...prev]);
    }
  };

  // Cálculo NPS: % promotores (9-10) - % detratores (0-6)
  const calcularNps = () => {
    if (feedbacksNps.length === 0) return 0;
    const promotores = feedbacksNps.filter(f => f.nota >= 9).length;
    const detratores = feedbacksNps.filter(f => f.nota <= 6).length;
    return Math.round(((promotores - detratores) / feedbacksNps.length) * 100);
  };

  const feedbacks = feedbacksNps;
  const [showNew, setShowNew] = useState(false);
  const [newFb, setNewFb] = useState({ nome: "", proc: "", nota: 10, data: "", comentario: "", indicaria: true });

  const addFb = async () => {
    if (!newFb.nome) return;
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2,"0")}/${(now.getMonth()+1).toString().padStart(2,"0")}`;
    await salvarFeedbackNps({ ...newFb, data: dateStr });
    setNewFb({ nome: "", proc: "", nota: 10, data: "", comentario: "", indicaria: true });
    setShowNew(false);
  };

  const promoters = feedbacks.filter(f => f.nota >= 9).length;
  const passives = feedbacks.filter(f => f.nota >= 7 && f.nota <= 8).length;
  const detractors = feedbacks.filter(f => f.nota <= 6).length;
  const total = feedbacks.length;
  const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
  const avgNota = total > 0 ? (feedbacks.reduce((a, f) => a + f.nota, 0) / total).toFixed(1) : 0;

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <Metric label="NPS Score" value={nps} color={nps >= 75 ? "#2E7D32" : nps >= 50 ? GOLD : "#B71C1C"} sub={nps >= 75 ? "Excelente" : nps >= 50 ? "Bom" : "Precisa melhorar"} />
        <Metric label="Nota Média" value={avgNota} sub="de 0 a 10" />
        <Metric label="Promotores (9-10)" value={promoters} color="#2E7D32" sub={`${total > 0 ? Math.round(promoters/total*100) : 0}%`} />
        <Metric label="Neutros (7-8)" value={passives} color={GOLD} sub={`${total > 0 ? Math.round(passives/total*100) : 0}%`} />
        <Metric label="Detratores (0-6)" value={detractors} color="#B71C1C" sub={`${total > 0 ? Math.round(detractors/total*100) : 0}%`} />
      </div>

      <Card title="Registrar Feedback">
        {!showNew ? (
          <button onClick={() => setShowNew(true)} style={{ width: "100%", padding: "10px", background: "white", border: `2px dashed ${GOLD}`, borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: GOLD, fontFamily: "inherit" }}>+ Registrar novo feedback</button>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 150px" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>PACIENTE</div>
              <input value={newFb.nome} onChange={e => setNewFb({...newFb, nome: e.target.value})} placeholder="Nome" style={{ width: "100%", padding: "7px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" }} /></div>
            <div style={{ flex: "0 0 140px" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>PROCEDIMENTO</div>
              <input value={newFb.proc} onChange={e => setNewFb({...newFb, proc: e.target.value})} placeholder="Botox, Lips..." style={{ width: "100%", padding: "7px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" }} /></div>
            <div style={{ flex: "0 0 70px" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>NOTA (0-10)</div>
              <input type="number" min="0" max="10" value={newFb.nota} onChange={e => setNewFb({...newFb, nota: Number(e.target.value)})} style={{ width: "100%", padding: "7px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, fontFamily: "inherit", textAlign: "center", boxSizing: "border-box" }} /></div>
            <div style={{ flex: "1 1 200px" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>COMENTÁRIO</div>
              <input value={newFb.comentario} onChange={e => setNewFb({...newFb, comentario: e.target.value})} placeholder="O que o paciente disse?" style={{ width: "100%", padding: "7px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" }} /></div>
            <button onClick={addFb} style={{ padding: "8px 16px", background: GOLD, color: "white", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Registrar</button>
          </div>
        )}
      </Card>

      <Card title="Feedbacks Recebidos">
        {feedbacks.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #f0ece6", alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: f.nota >= 9 ? "#E8F5E9" : f.nota >= 7 ? "#FFF9C4" : "#FFEBEE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: f.nota >= 9 ? "#2E7D32" : f.nota >= 7 ? "#F57F17" : "#B71C1C" }}>{f.nota}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{f.nome}</span>
                <Badge text={f.proc} color={LIGHT} textColor={GOLD} />
                <span style={{ fontSize: 10, color: "#bbb" }}>{f.data}</span>
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 2, fontStyle: "italic" }}>"{f.comentario}"</div>
            </div>
            <Badge text={f.indicaria ? "INDICARIA" : "NÃO INDICARIA"} color={f.indicaria ? "#E8F5E9" : "#FFEBEE"} textColor={f.indicaria ? "#2E7D32" : "#B71C1C"} />
          </div>
        ))}
      </Card>

      <Card title="Quando Coletar">
        {["7 dias após procedimento — Sirlândia envia WhatsApp com pergunta NPS", "Perguntar: 'De 0 a 10, qual a chance de indicar o Levvai pra uma amiga?'", "Se nota ≤ 6: Lara liga pessoalmente pra entender. Oportunidade de reverter.", "Se nota 7-8: Sirlândia pergunta o que pode melhorar.", "Se nota 9-10: Pedir review Google + depoimento pra Instagram.", "Consolidar na weekly (Bloco 3). Meta: NPS 85+."].map((r, i) => (
          <div key={i} style={{ fontSize: 12, color: "#555", padding: "4px 0", display: "flex", gap: 6 }}><span style={{ color: GOLD }}>›</span> {r}</div>
        ))}
      </Card>
    </div>
  );
};

// MARKETING DASHBOARD TAB
const MarketingTab = () => {
  const [igTab, setIgTab] = useState("feed");
  const [igData, setIgData] = useState(null);
  const [igLoading, setIgLoading] = useState(true);
  const [igError, setIgError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const [igTokenExpiry, setIgTokenExpiry] = useState(() => localStorage.getItem('ig_token_expiry') || '');
  const [editingExpiry, setEditingExpiry] = useState(false);
  const [expiryInput, setExpiryInput] = useState('');
  const tokenDaysLeft = igTokenExpiry
    ? Math.ceil((new Date(igTokenExpiry) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const saveExpiry = () => {
    localStorage.setItem('ig_token_expiry', expiryInput);
    setIgTokenExpiry(expiryInput);
    setEditingExpiry(false);
  };

  // AUTO-FETCH from Instagram API
  useEffect(() => {
    const fetchIG = async () => {
      try {
        setIgLoading(true);
        const res = await authenticatedFetch("/api/instagram");
        if (!res.ok) throw new Error("API not configured");
        const data = await res.json();
        if (data.success) {
          setIgData(data);
          setLastFetch(new Date().toLocaleString("pt-BR"));
        } else {
          setIgError(data.error || "Erro na API");
        }
      } catch (e) {
        setIgError("API do Instagram não configurada ainda. Usando modo manual.");
      } finally {
        setIgLoading(false);
      }
    };
    fetchIG();
    const interval = setInterval(fetchIG, 30 * 60 * 1000); // refresh every 30 min
    return () => clearInterval(interval);
  }, []);

  const [posts, setPosts] = useState([
    { id: 1, date: "14/04", type: "Reel", pilar: "Transformação", desc: "Harmonização antes/depois", likes: 45, comments: 8, saves: 12, shares: 3, reach: 890, engagement: "7.5%" },
    { id: 2, date: "12/04", type: "Carrossel", pilar: "Ciência", desc: "Profhilo vs Skinbooster", likes: 32, comments: 5, saves: 18, shares: 6, reach: 650, engagement: "9.4%" },
    { id: 3, date: "10/04", type: "Reel", pilar: "Levvai Lips", desc: "Processo labial ao vivo", likes: 67, comments: 12, saves: 22, shares: 8, reach: 1200, engagement: "9.1%" },
  ]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ date: "", type: "Reel", pilar: "Transformação", desc: "", likes: 0, comments: 0, saves: 0, shares: 0, reach: 0 });

  const addPost = () => {
    if (!newPost.desc) return;
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2,"0")}/${(now.getMonth()+1).toString().padStart(2,"0")}`;
    const eng = newPost.reach > 0 ? ((newPost.likes + newPost.comments + newPost.saves + newPost.shares) / newPost.reach * 100).toFixed(1) + "%" : "—";
    setPosts([{ ...newPost, id: posts.length + 1, date: dateStr, engagement: eng }, ...posts]);
    setNewPost({ date: "", type: "Reel", pilar: "Transformação", desc: "", likes: 0, comments: 0, saves: 0, shares: 0, reach: 0 });
    setShowNewPost(false);
  };

  const totalReach = posts.reduce((a, p) => a + p.reach, 0);
  const avgEng = posts.length > 0 ? (posts.reduce((a, p) => a + parseFloat(p.engagement) || 0, 0) / posts.length).toFixed(1) : 0;
  const bestPost = posts.length > 0 ? posts.reduce((a, b) => (parseFloat(a.engagement) || 0) > (parseFloat(b.engagement) || 0) ? a : b) : null;

  return (
    <div>
      <Card title="Dashboard de Marketing & Instagram" accent>
        <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Hub completo: feed, métricas, ações rápidas e performance de conteúdo. Gi alimenta, CEO acompanha na weekly.</p>
      </Card>

      {/* TOKEN EXPIRY ALERT */}
      {(tokenDaysLeft !== null && tokenDaysLeft <= 14) && (
        <div style={{
          background: tokenDaysLeft <= 3 ? '#FFEBEE' : tokenDaysLeft <= 7 ? '#FFF3E0' : '#FFFDE7',
          border: `1px solid ${tokenDaysLeft <= 3 ? '#FFCDD2' : tokenDaysLeft <= 7 ? '#FFE0B2' : '#FFF9C4'}`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{tokenDaysLeft <= 3 ? '🚨' : '⚠️'}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: tokenDaysLeft <= 3 ? '#B71C1C' : '#E65100' }}>
                Token Instagram expira em {tokenDaysLeft} dia{tokenDaysLeft !== 1 ? 's' : ''} ({igTokenExpiry})
              </div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                Acesse Meta for Developers → renovar Long-Lived Token antes de expirar
              </div>
            </div>
          </div>
          <button onClick={() => { setExpiryInput(igTokenExpiry); setEditingExpiry(true); }} style={{
            padding: '6px 14px', background: 'white', border: '1px solid #ddd',
            borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
          }}>Atualizar data</button>
        </div>
      )}

      {/* TOKEN EXPIRY FORM */}
      {editingExpiry && (
        <div style={{ background: '#F5F0E8', borderRadius: 10, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#888' }}>Data de expiração do token:</span>
          <input type="date" value={expiryInput} onChange={e => setExpiryInput(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
          <button onClick={saveExpiry} style={{ padding: '6px 16px', background: GOLD, color: 'white', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Salvar</button>
          <button onClick={() => setEditingExpiry(false)} style={{ padding: '6px 12px', background: 'white', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
        </div>
      )}

      {/* TOKEN EXPIRY SETUP (when not set) */}
      {tokenDaysLeft === null && (
        <div style={{ background: '#F5F0E8', borderRadius: 10, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#888' }}>Token Instagram: data de expiração não configurada</span>
          {!editingExpiry && <button onClick={() => { setExpiryInput(''); setEditingExpiry(true); }} style={{ padding: '5px 14px', background: DARK, color: GOLD, border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>Configurar alerta</button>}
        </div>
      )}

      {/* API STATUS */}
      <div style={{
        background: igData ? "#E8F5E9" : igLoading ? "#FFF9C4" : "#FFF3E0",
        borderRadius: 10, padding: "10px 16px", marginBottom: 12,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        border: `1px solid ${igData ? "#C8E6C9" : "#FFE0B2"}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: igData ? "#2E7D32" : igLoading ? "#F57F17" : "#E65100", animation: igLoading ? "none" : "none" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: igData ? "#2E7D32" : "#E65100" }}>
            {igLoading ? "Conectando ao Instagram..." : igData ? `Instagram conectado — ${igData.profile.followers} seguidores` : "Modo manual — API não configurada"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {lastFetch && <span style={{ fontSize: 10, color: "#999" }}>Atualizado: {lastFetch}</span>}
          {igData && <Badge text="AUTO-REFRESH 5min" color="#C8E6C9" textColor="#2E7D32" />}
          {!igData && !igLoading && <Badge text="CONFIGURAR API →" color="#FFE0B2" textColor="#E65100" />}
        </div>
      </div>

      {/* INSTAGRAM QUICK ACTIONS */}
      <Card title="Instagram — Ações Rápidas">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
          {[
            { label: "Ver Perfil", url: "https://www.instagram.com/institutolevvai/", icon: "👤", color: "#E8EAF6", desc: "@institutolevvai" },
            { label: "Criar Post", url: "https://business.facebook.com/latest/posts/create", icon: "📝", color: "#E8F5E9", desc: "Meta Business Suite" },
            { label: "Ver DMs", url: "https://www.instagram.com/direct/inbox/", icon: "💬", color: "#E3F2FD", desc: "Mensagens diretas" },
            { label: "Insights", url: "https://www.instagram.com/institutolevvai/insights/", icon: "📊", color: "#FFF3E0", desc: "Métricas IG" },
            { label: "Creator Studio", url: "https://business.facebook.com/creatorstudio", icon: "🎬", color: "#F3E5F5", desc: "Agendar posts" },
            { label: "Meta Ads", url: "https://adsmanager.facebook.com/", icon: "📢", color: "#FCE4EC", desc: "Tráfego pago" },
            { label: "Google Analytics", url: "https://analytics.google.com/", icon: "📈", color: "#E0F2F1", desc: "Tráfego site" },
            { label: "Google Business", url: "https://business.google.com/", icon: "🗺", color: "#FFF9C4", desc: "Perfil Google" },
          ].map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{
              background: a.color, borderRadius: 10, padding: "14px 12px", textAlign: "center",
              textDecoration: "none", transition: "transform 0.15s", display: "block",
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{a.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: DARK }}>{a.label}</div>
              <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>{a.desc}</div>
            </a>
          ))}
        </div>
      </Card>

      {/* INSTAGRAM TABS */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {[
          { id: "feed", label: "Feed & Performance" },
          { id: "metrics", label: "Métricas IG" },
          { id: "channels", label: "ROI por Canal" },
        ].map(t => (
          <button key={t.id} onClick={() => setIgTab(t.id)} style={{
            flex: 1, padding: "10px", borderRadius: 8, fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", border: "1px solid",
            background: igTab === t.id ? DARK : "white",
            color: igTab === t.id ? GOLD : "#888",
            borderColor: igTab === t.id ? DARK : "#ddd",
          }}>{t.label}</button>
        ))}
      </div>

      {/* FEED & PERFORMANCE */}
      {igTab === "feed" && (
        <>
          {/* FEED EMBED */}
          <Card title="Feed @institutolevvai">
            <div style={{ background: "#FAFAF8", borderRadius: 10, border: "1px solid #E8E4DE", overflow: "hidden" }}>
              <iframe
                src="https://www.instagram.com/institutolevvai/embed"
                style={{ width: "100%", height: 480, border: "none" }}
                title="Instagram Feed Levvai"
              />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10 }}>
              <a href="https://www.instagram.com/institutolevvai/" target="_blank" rel="noopener noreferrer" style={{
                padding: "8px 20px", background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                color: "white", borderRadius: 8, fontWeight: 700, fontSize: 12, textDecoration: "none", fontFamily: "inherit",
              }}>Abrir Instagram</a>
              <a href="https://www.instagram.com/institutolevvai/insights/" target="_blank" rel="noopener noreferrer" style={{
                padding: "8px 20px", background: DARK, color: GOLD, borderRadius: 8, fontWeight: 700, fontSize: 12, textDecoration: "none", fontFamily: "inherit",
              }}>Ver Insights</a>
            </div>
          </Card>

          {/* CONTENT PERFORMANCE */}
          <Card title="Performance de Conteúdo — Tracker">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
              <Metric label="Posts Rastreados" value={posts.length} />
              <Metric label="Alcance Total" value={totalReach.toLocaleString("pt-BR")} />
              <Metric label="Eng. Médio" value={`${avgEng}%`} color={parseFloat(avgEng) >= 5 ? "#2E7D32" : "#E65100"} />
              {bestPost && <Metric label="Melhor Post" value={bestPost.engagement} sub={bestPost.desc} color="#2E7D32" />}
            </div>

            <button onClick={() => setShowNewPost(!showNewPost)} style={{
              width: "100%", padding: "10px", background: "white", border: `2px dashed ${GOLD}`,
              borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: GOLD, fontFamily: "inherit", marginBottom: 12,
            }}>+ Registrar performance de post</button>

            {showNewPost && (
              <div style={{ background: LIGHT, borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  <div style={{ flex: "0 0 100px" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>FORMATO</div>
                    <select value={newPost.type} onChange={e => setNewPost({...newPost, type: e.target.value})} style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                      {["Reel", "Carrossel", "Foto", "Stories", "Live"].map(t => <option key={t}>{t}</option>)}
                    </select></div>
                  <div style={{ flex: "0 0 120px" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>PILAR</div>
                    <select value={newPost.pilar} onChange={e => setNewPost({...newPost, pilar: e.target.value})} style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                      {["Transformação", "Ciência", "Levvai Lips", "Levvai Slim", "Bastidores", "Lara Pessoal", "Inovação", "Depoimentos"].map(p => <option key={p}>{p}</option>)}
                    </select></div>
                  <div style={{ flex: "1 1 180px" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>DESCRIÇÃO</div>
                    <input value={newPost.desc} onChange={e => setNewPost({...newPost, desc: e.target.value})} placeholder="Sobre o que era o post" style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" }} /></div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {[["LIKES", "likes"], ["COMMENTS", "comments"], ["SAVES", "saves"], ["SHARES", "shares"], ["ALCANCE", "reach"]].map(([label, field]) => (
                    <div key={field} style={{ flex: "0 0 80px" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>{label}</div>
                      <input type="number" value={newPost[field] || ""} onChange={e => setNewPost({...newPost, [field]: Number(e.target.value)})} style={{ width: "100%", padding: "7px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", textAlign: "center", boxSizing: "border-box" }} /></div>
                  ))}
                </div>
                <button onClick={addPost} style={{ padding: "8px 20px", background: GOLD, color: "white", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Registrar</button>
              </div>
            )}

            {/* POST LIST */}
            <div style={{ display: "flex", background: DARK, borderRadius: "8px 8px 0 0", padding: "8px 0" }}>
              {["DATA", "FORMATO", "PILAR", "POST", "❤️", "💬", "🔖", "🔄", "👁", "ENG%"].map((h, i) => (
                <div key={i} style={{ flex: i === 3 ? 2 : i < 3 ? 0.8 : 0.6, textAlign: "center", fontSize: 8, fontWeight: 700, color: GOLD, letterSpacing: "0.05em" }}>{h}</div>
              ))}
            </div>
            {posts.map((p, i) => (
              <div key={i} style={{ display: "flex", padding: "6px 0", borderBottom: "1px solid #f0ece6", alignItems: "center", background: i % 2 === 0 ? "white" : "#FAFAF8" }}>
                <div style={{ flex: 0.8, textAlign: "center", fontSize: 11, color: "#888" }}>{p.date}</div>
                <div style={{ flex: 0.8, textAlign: "center" }}><Badge text={p.type} color={p.type === "Reel" ? "#FCE4EC" : p.type === "Carrossel" ? "#E3F2FD" : LIGHT} textColor="#555" /></div>
                <div style={{ flex: 0.8, textAlign: "center", fontSize: 10, color: GOLD, fontWeight: 600 }}>{p.pilar}</div>
                <div style={{ flex: 2, fontSize: 11, paddingLeft: 4 }}>{p.desc}</div>
                <div style={{ flex: 0.6, textAlign: "center", fontSize: 11 }}>{p.likes}</div>
                <div style={{ flex: 0.6, textAlign: "center", fontSize: 11 }}>{p.comments}</div>
                <div style={{ flex: 0.6, textAlign: "center", fontSize: 11 }}>{p.saves}</div>
                <div style={{ flex: 0.6, textAlign: "center", fontSize: 11 }}>{p.shares}</div>
                <div style={{ flex: 0.6, textAlign: "center", fontSize: 11 }}>{p.reach}</div>
                <div style={{ flex: 0.6, textAlign: "center" }}><Badge text={p.engagement} color={parseFloat(p.engagement) >= 5 ? "#E8F5E9" : "#FFF9C4"} textColor={parseFloat(p.engagement) >= 5 ? "#2E7D32" : "#F57F17"} /></div>
              </div>
            ))}
          </Card>
        </>
      )}

      {/* MÉTRICAS INSTAGRAM */}
      {igTab === "metrics" && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <Metric label="Seguidores" value={igData ? igData.profile.followers.toLocaleString("pt-BR") : "286"} sub="Meta Q2: 1.000" color={igData && igData.profile.followers >= 1000 ? "#2E7D32" : undefined} />
            <Metric label="Posts" value={igData ? igData.profile.mediaCount : "20"} sub="Meta Q2: 70" />
            <Metric label="Eng. Médio" value={`${avgEng}%`} sub="Meta: 5%+" color={parseFloat(avgEng) >= 5 ? "#2E7D32" : "#E65100"} />
            <Metric label="Alcance/Semana" value={igData?.accountInsights?.reach ? igData.accountInsights.reach.total.toLocaleString("pt-BR") : "—"} sub="Meta: +10% WoW" />
          </div>

          {/* INSTAGRAM TRENDS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <TrendChart title="Evolução seguidores" color="#E91E63" target={1000}
              data={[{label:"Jan",value:80},{label:"Fev",value:130},{label:"Mar",value:200},{label:"Abr",value:286},{label:"Mai",value:500,projected:true},{label:"Jun",value:1000,projected:true}]} />
            <TrendChart title="Posts acumulados" color="#2196F3" target={70}
              data={[{label:"Jan",value:3},{label:"Fev",value:7},{label:"Mar",value:13},{label:"Abr",value:20},{label:"Mai",value:40,projected:true},{label:"Jun",value:70,projected:true}]} />
          </div>

          {/* LIVE POSTS FROM API */}
          {igData && igData.posts.length > 0 && (
            <Card title="Últimos Posts — Dados ao Vivo da API">
              <div style={{ display: "flex", background: DARK, borderRadius: "8px 8px 0 0", padding: "8px 0" }}>
                {["DATA", "TIPO", "DESCRIÇÃO", "❤️", "💬", "👁 REACH", "🔖", "ENG%"].map((h, i) => (
                  <div key={i} style={{ flex: i === 2 ? 2.5 : i === 0 ? 0.8 : 0.7, textAlign: "center", fontSize: 8, fontWeight: 700, color: GOLD }}>{h}</div>
                ))}
              </div>
              {igData.posts.map((p, i) => {
                const eng = p.reach > 0 ? ((p.likes + p.comments + p.saves + p.shares) / p.reach * 100).toFixed(1) : "—";
                const dateStr = new Date(p.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
                return (
                  <div key={i} style={{ display: "flex", padding: "6px 0", borderBottom: "1px solid #f0ece6", alignItems: "center", background: i % 2 === 0 ? "white" : "#FAFAF8" }}>
                    <div style={{ flex: 0.8, textAlign: "center", fontSize: 11, color: "#888" }}>{dateStr}</div>
                    <div style={{ flex: 0.7, textAlign: "center" }}><Badge text={p.type === "VIDEO" ? "Reel" : p.type === "CAROUSEL_ALBUM" ? "Carrossel" : "Foto"} color={p.type === "VIDEO" ? "#FCE4EC" : p.type === "CAROUSEL_ALBUM" ? "#E3F2FD" : LIGHT} textColor="#555" /></div>
                    <div style={{ flex: 2.5, fontSize: 11, paddingLeft: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: "#555", textDecoration: "none" }}>{p.caption || "—"}</a>
                    </div>
                    <div style={{ flex: 0.7, textAlign: "center", fontSize: 11 }}>{p.likes}</div>
                    <div style={{ flex: 0.7, textAlign: "center", fontSize: 11 }}>{p.comments}</div>
                    <div style={{ flex: 0.7, textAlign: "center", fontSize: 11 }}>{p.reach || "—"}</div>
                    <div style={{ flex: 0.7, textAlign: "center", fontSize: 11 }}>{p.saves || "—"}</div>
                    <div style={{ flex: 0.7, textAlign: "center" }}><Badge text={eng !== "—" ? `${eng}%` : "—"} color={parseFloat(eng) >= 5 ? "#E8F5E9" : "#FFF9C4"} textColor={parseFloat(eng) >= 5 ? "#2E7D32" : "#F57F17"} /></div>
                  </div>
                );
              })}
              <div style={{ fontSize: 10, color: "#999", marginTop: 8, textAlign: "center" }}>Dados atualizados automaticamente a cada 5 minutos via Meta Graph API</div>
            </Card>
          )}

          <Card title="Métricas Semanais — Gi preenche toda sexta">
            {[
              { metric: "Seguidores", current: "286", target: "1.000 (Q2)", color: "#E3F2FD", instruction: "Gi checa no Instagram > Perfil > Seguidores" },
              { metric: "Posts acumulados", current: "20", target: "70 (Q2)", color: "#E8F5E9", instruction: "Contar total de publicações no perfil" },
              { metric: "Engajamento médio", current: `${avgEng}%`, target: "5%+", color: "#FFF3E0", instruction: "Instagram Insights > Conteúdo > Média de engajamento" },
              { metric: "Alcance semanal", current: "—", target: "+10% WoW", color: "#F3E5F5", instruction: "Instagram Insights > Visão geral > Alcance últimos 7 dias" },
              { metric: "DMs recebidas/semana", current: "—", target: "5+ leads", color: "#FCE4EC", instruction: "Contar DMs novas de potenciais pacientes" },
              { metric: "Saves + Shares / post", current: "—", target: "crescente", color: "#E0F2F1", instruction: "Insights de cada post > Saves + Compartilhamentos" },
              { metric: "Visitas ao perfil/semana", current: "—", target: "crescente", color: "#E8EAF6", instruction: "Instagram Insights > Visão geral > Visitas ao perfil" },
              { metric: "Cliques no link da bio", current: "—", target: "crescente", color: "#FFF9C4", instruction: "Instagram Insights > Visão geral > Cliques no link" },
            ].map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f0ece6" }}>
                <div style={{ background: m.color, borderRadius: 6, padding: "6px 10px", minWidth: 140, fontSize: 12, fontWeight: 600 }}>{m.metric}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: DARK, minWidth: 60 }}>{m.current}</div>
                <div style={{ fontSize: 11, color: "#999", flex: 1 }}>{m.instruction}</div>
                <div style={{ fontSize: 10, color: GOLD, fontWeight: 600, minWidth: 80, textAlign: "right" }}>Meta: {m.target}</div>
              </div>
            ))}
          </Card>

          <Card title="Benchmark por Tipo de Conteúdo">
            {[
              { type: "Reels", avgReach: "800-1.500", avgEng: "6-10%", tip: "Melhor alcance. Priorizar. 15-30 segundos performa melhor.", color: "#FCE4EC" },
              { type: "Carrossel", avgReach: "400-800", avgEng: "4-7%", tip: "Melhor save rate. Ideal pra conteúdo educativo e comparativos.", color: "#E3F2FD" },
              { type: "Foto única", avgReach: "200-500", avgEng: "2-4%", tip: "Menor alcance. Usar pra depoimentos com texto e antes/depois.", color: "#E8F5E9" },
              { type: "Stories", avgReach: "150-400", avgEng: "3-5%", tip: "Alcance limitado a seguidores. Usar pra bastidores e dia a dia.", color: "#FFF3E0" },
            ].map((t, i) => (
              <div key={i} style={{ background: t.color, borderRadius: 8, padding: "12px 14px", marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: DARK }}>{t.type}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Badge text={`Alcance: ${t.avgReach}`} color="rgba(0,0,0,0.06)" textColor="#555" />
                    <Badge text={`Eng: ${t.avgEng}`} color="rgba(0,0,0,0.06)" textColor="#555" />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#666" }}>{t.tip}</div>
              </div>
            ))}
          </Card>
        </>
      )}

      {/* ROI POR CANAL */}
      {igTab === "channels" && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <Metric label="CAC (Custo Aquisição)" value="R$ —" sub="Meta: R$80-150" />
            <Metric label="LTV (Valor Vitalício)" value="R$ —" sub="Ticket × retornos" />
            <Metric label="LTV / CAC" value="— x" sub="Meta: >3x" />
            <Metric label="ROI Marketing" value="— %" sub="(Receita mkt - Custo) / Custo" />
          </div>

          <Card title="Métricas por Canal de Aquisição">
            <div style={{ display: "flex", background: DARK, borderRadius: "8px 8px 0 0", padding: "10px 0" }}>
              {["CANAL", "LEADS", "CONVERSÕES", "CAC", "INVESTIMENTO", "RECEITA", "ROI"].map((h, i) => (
                <div key={i} style={{ flex: i === 0 ? 1.5 : 1, textAlign: "center", fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em" }}>{h}</div>
              ))}
            </div>
            {[
              { canal: "Instagram Orgânico", leads: "—", conv: "—", cac: "R$0", inv: "R$0", rec: "—", roi: "∞" },
              { canal: "Google Orgânico", leads: "—", conv: "—", cac: "R$0", inv: "R$0", rec: "—", roi: "∞" },
              { canal: "Tráfego Pago (Meta)", leads: "—", conv: "—", cac: "—", inv: "—", rec: "—", roi: "—" },
              { canal: "Tráfego Pago (Google)", leads: "—", conv: "—", cac: "—", inv: "—", rec: "—", roi: "—" },
              { canal: "Indicação", leads: "—", conv: "—", cac: "R$0", inv: "R$0", rec: "—", roi: "∞" },
              { canal: "Levvai Day", leads: "—", conv: "—", cac: "—", inv: "—", rec: "—", roi: "—" },
              { canal: "Associados", leads: "—", conv: "—", cac: "R$0", inv: "R$0", rec: "—", roi: "—" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", padding: "8px 0", borderBottom: "1px solid #f0ece6", background: i % 2 === 0 ? "white" : "#FAFAF8" }}>
                <div style={{ flex: 1.5, fontSize: 12, fontWeight: 600, paddingLeft: 8 }}>{r.canal}</div>
                {[r.leads, r.conv, r.cac, r.inv, r.rec, r.roi].map((v, j) => (
                  <div key={j} style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#888" }}>{v}</div>
                ))}
              </div>
            ))}
            <div style={{ fontSize: 11, color: "#999", marginTop: 8 }}>Gi preenche leads e conversões. Sylmara preenche investimento. CEO calcula ROI na weekly.</div>
          </Card>
        </>
      )}
    </div>
  );
};

// ICP TAB
const IcpTab = () => (
  <div>
    <Card title="ICP — Ideal Customer Profile" accent>
      <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Quem é a paciente ideal do Instituto Levvai. Toda decisão de conteúdo, captação e posicionamento parte daqui.</p>
    </Card>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <Card title="Perfil Demográfico">
        {[
          { label: "Gênero", value: "Mulher (90%+ da base)" },
          { label: "Idade", value: "30 a 50 anos (core: 35-45)" },
          { label: "Classe", value: "A e B (renda familiar >R$15K/mês)" },
          { label: "Localização", value: "Vila Olímpia, Itaim, Moema, Pinheiros, Jardins" },
          { label: "Profissão", value: "Executiva, empresária, profissional liberal, médica, advogada" },
          { label: "Estado civil", value: "Casada ou em relacionamento estável (maioria)" },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", padding: "6px 0", borderBottom: "1px solid #f0ece6" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: GOLD, minWidth: 100 }}>{f.label}</span>
            <span style={{ fontSize: 12, color: "#555" }}>{f.value}</span>
          </div>
        ))}
      </Card>
      <Card title="Perfil Comportamental">
        {[
          { label: "Rotina", value: "Agenda cheia, valoriza praticidade e pontualidade" },
          { label: "Estética", value: "Quer resultado natural — 'ninguém precisa saber que fiz'" },
          { label: "Pesquisa", value: "Pesquisa no Instagram e Google antes de agendar" },
          { label: "Decisão", value: "Confia em indicação de amiga + prova social (antes/depois)" },
          { label: "Preço", value: "Não busca o mais barato, busca confiança e resultado" },
          { label: "Fidelidade", value: "Quando encontra profissional de confiança, não troca" },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", padding: "6px 0", borderBottom: "1px solid #f0ece6" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: GOLD, minWidth: 100 }}>{f.label}</span>
            <span style={{ fontSize: 12, color: "#555" }}>{f.value}</span>
          </div>
        ))}
      </Card>
    </div>
    <Card title="Persona — 'Mariana'">
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "white", flexShrink: 0 }}>M</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: DARK }}>Mariana, 38 anos</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Diretora de Marketing numa multinacional. Mora no Itaim com marido e 2 filhos.</div>
          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8, marginTop: 8 }}>
            Agenda lotada de reuniões. Cuida da aparência mas não tem tempo de pesquisar muito. Já fez Botox numa clínica que não gostou — achou o resultado artificial. Quer alguém que entenda que ela precisa parecer descansada, não diferente. Encontrou o Levvai pelo Instagram, viu um antes/depois natural e mandou DM. Marcou avaliação pra terça-feira às 12h (horário de almoço). Se gostar, vai indicar pras amigas do trabalho.
          </div>
        </div>
      </div>
    </Card>
    <Card title="O que a Mariana NÃO quer">
      {["Parecer que 'fez procedimento' — resultado artificial é o maior medo", "Ser atendida com pressa ou sem explicação", "Clínica que parece 'fábrica de Botox' — volume alto, pouca atenção", "Fotos dela no Instagram sem autorização", "Ser pressionada a fazer mais do que precisa", "Ambiente barulhento ou sem privacidade"].map((r, i) => (
        <div key={i} style={{ fontSize: 12, color: "#B71C1C", padding: "4px 0", display: "flex", gap: 6 }}><span>✕</span> {r}</div>
      ))}
    </Card>
    <Card title="O que a Mariana VALORIZA">
      {["Resultado natural — 'você está diferente, tá linda, mas não sei o que mudou'", "Profissional que explica o que vai fazer e por quê", "Ambiente premium, discreto, reservado", "Pontualidade — respeitar o tempo dela", "Facilidade — WhatsApp pra agendar, sem burocracia", "Confiança — quer se sentir segura com quem cuida do rosto dela", "Continuidade — plano de tratamento com visão de longo prazo"].map((r, i) => (
        <div key={i} style={{ fontSize: 12, color: "#2E7D32", padding: "4px 0", display: "flex", gap: 6 }}><span>✓</span> {r}</div>
      ))}
    </Card>
    <Card title="Como Usar o ICP">
      {["Gi: toda peça de conteúdo deve ser pensada pra Mariana. 'Ela pararia de scrollar pra ver isso?'", "Sirlândia: atendimento rápido, sem enrolação, respeitar o tempo. Mariana não quer ficar esperando.", "Lara: explicar cada etapa. Mariana quer entender. Não quer surpresas.", "CEO: precificação premium é justificada — Mariana não busca preço, busca confiança.", "Tráfego pago: segmentar mulheres 30-50, Vila Olímpia/Itaim/Moema, interesses em skincare e bem-estar.", "Levvai Day: formato que funciona pra Mariana = horário no sábado de manhã, experiência exclusiva."].map((r, i) => (
        <div key={i} style={{ fontSize: 12, color: "#555", padding: "5px 0", display: "flex", gap: 6, borderBottom: "1px solid #f5f0e8" }}>
          <span style={{ color: GOLD, fontWeight: 800, minWidth: 22 }}>{(i+1).toString().padStart(2,"0")}</span> {r}
        </div>
      ))}
    </Card>
  </div>
);

// FORNECEDORES TAB
const FornecedoresTab = () => {
  // Estado — Fornecedores
  const [fornecedores, setFornecedores] = useState([]);
  const [loadingFornecedores, setLoadingFornecedores] = useState(true);

  useEffect(() => {
    const fetchFornecedores = async () => {
      setLoadingFornecedores(true);
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (!error && data) setFornecedores(data);
      setLoadingFornecedores(false);
    };

    fetchFornecedores();
  }, []);

  const salvarFornecedor = async (fornecedor) => {
    if (fornecedor.id) {
      const { error } = await supabase
        .from('fornecedores')
        .update(fornecedor)
        .eq('id', fornecedor.id);
      if (!error) setFornecedores(prev => prev.map(f => f.id === fornecedor.id ? fornecedor : f));
    } else {
      const { data, error } = await supabase
        .from('fornecedores')
        .insert([fornecedor])
        .select()
        .single();
      if (!error && data) setFornecedores(prev => [...prev, data]);
    }
  };

  const arquivarFornecedor = async (fornecedorId) => {
    const { error } = await supabase
      .from('fornecedores')
      .update({ ativo: false })
      .eq('id', fornecedorId);
    if (!error) setFornecedores(prev => prev.filter(f => f.id !== fornecedorId));
  };

  const suppliers = fornecedores;
  const [showNew, setShowNew] = useState(false);
  const [newSup, setNewSup] = useState({ nome: "", produtos: "", contato: "", tel: "", email: "", prazo: "", pagamento: "", obs: "" });

  const addSup = async () => {
    if (!newSup.nome) return;
    await salvarFornecedor({ ...newSup, ativo: true });
    setNewSup({ nome: "", produtos: "", contato: "", tel: "", email: "", prazo: "", pagamento: "", obs: "" });
    setShowNew(false);
  };

  return (
    <div>
      <Card title="Gestão de Fornecedores" accent>
        <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Cadastro de todos os fornecedores. Sylmara mantém atualizado. CEO negocia condições na revisão trimestral.</p>
      </Card>
      {suppliers.map((s, i) => (
        <div key={i} style={{ background: "white", border: "1px solid #E8E4DE", borderRadius: 10, padding: "14px 16px", marginBottom: 8, borderLeft: `4px solid ${s.tel === "—" ? "#FFCDD2" : GOLD}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: DARK }}>{s.nome}</span>
            {s.tel === "—" && <Badge text="INCOMPLETO" color="#FFCDD2" textColor="#B71C1C" />}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, fontSize: 12 }}>
            {[["Produtos", s.produtos], ["Contato", s.contato], ["Telefone", s.tel], ["E-mail", s.email], ["Prazo entrega", s.prazo], ["Pagamento", s.pagamento]].map(([l, v], j) => (
              <div key={j}><span style={{ fontSize: 9, fontWeight: 700, color: GOLD }}>{l}</span><div style={{ color: "#555" }}>{v}</div></div>
            ))}
          </div>
          {s.obs && <div style={{ fontSize: 11, color: "#888", marginTop: 6, fontStyle: "italic" }}>{s.obs}</div>}
        </div>
      ))}
      {!showNew ? (
        <button onClick={() => setShowNew(true)} style={{ width: "100%", padding: "10px", background: "white", border: `2px dashed ${GOLD}`, borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: GOLD, fontFamily: "inherit" }}>+ Cadastrar fornecedor</button>
      ) : (
        <Card title="Novo Fornecedor">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[["NOME", "nome", "Allergan, Galderma..."], ["PRODUTOS", "produtos", "Botox, Radiesse..."], ["CONTATO", "contato", "Nome do representante"], ["TELEFONE", "tel", "(11) 99999"], ["E-MAIL", "email", "rep@email.com"], ["PRAZO ENTREGA", "prazo", "7-15 dias"], ["PAGAMENTO", "pagamento", "Boleto 30d, PIX"], ["OBS", "obs", "Notas"]].map(([l, f, p], i) => (
              <div key={i}><div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>{l}</div>
                <input value={newSup[f]} onChange={e => setNewSup({...newSup, [f]: e.target.value})} placeholder={p} style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" }} /></div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={addSup} style={{ padding: "8px 20px", background: GOLD, color: "white", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cadastrar</button>
            <button onClick={() => setShowNew(false)} style={{ padding: "8px 14px", background: "white", color: "#888", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
          </div>
        </Card>
      )}
    </div>
  );
};

// CONTRATOS TAB
const ContratosTab = () => {
  // Estado — Contratos
  const [contratos, setContratos] = useState([]);
  const [loadingContratos, setLoadingContratos] = useState(true);

  useEffect(() => {
    const fetchContratos = async () => {
      setLoadingContratos(true);
      const { data, error } = await supabase
        .from('contratos')
        .select('*')
        .order('vencimento', { ascending: true });

      if (!error && data) setContratos(data);
      setLoadingContratos(false);
    };

    fetchContratos();
  }, []);

  const salvarContrato = async (contrato) => {
    if (contrato.id) {
      const { error } = await supabase
        .from('contratos')
        .update(contrato)
        .eq('id', contrato.id);
      if (!error) setContratos(prev => prev.map(c => c.id === contrato.id ? contrato : c));
    } else {
      const { data, error } = await supabase
        .from('contratos')
        .insert([contrato])
        .select()
        .single();
      if (!error && data) setContratos(prev => [...prev, data]);
    }
  };

  const excluirContrato = async (contratoId) => {
    const { error } = await supabase
      .from('contratos')
      .update({ status: 'encerrado' })
      .eq('id', contratoId);
    if (!error) setContratos(prev =>
      prev.map(c => c.id === contratoId ? { ...c, status: 'encerrado' } : c)
    );
  };

  const contratosAlerta = contratos.filter(c => {
    if (!c.vencimento || c.status !== 'ativo') return false;
    const diasRestantes = Math.ceil(
      (new Date(c.vencimento) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return diasRestantes <= (c.alerta_dias || 30) && diasRestantes >= 0;
  });

  const contracts = contratos;

  const statusColors = { "ATIVO": { bg: "#E8F5E9", tc: "#2E7D32" }, "PENDENTE": { bg: "#FFF9C4", tc: "#F57F17" }, "VAGA ABERTA": { bg: "#E3F2FD", tc: "#1565C0" }, "VERIFICAR": { bg: "#FFCDD2", tc: "#B71C1C" }, "VENCIDO": { bg: "#FFCDD2", tc: "#B71C1C" }, "ENCERRADO": { bg: "#ECEFF1", tc: "#546E7A" } };

  return (
    <div>
      <Card title="Repositório de Contratos e Vencimentos" accent>
        <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Todos os contratos da clínica. Sylmara monitora vencimentos. CEO revisa na revisão trimestral. Luciano Gebara consulta sob demanda.</p>
      </Card>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <Metric label="Contratos Ativos" value={contracts.filter(c => c.status === "ATIVO").length} color="#2E7D32" />
        <Metric label="Pendentes" value={contracts.filter(c => c.status === "PENDENTE").length} color="#F57F17" />
        <Metric label="Verificar" value={contracts.filter(c => c.status === "VERIFICAR").length} color="#B71C1C" sub="ação necessária" />
        <Metric label="Vagas Abertas" value={contracts.filter(c => c.status === "VAGA ABERTA").length} color="#1565C0" />
      </div>
      {contracts.map((c, i) => {
        const st = statusColors[c.status] || statusColors["PENDENTE"];
        return (
          <div key={i} style={{ background: c.alerta ? "#FFF5F5" : "white", border: "1px solid #E8E4DE", borderRadius: 10, padding: "14px 16px", marginBottom: 6, borderLeft: `4px solid ${st.tc}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: DARK }}>{c.tipo}</span>
                <Badge text={c.status} color={st.bg} textColor={st.tc} />
                {c.alerta && <Badge text="⚠ AÇÃO" color="#FFCDD2" textColor="#B71C1C" />}
              </div>
              <Badge text={c.resp} color={LIGHT} textColor={GOLD} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, fontSize: 12 }}>
              {[["Parte", c.parte], ["Início", c.inicio], ["Vencimento", c.vencimento], ["Valor", c.valor]].map(([l, v], j) => (
                <div key={j}><span style={{ fontSize: 9, fontWeight: 700, color: GOLD }}>{l}</span><div style={{ color: "#555" }}>{v}</div></div>
              ))}
            </div>
            {c.obs && <div style={{ fontSize: 11, color: "#888", marginTop: 6, fontStyle: "italic" }}>{c.obs}</div>}
          </div>
        );
      })}
    </div>
  );
};

// 1:1 TRACKER TAB
const OneOneTab = () => {
  // Estado — Sessões 1:1
  const [sessoesOneOne, setSessoesOneOne] = useState([]);
  const [loadingOneOne, setLoadingOneOne] = useState(true);

  useEffect(() => {
    const fetchOneOne = async () => {
      setLoadingOneOne(true);
      const { data, error } = await supabase
        .from('sessoes_oneone')
        .select('*')
        .order('data', { ascending: false });

      if (!error && data) setSessoesOneOne(data);
      setLoadingOneOne(false);
    };

    fetchOneOne();
  }, []);

  const salvarSessaoOneOne = async (sessao) => {
    if (sessao.id) {
      const { error } = await supabase
        .from('sessoes_oneone')
        .update(sessao)
        .eq('id', sessao.id);
      if (!error) setSessoesOneOne(prev => prev.map(s => s.id === sessao.id ? sessao : s));
    } else {
      const { data, error } = await supabase
        .from('sessoes_oneone')
        .insert([sessao])
        .select()
        .single();
      if (!error && data) setSessoesOneOne(prev => [data, ...prev]);
    }
  };

  const excluirSessaoOneOne = async (sessaoId) => {
    const { error } = await supabase
      .from('sessoes_oneone')
      .delete()
      .eq('id', sessaoId);
    if (!error) setSessoesOneOne(prev => prev.filter(s => s.id !== sessaoId));
  };

  // Sessões por participante
  const sessoesPorParticipante = (nome) =>
    sessoesOneOne.filter(s => s.participantes?.includes(nome));

  const sessions = sessoesOneOne; // compat alias

  const [profissOnOne, setProfissOnOne] = useState([]);
  useEffect(() => {
    supabase.from('profissionais').select('*').eq('ativo', true).order('nome').then(({ data }) => { if (data) setProfissOnOne(data); });
  }, []);

  const [showNew, setShowNew] = useState(false);
  const [newSession, setNewSession] = useState({ participants: "Lara × Gi", topics: "", actions: "" });

  const addSession = async () => {
    if (!newSession.topics) return;
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2,"0")}/${(now.getMonth()+1).toString().padStart(2,"0")}`;
    const topicsList = newSession.topics.split("\n").filter(t => t.trim());
    const actionsList = newSession.actions.split("\n").filter(a => a.trim()).map(a => ({ task: a, done: false }));
    await salvarSessaoOneOne({ date: dateStr, participants: newSession.participants, topics: topicsList, actions: actionsList, mood: "positivo" });
    setNewSession({ participants: "Lara × Gi", topics: "", actions: "" });
    setShowNew(false);
  };

  const toggleAction = (sIdx, aIdx) => {
    // toggle local apenas — atualização no DB via salvarSessaoOneOne futuramente
    setSessoesOneOne(prev => prev.map((s, si) => si === sIdx ? {
      ...s, actions: (s.actions || []).map((a, ai) => ai === aIdx ? { ...a, done: !a.done } : a)
    } : s));
  };

  return (
    <div>
      <Card title="Tracker de 1:1s" accent>
        <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Registro de conversas 1:1. Toda sexta Lara × Gi. Futuramente CEO × associados (mensal).</p>
      </Card>
      <Card title="Registrar 1:1">
        {!showNew ? (
          <button onClick={() => setShowNew(true)} style={{ width: "100%", padding: "10px", background: "white", border: `2px dashed ${GOLD}`, borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: GOLD, fontFamily: "inherit" }}>+ Registrar nova sessão 1:1</button>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <div style={{ flex: "0 0 160px" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>PARTICIPANTES</div>
                <select value={newSession.participants} onChange={e => setNewSession({...newSession, participants: e.target.value})} style={{ width: "100%", padding: "7px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white", boxSizing: "border-box" }}>
                  {profissOnOne.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
                </select></div>
            </div>
            <div style={{ marginBottom: 8 }}><div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>TÓPICOS (um por linha)</div>
              <textarea value={newSession.topics} onChange={e => setNewSession({...newSession, topics: e.target.value})} rows={3} placeholder="Tema 1&#10;Tema 2&#10;Tema 3" style={{ width: "100%", padding: "7px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} /></div>
            <div style={{ marginBottom: 8 }}><div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 2 }}>AÇÕES (uma por linha)</div>
              <textarea value={newSession.actions} onChange={e => setNewSession({...newSession, actions: e.target.value})} rows={2} placeholder="Ação 1&#10;Ação 2" style={{ width: "100%", padding: "7px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} /></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addSession} style={{ padding: "8px 20px", background: GOLD, color: "white", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Salvar</button>
              <button onClick={() => setShowNew(false)} style={{ padding: "8px 14px", background: "white", color: "#888", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            </div>
          </div>
        )}
      </Card>
      {sessions.map((s, si) => (
        <Card key={si} title={`${s.participants} — ${s.date}`}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 4 }}>TÓPICOS DISCUTIDOS</div>
          {s.topics.map((t, ti) => <div key={ti} style={{ fontSize: 12, color: "#555", padding: "3px 0 3px 12px" }}>› {t}</div>)}
          {s.actions.length > 0 && <>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginTop: 10, marginBottom: 4 }}>AÇÕES</div>
            {s.actions.map((a, ai) => (
              <div key={ai} onClick={() => toggleAction(si, ai)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", cursor: "pointer" }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${a.done ? "#2E7D32" : "#ddd"}`, background: a.done ? "#E8F5E9" : "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#2E7D32" }}>{a.done ? "✓" : ""}</div>
                <span style={{ fontSize: 12, color: a.done ? "#999" : "#555", textDecoration: a.done ? "line-through" : "none" }}>{a.task}</span>
              </div>
            ))}
          </>}
        </Card>
      ))}
    </div>
  );
};

// AVALIAÇÃO DE DESEMPENHO TAB
const AvaliacaoTab = () => {
  const team = [
    { name: "Lara", role: "Dir. Clínica", kpis: [
      { kpi: "Ticket médio ≥ R$2.000", target: "R$2.000", current: "—", score: null },
      { kpi: "NPS ≥ 85", target: "85", current: "—", score: null },
      { kpi: "Taxa de retorno ≥ 30%", target: "30%", current: "—", score: null },
      { kpi: "Conteúdos ≥ 3/semana", target: "3/sem", current: "—", score: null },
    ]},
    { name: "Sirlândia", role: "Ger. Operacional", kpis: [
      { kpi: "Conversão leads ≥ 60%", target: "60%", current: "—", score: null },
      { kpi: "Ocupação agenda ≥ 60%", target: "60%", current: "—", score: null },
      { kpi: "No-show < 10%", target: "<10%", current: "—", score: null },
      { kpi: "Reviews Google ≥ 5/mês", target: "5/mês", current: "—", score: null },
      { kpi: "Resposta lead < 30min", target: "<30min", current: "—", score: null },
    ]},
    { name: "Sylmara", role: "Administradora", kpis: [
      { kpi: "DRE fechado até dia 5", target: "100%", current: "—", score: null },
      { kpi: "Margem bruta 65-70%", target: "65-70%", current: "—", score: null },
      { kpi: "Inadimplência < 3%", target: "<3%", current: "—", score: null },
      { kpi: "Dashboard weekly toda segunda", target: "100%", current: "—", score: null },
    ]},
    { name: "Gi", role: "Social Media", kpis: [
      { kpi: "Posts ≥ 5/semana", target: "5/sem", current: "—", score: null },
      { kpi: "Seguidores (meta Q2: 1.000)", target: "1.000", current: "286", score: null },
      { kpi: "Engajamento ≥ 5%", target: "5%", current: "—", score: null },
      { kpi: "Depoimentos ≥ 4/mês", target: "4/mês", current: "—", score: null },
    ]},
  ];

  const [profissAvaliacao, setProfissAvaliacao] = useState([]);
  useEffect(() => {
    supabase.from('profissionais').select('*').eq('ativo', true).order('nome').then(({ data }) => { if (data) setProfissAvaliacao(data); });
  }, []);
  const teamDinamico = profissAvaliacao.length > 0
    ? profissAvaliacao.map(p => team.find(t => t.name === p.nome) || { name: p.nome, role: p.specialty || '', kpis: [] })
    : team;

  // Estado — Avaliações de Equipe
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(true);

  useEffect(() => {
    const fetchAvaliacoes = async () => {
      setLoadingAvaliacoes(true);
      const { data, error } = await supabase
        .from('avaliacoes_equipe')
        .select('*')
        .order('criado_em', { ascending: false });

      if (!error && data) setAvaliacoes(data);
      setLoadingAvaliacoes(false);
    };

    fetchAvaliacoes();
  }, []);

  const salvarAvaliacao = async (avaliacao) => {
    if (avaliacao.id) {
      const { error } = await supabase
        .from('avaliacoes_equipe')
        .update(avaliacao)
        .eq('id', avaliacao.id);
      if (!error) setAvaliacoes(prev => prev.map(a => a.id === avaliacao.id ? avaliacao : a));
    } else {
      const { data, error } = await supabase
        .from('avaliacoes_equipe')
        .insert([avaliacao])
        .select()
        .single();
      if (!error && data) setAvaliacoes(prev => [data, ...prev]);
    }
  };

  // Última avaliação por colaborador
  const ultimaAvaliacao = (colaborador) =>
    avaliacoes.find(a => a.colaborador === colaborador);

  // Média geral do time no período
  const mediaTime = (periodo) => {
    const doPeriodo = avaliacoes.filter(a => a.periodo === periodo && a.nota_geral);
    if (doPeriodo.length === 0) return 0;
    return (doPeriodo.reduce((acc, a) => acc + Number(a.nota_geral), 0) / doPeriodo.length).toFixed(1);
  };

  return (
    <div>
      <Card title="Avaliação de Desempenho — Trimestral" accent>
        <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>CEO avalia na última semana do trimestre, junto com review de OKRs. Baseada nos KPIs do descritivo de cargos v3.</p>
      </Card>
      {teamDinamico.map((p, pi) => (
        <Card key={pi} title={`${p.name} — ${p.role}`}>
          <div style={{ display: "flex", background: DARK, borderRadius: "8px 8px 0 0", padding: "8px 0" }}>
            {["KPI", "META", "ATUAL", "SCORE", "STATUS"].map((h, i) => (
              <div key={i} style={{ flex: i === 0 ? 2 : 1, textAlign: "center", fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.05em" }}>{h}</div>
            ))}
          </div>
          {p.kpis.map((k, ki) => (
            <div key={ki} style={{ display: "flex", padding: "8px 0", borderBottom: "1px solid #f0ece6", alignItems: "center" }}>
              <div style={{ flex: 2, fontSize: 12, paddingLeft: 8 }}>{k.kpi}</div>
              <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: GOLD, fontWeight: 600 }}>{k.target}</div>
              <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#888" }}>{k.current}</div>
              <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#bbb" }}>— /5</div>
              <div style={{ flex: 1, textAlign: "center" }}><Badge text="AGUARDANDO" color={LIGHT} textColor="#888" /></div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 8px", background: LIGHT, borderRadius: "0 0 8px 8px" }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Score geral: — /5.0</span>
            <span style={{ fontSize: 11, color: "#999" }}>Próxima avaliação: fim Q2 (Jun/2026)</span>
          </div>
        </Card>
      ))}
      <Card title="Escala de Score">
        {[
          { score: "5.0", label: "EXCEPCIONAL", desc: "Superou todas as metas. Referência pro time.", color: "#2E7D32" },
          { score: "4.0", label: "ACIMA", desc: "Atingiu e superou a maioria das metas.", color: "#4CAF50" },
          { score: "3.0", label: "DENTRO", desc: "Atingiu as metas conforme esperado.", color: GOLD },
          { score: "2.0", label: "ABAIXO", desc: "Não atingiu parte das metas. Plano de ação necessário.", color: "#FF9800" },
          { score: "1.0", label: "CRÍTICO", desc: "Não atingiu a maioria. Conversa imediata com CEO.", color: "#B71C1C" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #f0ece6" }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: s.color, minWidth: 30 }}>{s.score}</span>
            <Badge text={s.label} color={`${s.color}20`} textColor={s.color} />
            <span style={{ fontSize: 12, color: "#666" }}>{s.desc}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

// CULTURA & GOVERNANÇA TAB
const CulturaTab = () => (
  <div>
    <Card title="Cultura & Governança — Instituto Levvai" accent>
      <p style={{ fontSize: 18, fontWeight: 300, lineHeight: 1.8, margin: 0, color: "#ccc" }}>
        Cultura não é o que está escrito na parede. É o que acontece quando o CEO não está olhando.
        <span style={{ color: GOLD, fontWeight: 600 }}> No Levvai, governança é ritual — não presença.</span>
      </p>
    </Card>

    <Card title="Propósito">
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: DARK, fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1.6 }}>
          Elevar a autoestima de cada paciente com ciência, precisão e acolhimento —
          <br />entregando resultados naturais que falam por si.
        </div>
        <div style={{ fontSize: 12, color: "#999", marginTop: 12 }}>
          Tudo que fazemos — do conteúdo à consulta, do atendimento ao pós — serve a esse propósito.
        </div>
      </div>
    </Card>

    <Card title="Valores — O que nos guia">
      {[
        { valor: "RESULTADO NATURAL", desc: "A melhor estética é aquela que ninguém percebe. Nunca comprometemos a naturalidade por vaidade ou pressão.", icon: "◆", color: "#E8EAF6" },
        { valor: "CIÊNCIA PRIMEIRO", desc: "Toda decisão clínica é baseada em evidência. Não seguimos modas — seguimos dados e protocolos validados.", icon: "◈", color: "#E0F2F1" },
        { valor: "CONFIANÇA ACIMA DE TUDO", desc: "A paciente confia no Levvai porque somos transparentes, éticos e honestos. Essa confiança é inegociável.", icon: "●", color: "#FFF3E0" },
        { valor: "EXPERIÊNCIA PREMIUM", desc: "Do primeiro WhatsApp ao pós-atendimento, cada ponto de contato é pensado pra fazer a paciente se sentir cuidada.", icon: "◎", color: "#F3E5F5" },
        { valor: "DISCIPLINA OPERACIONAL", desc: "Rituais, processos e métricas existem pra que a qualidade não dependa de humor, memória ou sorte.", icon: "◒", color: "#E8F5E9" },
        { valor: "CRESCIMENTO SUSTENTÁVEL", desc: "Crescemos com margem saudável, equipe valorizada e reputação intacta. Não trocamos qualidade por volume.", icon: "◐", color: "#FFF9C4" },
      ].map((v, i) => (
        <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < 5 ? "1px solid #f0ece6" : "none" }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: v.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{v.icon}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: DARK, letterSpacing: "0.03em" }}>{v.valor}</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 2, lineHeight: 1.6 }}>{v.desc}</div>
          </div>
        </div>
      ))}
    </Card>

    <Card title="Estrutura de Governança">
      <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
        <div style={{ display: "inline-block", background: "#ECEFF1", borderRadius: 8, padding: "8px 20px", marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#78909C" }}>BOARD CONSULTIVO</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: DARK }}>Rich</div>
          <div style={{ fontSize: 10, color: "#999" }}>1º sábado/mês · Voto consultivo · Questiona e valida</div>
        </div>
        <div style={{ color: "#ccc", fontSize: 16, margin: "4px 0" }}>↓</div>
        <div style={{ display: "inline-block", background: GOLD, borderRadius: 8, padding: "10px 24px", marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>IKE — CEO</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>~6-8h/semana · Governa por ritual · Levvai Weekly terça 9h</div>
        </div>
        <div style={{ color: "#ccc", fontSize: 16, margin: "4px 0" }}>↓</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          {[
            { name: "LARA", role: "Dir. Clínica\n& Face da Marca", color: "#E91E63" },
            { name: "SIRLÂNDIA", role: "Ger. Operacional", color: "#039BE5" },
            { name: "SYLMARA", role: "Administradora", color: "#7B1FA2" },
            { name: "GI", role: "Social Media", color: "#43A047" },
          ].map((p, i) => (
            <div key={i} style={{ background: p.color, borderRadius: 8, padding: "8px 16px", minWidth: 90, textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "white" }}>{p.name}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", whiteSpace: "pre-line" }}>{p.role}</div>
            </div>
          ))}
        </div>
        <div style={{ color: "#ccc", fontSize: 16, margin: "8px 0" }}>↓</div>
        <div style={{ display: "inline-block", background: LIGHT, borderRadius: 8, padding: "8px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD }}>ASSOCIADOS (futuro)</div>
          <div style={{ fontSize: 10, color: "#888" }}>Nutrólogo + Dermatologista</div>
        </div>
      </div>
    </Card>

    <Card title="Cadeia de Decisão — Quem decide o quê">
      {[
        { decisao: "Procedimento clínico (o que fazer no paciente)", quem: "LARA — autonomia total", escala: "Sem escalação. Lara é soberana no clínico.", color: "#FCE4EC" },
        { decisao: "Preço de procedimento / tabela de preços", quem: "CEO — propõe na weekly", escala: "Lara valida se faz sentido clínico.", color: "#FFF3E0" },
        { decisao: "Contratação de associado", quem: "CEO + LARA — unanimidade", escala: "CEO filtra fit cultural. Lara filtra competência técnica.", color: "#E3F2FD" },
        { decisao: "Compra de estoque / insumo", quem: "SYLMARA executa", escala: "CEO aprova compra >R$5K. Lara aprova produto novo.", color: "#E1BEE7" },
        { decisao: "Conteúdo Instagram (o que postar)", quem: "GI propõe, LARA valida sexta", escala: "CEO valida tom/posicionamento na weekly.", color: "#C8E6C9" },
        { decisao: "Agenda (horários, salas)", quem: "SIRLÂNDIA gerencia", escala: "Conflito de sala → CEO arbitra.", color: "#B3E5FC" },
        { decisao: "Despesa não prevista", quem: "SYLMARA registra", escala: "<R$500: Sylmara decide. >R$500: CEO aprova. >R$2K: board.", color: "#FFF9C4" },
        { decisao: "Desconto acima de 10%", quem: "CEO aprova na weekly", escala: "Nunca decidido na hora com paciente.", color: "#FFEBEE" },
        { decisao: "Mudança regulatória / compliance", quem: "CEO + Luciano Gebara", escala: "Lara implementa técnico. Sylmara implementa admin.", color: "#ECEFF1" },
        { decisao: "Estratégia, metas, OKRs", quem: "CEO propõe", escala: "Board (Rich) questiona. Equipe executa.", color: "#F5F0E8" },
      ].map((d, i) => (
        <div key={i} style={{ background: d.color, borderRadius: 8, padding: "12px 14px", marginBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: DARK, marginBottom: 4 }}>{d.decisao}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Badge text={d.quem} color="rgba(0,0,0,0.06)" textColor="#333" />
            <span style={{ fontSize: 11, color: "#666" }}>{d.escala}</span>
          </div>
        </div>
      ))}
    </Card>

    <Card title="Rituais de Governança — Quando o sistema roda">
      {[
        { ritual: "Levvai Weekly", freq: "Toda terça 9h", dur: "60-90min", quem: "CEO + todos", purpose: "O coração da governança. Números, pipeline, conteúdo, ações, alertas." },
        { ritual: "1:1 Lara × Gi", freq: "Toda sexta 16h", dur: "20min", quem: "Lara + Gi", purpose: "Validar calendário editorial da semana seguinte." },
        { ritual: "Board Mensal", freq: "1º sábado", dur: "60min", quem: "CEO + Rich", purpose: "DRE, KPIs, decisões estratégicas. Rich questiona e valida." },
        { ritual: "Review OKRs", freq: "Fim do trimestre", dur: "2h", quem: "Todos + Rich", purpose: "Scoring, lições aprendidas, próximo ciclo." },
        { ritual: "Levvai Day", freq: "3º sábado", dur: "4-6h", quem: "Lara + Sirlândia + Gi", purpose: "Mini-evento. CEO define tema na weekly anterior." },
        { ritual: "Revisão Anual", freq: "Janeiro", dur: "3-4h", quem: "CEO + Rich + Lara", purpose: "Off-site. Plano anual, SWOT, OKRs Q1, revisão jurídica." },
      ].map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #f0ece6", alignItems: "center" }}>
          <div style={{ minWidth: 120 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{r.ritual}</div>
            <div style={{ fontSize: 10, color: "#999" }}>{r.freq} · {r.dur}</div>
          </div>
          <Badge text={r.quem} color={LIGHT} textColor={GOLD} />
          <div style={{ flex: 1, fontSize: 12, color: "#666" }}>{r.purpose}</div>
        </div>
      ))}
    </Card>

    <Card title="Código de Conduta — 10 Regras do Instituto Levvai">
      {[
        "PACIENTE PRIMEIRO — toda decisão começa com 'isso é melhor pra paciente?'. Se não for, não fazemos.",
        "RESULTADO NATURAL — nunca ceder à pressão por resultado exagerado. Dizer não é proteger a marca.",
        "PONTUALIDADE — respeitar o tempo da paciente é respeitar a confiança dela. Atraso máximo: 10 minutos.",
        "SIGILO ABSOLUTO — o que acontece na clínica fica na clínica. Dados, procedimentos, antes/depois — tudo é confidencial.",
        "COMUNICAÇÃO RÁPIDA — lead novo = 30 minutos. Paciente com dúvida = mesmo dia. Sem exceção.",
        "REGISTRO É LEI — procedimento sem TCLE não acontece. Foto sem termo de imagem não posta. Atendimento sem registro no CRM não existiu.",
        "CONFLITO SOBE — problema entre áreas não se resolve no corredor. Sobe pro CEO na weekly. Sem fofoca.",
        "FEEDBACK É PRESENTE — receber crítica é oportunidade. NPS ≤ 6 = Lara liga pessoalmente. Sempre.",
        "MELHORIA CONTÍNUA — toda semana a gente melhora alguma coisa. Uma métrica, um processo, um detalhe.",
        "CELEBRE AS CONQUISTAS — meta batida, paciente fidelizada, review 5 estrelas — comemorar é parte do ritual.",
      ].map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #f0ece6" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: DARK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: GOLD, flexShrink: 0 }}>{(i+1).toString().padStart(2,"0")}</div>
          <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6, paddingTop: 4 }}>
            <span style={{ fontWeight: 800, color: DARK }}>{r.split("—")[0]}—</span>
            {r.split("—").slice(1).join("—")}
          </div>
        </div>
      ))}
    </Card>

    <Card title="Regra de Ouro">
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: GOLD, fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1.5 }}>
          "CEO governa por ritual, não por presença.<br />
          A clínica funciona porque o sistema funciona —<br />
          não porque alguém está vigiando."
        </div>
        <div style={{ fontSize: 12, color: "#999", marginTop: 12 }}>
          Se a weekly acontece, o dashboard chega, o estoque é checado e o NPS é medido —<br />
          a clínica roda. Mesmo que o CEO esteja em outro continente.
        </div>
      </div>
    </Card>
  </div>
);

const tabContent = {
  home: HomeTab,
  plan: PlanTab,
  team: TeamTab,
  finance: FinanceTab,
  cashflow: CashflowTab,
  executive: ExecutiveTab,
  competitors: CompetitorsTab,
  associates: AssociatesTab,
  compliance: ComplianceTab,
  termos: TermosTab,
  brand: BrandTab,
  rituals: RitualsTab,
  atas: AtasTab,
  budget: BudgetTab,
  stock: StockTab,
  agenda: AgendaTab,
  crm: CRMTab,
  comunicacao: ComunicacaoTab,
  journey: JourneyTab,
  editorial: EditorialTab,
  nps: NpsTab,
  marketing: MarketingTab,
  icp: IcpTab,
  fornecedores: FornecedoresTab,
  contratos: ContratosTab,
  oneone: OneOneTab,
  avaliacao: AvaliacaoTab,
  cultura: CulturaTab,
  docs: DocsTab,
  usuarios: UsuariosTab,
};

// USER DATABASE
const userProfiles = {
  'ikeguimaraes@gmail.com':          { name: 'Ike',        role: 'CEO — Admin Master',    color: '#C8A96E' },
  'grupomeeteat@gmail.com':                { name: 'Rich',       role: 'Consultor',          color: '#E91E63' },
};

// Maps new sidebar tab IDs → { sector, label } for the breadcrumb
const TAB_TO_SECTOR = {
  'visao-geral':       { sector: 'Estratégia',          label: 'Visão Geral' },
  'planejamento':      { sector: 'Estratégia',          label: 'Planejamento' },
  'dashboard-ceo':     { sector: 'Estratégia',          label: 'Dashboard CEO' },
  'cultura':           { sector: 'Cultura & Governança', label: 'Cultura' },
  'atas-acoes':        { sector: 'Cultura & Governança', label: 'Atas & Ações' },
  'dre-catalogo':      { sector: 'Financeiro',          label: 'DRE & Catálogo' },
  'fluxo-caixa':       { sector: 'Financeiro',          label: 'Fluxo de Caixa' },
  'orcamento':         { sector: 'Financeiro',          label: 'Orçamento' },
  'crm-leads':         { sector: 'Comercial',           label: 'CRM & Leads' },
  'comunicacao':       { sector: 'Comercial',           label: 'Comunicação' },
  'jornada-paciente':  { sector: 'Comercial',           label: 'Jornada Paciente' },
  'nps-satisfacao':    { sector: 'Comercial',           label: 'NPS & Satisfação' },
  'marca':             { sector: 'Marketing',           label: 'Marca' },
  'icp':               { sector: 'Marketing',           label: 'ICP' },
  'editorial':         { sector: 'Marketing',           label: 'Editorial' },
  'dashboard-mkt':     { sector: 'Marketing',           label: 'Dashboard Mkt' },
  'concorrentes':      { sector: 'Marketing',           label: 'Concorrentes' },
  'equipe':            { sector: 'Pessoas',             label: 'Equipe' },
  'associados':        { sector: 'Pessoas',             label: 'Associados' },
  '1-1s':              { sector: 'Pessoas',             label: '1:1s' },
  'avaliacao':         { sector: 'Pessoas',             label: 'Avaliação' },
  'agenda':            { sector: 'Operação',            label: 'Agenda' },
  'estoque':           { sector: 'Operação',            label: 'Estoque' },
  'rotinas':           { sector: 'Operação',            label: 'Rotinas' },
  'fornecedores':      { sector: 'Operação',            label: 'Fornecedores' },
  'compliance':        { sector: 'Jurídico',            label: 'Compliance' },
  'contratos':         { sector: 'Jurídico',            label: 'Contratos' },
  'biblioteca':        { sector: 'Docs',                label: 'Biblioteca' },
  'templates':         { sector: 'Docs',                label: 'Templates' },
  'usuarios':          { sector: 'Docs',                label: 'Usuários' },
};

// Maps new sidebar IDs → existing tabContent keys (backward compat)
const NEW_TO_OLD_ID = {
  'visao-geral': 'home', 'planejamento': 'plan', 'dashboard-ceo': 'executive',
  'cultura': 'cultura', 'atas-acoes': 'atas',
  'dre-catalogo': 'finance', 'fluxo-caixa': 'cashflow', 'orcamento': 'budget',
  'crm-leads': 'crm', 'comunicacao': 'comunicacao', 'jornada-paciente': 'journey', 'nps-satisfacao': 'nps',
  'marca': 'brand', 'icp': 'icp', 'editorial': 'editorial', 'dashboard-mkt': 'marketing', 'concorrentes': 'competitors',
  'equipe': 'team', 'associados': 'associates', '1-1s': 'oneone', 'avaliacao': 'avaliacao',
  'agenda': 'agenda', 'estoque': 'stock', 'rotinas': 'rituals', 'fornecedores': 'fornecedores',
  'compliance': 'compliance', 'contratos': 'contratos', 'biblioteca': 'docs', 'templates': 'docs',
  'usuarios': 'usuarios',
};

// Reverse map: old ID → new ID (for navigateTo backward compatibility)
const OLD_TO_NEW_ID = Object.fromEntries(Object.entries(NEW_TO_OLD_ID).map(([k, v]) => [v, k]));

export default function LevvaiPortal() {
  const [currentUser, setCurrentUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);
const [loginEmail, setLoginEmail] = useState("");
const [loginPass, setLoginPass] = useState("");
const [loginError, setLoginError] = useState("");
const [loginLoading, setLoginLoading] = useState(false);
const [active, setActive] = useState("visao-geral");

  // ALL hooks must be BEFORE any conditional return
  const [sharedLeads, setSharedLeads] = useState([
    { nome: "Maria S.", tel: "(11) 99999-1111", origem: "Instagram", interesse: "Levvai Lips", status: "novo", data: "14/04", obs: "", agendamento: null },
    { nome: "Ana P.", tel: "(11) 99888-2222", origem: "Google", interesse: "Tirzepatida", status: "contato", data: "12/04", obs: "Enviou WhatsApp, aguardando retorno", agendamento: null },
    { nome: "Julia M.", tel: "(11) 99777-3333", origem: "Indicação", interesse: "Botox Full Face", status: "agendado", data: "10/04", obs: "Consulta 18/04 às 14h", agendamento: { day: 3, room: "maca1", hour: 10, prof: "Lara" } },
    { nome: "Carla R.", tel: "(11) 99666-4444", origem: "Levvai Day", interesse: "Profhilo + Bioflash", status: "atendido", data: "05/04", obs: "Fez Profhilo. Voltar em 30 dias.", agendamento: null },
    { nome: "Fernanda L.", tel: "(11) 99555-5555", origem: "Instagram", interesse: "Harmonização", status: "fidelizado", data: "01/03", obs: "3º procedimento. Indicou 2 amigas.", agendamento: null },
  ]);
  const [sharedSlots, setSharedSlots] = useState({});

  // Support both old IDs ("home", "crm") and new IDs ("visao-geral", "crm-leads")
  const navigateTo = (tabId) => { setActive(OLD_TO_NEW_ID[tabId] || tabId); };
  const shared = { leads: sharedLeads, setLeads: setSharedLeads, slots: sharedSlots, setSlots: setSharedSlots, navigateTo, currentUserEmail: currentUser?.email || '' };
  const oldId = NEW_TO_OLD_ID[active] || active;
  const Content = tabContent[oldId];

  useEffect(() => {
    let mounted = true;
    let revision = 0;
    let timer;
    const applySession = async (session) => {
      const current = ++revision;
      try {
        if (!session?.user || session.user.is_anonymous) {
          if (mounted) setCurrentUser(null);
          return;
        }
        const { data, error } = await supabase.from('levvai_members')
          .select('user_id').eq('user_id', session.user.id).maybeSingle();
        if (!mounted || current !== revision) return;
        if (error || !data) {
          setCurrentUser(null);
          setLoginError(error ? 'Não foi possível verificar o acesso. Tente novamente.' : 'Sua conta não possui acesso ao Levvai.');
          return;
        }
        const profile = userProfiles[session.user.email] || { name: session.user.email, role: 'Usuário', color: '#888' };
        setCurrentUser({ email: session.user.email, ...profile });
      } catch {
        if (mounted && current === revision) {
          setCurrentUser(null);
          setLoginError('Não foi possível verificar o acesso. Tente novamente.');
        }
      } finally {
        if (mounted && current === revision) setAuthLoading(false);
      }
    };
    supabase.auth.getSession().then(({ data: { session } }) => applySession(session)).catch(() => {
      if (mounted) { setAuthLoading(false); setLoginError('Não foi possível recuperar a sessão.'); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Query after the Auth callback returns, outside its internal lock.
      clearTimeout(timer);
      revision++;
      timer = setTimeout(() => applySession(session), 0);
    });
    return () => { mounted = false; clearTimeout(timer); subscription.unsubscribe(); };
  }, []);

  const handleLogin = async () => {
    setLoginError('');
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPass,
    });
    if (error) {
      const message = error.message || '';
      if (error.status === 402 || /restricted|quota/i.test(message)) {
        setLoginError('Serviço temporariamente indisponível por limite de uso. Fale com o administrador.');
      } else if (error.status === 429) {
        setLoginError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      } else if (/invalid login credentials/i.test(message)) {
        setLoginError('E-mail ou senha incorretos.');
      } else {
        setLoginError('Não foi possível entrar agora. Tente novamente em instantes.');
      }
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActive("visao-geral");
  };

  const breadcrumb = TAB_TO_SECTOR[active] || { sector: '—', label: '—' };
  const badges = { 'atas-acoes': 3, 'crm-leads': 5 };

  if (authLoading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#1A1512', color:'#C9A876', fontFamily:'Arial', fontSize:14 }}>
      Carregando...
    </div>
  );

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="login-screen">
        <div className="login-wrap">
          <div className="login-logo">
            <div className="login-eyebrow">Instituto</div>
            <div className="login-name">LEVVAI</div>
            <div className="login-sub">Plataforma de Gestão</div>
          </div>
          <div className="login-card">
            <div className="login-label">Acesso restrito à equipe</div>
            <input
              className="login-input"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
              placeholder="E-mail"
              type="email"
              autoComplete="email"
            />
            <input
              type="password"
              className="login-input"
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
              placeholder="Senha"
              autoComplete="current-password"
            />
            {loginError && <div className="login-error">{loginError}</div>}
            <button className="login-btn" onClick={handleLogin} disabled={loginLoading}>
              {loginLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
          <div className="login-hint">Acesso exclusivo para equipe Instituto Levvai</div>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      activeTab={active}
      onTabChange={setActive}
      user={currentUser}
      onLogout={handleLogout}
      badges={badges}
      sector={breadcrumb.sector}
      tab={breadcrumb.label}
      cycleLabel="Ciclo Q2 · Abr 26"
    >
      {active === 'visao-geral' ? (
        <VisaoGeral />
      ) : Content ? (
        <Content shared={shared} />
      ) : (
        <div style={{ padding: '40px 0', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 13 }}>
          Aba em construção.
        </div>
      )}
    </AppShell>
  );
}
