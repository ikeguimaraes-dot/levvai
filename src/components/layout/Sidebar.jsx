import React from 'react';
import { ADMIN_MASTER_EMAILS } from '../../../shared/auth-config.js';

/**
 * Sidebar — navegação lateral com 9 setores e 29 abas
 *
 * Props:
 *  - activeTab: string (id da aba ativa, ex: "visao-geral")
 *  - onTabChange: (tabId) => void
 *  - user: { name: string, role: string }  (opcional)
 *  - onLogout: () => void (opcional)
 *  - badges: { [tabId]: number } (opcional, ex: { "atas-acoes": 3, "crm-leads": 5 })
 */

const SECTORS = [
  {
    name: 'Estratégia',
    tabs: [
      { id: 'visao-geral', label: 'Visão Geral' },
      { id: 'planejamento', label: 'Planejamento' },
      { id: 'dashboard-ceo', label: 'Dashboard CEO' },
    ],
  },
  {
    name: 'Cultura & Governança',
    tabs: [
      { id: 'cultura', label: 'Cultura' },
      { id: 'atas-acoes', label: 'Atas & Ações' },
    ],
  },
  {
    name: 'Financeiro',
    tabs: [
      { id: 'dre-catalogo', label: 'DRE & Catálogo' },
      { id: 'fluxo-caixa', label: 'Fluxo de Caixa' },
      { id: 'orcamento', label: 'Orçamento' },
    ],
  },
  {
    name: 'Comercial',
    tabs: [
      { id: 'crm-leads', label: 'CRM & Leads' },
      { id: 'comunicacao', label: 'Comunicação' },
      { id: 'jornada-paciente', label: 'Jornada Paciente' },
      { id: 'nps-satisfacao', label: 'NPS & Satisfação' },
    ],
  },
  {
    name: 'Marketing',
    tabs: [
      { id: 'marca', label: 'Marca' },
      { id: 'icp', label: 'ICP' },
      { id: 'editorial', label: 'Editorial' },
      { id: 'dashboard-mkt', label: 'Dashboard Mkt' },
      { id: 'concorrentes', label: 'Concorrentes' },
    ],
  },
  {
    name: 'Pessoas',
    tabs: [
      { id: 'equipe', label: 'Equipe' },
      { id: 'associados', label: 'Associados' },
      { id: '1-1s', label: '1:1s' },
      { id: 'avaliacao', label: 'Avaliação' },
    ],
  },
  {
    name: 'Operação',
    tabs: [
      { id: 'agenda', label: 'Agenda' },
      { id: 'estoque', label: 'Estoque' },
      { id: 'rotinas', label: 'Rotinas' },
      { id: 'fornecedores', label: 'Fornecedores' },
    ],
  },
  {
    name: 'Jurídico',
    tabs: [
      { id: 'compliance', label: 'Compliance' },
      { id: 'contratos', label: 'Contratos' },
    ],
  },
  {
    name: 'Docs',
    tabs: [
      { id: 'biblioteca', label: 'Biblioteca' },
      { id: 'templates', label: 'Templates' },
      { id: 'usuarios', label: 'Usuários' },
    ],
  },
];

export default function Sidebar({
  activeTab = 'visao-geral',
  onTabChange = () => {},
  user = { name: 'Ike Guimarães', role: 'CEO — Admin' },
  onLogout = () => {},
  badges = {},
  mobileOpen = false,
  onMobileClose = () => {},
}) {
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <aside className={`sidebar ${mobileOpen ? 'is-mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <button className="sidebar-mobile-close" onClick={onMobileClose} aria-label="Fechar menu">×</button>
        <span className="sidebar-brand-top">Instituto</span>
        <span className="sidebar-brand-main">LEVVAI</span>
        <span className="sidebar-brand-sub">Plataforma de Gestão</span>
      </div>

      {SECTORS.map((sector) => (
        <div key={sector.name} className="sidebar-sector">
          <div className="sidebar-sector-header">{sector.name}</div>
          {sector.tabs
            .filter(tab => tab.id !== 'usuarios' || ADMIN_MASTER_EMAILS.includes(user?.email?.toLowerCase()))
            .map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`sidebar-link ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
              {badges[tab.id] ? (
                <span className="sidebar-link-badge">{badges[tab.id]}</span>
              ) : null}
            </button>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="sidebar-avatar">{initial}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name || 'Usuário'}</div>
          <div className="sidebar-user-role">{user?.role || '—'}</div>
        </div>
        <button className="sidebar-logout" onClick={onLogout} aria-label="Sair">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
