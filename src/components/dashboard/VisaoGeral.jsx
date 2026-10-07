import React from 'react';

/**
 * VisaoGeral — aba "Visão Geral" do Portal Levvai
 *
 * Props (todas opcionais — tem defaults com os números atuais):
 *  - data: {
 *      faturamento, pacientesMes, ticketMedio, conversao, instagram, nps,
 *      funnel, revenueHistory, q2Progress
 *    }
 */
export default function VisaoGeral({ data = {} }) {
  const d = {
    faturamento: { valor: 'R$20', valor2: '–50K', metaPct: 58, meta: 'R$60K', trend: '+28%', trendDir: 'up' },
    pacientesMes: { valor: 20, meta: 30, trend: '~20', trendDir: 'neutral' },
    ticketMedio: { valor: 'R$1.5', unidade: 'K', meta: 'R$2K', metaPct: 75, trend: '+12%', trendDir: 'up' },
    conversao: { valor: '40%', meta: '2/5 leads', trend: '−8%', trendDir: 'down' },
    instagram: { valor: 286, meta: 1000, trend: '+12', trendDir: 'up' },
    nps: { valor: '—', meta: '85+ · aguardando ciclo' },
    funnel: [
      { label: 'Novos', count: 5, width: 100, cls: 'novos' },
      { label: 'Contato', count: 4, width: 90, cls: 'contato' },
      { label: 'Agendado', count: 3, width: 70, cls: 'agendado' },
      { label: 'Atendido', count: 2, width: 40, cls: 'atendido' },
      { label: 'Retorno', count: 1, width: 20, cls: 'retorno' },
      { label: 'VIP', count: 1, width: 20, cls: 'vip' },
      { label: 'Perdido', count: 1, width: 20, cls: 'perdido' },
    ],
    revenueHistory: [
      { mes: 'Jan', valor: 'R$25K', altura: 41.6, tipo: 'past' },
      { mes: 'Fev', valor: 'R$30K', altura: 50, tipo: 'past' },
      { mes: 'Mar', valor: 'R$35K', altura: 58.3, tipo: 'past' },
      { mes: 'Abr', valor: 'R$40K', altura: 66.6, tipo: 'current' },
      { mes: 'Mai', valor: 'R$50K', altura: 83.3, tipo: 'future' },
      { mes: 'Jun', valor: 'R$60K', altura: 100, tipo: 'future' },
    ],
    q2Progress: [
      { label: 'Seguidores', valor: 286, meta: 1000, pct: 28.6, color: 'warning' },
      { label: 'Posts', valor: 20, meta: 70, pct: 28.5, color: 'info' },
      { label: 'Pacientes', valor: '~20', meta: 30, pct: 66, color: 'success' },
      { label: 'OKRs scoring', valor: 1, meta: 4, pct: 25, color: 'gold' },
    ],
    ...data,
  };

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-header fade-in">
        <div>
          <div className="page-eyebrow">Dashboard · Abril 2026</div>
          <h1 className="page-title">
            Visão <span className="italic">geral</span> do instituto.
          </h1>
          <p className="page-subtitle">
            Atualizado pela equipe na weekly toda terça. Todos os indicadores refletem o último ciclo de apontamento.
          </p>
        </div>
        <div className="page-meta">
          <button className="page-btn ghost">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Exportar
          </button>
          <button className="page-btn primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Novo apontamento
          </button>
        </div>
      </div>

      {/* MISSION CARD */}
      <div className="mission-card fade-in fade-in-1">
        <div>
          <div className="mission-eyebrow">Meta Q2 · Prioridade CEO</div>
          <h2 className="mission-title">
            O trimestre pede <em>obsessão</em> em três frentes.
          </h2>
          <p className="mission-text">
            Visão em tempo real do instituto — <strong>faturamento R$60K/mês</strong>, <strong>30 pacientes/mês</strong> e <strong>1.000 seguidores</strong> até o fechamento de junho. Tudo que não contribui pra essas três pode ser desprioritizado.
          </p>
        </div>
        <div className="mission-targets">
          <div className="mission-target">
            <div className="mission-target-num">60K</div>
            <div className="mission-target-label">Faturamento</div>
          </div>
          <div className="mission-target">
            <div className="mission-target-num">30</div>
            <div className="mission-target-label">Pacientes</div>
          </div>
          <div className="mission-target">
            <div className="mission-target-num">1K</div>
            <div className="mission-target-label">Seguidores</div>
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="kpi-grid">
        <KpiCard
          status="warning" label="Faturamento"
          value={<>{d.faturamento.valor}<span className="small">{d.faturamento.valor2}</span></>}
          meta={`Meta Q2 · ${d.faturamento.meta}`}
          trend={d.faturamento.trend} trendDir={d.faturamento.trendDir}
          barPct={d.faturamento.metaPct}
          delay={1}
        />
        <KpiCard
          status="warning" label="Pacientes/mês"
          value={<>{d.pacientesMes.valor}<span className="small"> /{d.pacientesMes.meta}</span></>}
          meta={`Meta Q2 · ${d.pacientesMes.meta}/mês`}
          trend={d.pacientesMes.trend} trendDir={d.pacientesMes.trendDir}
          barPct={(d.pacientesMes.valor / d.pacientesMes.meta) * 100}
          delay={1}
        />
        <KpiCard
          status="success" label="Ticket médio"
          value={<>{d.ticketMedio.valor}<span className="small">{d.ticketMedio.unidade}</span></>}
          meta={`Meta · ${d.ticketMedio.meta}`}
          trend={d.ticketMedio.trend} trendDir={d.ticketMedio.trendDir}
          barPct={d.ticketMedio.metaPct} barColor="success"
          delay={2}
        />
        <KpiCard
          status="critical" label="Conversão"
          value={<span className="alert">{d.conversao.valor}</span>}
          meta={d.conversao.meta}
          trend={d.conversao.trend} trendDir={d.conversao.trendDir}
          barPct={parseInt(d.conversao.valor)} barColor="danger"
          delay={2}
        />
        <KpiCard
          status="gold" label="Instagram"
          value={d.instagram.valor}
          meta={`Meta Q2 · ${d.instagram.meta.toLocaleString('pt-BR')}`}
          trend={d.instagram.trend} trendDir={d.instagram.trendDir}
          barPct={(d.instagram.valor / d.instagram.meta) * 100}
          delay={3}
        />
        <KpiCard
          status="" label="NPS"
          value={<span className="muted">{d.nps.valor}</span>}
          meta={`Meta · ${d.nps.meta}`}
          trend="—" trendDir="neutral"
          barPct={0}
          delay={3}
        />
      </div>

      {/* ROW 2: Funil + Meta Chart */}
      <div className="row-2">
        <div className="card fade-in fade-in-2">
          <div className="card-header">
            <div className="card-title">
              <span className="card-title-eyebrow">Comercial</span>
              <span className="card-title-main">Funil de conversão</span>
            </div>
            <span className="card-action">Ver CRM →</span>
          </div>
          <div className="funnel">
            {d.funnel.map((row) => (
              <div key={row.label} className="funnel-row">
                <span className="funnel-label">{row.label}</span>
                <div className="funnel-bar-wrap">
                  <div className={`funnel-bar funnel-bar-${row.cls}`} style={{ width: `${row.width}%` }}>
                    {row.count}
                  </div>
                </div>
                <span className="funnel-count">{row.count}</span>
              </div>
            ))}
          </div>
          <div className="funnel-footer">
            <span>Total · {d.funnel[0].count} leads no ciclo</span>
            <span>Conversão · <strong>40%</strong></span>
          </div>
        </div>

        <div className="card fade-in fade-in-3">
          <div className="card-header">
            <div className="card-title">
              <span className="card-title-eyebrow">Financeiro</span>
              <span className="card-title-main">Meta faturamento Q2</span>
            </div>
            <span className="card-action">Ver DRE →</span>
          </div>
          <div className="chart-meta">
            {d.revenueHistory.map((m) => (
              <div key={m.mes} className="chart-bar-col">
                <div className="chart-bar-stack">
                  <div
                    className={`chart-bar chart-bar-${m.tipo}`}
                    style={{ height: `${m.altura}%` }}
                  />
                </div>
                <div className={`chart-bar-value${m.tipo === 'current' ? ' current' : ''}`}>{m.valor}</div>
                <div className="chart-bar-label">{m.mes}</div>
              </div>
            ))}
            <div className="chart-yaxis">
              <span>60K</span>
              <span>30K</span>
              <span>0</span>
            </div>
          </div>
          <div className="chart-legend">
            <div className="chart-legend-item">
              <span className="chart-legend-dot" style={{ background: 'var(--muted-light)' }} />
              Realizado
            </div>
            <div className="chart-legend-item">
              <span className="chart-legend-dot" style={{ background: 'var(--gold)' }} />
              Mês atual
            </div>
            <div className="chart-legend-item">
              <span className="chart-legend-dot" style={{ background: 'transparent', border: '1px dashed var(--muted-light)' }} />
              Meta
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESS Q2 */}
      <div className="progress-card fade-in fade-in-3">
        <div className="card-header" style={{ marginBottom: 8 }}>
          <div className="card-title">
            <span className="card-title-eyebrow">OKRs · Q2 2026</span>
            <span className="card-title-main">Progresso do <em>trimestre</em></span>
          </div>
          <span className="card-action">Detalhar OKRs →</span>
        </div>
        <div className="progress-grid">
          {d.q2Progress.map((p) => (
            <div key={p.label} className="progress-item">
              <div className="progress-value">
                {p.valor}
                <span className="target">
                  {' /'}{typeof p.meta === 'number' ? p.meta.toLocaleString('pt-BR') : p.meta}
                </span>
              </div>
              <div className="progress-bar">
                <div className={`progress-bar-fill ${p.color}`} style={{ width: `${p.pct}%` }} />
              </div>
              <div className="progress-label">
                <strong>{p.label}</strong>
                <span>{String(p.pct).replace(/\.0$/, '')}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LINE CHARTS */}
      <div className="row-2">
        <LineChartCard
          eyebrow="Financeiro"
          title="Faturamento mensal"
          now="R$40K"
          target="R$60K"
          color="#C9A876"
          gradientId="gold-grad"
          metaLabel="META 60K"
          realized={[[0, 106], [100, 93], [200, 80], [300, 53]]}
          projected={[[300, 53], [400, 33], [500, 20]]}
          monthHighlight={3}
        />
        <LineChartCard
          eyebrow="Marketing · @institutolevvai"
          title="Seguidores Instagram"
          now="286"
          target="1.000"
          color="#8B7BA8"
          gradientId="rose-grad"
          metaLabel="META 1K"
          realized={[[0, 132], [100, 125], [200, 118], [300, 108]]}
          projected={[[300, 108], [400, 70], [500, 20]]}
          monthHighlight={3}
        />
      </div>
    </>
  );
}

