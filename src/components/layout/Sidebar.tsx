import React from 'react';
import { useApp, ViewPath } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView } = useApp();

  const navItems: { path: ViewPath; label: string; icon: string }[] = [
    { path: 'painel-geral', label: 'Painel Geral', icon: 'dashboard' },
    { path: 'lancamentos', label: 'Lançamentos', icon: 'swap_horiz' },
    { path: 'contas-e-categorias', label: 'Contas & Categorias', icon: 'account_balance' },
    { path: 'equivalencias', label: 'Equivalências', icon: 'scale' },
    { path: 'relatorios-ia', label: 'Relatórios IA', icon: 'auto_awesome' },
    { path: 'acessibilidade-e-configuracoes', label: 'Acessibilidade & Configurações', icon: 'tune' },
  ];

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container-high max-lg:static max-lg:w-full max-lg:h-auto"
      aria-label="Menu Principal de Navegação"
    >
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="px-4 py-5 flex items-start gap-3 bg-surface-container-low border-b border-surface-container-high">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-on-primary-container text-[22px]" aria-hidden="true">
              account_balance_wallet
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-lg font-bold tracking-tight text-on-surface">
                Finance
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-primary uppercase font-bold">
                SENAI v0.1.0
              </span>
            </div>
            <span className="text-xs text-on-surface-variant truncate">
              Gestão Tangível & IA
            </span>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-4 pt-4 pb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Navegação Executiva
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = currentView === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => setCurrentView(item.path)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? 'bg-surface-container-high text-primary font-semibold shadow-sm border-l-4 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Badges (RNF01, RNF03) */}
      <div className="p-4 flex flex-col gap-2 bg-surface-container-low border-t border-surface-container-high">
        {/* RLS Badge */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-surface-container-lowest border border-surface-container-high/40">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[16px]" aria-hidden="true">
              verified_user
            </span>
            <span className="text-[11px] font-bold uppercase text-on-surface-variant">
              RLS ATIVO • SUPABASE
            </span>
          </div>
          <span className="text-[10px] font-mono text-primary font-bold">
            SECURE
          </span>
        </div>

        {/* WCAG Badge */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-surface-container-lowest border border-surface-container-high/40">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary text-[16px]" aria-hidden="true">
              accessibility_new
            </span>
            <span className="text-[11px] font-bold uppercase text-on-surface-variant">
              WCAG 2.1 AA
            </span>
          </div>
          <span className="text-[10px] font-mono text-on-surface-variant font-semibold">
            CONFORME
          </span>
        </div>

        {/* Switch to Login / Register View (RF01) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setCurrentView('login-e-registro')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary ${
              currentView === 'login-e-registro'
                ? 'bg-primary-container text-on-primary-container font-semibold'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                logout
              </span>
              <span>Trocar Acesso</span>
            </span>
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
