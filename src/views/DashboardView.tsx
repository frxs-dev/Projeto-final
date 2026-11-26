import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatEquivalence } from '../services/equivalenceEngine';
import { AccessibleChartTable, ChartDataPoint } from '../components/common/AccessibleChartTable';
import { NovoLancamentoModal } from '../components/modals/NovoLancamentoModal';

export const DashboardView: React.FC = () => {
  const {
    state,
    metricas,
    activeExpenseItem,
    activeProfitItem,
    setCurrentView,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dados semestrais para o gráfico e tabela acessível (RF16)
  const chartData: ChartDataPoint[] = [
    { mes: 'Jun', receita: 105000, despesa: 55000, lucro: 50000, equivalenciaTexto: '6,6 un' },
    { mes: 'Jul', receita: 115000, despesa: 60000, lucro: 55000, equivalenciaTexto: '7,3 un' },
    { mes: 'Ago', receita: 125000, despesa: 65000, lucro: 60000, equivalenciaTexto: '8,0 un' },
    { mes: 'Set', receita: 120000, despesa: 45000, lucro: 75000, equivalenciaTexto: '10,0 un' },
    { mes: 'Out', receita: 135000, despesa: 52000, lucro: 83000, equivalenciaTexto: '11,0 un' },
    {
      mes: 'Nov',
      receita: metricas.receitaTotal,
      despesa: metricas.despesaTotal,
      lucro: metricas.lucroLiquido,
      equivalenciaTexto: activeProfitItem ? `${(metricas.lucroLiquido / activeProfitItem.precoReferencia).toFixed(1)} un` : '12,6 un',
      isCurrent: true,
    },
  ];

  // Cálculo de meta tangível
  const precoNotebook = activeProfitItem?.precoReferencia || 11200;
  const unidadesAtingidas = metricas.lucroLiquido / precoNotebook;
  const percentualMeta = Math.min(100, Math.round((unidadesAtingidas / state.metaLucroUnidades) * 1000) / 10);

  // Últimos lançamentos para a tabela resumida
  const ultimosLancamentos = state.lancamentos.slice(0, 5);
  const catMap = new Map(state.categorias.map((c) => [c.id, c.nome]));
  const contaMap = new Map(state.contas.map((c) => [c.id, c.nome]));

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Top Bar: Filtro de Período & Ação Rápida */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Seletor de Período */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl shadow-sm border border-surface-container-high/40">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-high text-primary text-sm font-semibold transition-all"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                calendar_today
              </span>
              <span>Novembro de 2026</span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant" aria-hidden="true">
                expand_more
              </span>
            </button>
            <div className="hidden sm:flex items-center">
              <button type="button" className="px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface text-xs transition-colors">
                30 dias
              </button>
              <button type="button" className="px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface text-xs transition-colors">
                Trimestre
              </button>
              <button type="button" className="px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface text-xs transition-colors">
                Ano 2026
              </button>
            </div>
          </div>

          {/* Quick Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low text-on-surface-variant border border-surface-container-high/40">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true"></span>
            <span className="text-xs text-on-surface">
              {state.empresa.nome.split(' ')[0]}:{' '}
              <strong className="text-primary font-semibold">Saúde Financeira A+</strong>
            </span>
            <span className="font-mono text-[10px] text-on-surface-variant ml-1 font-bold">
              FECHAMENTO D-2
            </span>
          </div>
        </div>

        {/* Quick Action: Registrar Lançamento (RNF05) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-sm font-bold shadow-md hover:bg-primary transition-all active:scale-98 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              add_circle
            </span>
            <span>+ Novo Lançamento</span>
            <span className="text-on-primary-container/80 font-normal text-xs hidden xl:inline">
              (3 passos rápidos)
            </span>
          </button>
        </div>
      </div>

      {/* Grid de 4 Cards de KPI com Equivalências Tangíveis (RF08, RF12) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {/* KPI 1: Receita Total */}
        <div className="bg-surface-container-low rounded-xl p-4 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Receita Bruta Total
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                trending_up
              </span>
              +14.2%
            </span>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-on-surface tracking-tight mb-2">
              {formatCurrency(metricas.receitaTotal)}
            </div>
            {/* Tangible Conversion */}
            <div className="bg-surface-container rounded-lg p-2 flex items-center justify-between gap-2 border border-surface-container-high/40">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-tertiary text-[16px]" aria-hidden="true">
                  devices
                </span>
                <span className="text-xs text-on-surface-variant">Equivalência:</span>
              </div>
              <span className="font-mono text-xs font-semibold text-tertiary">
                {formatEquivalence(metricas.receitaTotal, activeExpenseItem)}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-1 text-right">
            <span className="text-[11px] text-on-surface-variant">
              ou ≈ {Math.round(metricas.receitaTotal / 1412)} Salários Mínimos
            </span>
          </div>
        </div>

        {/* KPI 2: Despesas Operacionais */}
        <div className="bg-surface-container-low rounded-xl p-4 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Despesas Operacionais
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                arrow_downward
              </span>
              -5.0%
            </span>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-on-surface tracking-tight mb-2">
              {formatCurrency(metricas.despesaTotal)}
            </div>
            {/* Tangible Conversion */}
            <div className="bg-surface-container rounded-lg p-2 flex items-center justify-between gap-2 border border-surface-container-high/40">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-tertiary text-[16px]" aria-hidden="true">
                  devices
                </span>
                <span className="text-xs text-on-surface-variant">Equivalência:</span>
              </div>
              <span className="font-mono text-xs font-semibold text-tertiary">
                {formatEquivalence(metricas.despesaTotal, activeExpenseItem)}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-1 text-right">
            <span className="text-[11px] text-on-surface-variant">
              ou ≈ {Math.round(metricas.despesaTotal / 850)} Cestas Básicas Corp/mês
            </span>
          </div>
        </div>

        {/* KPI 3: Lucro Líquido Real */}
        <div className="bg-surface-container-low rounded-xl p-4 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Lucro Líquido Real
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                verified
              </span>
              {metricas.margemLucro}% margem
            </span>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-primary tracking-tight mb-2">
              {formatCurrency(metricas.lucroLiquido)}
            </div>
            {/* Tangible Conversion */}
            <div className="bg-surface-container rounded-lg p-2 flex items-center justify-between gap-2 border border-surface-container-high/40">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-tertiary text-[16px]" aria-hidden="true">
                  laptop_mac
                </span>
                <span className="text-xs text-on-surface-variant">Equivalência:</span>
              </div>
              <span className="font-mono text-xs font-semibold text-tertiary">
                {formatEquivalence(metricas.lucroLiquido, activeProfitItem)}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-1 text-right">
            <span className="text-[11px] text-primary font-medium">
              +28% vs. Mês Anterior
            </span>
          </div>
        </div>

        {/* KPI 4: Saldo Consolidado */}
        <div className="bg-surface-container-low rounded-xl p-4 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Saldo Consolidado
            </span>
            <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded font-bold">
              {state.contas.filter((c) => c.ativa).length} CONTAS
            </span>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-on-surface tracking-tight mb-2">
              {formatCurrency(metricas.saldoConsolidado)}
            </div>
            <div className="grid grid-cols-3 gap-1 bg-surface-container rounded-lg p-1.5 text-center text-xs border border-surface-container-high/40">
              <div>
                <div className="text-on-surface-variant text-[10px]">Itaú</div>
                <div className="font-mono text-xs font-semibold text-on-surface">140k</div>
              </div>
              <div className="border-x border-surface-container-high">
                <div className="text-on-surface-variant text-[10px]">Nubank</div>
                <div className="font-mono text-xs font-semibold text-on-surface">65k</div>
              </div>
              <div>
                <div className="text-on-surface-variant text-[10px]">Caixa</div>
                <div className="font-mono text-xs font-semibold text-on-surface">13,4k</div>
              </div>
            </div>
          </div>
          <div className="mt-2 pt-1 text-right">
            <span className="text-[11px] text-on-surface-variant">
              Capacidade: {metricas.runwayMeses} meses de Runway
            </span>
          </div>
        </div>
      </div>

      {/* Highlight Banner: Equivalências em Foco (Metodologia Tangível RF10/RF12) */}
      <div className="relative bg-surface-container-low rounded-2xl p-6 mb-6 shadow-sm border border-surface-container-high/60 overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="w-12 h-12 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[26px]" aria-hidden="true">
                scale
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-headline text-lg font-bold text-on-surface">
                  Equivalências Tangíveis em Foco
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-tertiary/10 text-tertiary rounded font-bold">
                  SISTEMA ATIVO
                </span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Seus números traduzidos em valor palpável. Despesas mapeadas no referencial{' '}
                <strong className="text-on-surface font-semibold">
                  {activeExpenseItem?.nome || 'iPhone 16 Pro'} ({formatCurrency(activeExpenseItem?.precoReferencia || 7500)})
                </strong>{' '}
                e Lucro consolidado no ativo{' '}
                <strong className="text-on-surface font-semibold">
                  {activeProfitItem?.nome || 'Notebook Dell XPS'} ({formatCurrency(activeProfitItem?.precoReferencia || 11200)})
                </strong>.
              </p>
            </div>
          </div>

          {/* Goal Progress in Real Tangibles */}
          <div className="flex flex-col bg-surface-container p-4 rounded-xl min-w-[300px] border border-surface-container-high/40 shadow-sm">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-xs font-medium text-on-surface">Meta Mensal de Lucro:</span>
              <span className="font-mono text-xs font-bold text-primary">
                {state.metaLucroUnidades} {activeProfitItem?.nome ? activeProfitItem.nome.split(' ')[0] + 's' : 'Notebooks'}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden mb-1.5">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${percentualMeta}%` }}
              />
            </div>
            <div className="flex items-center justify-between font-mono text-xs text-on-surface-variant">
              <span>Atingido: {unidadesAtingidas.toFixed(1)} / {state.metaLucroUnidades} Unid.</span>
              <span className="text-primary font-bold">{percentualMeta}% Concluído</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Analítico: Gráfico & Tabela (RF16) + Diagnóstico IA (RF13) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Fluxo de Caixa e Evolução (8 colunas) */}
        <div className="lg:col-span-8 bg-surface-container-low rounded-2xl p-6 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <AccessibleChartTable
            data={chartData}
            title="Fluxo de Caixa & Evolução Mensal"
            subtitle="Visão comparativa de Receita, Custo e Margem Líquida acumulada em 2026"
            unitLabel={activeExpenseItem?.nome || 'iPhones'}
          />
        </div>

        {/* Diagnóstico IA Finance & Conversões Rápidas (4 colunas) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-surface-container-low rounded-2xl p-6 shadow-sm border border-surface-container-high/60 flex flex-col justify-between h-full relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      auto_awesome
                    </span>
                  </div>
                  <span className="font-headline text-sm font-bold text-on-surface">
                    Diagnóstico IA Finance
                  </span>
                </div>
                <span className="font-mono text-[10px] text-secondary bg-secondary/10 px-2 py-0.5 rounded font-bold">
                  CONFIÁVEL
                </span>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                A TechCorp reduziu em <strong className="text-on-surface">5% os custos operacionais</strong> com a migração para instâncias em nuvem reservadas, gerando economia equivalente a <strong className="text-tertiary">1,8 iPhones adicionais</strong> para reinvestimento em P&amp;D.
              </p>

              {/* Dynamic Conversion Pill Box */}
              <div className="bg-surface-container rounded-xl p-3 flex flex-col gap-2 mb-4 border border-surface-container-high/40">
                <span className="font-mono text-[10px] uppercase font-bold text-on-surface-variant">
                  Equivalente no Cotidiano Empresarial
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface">1 Folha Dev Jr:</span>
                  <span className="font-mono font-semibold text-primary">R$ 5.200 (0,7 iPhones)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface">Licenças Software SaaS:</span>
                  <span className="font-mono font-semibold text-on-surface">R$ 3.800 (0,5 iPhones)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface">Aluguel Sede Física:</span>
                  <span className="font-mono font-semibold text-on-surface">R$ 8.900 (1,2 iPhones)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView('relatorios-ia')}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 border border-surface-container-high cursor-pointer"
            >
              <span>Ver Relatório de Eficiência Completo</span>
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Lançamentos Recentes com Unidades Tangíveis (RF08, RF12) */}
      <div className="bg-surface-container-low rounded-2xl p-6 shadow-sm border border-surface-container-high/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">
                receipt_long
              </span>
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Últimas Movimentações Registradas
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant">
              Lançamentos recentes com tradução automática em equivalências do mundo real (RF12)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('lancamentos')}
            className="text-primary hover:underline text-xs font-semibold flex items-center gap-1"
          >
            <span>Ver todos os lançamentos</span>
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              arrow_forward
            </span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm" aria-label="Tabela de Lançamentos Recentes">
            <thead>
              <tr className="bg-surface-container-high/60 text-on-surface-variant font-mono text-[11px] uppercase">
                <th scope="col" className="py-2.5 px-3">Data</th>
                <th scope="col" className="py-2.5 px-3">Tipo</th>
                <th scope="col" className="py-2.5 px-3">Descrição</th>
                <th scope="col" className="py-2.5 px-3">Categoria</th>
                <th scope="col" className="py-2.5 px-3">Conta</th>
                <th scope="col" className="py-2.5 px-3 text-right">Valor (R$)</th>
                <th scope="col" className="py-2.5 px-3 text-right">Equivalência Tangível</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-xs">
              {ultimosLancamentos.map((item) => {
                const dataBR = item.data.split('-').reverse().join('/');
                const catNome = catMap.get(item.categoriaId) || 'Geral';
                const contaNome = contaMap.get(item.contaId) || 'Conta Corrente';
                const itemRef = item.tipo === 'DESPESA' ? activeExpenseItem : activeProfitItem;
                const equivTexto = formatEquivalence(item.valor, itemRef);

                return (
                  <tr key={item.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-3 px-3 font-mono text-on-surface-variant whitespace-nowrap">
                      {dataBR}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
                          item.tipo === 'RECEITA'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-error/10 text-error'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]" aria-hidden="true">
                          {item.tipo === 'RECEITA' ? 'arrow_downward' : 'arrow_upward'}
                        </span>
                        {item.tipo === 'RECEITA' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-on-surface">
                      {item.descricao}
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant whitespace-nowrap">
                      <span className="px-2 py-1 rounded bg-surface-container text-xs">
                        {catNome}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant whitespace-nowrap">
                      {contaNome}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${
                        item.tipo === 'RECEITA' ? 'text-primary' : 'text-error'
                      }`}
                    >
                      {item.tipo === 'RECEITA' ? '+' : '-'} {formatCurrency(item.valor)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-tertiary bg-surface-container px-2 py-0.5 rounded font-semibold">
                        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                          devices
                        </span>
                        {equivTexto}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registro de Novo Lançamento (RF05, RNF05) */}
      <NovoLancamentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