/* ==================== KPI CARD ==================== */
function KpiCard({ status, label, value, meta, trend, trendDir, barPct, barColor, delay = 1 }) {
  const trendIcon = trendDir === 'up' ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17l10-10M7 7h10v10" />
    </svg>
  ) : trendDir === 'down' ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 7l10 10M7 17h10V7" />
    </svg>
  ) : null;

  return (
    <div className={`kpi ${status} fade-in fade-in-${delay}`}>
      <div className="kpi-header">
        <span className="kpi-label">{label}</span>
        <span className={`kpi-trend ${trendDir}`}>
          {trendIcon}{trend}
        </span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-meta">{meta}</div>
      <div className="kpi-bar">
        <div
          className={`kpi-bar-fill${barColor ? ` ${barColor}` : ''}`}
          style={{ width: `${Math.min(Math.max(barPct || 0, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

/* ==================== LINE CHART CARD ==================== */
function LineChartCard({
  eyebrow, title, now, target, color, gradientId, metaLabel,
  realized, projected, monthHighlight,
}) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const pathRealized = `M ${realized.map(p => p.join(' ')).join(' L ')}`;
  const pathProjected = `M ${projected.map(p => p.join(' ')).join(' L ')}`;
  const [firstX, firstY] = realized[0];
  const [lastX] = realized[realized.length - 1];
  const areaPath = `M ${realized.map(p => p.join(' ')).join(' L ')} L ${lastX} 140 L ${firstX} 140 Z`;

  return (
    <div className="chart-line-card fade-in fade-in-4">
      <div className="chart-line-head">
        <div className="card-title">
          <span className="card-title-eyebrow">{eyebrow}</span>
          <span className="card-title-main">{title}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="chart-line-now">{now}</div>
          <div className="chart-line-target">Meta · <strong>{target}</strong></div>
        </div>
      </div>
      <svg className="chart-svg" viewBox="0 0 500 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(26,21,18,0.06)" strokeDasharray="4 4" />
        <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(26,21,18,0.06)" strokeDasharray="4 4" />
        <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(26,21,18,0.06)" strokeDasharray="4 4" />
        <line x1="0" y1="20" x2="500" y2="20" stroke={color} strokeDasharray="6 4" strokeWidth="1" opacity="0.6" />
        <text x="495" y="16" fontFamily="DM Mono" fontSize="9" fill={color} textAnchor="end" letterSpacing="1">{metaLabel}</text>
        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path d={pathRealized} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d={pathProjected} stroke={color} strokeWidth="2" strokeDasharray="6 4" fill="none" strokeLinecap="round" opacity="0.5" />
        {realized.map(([x, y], i) => (
          <circle
            key={i} cx={x} cy={y}
            r={i === realized.length - 1 ? 5 : 3}
            fill={color}
            stroke={i === realized.length - 1 ? '#FFF' : 'none'}
            strokeWidth={i === realized.length - 1 ? 2 : 0}
          />
        ))}
        {projected.slice(1).map(([x, y], i) => (
          <circle key={`p${i}`} cx={x} cy={y} r="3" fill={color} opacity="0.4" />
        ))}
      </svg>
      <div className="chart-line-axis">
        {months.map((m, i) => (
          <span key={m} style={i === monthHighlight ? { color, fontWeight: 500 } : {}}>{m}</span>
        ))}
      </div>
    </div>
  );
}
