import React, { useEffect, useState } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  return (
    <div className="app">
      {mobileMenuOpen && (
        <button
          className="mobile-nav-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Fechar menu"
        />
      )}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        user={user}
        onLogout={onLogout}
        badges={badges}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <main className="main">
        <Topbar
          sector={sector}
          tab={tab}
          cycleLabel={cycleLabel}
          onMenuToggle={() => setMobileMenuOpen((open) => !open)}
        />
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
