import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AppState,
  loadAppState,
  saveAppState,
  resetAppState,
  calcularMetricas,
  authenticateAccount,
  getAuthAccounts,
  loadAuthSession,
  registerAccount as createAccount,
  saveAuthSession,
  AuthAccount,
} from '../services/storage';
import {
  Tema,
  PapelUsuario,
  Lancamento,
  ContaFinanceira,
  Categoria,
  ItemEquivalencia,
  ConfigEquivalencia,
  RelatorioIA,
  Empresa,
  MetricasFinanceiras,
} from '../types';

export type ViewPath =
  | 'painel-geral'
  | 'lancamentos'
  | 'contas-e-categorias'
  | 'equivalencias'
  | 'relatorios-ia'
  | 'acessibilidade-e-configuracoes'
  | 'login-e-registro';

interface AppContextType {
  state: AppState;
  currentView: ViewPath;
  setCurrentView: (v: ViewPath) => void;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => boolean;
  register: (details: Omit<AuthAccount, 'id' | 'empresaId'>) => void;
  logout: () => void;
  activeExpenseItem: ItemEquivalencia | null;
  activeProfitItem: ItemEquivalencia | null;
  metricas: MetricasFinanceiras;
  // Acessibilidade
  setTema: (tema: Tema) => void;
  toggleAltoContraste: () => void;
  setTamanhoFonte: (size: number) => void;
  cycleTamanhoFonte: () => void;
  toggleReduzirAnimacoes: () => void;
  // Entidades
  addLancamento: (l: Omit<Lancamento, 'id'>) => void;
  updateLancamento: (l: Lancamento) => void;
  deleteLancamento: (id: string) => void;
  addConta: (c: Omit<ContaFinanceira, 'id'>) => void;
  toggleContaAtiva: (id: string) => void;
  addCategoria: (c: Omit<Categoria, 'id'>) => void;
  toggleCategoriaAtiva: (id: string) => void;
  addItemEquivalencia: (i: Omit<ItemEquivalencia, 'id'>) => void;
  deleteItemEquivalencia: (id: string) => void;
  setConfigEquivalencia: (itemId: string, aplicacao: 'DESPESA' | 'LUCRO') => void;
  setMetaLucroUnidades: (units: number) => void;
  addRelatorio: (r: RelatorioIA) => void;
  updateEmpresa: (emp: Partial<Empresa>) => void;
  switchUsuarioPapel: (papel: PapelUsuario) => void;
  resetDatabase: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(() => loadAuthSession());
  const [state, setState] = useState<AppState>(() => {
    const userId = loadAuthSession();
    const account = userId ? getAuthAccounts().find((entry) => entry.id === userId) : undefined;
    return loadAppState(userId || undefined, account);
  });
  const [currentView, setCurrentView] = useState<ViewPath>('painel-geral');

  // Salva os dados somente no espaço isolado do usuário autenticado.
  useEffect(() => {
    if (authenticatedUserId) saveAppState(state, authenticatedUserId);
  }, [state, authenticatedUserId]);

  const login = (email: string, senha: string): boolean => {
    const account = authenticateAccount(email, senha);
    if (!account) return false;
    setState(loadAppState(account.id, account));
    saveAuthSession(account.id);
    setAuthenticatedUserId(account.id);
    setCurrentView('painel-geral');
    return true;
  };

  const register = (details: Omit<AuthAccount, 'id' | 'empresaId'>): void => {
    const account = createAccount(details);
    loadAppState(account.id, account);
  };

  const logout = () => {
    saveAuthSession(null);
    setAuthenticatedUserId(null);
    setState(loadAppState());
    setCurrentView('painel-geral');
  };

