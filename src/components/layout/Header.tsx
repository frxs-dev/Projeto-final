import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/equivalenceEngine';

export const Header: React.FC = () => {
  const {
    state,
    activeExpenseItem,
    setCurrentView,
    cycleTamanhoFonte,
    toggleAltoContraste,
    setTema,
    switchUsuarioPapel,
  } = useApp();

  const isDarkMode = state.usuario.tema === 'ESCURO';
  const isHighContrast = state.usuario.tema === 'ALTO_CONTRASTE';

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl z-40 px-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center justify-between gap-4 border-b border-surface-container-high max-lg:left-0">
      {/* Informações da Empresa & Unidade Ativa */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-3 min-w-0 bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container-high/50">
          <span className="material-symbols-outlined text-primary text-[20px] shrink-0" aria-hidden="true">
            domain
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-on-surface truncate">
              {state.empresa.nome}
            </span>
            <span className="font-mono text-xs text-on-surface-variant truncate">
              CNPJ: {state.empresa.cnpj} • {state.empresa.regimeTributario.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Unidade Tangível Ativa (RF12) */}
        {activeExpenseItem && (
          <button
            type="button"
            onClick={() => setCurrentView('equivalencias')}
            className="hidden xl:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors border border-surface-container-high/50 text-left cursor-pointer"
            title="Clique para configurar o item de equivalência do mundo real"
            aria-label={`Unidade de despesa ativa: ${activeExpenseItem.nome}, ${formatCurrency(activeExpenseItem.precoReferencia)}`}
          >
            <span className="material-symbols-outlined text-tertiary text-[18px]" aria-hidden="true">
              devices
            </span>
            <span className="text-xs text-on-surface-variant">Unidade Ativa:</span>
            <span className="font-mono text-xs font-semibold text-on-surface">
              {activeExpenseItem.nome} ({formatCurrency(activeExpenseItem.precoReferencia)})
            </span>
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]" aria-hidden="true">
              unfold_more
            </span>
          </button>
        )}
      </div>

      {/* Ferramentas de Acessibilidade (RF15) & Perfil */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Barra de Acessibilidade Rápida (WCAG 2.1 AA) */}
        <div
          className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-surface-container-high/50"
          role="toolbar"
          aria-label="Opções Rápidas de Acessibilidade"
        >
          {/* Ajuste de Fonte */}
          <button
            type="button"
            onClick={cycleTamanhoFonte}
            className="px-2 py-1 rounded font-mono text-xs font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            title={`Alternar Tamanho da Fonte (Atual: ${state.usuario.tamanhoFonte}%)`}
            aria-label={`Alternar tamanho da fonte. Atual em ${state.usuario.tamanhoFonte}%`}
          >
            A{state.usuario.tamanhoFonte > 100 ? `+${state.usuario.tamanhoFonte - 100}%` : '+'}
          </button>

          {/* Alto Contraste (WCAG AAA) */}
          <button
            type="button"
            onClick={toggleAltoContraste}
            className={`p-1.5 rounded transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary ${
              isHighContrast
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
            title="Alternar Modo Alto Contraste (WCAG 2.1 AAA)"
            aria-label="Alternar Modo Alto Contraste"
            aria-pressed={isHighContrast}
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              contrast
            </span>
          </button>

          {/* Alternar Tema Claro / Escuro */}
          <button
            type="button"
            onClick={() => setTema(isDarkMode ? 'CLARO' : 'ESCURO')}
            className="p-1.5 rounded text-primary hover:bg-surface-container-high transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary"
            title={`Alternar para tema ${isDarkMode ? 'Claro' : 'Escuro'}`}
            aria-label={`Alternar para tema ${isDarkMode ? 'Claro' : 'Escuro'}`}
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {isDarkMode ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
        </div>

        {/* Perfil & Seletor de Papel (RF01, RF02) */}
        <div className="flex items-center gap-2 pl-1 bg-surface-container-low py-1 pr-3 rounded-lg border border-surface-container-high/50">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              person
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-on-surface">
              {state.usuario.nome}
            </span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] text-primary uppercase font-bold">
                {state.usuario.papel}
              </span>
              <button
                type="button"
                onClick={() => {
                  const papeis: ('ADMIN' | 'FINANCEIRO' | 'LEITOR')[] = ['ADMIN', 'FINANCEIRO', 'LEITOR'];
                  const currentIndex = papeis.indexOf(state.usuario.papel);
                  const nextPapel = papeis[(currentIndex + 1) % papeis.length];
                  switchUsuarioPapel(nextPapel);
                }}
                className="text-[9px] text-on-surface-variant hover:text-primary transition-colors underline"
                title="Clique para alternar o papel do usuário (ADMIN / FINANCEIRO / LEITOR)"
                aria-label={`Trocar papel do usuário. Papel atual: ${state.usuario.papel}`}
              >
                (alternar)
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
