import React from 'react';

/**
 * Topbar — barra superior com breadcrumb, busca e ações
 *
 * Props:
 *  - sector: string (ex: "Estratégia")
 *  - tab: string (ex: "Visão Geral")
 *  - cycleLabel: string (ex: "Ciclo Q2 · Abr 26")
 *  - onSearch: (query) => void (opcional)
 */
export default function Topbar({
  sector = 'Estratégia',
  tab = 'Visão Geral',
  cycleLabel = 'Ciclo Q2 · Abr 26',
  onSearch = () => {},
}) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-breadcrumb">
          <span>{sector}</span>
          <span className="sep">/</span>
          <strong>{tab}</strong>
        </div>
      </div>

      <div className="topbar-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Buscar abas, docs, leads..."
          onChange={(e) => onSearch(e.target.value)}
        />
        <span className="kbd">⌘K</span>
      </div>

      <div className="topbar-right">
        <div className="topbar-pill hidden-mobile">
          <span className="topbar-pill-dot"></span>
          <span>{cycleLabel}</span>
        </div>
        <button className="topbar-icon-btn" aria-label="Notificações">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="notif-dot"></span>
        </button>
        <button className="topbar-icon-btn" aria-label="Configurações">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