  // Aplica classes de acessibilidade no elemento <html> (RF15, RNF01)
  useEffect(() => {
    const root = document.documentElement;

    // Tema
    root.classList.remove('theme-claro', 'theme-escuro', 'theme-alto-contraste');
    if (state.usuario.tema === 'CLARO') {
      root.classList.add('theme-claro');
    } else if (state.usuario.tema === 'ALTO_CONTRASTE') {
      root.classList.add('theme-alto-contraste');
    } else {
      root.classList.add('theme-escuro');
    }

    // Escala de fonte
    const scale = state.usuario.tamanhoFonte / 100;
    root.style.setProperty('--font-scale', scale.toString());

    // Redução de animações
    if (state.usuario.reduzirAnimacoes) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [state.usuario.tema, state.usuario.tamanhoFonte, state.usuario.reduzirAnimacoes]);

  // Itens de equivalência ativos configurados
  const activeExpenseItem = useMemo(() => {
    const cfg = state.configsEquivalencia.find((c) => c.aplicacao === 'DESPESA');
    if (!cfg) return state.itensEquivalencia[0] || null;
    return state.itensEquivalencia.find((i) => i.id === cfg.itemId) || state.itensEquivalencia[0] || null;
  }, [state.configsEquivalencia, state.itensEquivalencia]);

  const activeProfitItem = useMemo(() => {
    const cfg = state.configsEquivalencia.find((c) => c.aplicacao === 'LUCRO');
    if (!cfg) return state.itensEquivalencia[1] || null;
    return state.itensEquivalencia.find((i) => i.id === cfg.itemId) || state.itensEquivalencia[1] || null;
  }, [state.configsEquivalencia, state.itensEquivalencia]);

  // Métricas do painel
  const metricas = useMemo(() => {
    return calcularMetricas(state.lancamentos, state.contas);
  }, [state.lancamentos, state.contas]);

  // Funções de Acessibilidade
  const setTema = (tema: Tema) => {
    setState((prev) => ({
      ...prev,
      usuario: { ...prev.usuario, tema },
    }));
  };

  const toggleAltoContraste = () => {
    setState((prev) => ({
      ...prev,
      usuario: {
        ...prev.usuario,
        tema: prev.usuario.tema === 'ALTO_CONTRASTE' ? 'ESCURO' : 'ALTO_CONTRASTE',
      },
    }));
  };

  const setTamanhoFonte = (size: number) => {
    setState((prev) => ({
      ...prev,
      usuario: { ...prev.usuario, tamanhoFonte: size },
    }));
  };

  const cycleTamanhoFonte = () => {
    setState((prev) => {
      const current = prev.usuario.tamanhoFonte;
      let next = 100;
      if (current === 100) next = 125;
      else if (current === 125) next = 150;
      else next = 100;
      return {
        ...prev,
        usuario: { ...prev.usuario, tamanhoFonte: next },
      };
    });
  };

  const toggleReduzirAnimacoes = () => {
    setState((prev) => ({
      ...prev,
      usuario: {
        ...prev.usuario,
        reduzirAnimacoes: !prev.usuario.reduzirAnimacoes,
      },
    }));
  };

  // Funções de Negócio
  const addLancamento = (l: Omit<Lancamento, 'id'>) => {
    const novo: Lancamento = {
      ...l,
      id: `lanc_${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      lancamentos: [novo, ...prev.lancamentos],
    }));
  };

  const updateLancamento = (l: Lancamento) => {
    setState((prev) => ({
      ...prev,
      lancamentos: prev.lancamentos.map((item) => (item.id === l.id ? l : item)),
    }));
  };

  const deleteLancamento = (id: string) => {
    setState((prev) => ({
      ...prev,
      lancamentos: prev.lancamentos.filter((l) => l.id !== id),
    }));
  };

  const addConta = (c: Omit<ContaFinanceira, 'id'>) => {
    const nova: ContaFinanceira = {
      ...c,
      id: `cta_${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      contas: [...prev.contas, nova],
    }));
  };

  const toggleContaAtiva = (id: string) => {
    setState((prev) => ({
      ...prev,
      contas: prev.contas.map((c) => (c.id === id ? { ...c, ativa: !c.ativa } : c)),
    }));
  };

  const addCategoria = (c: Omit<Categoria, 'id'>) => {
    const nova: Categoria = {
      ...c,
      id: `cat_${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      categorias: [...prev.categorias, nova],
    }));
  };

  const toggleCategoriaAtiva = (id: string) => {
    setState((prev) => ({
      ...prev,
      categorias: prev.categorias.map((c) => (c.id === id ? { ...c, ativa: !c.ativa } : c)),
    }));
  };

  const addItemEquivalencia = (i: Omit<ItemEquivalencia, 'id'>) => {
    const novo: ItemEquivalencia = {
      ...i,
      id: `item_${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      itensEquivalencia: [...prev.itensEquivalencia, novo],
    }));
  };

  const deleteItemEquivalencia = (id: string) => {
    setState((prev) => ({
      ...prev,
      itensEquivalencia: prev.itensEquivalencia.filter((item) => item.id !== id),
    }));
  };

  const setConfigEquivalencia = (itemId: string, aplicacao: 'DESPESA' | 'LUCRO') => {
    setState((prev) => {
      const filtered = prev.configsEquivalencia.filter((c) => c.aplicacao !== aplicacao);
      const nova: ConfigEquivalencia = {
        id: `cfg_${Date.now()}`,
        empresaId: prev.empresa.id,
        itemId,
        aplicacao,
        atualizadoEm: new Date().toISOString(),
      };
      return {
        ...prev,
        configsEquivalencia: [...filtered, nova],
      };
    });
  };

  const setMetaLucroUnidades = (units: number) => {
    setState((prev) => ({
      ...prev,
      metaLucroUnidades: units,
    }));
  };

  const addRelatorio = (r: RelatorioIA) => {
    setState((prev) => ({
      ...prev,
      relatorios: [r, ...prev.relatorios],
    }));
  };

  const updateEmpresa = (emp: Partial<Empresa>) => {
    setState((prev) => ({
      ...prev,
      empresa: { ...prev.empresa, ...emp },
    }));
  };

  const switchUsuarioPapel = (papel: PapelUsuario) => {
    setState((prev) => ({
      ...prev,
      usuario: { ...prev.usuario, papel },
    }));
  };

  const resetDatabase = () => {
    const account = authenticatedUserId
      ? getAuthAccounts().find((entry) => entry.id === authenticatedUserId)
      : undefined;
    const reset = resetAppState(authenticatedUserId || undefined, account);
    setState(reset);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        currentView,
        setCurrentView,
        isAuthenticated: authenticatedUserId !== null,
        login,
        register,
        logout,
        activeExpenseItem,
        activeProfitItem,
        metricas,
        setTema,
        toggleAltoContraste,
        setTamanhoFonte,
        cycleTamanhoFonte,
        toggleReduzirAnimacoes,
        addLancamento,
        updateLancamento,
        deleteLancamento,
        addConta,
        toggleContaAtiva,
        addCategoria,
        toggleCategoriaAtiva,
        addItemEquivalencia,
        deleteItemEquivalencia,
        setConfigEquivalencia,
        setMetaLucroUnidades,
        addRelatorio,
        updateEmpresa,
        switchUsuarioPapel,
        resetDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser utilizado dentro de um AppProvider');
  }
  return context;
}
