import React from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './views/DashboardView';
import { LancamentosView } from './views/LancamentosView';
import { ContasCategoriasView } from './views/ContasCategoriasView';
import { EquivalenciasView } from './views/EquivalenciasView';
import { RelatoriosIAView } from './views/RelatoriosIAView';
import { AcessibilidadeConfigView } from './views/AcessibilidadeConfigView';
import { AuthView } from './views/AuthView';

export const AppContent: React.FC = () => {
  const { currentView, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-on-surface">
        <AuthView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      {/* Sidebar Executiva (Fixa à esquerda no desktop) */}
      <Sidebar />

      {/* Conteúdo Principal com Header Fixo */}
      <div className="pl-72 flex flex-col min-h-screen max-lg:pl-0">
        <Header />

        <main className="w-full pt-20 px-6 pb-12 flex-1 max-w-7xl mx-auto">
          {currentView === 'painel-geral' && <DashboardView />}
          {currentView === 'lancamentos' && <LancamentosView />}
          {currentView === 'contas-e-categorias' && <ContasCategoriasView />}
          {currentView === 'equivalencias' && <EquivalenciasView />}
          {currentView === 'relatorios-ia' && <RelatoriosIAView />}
          {currentView === 'acessibilidade-e-configuracoes' && <AcessibilidadeConfigView />}
          {currentView === 'login-e-registro' && <AuthView />}
        </main>
      </div>
    </div>
  );
};
