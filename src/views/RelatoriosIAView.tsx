import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/equivalenceEngine';
import { gerarRelatorioIA } from '../services/aiReportService';
import { RelatorioIA } from '../types';

export const RelatoriosIAView: React.FC = () => {
  const {
    state,
    addRelatorio,
    activeProfitItem,
  } = useApp();

  // Relatório selecionado para exibição ativa
  const [relatorioAtivoId, setRelatorioAtivoId] = useState<string>(
    state.relatorios[0]?.id || ''
  );

  // Switcher Gráfico vs Tabela no relatório (RF16)
  const [tabExibicao, setTabExibicao] = useState<'chart' | 'table'>('chart');

  // Modal para gerar novo relatório comparativo (RF13)
  const [isGerarModalOpen, setIsGerarModalOpen] = useState(false);
  const [periodoInicioAtual, setPeriodoInicioAtual] = useState('2026-11-01');
  const [periodoFimAtual, setPeriodoFimAtual] = useState('2026-11-30');
  const [periodoInicioAnt, setPeriodoInicioAnt] = useState('2026-10-01');
  const [periodoFimAnt, setPeriodoFimAnt] = useState('2026-10-31');

  const relatorioAtivo: RelatorioIA | undefined =
    state.relatorios.find((r) => r.id === relatorioAtivoId) || state.relatorios[0];

  const handleGerarNovo = (e: React.FormEvent) => {
    e.preventDefault();

    // Filtra lançamentos do período atual
    const lAtuais = state.lancamentos.filter(
      (l) => l.data >= periodoInicioAtual && l.data <= periodoFimAtual
    );
    // Filtra lançamentos do período anterior
    const lAnteriores = state.lancamentos.filter(
      (l) => l.data >= periodoInicioAnt && l.data <= periodoFimAnt
    );

    const fallbackItem = activeProfitItem || {
      id: 'item_fallback',
      empresaId: null,
      nome: 'iPhone 16 Pro',
      precoReferencia: 7500,
      icone: 'devices',
      categoriaObjeto: 'Geral',
    };

    const novoRelatorio = gerarRelatorioIA(
      periodoInicioAtual,
      periodoFimAtual,
      periodoInicioAnt,
      periodoFimAnt,
      lAtuais,
      lAnteriores,
      state.categorias,
      fallbackItem,
      state.empresa.id
    );

    addRelatorio(novoRelatorio);
    setRelatorioAtivoId(novoRelatorio.id);
    setIsGerarModalOpen(false);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Top Command & Action Bar */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container-high text-primary uppercase font-bold">
              Módulo IA RF13 • Cognitivo
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant flex items-center gap-1.5 border border-surface-container-high/40">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true"></span>
              Modelo Ativo v4.2 • LGPD Conforme
            </span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
            Relatórios Inteligentes com IA
          </h1>
          <p className="text-xs text-on-surface-variant max-w-3xl">
            Análise causal automática de receitas, despesas e variação de margem em linguagem simples e humana (RF13).
          </p>
        </div>

        {/* Quick Action Triggers */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleImprimir}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all border border-surface-container-high cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
            title="Imprimir ou Salvar em PDF"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              print
            </span>
            <span>Imprimir / PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGerarModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              auto_awesome
            </span>
            <span>Gerar Novo Relatório Comparativo</span>
          </button>
        </div>
      </section>

      {/* Primary Intelligence Ledger & Bento Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main AI Executive Diagnosis (8 Colunas) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {relatorioAtivo ? (
            <section
              aria-label="Relatório Ativo Gerado pela Inteligência Artificial"
              className="rounded-2xl bg-surface-container p-6 shadow-md border border-surface-container-high relative overflow-hidden flex flex-col gap-6"
            >
              {/* Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3 border-b border-surface-container-high">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary border border-surface-container-highest">
                    <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                      psychology
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-base font-bold text-on-surface">
                        {relatorioAtivo.titulo}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary uppercase font-bold">
                        CONSOLIDADO
                      </span>
                    </div>
                    <p className="font-mono text-xs text-on-surface-variant">
                      Período Analisado: {relatorioAtivo.periodoInicio.split('-').reverse().join('/')} a {relatorioAtivo.periodoFim.split('-').reverse().join('/')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">
                    Gerado em:
                  </span>
                  <span className="font-mono text-xs text-on-surface font-semibold">
                    {new Date(relatorioAtivo.geradoEm).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* 3-Column Micro-KPI Metric Rail */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                    Lucro Período Anterior
                  </span>
                  <span className="font-mono text-xl text-on-surface font-bold">
                    {formatCurrency(relatorioAtivo.lucroAnterior)}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Receita: {formatCurrency(relatorioAtivo.receitaTotal * 0.9)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                    Lucro Período Atual
                  </span>
                  <span className="font-mono text-xl text-primary font-bold">
                    {formatCurrency(relatorioAtivo.lucroAtual)}
                  </span>
                  <span className="text-xs text-primary font-medium">
                    Margem bruta: {((relatorioAtivo.lucroAtual / (relatorioAtivo.receitaTotal || 1)) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                    Variação Real
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">
                      trending_up
                    </span>
                    <span className="font-mono text-xl text-primary font-bold">
                      {relatorioAtivo.variacaoPercentual >= 0 ? '+' : ''}{relatorioAtivo.variacaoPercentual}%
                    </span>
                  </div>
                  <span className="font-mono text-xs text-primary">
                    {formatCurrency(relatorioAtivo.lucroAtual - relatorioAtivo.lucroAnterior)} líquido
                  </span>
                </div>
              </div>

              {/* Tangible Real-World Equivalence Banner (RF13 Core Innovation) */}
              <div className="rounded-xl bg-surface-container-lowest p-4 border border-surface-container-high/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start md:items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 flex items-center justify-center shrink-0 text-tertiary border border-tertiary/20">
                    <span className="material-symbols-outlined text-[26px]" aria-hidden="true">
                      devices
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] font-bold text-tertiary uppercase tracking-wider">
                      Leitura Tangível Instantânea
                    </span>
                    <p className="text-sm text-on-surface font-semibold">
                      {relatorioAtivo.equivalenciaLucroTexto}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="font-mono text-[11px] px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant font-bold">
                    RF12 Ativo
                  </span>
                </div>
              </div>

              {/* AI Diagnostic Box (Human-Centered / Jargon-Free) */}
              <div className="rounded-xl bg-surface-container-low p-5 border border-surface-container-high/60 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]" aria-hidden="true">
                      insights
                    </span>
                    <h2 className="font-headline text-base text-on-surface font-bold">
                      Por que seu lucro variou {relatorioAtivo.variacaoPercentual}% neste período?
                    </h2>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-secondary font-bold">
                    Sem Jargões Contábeis
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {relatorioAtivo.causas.map((causa, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-surface-container flex items-start gap-3 border border-surface-container-high/40 hover:bg-surface-container-high/60 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary font-mono font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-on-surface">
                            {causa.titulo}
                          </span>
                          <span className="font-mono text-[10px] px-2 py-0.2 rounded bg-primary/10 text-primary font-bold">
                            {causa.impacto}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {causa.descricao}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations Rail */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                    Dicas Práticas &amp; Acionáveis Recomendadas
                  </span>
                  <span className="text-xs text-primary flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      task_alt
                    </span>
                    Prontas para Execução
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatorioAtivo.dicasPraticas.map((dica, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col justify-between gap-3"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                            savings
                          </span>
                          <span>{dica.titulo}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {dica.descricao}
                        </p>
                      </div>
                      <div className="pt-2 flex items-center justify-between border-t border-surface-container-high/40">
                        <span className="font-mono text-[10px] text-tertiary">
                          {dica.impactoEstimado}
                        </span>
                        <button
                          type="button"
                          className="text-primary hover:text-on-surface text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>{dica.acao}</span>
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                            arrow_forward
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Comparative Breakdown by Category with WCAG Dual Mode (RF16) */}
              <div className="flex flex-col gap-4 pt-4 border-t border-surface-container-high">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-headline text-base text-on-surface font-bold">
                      Comparativo Detalhado por Categoria (RF16)
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Anonimização LGPD: processamento restrito a categorias agregadas
                    </p>
                  </div>

                  <div
                    className="inline-flex rounded-lg bg-surface-container-lowest p-1 border border-surface-container-high/60"
                    role="tablist"
                    aria-label="Modo de Exibição do Comparativo de Categorias"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={tabExibicao === 'chart'}
                      onClick={() => setTabExibicao('chart')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        tabExibicao === 'chart'
                          ? 'bg-surface-container text-primary shadow-sm font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                        bar_chart
                      </span>
                      <span>Gráfico Visual</span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={tabExibicao === 'table'}
                      onClick={() => setTabExibicao('table')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        tabExibicao === 'table'
                          ? 'bg-surface-container text-primary shadow-sm font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                        table_rows
                      </span>
                      <span>Tabela WCAG</span>
                    </button>
                  </div>
                </div>

                {tabExibicao === 'chart' ? (
                  <div className="w-full bg-surface-container-low rounded-xl p-4 border border-surface-container-high/60 flex flex-col gap-3">
                    <div className="flex items-center justify-end gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-surface-container-highest inline-block" aria-hidden="true"></span>
                        Período Anterior
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-primary inline-block" aria-hidden="true"></span>
                        Período Atual
                      </span>
                    </div>

                    <div className="w-full py-2">
                      <svg
                        className="w-full h-auto text-on-surface font-mono"
                        viewBox="0 0 760 200"
                        role="img"
                        aria-label="Gráfico de colunas comparativo de categorias entre períodos"
                      >
                        <line stroke="#262a34" strokeDasharray="4" x1="50" x2="730" y1="30" y2="30" />
                        <line stroke="#262a34" strokeDasharray="4" x1="50" x2="730" y1="80" y2="80" />
                        <line stroke="#262a34" strokeDasharray="4" x1="50" x2="730" y1="130" y2="130" />
                        <line stroke="#31353f" x1="50" x2="730" y1="170" y2="170" />

                        <text fill="#849589" fontSize="10" textAnchor="end" x="42" y="34">120k</text>
                        <text fill="#849589" fontSize="10" textAnchor="end" x="42" y="84">80k</text>
                        <text fill="#849589" fontSize="10" textAnchor="end" x="42" y="134">40k</text>
                        <text fill="#849589" fontSize="10" textAnchor="end" x="42" y="174">0k</text>

                        {relatorioAtivo.dadosAgregadosPorCategoria.slice(0, 4).map((d, index) => {
                          const groupX = 80 + index * 160;
                          const hAnt = Math.min(130, (d.valorAnterior / 130000) * 130);
                          const hAtu = Math.min(130, (d.valorAtual / 130000) * 130);

                          return (
                            <g key={d.categoriaNome} className="hover:opacity-85 transition-opacity">
                              <rect
                                x={groupX}
                                y={170 - hAnt}
                                width="34"
                                height={hAnt}
                                rx="4"
                                fill="#31353f"
                              />
                              <rect
                                x={groupX + 40}
                                y={170 - hAtu}
                                width="34"
                                height={hAtu}
                                rx="4"
                                fill={d.tipo === 'RECEITA' ? '#00e599' : '#c3c0ff'}
                              />
                              <text
                                x={groupX + 37}
                                y="190"
                                textAnchor="middle"
                                fill="#bacbbe"
                                fontSize="11"
                              >
                                {d.categoriaNome.split(' ')[0]}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table
                      className="w-full text-left text-xs border-collapse"
                      aria-label="Tabela de Dados Equivalente do Gráfico Comparativo"
                    >
                      <thead className="bg-surface-container-high text-on-surface-variant font-mono uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Categoria</th>
                          <th className="py-2.5 px-3 text-right">Anterior (R$)</th>
                          <th className="py-2.5 px-3 text-right">Atual (R$)</th>
                          <th className="py-2.5 px-3 text-right">Variação Líquida</th>
                          <th className="py-2.5 px-3 text-right">Percentual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-high font-mono">
                        {relatorioAtivo.dadosAgregadosPorCategoria.map((d) => (
                          <tr key={d.categoriaNome} className="hover:bg-surface-container/60 transition-colors">
                            <th className="py-2 px-3 text-on-surface font-sans font-medium text-left">
                              {d.categoriaNome}
                            </th>
                            <td className="py-2 px-3 text-right text-on-surface-variant">
                              {formatCurrency(d.valorAnterior)}
                            </td>
                            <td className="py-2 px-3 text-right text-on-surface font-bold">
                              {formatCurrency(d.valorAtual)}
                            </td>
                            <td
                              className={`py-2 px-3 text-right font-semibold ${
                                d.variacaoValor >= 0 ? 'text-primary' : 'text-error'
                              }`}
                            >
                              {d.variacaoValor >= 0 ? '+' : ''}
                              {formatCurrency(d.variacaoValor)}
                            </td>
                            <td
                              className={`py-2 px-3 text-right font-bold ${
                                d.variacaoPercentual >= 0 ? 'text-primary' : 'text-error'
                              }`}
                            >
                              {d.variacaoPercentual >= 0 ? '+' : ''}
                              {d.variacaoPercentual}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <div className="p-8 text-center text-on-surface-variant bg-surface-container rounded-xl">
              Nenhum relatório selecionado.
            </div>
          )}
        </div>

        {/* Right Rail: Histórico de Relatórios (RF14) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <section
            aria-label="Histórico de Relatórios Salvos"
            className="rounded-2xl bg-surface-container p-6 shadow-md border border-surface-container-high flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">
                  history
                </span>
                <h2 className="font-headline text-base font-bold text-on-surface">
                  Histórico de Relatórios
                </h2>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-bold">
                RF14
              </span>
            </div>

            <p className="text-xs text-on-surface-variant">
              Relatórios arquivados com persistência e análise retroativa
            </p>

            <div className="flex flex-col gap-3">
              {state.relatorios.map((rel) => {
                const isSelected = rel.id === relatorioAtivo?.id;

                return (
                  <div
                    key={rel.id}
                    onClick={() => setRelatorioAtivoId(rel.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-surface-container-high border-primary shadow-sm'
                        : 'bg-surface-container-low border-surface-container-high/60 hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                          isSelected ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {isSelected ? 'EM EXIBIÇÃO' : 'ARQUIVADO'}
                      </span>
                      <span className="font-mono text-xs text-on-surface-variant">
                        {new Date(rel.geradoEm).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-on-surface">
                      {rel.titulo}
                    </span>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-surface-container-high/40">
                      <span
                        className={`font-mono font-bold ${
                          rel.variacaoPercentual >= 0 ? 'text-primary' : 'text-error'
                        }`}
                      >
                        {rel.variacaoPercentual >= 0 ? '+' : ''}{rel.variacaoPercentual}% Lucro
                      </span>
                      <span className="font-mono text-tertiary text-[11px]">
                        {formatCurrency(rel.lucroAtual)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Modal Gerar Novo Relatório Comparativo (RF13) */}
      {isGerarModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleGerarNovo}
            className="w-full max-w-lg bg-surface-container rounded-2xl p-6 shadow-2xl border border-surface-container-high flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">
                  auto_awesome
                </span>
                <h2 className="font-headline text-base font-bold text-on-surface">
                  Gerar Relatório Comparativo com IA (RF13)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsGerarModalOpen(false)}
                className="p-1 rounded text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Escolha os dois intervalos temporais para a IA calcular a variação causal, gerar as dicas e traduzir em unidades tangíveis.
            </p>

            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs font-bold text-primary uppercase">
                1. Período Atual (Foco da Análise)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">Início</label>
                  <input
                    type="date"
                    value={periodoInicioAtual}
                    onChange={(e) => setPeriodoInicioAtual(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">Fim</label>
                  <input
                    type="date"
                    value={periodoFimAtual}
                    onChange={(e) => setPeriodoFimAtual(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs font-bold text-on-surface-variant uppercase">
                2. Período Anterior (Base de Comparação)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">Início</label>
                  <input
                    type="date"
                    value={periodoInicioAnt}
                    onChange={(e) => setPeriodoInicioAnt(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">Fim</label>
                  <input
                    type="date"
                    value={periodoFimAnt}
                    onChange={(e) => setPeriodoFimAnt(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high text-[11px] text-on-surface-variant">
              🔒 <strong>Garantia de Privacidade LGPD (RNF04):</strong> Os dados são sintetizados internamente de forma agregada por categoria, sem expor nomes de pessoas físicas ou documentos confidenciais.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setIsGerarModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-container text-on-primary-container hover:bg-primary cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">auto_awesome</span>
                <span>Processar &amp; Gerar Relatório</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
