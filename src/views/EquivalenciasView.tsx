import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatEquivalenceValue } from '../services/equivalenceEngine';

export const EquivalenciasView: React.FC = () => {
  const {
    state,
    activeExpenseItem,
    activeProfitItem,
    setConfigEquivalencia,
    addItemEquivalencia,
    deleteItemEquivalencia,
    metricas,
  } = useApp();

  const [catalogoTab, setCatalogoTab] = useState<'all' | 'standard' | 'custom'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states para novo item personalizado (RF11)
  const [novoNome, setNovoNome] = useState('');
  const [novoPreco, setNovoPreco] = useState('');
  const [novoSubtitulo, setNovoSubtitulo] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('Equipamentos');
  const [novoIcone, setNovoIcone] = useState('devices');

  const handleSalvarItem = (e: React.FormEvent) => {
    e.preventDefault();
    const precoNum = parseFloat(novoPreco.replace(',', '.')) || 0;
    if (!novoNome.trim() || precoNum <= 0) return;

    addItemEquivalencia({
      empresaId: state.empresa.id,
      nome: novoNome.trim(),
      subtitulo: novoSubtitulo.trim() || 'Ativo Personalizado da Empresa',
      precoReferencia: precoNum,
      categoriaObjeto: novaCategoria,
      icone: novoIcone,
    });

    setNovoNome('');
    setNovoPreco('');
    setNovoSubtitulo('');
    setIsModalOpen(false);
  };

  const itensFiltrados = state.itensEquivalencia.filter((item) => {
    if (catalogoTab === 'standard') return item.empresaId === null;
    if (catalogoTab === 'custom') return item.empresaId !== null;
    return true;
  });

  // Cálculos dinâmicos em tempo real para a simulação
  const previewDespesasQty = activeExpenseItem
    ? formatEquivalenceValue(metricas.despesaTotal / activeExpenseItem.precoReferencia)
    : '—';

  const previewLucroQty = activeProfitItem
    ? formatEquivalenceValue(metricas.lucroLiquido / activeProfitItem.precoReferencia)
    : '—';

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 pb-2">
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container-high text-primary font-bold tracking-wider uppercase">
              RF09 • RF10 • RF11 • RF12
            </span>
            <span className="font-mono text-xs text-on-surface-variant flex items-center gap-1.5 font-bold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true"></span>
              MOTOR DE TANGIBILIZAÇÃO
            </span>
          </div>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            Configurador de Equivalências do Mundo Real
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Traduza o fluxo financeiro da sua empresa em objetos tangíveis e compreensíveis (RF09 - RF12).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-container text-on-primary-container text-xs font-bold hover:bg-primary transition-all shadow-md active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              add_circle
            </span>
            <span>+ Cadastrar Item Próprio da Empresa (RF11)</span>
          </button>
        </div>
      </section>

      {/* RF10: Active Equivalence Pair + Live Simulation Bento */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Card 1: Active Unit for Expenses */}
        <div className="xl:col-span-4 rounded-xl bg-surface-container-low p-6 flex flex-col justify-between shadow-sm border border-surface-container-high/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-error/80 to-error/20" aria-hidden="true"></div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono text-[11px] font-bold text-error uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  trending_down
                </span>
                RF10 • EQUIVALÊNCIA ATIVA PARA DESPESAS
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-bold">
                PADRÃO GERAL
              </span>
            </div>

            {activeExpenseItem && (
              <div className="flex items-start gap-4 mt-3">
                <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-error">
                  <span className="material-symbols-outlined text-[32px]" aria-hidden="true">
                    {activeExpenseItem.icone || 'smartphone'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-headline text-base font-bold text-on-surface truncate">
                    {activeExpenseItem.nome}
                  </span>
                  <span className="text-xs text-on-surface-variant">Preço unitário de baliza</span>
                  <span className="font-mono text-xl font-bold text-on-surface mt-0.5">
                    {formatCurrency(activeExpenseItem.precoReferencia)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-2">
            <label className="text-xs text-on-surface-variant block mb-1 font-medium" htmlFor="select-expense-unit">
              Alterar unidade métrica de despesa:
            </label>
            <div className="relative">
              <select
                id="select-expense-unit"
                value={activeExpenseItem?.id || ''}
                onChange={(e) => setConfigEquivalencia(e.target.value, 'DESPESA')}
                className="w-full bg-surface-container-lowest text-on-surface text-xs px-3 py-2.5 rounded-lg border border-surface-container-high appearance-none cursor-pointer pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {state.itensEquivalencia.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome} ({formatCurrency(item.precoReferencia)})
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]" aria-hidden="true">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Unit for Profit */}
        <div className="xl:col-span-4 rounded-xl bg-surface-container-low p-6 flex flex-col justify-between shadow-sm border border-surface-container-high/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container to-primary/40" aria-hidden="true"></div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  trending_up
                </span>
                RF10 • EQUIVALÊNCIA ATIVA PARA LUCRO
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-bold">
                PADRÃO GERAL
              </span>
            </div>

            {activeProfitItem && (
              <div className="flex items-start gap-4 mt-3">
                <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary">
                  <span className="material-symbols-outlined text-[32px]" aria-hidden="true">
                    {activeProfitItem.icone || 'laptop_mac'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-headline text-base font-bold text-on-surface truncate">
                    {activeProfitItem.nome}
                  </span>
                  <span className="text-xs text-on-surface-variant">Preço unitário de baliza</span>
                  <span className="font-mono text-xl font-bold text-on-surface mt-0.5">
                    {formatCurrency(activeProfitItem.precoReferencia)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-2">
            <label className="text-xs text-on-surface-variant block mb-1 font-medium" htmlFor="select-profit-unit">
              Alterar unidade métrica de lucro:
            </label>
            <div className="relative">
              <select
                id="select-profit-unit"
                value={activeProfitItem?.id || ''}
                onChange={(e) => setConfigEquivalencia(e.target.value, 'LUCRO')}
                className="w-full bg-surface-container-lowest text-on-surface text-xs px-3 py-2.5 rounded-lg border border-surface-container-high appearance-none cursor-pointer pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {state.itensEquivalencia.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome} ({formatCurrency(item.precoReferencia)})
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]" aria-hidden="true">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Preview Dynamic Panel (RF10/RF12 Live Synthesis) */}
        <div className="xl:col-span-4 rounded-xl bg-surface-container p-6 flex flex-col justify-between shadow-md border border-surface-container-high relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]" aria-hidden="true">
                auto_awesome
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-secondary">
                Pré-visualização Dinâmica
              </span>
            </div>
            <span className="font-mono text-[10px] text-on-surface-variant">
              Mês Vigente
            </span>
          </div>

          <div className="py-4 flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-error" aria-hidden="true"></div>
                <span className="text-xs text-on-surface-variant">Despesas:</span>
                <span className="font-mono text-xs font-bold text-on-surface">
                  {formatCurrency(metricas.despesaTotal)}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-sm font-bold text-error">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  arrow_right_alt
                </span>
                <span>{previewDespesasQty} {activeExpenseItem?.nome.split(' ')[0] || 'Unid.'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" aria-hidden="true"></div>
                <span className="text-xs text-on-surface-variant">Lucro:</span>
                <span className="font-mono text-xs font-bold text-on-surface">
                  {formatCurrency(metricas.lucroLiquido)}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-sm font-bold text-primary">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  arrow_right_alt
                </span>
                <span>{previewLucroQty} {activeProfitItem?.nome.split(' ')[0] || 'Unid.'}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-on-surface-variant text-xs bg-surface-container-low px-3 py-1.5 rounded border border-surface-container-high/40">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-tertiary" aria-hidden="true">
                info
              </span>
              Impacto no Painel Executivo
            </span>
            <span className="font-mono text-[10px] text-primary font-bold">
              SINCRONIZADO
            </span>
          </div>
        </div>
      </section>

      {/* RF09 & RF11: Catalog Section */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-surface-container-high/40">
          <div className="flex items-center p-1 rounded-lg bg-surface-container-low border border-surface-container-high/60">
            <button
              type="button"
              onClick={() => setCatalogoTab('all')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                catalogoTab === 'all'
                  ? 'bg-surface-container text-on-surface font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Todos os Itens ({state.itensEquivalencia.length})
            </button>
            <button
              type="button"
              onClick={() => setCatalogoTab('standard')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                catalogoTab === 'standard'
                  ? 'bg-surface-container text-on-surface font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Catálogo Padrão (RF09)
            </button>
            <button
              type="button"
              onClick={() => setCatalogoTab('custom')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                catalogoTab === 'custom'
                  ? 'bg-surface-container text-on-surface font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Personalizados da Empresa (RF11)
            </button>
          </div>

          <div className="flex items-center gap-1 text-on-surface-variant text-xs">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              sync
            </span>
            <span>Atualização cambial diária automática</span>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itensFiltrados.map((item) => {
            const isDespesaAtiva = activeExpenseItem?.id === item.id;
            const isLucroAtivo = activeProfitItem?.id === item.id;
            const isCustom = item.empresaId !== null;

            return (
              <article
                key={item.id}
                className="rounded-xl bg-surface-container-low p-5 flex flex-col justify-between shadow-sm border border-surface-container-high/60 hover:bg-surface-container/60 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface uppercase font-bold">
                      {isCustom ? 'PERSONALIZADO (SUA EMPRESA)' : 'PADRÃO DO SISTEMA'}
                    </span>
                    {isDespesaAtiva && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-error/20 text-error flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-error" aria-hidden="true"></span>
                        EM USO: DESPESAS
                      </span>
                    )}
                    {isLucroAtivo && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true"></span>
                        EM USO: LUCRO
                      </span>
                    )}
                    {isCustom && !isDespesaAtiva && !isLucroAtivo && (
                      <button
                        type="button"
                        onClick={() => deleteItemEquivalencia(item.id)}
                        className="text-error/80 hover:text-error transition-colors p-1"
                        title="Excluir item próprio"
                        aria-label={`Excluir item ${item.nome}`}
                      >
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                          delete
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shrink-0 border border-surface-container-high/40">
                      <span className="material-symbols-outlined text-[26px]" aria-hidden="true">
                        {item.icone || 'devices'}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-headline text-sm font-semibold text-on-surface truncate">
                        {item.nome}
                      </h3>
                      {item.subtitulo && (
                        <span className="text-[11px] text-on-surface-variant truncate">
                          {item.subtitulo}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 p-2.5 px-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/40 flex items-baseline justify-between">
                    <span className="text-xs text-on-surface-variant">Preço de Referência:</span>
                    <span className="font-mono text-sm font-bold text-on-surface">
                      {formatCurrency(item.precoReferencia)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center gap-2 border-t border-surface-container-high/40">
                  <button
                    type="button"
                    onClick={() => setConfigEquivalencia(item.id, 'DESPESA')}
                    className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-error ${
                      isDespesaAtiva
                        ? 'bg-error text-on-error font-bold'
                        : 'bg-surface-container-high text-on-surface hover:bg-error/20 hover:text-error'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      {isDespesaAtiva ? 'check_circle' : 'trending_down'}
                    </span>
                    <span>{isDespesaAtiva ? 'Ativo Despesa' : 'Definir Despesa'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfigEquivalencia(item.id, 'LUCRO')}
                    className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary ${
                      isLucroAtivo
                        ? 'bg-primary-container text-on-primary-container font-bold'
                        : 'bg-surface-container-high text-on-surface hover:bg-primary/20 hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      {isLucroAtivo ? 'check_circle' : 'trending_up'}
                    </span>
                    <span>{isLucroAtivo ? 'Ativo Lucro' : 'Definir Lucro'}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Modal Cadastro de Item Próprio (RF11) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSalvarItem}
            className="w-full max-w-md bg-surface-container rounded-2xl p-6 shadow-2xl border border-surface-container-high flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <h2 className="font-headline text-base font-bold text-on-surface">
                Novo Item de Equivalência Próprio (RF11)
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Nome do Objeto / Unidade *
              </label>
              <input
                type="text"
                placeholder="Ex: Hora de Consultoria Sênior, Máquina Laser..."
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                required
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Preço de Referência Unitário (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 5000,00"
                value={novoPreco}
                onChange={(e) => setNovoPreco(e.target.value)}
                required
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Descrição ou Referência (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Custo médio de mercado de hardware industrial"
                value={novoSubtitulo}
                onChange={(e) => setNovoSubtitulo(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Categoria &amp; Ícone
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  className="px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Equipamentos">Equipamentos</option>
                  <option value="Eletrônicos">Eletrônicos</option>
                  <option value="Serviços">Serviços</option>
                  <option value="Alimentação">Alimentação</option>
                  <option value="Veículos">Veículos</option>
                </select>

                <select
                  value={novoIcone}
                  onChange={(e) => setNovoIcone(e.target.value)}
                  className="px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="devices">devices</option>
                  <option value="laptop_mac">laptop_mac</option>
                  <option value="smartphone">smartphone</option>
                  <option value="coffee_maker">coffee_maker</option>
                  <option value="dns">dns</option>
                  <option value="commute">commute</option>
                  <option value="precision_manufacturing">precision_manufacturing</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-container text-on-primary-container hover:bg-primary cursor-pointer"
              >
                Salvar Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
