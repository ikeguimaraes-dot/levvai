import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * AppShell — shell principal da aplicação
 *
 * Props:
 *  - activeTab, onTabChange, user, onLogout, badges (passam pro Sidebar)
 *  - sector, tab, cycleLabel (passam pro Topbar)
 *  - children (conteúdo da página ativa)
 */
export default function AppShell({
  activeTab,
  onTabChange,
  user,
  onLogout,
  badges,
  sector,
  tab,
  cycleLabel,
  children,
}) {
  return (
    <div className="app">
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        user={user}
        onLogout={onLogout}
        badges={badges}
      />
      <main className="main">
        <Topbar sector={sector} tab={tab} cycleLabel={cycleLabel} />
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
