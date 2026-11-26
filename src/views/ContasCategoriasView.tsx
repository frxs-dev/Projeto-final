import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TipoConta, TipoCategoria } from '../types';
import { formatCurrency } from '../services/equivalenceEngine';

export const ContasCategoriasView: React.FC = () => {
  const {
    state,
    addConta,
    toggleContaAtiva,
    addCategoria,
    toggleCategoriaAtiva,
  } = useApp();

  // Estados dos formulários de nova conta e nova categoria
  const [isNovaContaOpen, setIsNovaContaOpen] = useState(false);
  const [nomeConta, setNomeConta] = useState('');
  const [tipoConta, setTipoConta] = useState<TipoConta>('BANCO');
  const [saldoInicialConta, setSaldoInicialConta] = useState('');
  const [instituicaoConta, setInstituicaoConta] = useState('');

  const [isNovaCategoriaOpen, setIsNovaCategoriaOpen] = useState(false);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [tipoCategoria, setTipoCategoria] = useState<TipoCategoria>('DESPESA');
  const [filtroTabCategoria, setFiltroTabCategoria] = useState<'todas' | 'RECEITA' | 'DESPESA'>('todas');

  const handleSalvarConta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeConta.trim()) return;

    addConta({
      empresaId: state.empresa.id,
      nome: nomeConta.trim(),
      tipo: tipoConta,
      instituicao: instituicaoConta.trim() || undefined,
      saldoInicial: parseFloat(saldoInicialConta.replace(',', '.')) || 0,
      ativa: true,
    });

    setNomeConta('');
    setSaldoInicialConta('');
    setInstituicaoConta('');
    setIsNovaContaOpen(false);
  };

  const handleSalvarCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCategoria.trim()) return;

    addCategoria({
      empresaId: state.empresa.id,
      nome: nomeCategoria.trim(),
      tipo: tipoCategoria,
      cor: tipoCategoria === 'RECEITA' ? '#00e599' : '#f43f5e',
      icone: tipoCategoria === 'RECEITA' ? 'payments' : 'receipt',
      ativa: true,
    });

    setNomeCategoria('');
    setIsNovaCategoriaOpen(false);
  };

  const categoriasFiltradas = state.categorias.filter((c) => {
    if (filtroTabCategoria === 'todas') return true;
    return c.tipo === filtroTabCategoria;
  });

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Header */}
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-low p-6 rounded-xl shadow-md border border-surface-container-high/60">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-on-surface-variant font-mono text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">
              account_balance
            </span>
            <span>Estrutura Cadastral</span>
            <span>•</span>
            <span className="text-primary font-bold">RF03 • RF04</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
            Contas &amp; Categorias
          </h1>
          <p className="text-xs text-on-surface-variant">
            Gerenciamento de contas correntes, caixas físicos, cartões e plano de contas por categoria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsNovaContaOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-container hover:bg-primary text-on-primary-container text-xs font-bold rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              add_circle
            </span>
            <span>+ Nova Conta (RF03)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNovaCategoriaOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold rounded-lg border border-surface-container-high cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              category
            </span>
            <span>+ Nova Categoria (RF04)</span>
          </button>
        </div>
      </section>

      {/* SEÇÃO 1: CONTAS FINANCEIRAS (RF03) */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">
              Contas Financeiras ({state.contas.length})
            </h2>
            <p className="text-xs text-on-surface-variant">
              Contas ativas e inativas disponíveis para movimentação
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {state.contas.map((conta) => {
            // Calcula o saldo atual dinamicamente a partir dos lançamentos da conta
            const entradas = state.lancamentos
              .filter((l) => l.contaId === conta.id && l.tipo === 'RECEITA')
              .reduce((acc, l) => acc + l.valor, 0);
            const saidas = state.lancamentos
              .filter((l) => l.contaId === conta.id && l.tipo === 'DESPESA')
              .reduce((acc, l) => acc + l.valor, 0);
            const saldoAtual = conta.saldoInicial + entradas - saidas;

            return (
              <div
                key={conta.id}
                className={`bg-surface-container-low rounded-xl p-5 border flex flex-col justify-between transition-all ${
                  conta.ativa
                    ? 'border-surface-container-high/60 shadow-sm'
                    : 'border-surface-container-high/30 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                      {conta.tipo}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleContaAtiva(conta.id)}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        conta.ativa
                          ? 'bg-primary/10 text-primary hover:bg-primary/20'
                          : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                      }`}
                      title="Alternar ativação da conta"
                    >
                      {conta.ativa ? 'ATIVA' : 'INATIVA'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                        {conta.tipo === 'CARTAO'
                          ? 'credit_card'
                          : conta.tipo === 'CAIXA'
                          ? 'payments'
                          : 'account_balance'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline text-sm font-semibold text-on-surface">
                        {conta.nome}
                      </h3>
                      {conta.instituicao && (
                        <span className="text-[11px] text-on-surface-variant">
                          {conta.instituicao}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 p-2 rounded-lg bg-surface-container-lowest border border-surface-container-high/40">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                      Saldo Consolidado:
                    </span>
                    <span className="font-mono text-base font-bold text-primary">
                      {formatCurrency(saldoAtual)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[10px] font-mono text-on-surface-variant border-t border-surface-container-high/40 flex justify-between">
                  <span>Saldo Inicial:</span>
                  <span>{formatCurrency(conta.saldoInicial)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SEÇÃO 2: CATEGORIAS CONTÁBEIS (RF04) */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">
              Categorias de Receita &amp; Despesa ({state.categorias.length})
            </h2>
            <p className="text-xs text-on-surface-variant">
              Classificação contábil com agrupamento para inteligência artificial
            </p>
          </div>

          <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg border border-surface-container-high/60">
            <button
              type="button"
              onClick={() => setFiltroTabCategoria('todas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filtroTabCategoria === 'todas'
                  ? 'bg-surface-container-high text-on-surface font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Todas ({state.categorias.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroTabCategoria('RECEITA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                filtroTabCategoria === 'RECEITA'
                  ? 'bg-surface-container-high text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true"></span>
              <span>Receitas</span>
            </button>
            <button
              type="button"
              onClick={() => setFiltroTabCategoria('DESPESA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                filtroTabCategoria === 'DESPESA'
                  ? 'bg-surface-container-high text-error font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-error" aria-hidden="true"></span>
              <span>Despesas</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoriasFiltradas.map((cat) => {
            const qtdLancamentos = state.lancamentos.filter((l) => l.categoriaId === cat.id).length;

            return (
              <div
                key={cat.id}
                className={`p-4 rounded-xl bg-surface-container-low border flex items-center justify-between transition-all ${
                  cat.ativa
                    ? 'border-surface-container-high/60 shadow-sm'
                    : 'border-surface-container-high/30 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      cat.tipo === 'RECEITA' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      {cat.tipo === 'RECEITA' ? 'trending_up' : 'trending_down'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-on-surface">
                      {cat.nome}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {cat.tipo === 'RECEITA' ? 'Receita' : 'Despesa'} • {qtdLancamentos} lançamentos
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleCategoriaAtiva(cat.id)}
                  className={`text-[10px] font-mono font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                    cat.ativa
                      ? 'bg-primary/10 text-primary hover:bg-primary/20'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                  }`}
                  title="Alternar ativação da categoria"
                >
                  {cat.ativa ? 'ATIVA' : 'INATIVA'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal Nova Conta */}
      {isNovaContaOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSalvarConta}
            className="w-full max-w-md bg-surface-container rounded-2xl p-6 shadow-2xl border border-surface-container-high flex flex-col gap-4"
          >
            <h2 className="font-headline text-base font-bold text-on-surface">
              Cadastrar Nova Conta Financeira (RF03)
            </h2>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Nome da Conta *
              </label>
              <input
                type="text"
                placeholder="Ex: Santander PJ, Caixa Loja 1..."
                value={nomeConta}
                onChange={(e) => setNomeConta(e.target.value)}
                required
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Tipo de Conta *
              </label>
              <select
                value={tipoConta}
                onChange={(e) => setTipoConta(e.target.value as TipoConta)}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="BANCO">Banco / Conta Corrente</option>
                <option value="CAIXA">Caixa Operacional / Físico</option>
                <option value="CARTAO">Cartão de Crédito Corporativo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Instituição Financeira (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Banco Itaú, Nubank..."
                value={instituicaoConta}
                onChange={(e) => setInstituicaoConta(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Saldo Inicial (R$)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={saldoInicialConta}
                onChange={(e) => setSaldoInicialConta(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setIsNovaContaOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-container text-on-primary-container hover:bg-primary cursor-pointer"
              >
                Salvar Conta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Nova Categoria */}
      {isNovaCategoriaOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSalvarCategoria}
            className="w-full max-w-md bg-surface-container rounded-2xl p-6 shadow-2xl border border-surface-container-high flex flex-col gap-4"
          >
            <h2 className="font-headline text-base font-bold text-on-surface">
              Cadastrar Nova Categoria (RF04)
            </h2>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Nome da Categoria *
              </label>
              <input
                type="text"
                placeholder="Ex: Treinamento & Cursos, Manutenção..."
                value={nomeCategoria}
                onChange={(e) => setNomeCategoria(e.target.value)}
                required
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Tipo *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoCategoria('RECEITA')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    tipoCategoria === 'RECEITA'
                      ? 'bg-primary-container text-on-primary-container border-primary'
                      : 'bg-surface-container-low text-on-surface-variant border-surface-container-high'
                  }`}
                >
                  Receita
                </button>
                <button
                  type="button"
                  onClick={() => setTipoCategoria('DESPESA')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    tipoCategoria === 'DESPESA'
                      ? 'bg-error-container text-on-error-container border-error'
                      : 'bg-surface-container-low text-on-surface-variant border-surface-container-high'
                  }`}
                >
                  Despesa
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setIsNovaCategoriaOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-container text-on-primary-container hover:bg-primary cursor-pointer"
              >
                Salvar Categoria
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
