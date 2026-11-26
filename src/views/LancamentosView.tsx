import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TipoLancamento, Lancamento } from '../types';
import { formatCurrency, formatEquivalence } from '../services/equivalenceEngine';
import { exportLancamentosToCSV } from '../services/exportService';
import { NovoLancamentoModal } from '../components/modals/NovoLancamentoModal';

export const LancamentosView: React.FC = () => {
  const {
    state,
    deleteLancamento,
    updateLancamento,
    activeExpenseItem,
    activeProfitItem,
    setCurrentView,
  } = useApp();

  // Estados de Filtro (RF07)
  const [busca, setBusca] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('mes_atual');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroConta, setFiltroConta] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receitas' | 'despesas'>('todos');

  // Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoModal, setTipoModal] = useState<TipoLancamento>('DESPESA');
  const [editingItem, setEditingItem] = useState<Lancamento | null>(null);

  // Mapeamentos
  const catMap = useMemo(() => new Map(state.categorias.map((c) => [c.id, c])), [state.categorias]);
  const contaMap = useMemo(() => new Map(state.contas.map((c) => [c.id, c])), [state.contas]);

  // Filtragem
  const lancamentosFiltrados = useMemo(() => {
    return state.lancamentos.filter((l) => {
      // Filtro de Busca
      if (busca.trim()) {
        const query = busca.toLowerCase();
        const matchesDesc = l.descricao.toLowerCase().includes(query);
        const matchesDoc = l.numeroDocumento?.toLowerCase().includes(query) || false;
        const matchesVal = l.valor.toString().includes(query);
        if (!matchesDesc && !matchesDoc && !matchesVal) return false;
      }

      // Filtro de Tipo
      if (filtroTipo === 'receitas' && l.tipo !== 'RECEITA') return false;
      if (filtroTipo === 'despesas' && l.tipo !== 'DESPESA') return false;

      // Filtro de Categoria
      if (filtroCategoria !== 'todas' && l.categoriaId !== filtroCategoria) return false;

      // Filtro de Conta
      if (filtroConta !== 'todas' && l.contaId !== filtroConta) return false;

      // Filtro de Período
      if (filtroPeriodo === 'mes_atual') {
        return l.data.startsWith('2026-11');
      }
      if (filtroPeriodo === 'mes_anterior') {
        return l.data.startsWith('2026-10');
      }

      return true;
    });
  }, [state.lancamentos, busca, filtroTipo, filtroCategoria, filtroConta, filtroPeriodo]);

  // Totais agregados da seleção atual
  const totalReceitas = lancamentosFiltrados
    .filter((l) => l.tipo === 'RECEITA')
    .reduce((acc, l) => acc + l.valor, 0);

  const totalDespesas = lancamentosFiltrados
    .filter((l) => l.tipo === 'DESPESA')
    .reduce((acc, l) => acc + l.valor, 0);

  const resultadoLiquido = totalReceitas - totalDespesas;

  const handleExportCSV = () => {
    exportLancamentosToCSV(
      lancamentosFiltrados,
      state.categorias,
      state.contas,
      activeExpenseItem
    );
  };

  const handleOpenModal = (tipo: TipoLancamento) => {
    setTipoModal(tipo);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, descricao: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o lançamento "${descricao}"?`)) {
      deleteLancamento(id);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Top Bar / Page Header */}
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-low p-6 rounded-xl shadow-md border border-surface-container-high/60">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-on-surface-variant font-mono text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">
              swap_horiz
            </span>
            <span>Tesouraria Operacional</span>
            <span>•</span>
            <span className="text-primary font-bold">RF05 • RF06 • RF12</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
            Lançamentos &amp; Movimentações
          </h1>
          <p className="text-xs text-on-surface-variant">
            Registro, conciliação e rastreamento de receitas e despesas em até 3 cliques.
          </p>
        </div>

        {/* Quick Action Triggers */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold rounded-lg transition-colors border border-surface-container-high cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
            title="Exportar lançamentos filtrados em CSV"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              download
            </span>
            <span>Exportar CSV (RF17)</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal('DESPESA')}
            className="flex items-center gap-2 px-4 py-2.5 bg-error-container hover:bg-error-container/80 text-on-error-container text-xs font-bold rounded-lg transition-transform active:scale-95 border border-error/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-error"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              arrow_upward
            </span>
            <span>Nova Despesa</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal('RECEITA')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-container hover:bg-primary-fixed text-on-primary-container text-xs font-bold rounded-lg shadow-sm transition-transform active:scale-95 border border-primary/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              arrow_downward
            </span>
            <span>Nova Receita</span>
          </button>
        </div>
      </section>

      {/* Filter and Search Suite (RF07) */}
      <section className="bg-surface-container-low p-4 rounded-xl shadow-md border border-surface-container-high/60 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-4 relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none" aria-hidden="true">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por descrição, código ou documento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-surface-container-lowest rounded-lg text-on-surface placeholder:text-on-surface-variant text-xs border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Period Filter */}
          <div className="lg:col-span-3 flex items-center relative">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none" aria-hidden="true">
              calendar_month
            </span>
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="w-full h-11 pl-10 pr-8 bg-surface-container-lowest rounded-lg text-on-surface text-xs border border-surface-container-high appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="mes_atual">Mês Atual (Novembro 2026)</option>
              <option value="mes_anterior">Mês Anterior (Outubro 2026)</option>
              <option value="todos">Todos os Períodos</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 text-on-surface-variant text-[18px] pointer-events-none" aria-hidden="true">
              expand_more
            </span>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3 flex items-center relative">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none" aria-hidden="true">
              sell
            </span>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full h-11 pl-10 pr-8 bg-surface-container-lowest rounded-lg text-on-surface text-xs border border-surface-container-high appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="todas">Todas as Categorias</option>
              {state.categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome} ({cat.tipo})
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 text-on-surface-variant text-[18px] pointer-events-none" aria-hidden="true">
              expand_more
            </span>
          </div>

          {/* Financial Account Filter */}
          <div className="lg:col-span-2 flex items-center relative">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none" aria-hidden="true">
              account_balance
            </span>
            <select
              value={filtroConta}
              onChange={(e) => setFiltroConta(e.target.value)}
              className="w-full h-11 pl-10 pr-8 bg-surface-container-lowest rounded-lg text-on-surface text-xs border border-surface-container-high appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="todas">Todas as Contas</option>
              {state.contas.map((cta) => (
                <option key={cta.id} value={cta.id}>
                  {cta.nome}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 text-on-surface-variant text-[18px] pointer-events-none" aria-hidden="true">
              expand_more
            </span>
          </div>
        </div>

        {/* Type Pills & Rapid Segmenter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-surface-container-high/40">
          <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg border border-surface-container-high/60">
            <button
              type="button"
              onClick={() => setFiltroTipo('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filtroTipo === 'todos'
                  ? 'bg-surface-container-high text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Todos os Tipos
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo('receitas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                filtroTipo === 'receitas'
                  ? 'bg-surface-container-high text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true"></span>
              <span>Apenas Receitas</span>
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo('despesas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                filtroTipo === 'despesas'
                  ? 'bg-surface-container-high text-error font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-error" aria-hidden="true"></span>
              <span>Apenas Despesas</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-on-surface-variant text-xs">
            <span className="flex items-center gap-1.5 bg-surface-container px-3 py-1 rounded border border-surface-container-high/40">
              <span className="material-symbols-outlined text-[16px] text-tertiary" aria-hidden="true">
                tune
              </span>
              <span>Equivalência Ativa:</span>
              <strong className="text-on-surface">
                {activeExpenseItem?.nome || 'iPhone 16 Pro'} ({formatCurrency(activeExpenseItem?.precoReferencia || 7500)})
              </strong>
            </span>
            <button
              type="button"
              onClick={() => setCurrentView('equivalencias')}
              className="text-primary hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <span>Trocar Unidade</span>
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Financial Ledger Table (RF05, RF06, RF12) */}
      <section className="bg-surface-container-low rounded-xl shadow-md border border-surface-container-high/60 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm" aria-label="Extrato Completo de Lançamentos">
            <thead>
              <tr className="bg-surface-container-high/60 text-on-surface-variant font-mono text-[11px] uppercase tracking-wider">
                <th scope="col" className="py-3 px-4">Data</th>
                <th scope="col" className="py-3 px-3">Tipo</th>
                <th scope="col" className="py-3 px-4">Descrição &amp; Documento</th>
                <th scope="col" className="py-3 px-3">Categoria</th>
                <th scope="col" className="py-3 px-3">Conta Origem</th>
                <th scope="col" className="py-3 px-4 text-right">Valor Líquido (R$)</th>
                <th scope="col" className="py-3 px-4 text-right">Equivalência Tangível</th>
                <th scope="col" className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-xs">
              {lancamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                    Nenhum lançamento encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                lancamentosFiltrados.map((item) => {
                  const dataBR = item.data.split('-').reverse().join('/');
                  const cat = catMap.get(item.categoriaId);
                  const conta = contaMap.get(item.contaId);
                  const itemRef = item.tipo === 'DESPESA' ? activeExpenseItem : activeProfitItem;
                  const equivTexto = formatEquivalence(item.valor, itemRef);

                  return (
                    <tr key={item.id} className="hover:bg-surface-container/60 transition-colors group">
                      <td className="py-3 px-4 font-mono text-on-surface-variant whitespace-nowrap">
                        {dataBR}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
                            item.tipo === 'RECEITA'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-error/10 text-error'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                            {item.tipo === 'RECEITA' ? 'arrow_downward' : 'arrow_upward'}
                          </span>
                          {item.tipo === 'RECEITA' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface">{item.descricao}</span>
                          {item.numeroDocumento && (
                            <span className="text-[10px] text-on-surface-variant font-mono">
                              Doc: {item.numeroDocumento}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-surface-container text-on-surface text-xs font-medium">
                          {cat?.nome || 'Geral'}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-on-surface-variant">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-tertiary" aria-hidden="true">
                            {conta?.tipo === 'CARTAO' ? 'credit_card' : 'account_balance'}
                          </span>
                          <span>{conta?.nome || 'Conta'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold">
                        <span className={item.tipo === 'RECEITA' ? 'text-primary' : 'text-error'}>
                          {item.tipo === 'RECEITA' ? '+' : '-'} {formatCurrency(item.valor)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container text-tertiary font-mono text-xs font-semibold">
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                            devices
                          </span>
                          <span>{equivTexto}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 rounded hover:bg-surface-bright text-on-surface-variant hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                            title="Editar Lançamento (RF06)"
                            aria-label={`Editar lançamento ${item.descricao}`}
                          >
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                              edit
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.descricao)}
                            className="p-1.5 rounded hover:bg-surface-bright text-on-surface-variant hover:text-error transition-colors focus-visible:ring-2 focus-visible:ring-error cursor-pointer"
                            title="Excluir Lançamento (RF06)"
                            aria-label={`Excluir lançamento ${item.descricao}`}
                          >
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Totais Agregados e Resumo */}
        <div className="bg-surface-container-high/40 p-4 flex flex-col xl:flex-row items-center justify-between gap-4 border-t border-surface-container-high/60">
          <div className="flex flex-wrap items-center gap-6 w-full xl:w-auto">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" aria-hidden="true"></span>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">
                  Total Receitas
                </span>
                <span className="font-mono text-sm font-bold text-primary">
                  {formatCurrency(totalReceitas)}
                </span>
              </div>
            </div>

            <div className="w-px h-8 bg-surface-container-highest hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-error" aria-hidden="true"></span>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">
                  Total Despesas
                </span>
                <span className="font-mono text-sm font-bold text-error">
                  {formatCurrency(totalDespesas)}
                </span>
              </div>
            </div>

            <div className="w-px h-8 bg-surface-container-highest hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" aria-hidden="true"></span>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">
                  Resultado Líquido
                </span>
                <span className="font-mono text-sm font-bold text-primary">
                  {resultadoLiquido >= 0 ? '+' : ''} {formatCurrency(resultadoLiquido)}
                  <span className="text-xs font-normal text-tertiary ml-1">
                    ({formatEquivalence(resultadoLiquido, activeProfitItem)})
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-on-surface-variant font-medium">
            Exibindo <strong className="text-on-surface">{lancamentosFiltrados.length}</strong> lançamentos no total
          </div>
        </div>
      </section>

      {/* Modal de Registro de Novo Lançamento */}
      <NovoLancamentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tipoPredefinido={tipoModal}
      />

      {/* Modal de Edição Rápida */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-surface-container rounded-2xl p-6 shadow-2xl border border-surface-container-high flex flex-col gap-4">
            <h2 className="font-headline text-base font-bold text-on-surface">
              Editar Lançamento
            </h2>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Descrição
              </label>
              <input
                type="text"
                value={editingItem.descricao}
                onChange={(e) => setEditingItem({ ...editingItem, descricao: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingItem.valor}
                  onChange={(e) => setEditingItem({ ...editingItem, valor: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={editingItem.data}
                  onChange={(e) => setEditingItem({ ...editingItem, data: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  updateLancamento(editingItem);
                  setEditingItem(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-container text-on-primary-container hover:bg-primary cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
