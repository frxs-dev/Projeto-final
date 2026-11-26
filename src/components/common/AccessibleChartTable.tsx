import React, { useState } from 'react';
import { formatCurrency } from '../../services/equivalenceEngine';

export interface ChartDataPoint {
  mes: string;
  receita: number;
  despesa: number;
  lucro: number;
  equivalenciaTexto: string;
  isCurrent?: boolean;
}

interface AccessibleChartTableProps {
  data: ChartDataPoint[];
  title: string;
  subtitle?: string;
  unitLabel?: string;
}

export const AccessibleChartTable: React.FC<AccessibleChartTableProps> = ({
  data,
  title,
  subtitle,
  unitLabel = 'iPhones',
}) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');

  // Encontra o maior valor para escalar as barras do gráfico SVG
  const maxVal = Math.max(...data.map((d) => Math.max(d.receita, d.despesa)), 150000);

  return (
    <div className="w-full flex flex-col justify-between">
      {/* Header com Switcher de Acessibilidade RF16 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">
              waterfall_chart
            </span>
            <h2 className="font-headline text-lg font-bold text-on-surface">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-on-surface-variant">
              {subtitle}
            </p>
          )}
        </div>

        {/* Switcher Gráfico vs Tabela Acessível (RF16) */}
        <div
          className="inline-flex p-1 bg-surface-container-high rounded-xl self-start sm:self-auto border border-surface-container-high/60"
          role="tablist"
          aria-label="Modo de Visualização dos Dados Financeiros"
        >
          <button
            type="button"
            role="tab"
            id="tab-btn-grafico"
            aria-selected={activeTab === 'chart'}
            aria-controls="view-grafico"
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-primary ${
              activeTab === 'chart'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              bar_chart
            </span>
            <span>Gráfico</span>
          </button>
          <button
            type="button"
            role="tab"
            id="tab-btn-tabela"
            aria-selected={activeTab === 'table'}
            aria-controls="view-tabela"
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-primary ${
              activeTab === 'table'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              table_rows
            </span>
            <span>Tabela Acessível</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Gráfico SVG com ARIA para Leitores de Tela */}
      {activeTab === 'chart' && (
        <div
          id="view-grafico"
          role="tabpanel"
          aria-labelledby="tab-btn-grafico"
          className="w-full flex flex-col"
        >
          <div
            className="w-full h-72 py-2 flex flex-col justify-between"
            role="img"
            aria-label="Gráfico de colunas comparativo de receitas e despesas nos últimos meses de 2026"
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 680 230"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Linhas de Grade de Fundo */}
              <line className="text-outline-variant/30" stroke="currentColor" strokeDasharray="4 4" x1="40" x2="660" y1="20" y2="20" />
              <line className="text-outline-variant/30" stroke="currentColor" strokeDasharray="4 4" x1="40" x2="660" y1="70" y2="70" />
              <line className="text-outline-variant/30" stroke="currentColor" strokeDasharray="4 4" x1="40" x2="660" y1="120" y2="120" />
              <line className="text-outline-variant/30" stroke="currentColor" strokeDasharray="4 4" x1="40" x2="660" y1="170" y2="170" />

              {/* Rótulos do Eixo Y */}
              <text className="text-on-surface-variant font-mono text-[11px]" fill="currentColor" x="5" y="24">150k</text>
              <text className="text-on-surface-variant font-mono text-[11px]" fill="currentColor" x="5" y="74">100k</text>
              <text className="text-on-surface-variant font-mono text-[11px]" fill="currentColor" x="12" y="124">50k</text>
              <text className="text-on-surface-variant font-mono text-[11px]" fill="currentColor" x="25" y="174">0</text>

              {/* Colunas dos Meses */}
              {data.map((item, index) => {
                const groupWidth = 600 / data.length;
                const baseX = 65 + index * groupWidth;
                const hReceita = Math.min(150, (item.receita / maxVal) * 150);
                const hDespesa = Math.min(150, (item.despesa / maxVal) * 150);
                const yReceita = 170 - hReceita;
                const yDespesa = 170 - hDespesa;

                return (
                  <g key={item.mes} className="transition-opacity hover:opacity-80">
                    <title>{`${item.mes}: Receita ${formatCurrency(item.receita)}, Despesa ${formatCurrency(item.despesa)}, Lucro ${formatCurrency(item.lucro)} (${item.equivalenciaTexto})`}</title>
                    {/* Barra Receita */}
                    <rect
                      x={baseX}
                      y={yReceita}
                      width="20"
                      height={hReceita}
                      rx="4"
                      className={item.isCurrent ? "fill-primary" : "fill-primary-container/80"}
                    />
                    {/* Barra Despesa */}
                    <rect
                      x={baseX + 24}
                      y={yDespesa}
                      width="20"
                      height={hDespesa}
                      rx="4"
                      className={item.isCurrent ? "fill-error" : "fill-surface-bright"}
                    />
                    {/* Rótulo Mês */}
                    <text
                      x={baseX + 22}
                      y="195"
                      textAnchor="middle"
                      className={`text-xs ${item.isCurrent ? 'fill-primary font-bold' : 'fill-on-surface-variant font-medium'}`}
                    >
                      {item.mes}
                    </text>
                    {item.isCurrent && (
                      <circle cx={baseX + 10} cy={yReceita} r="3" className="fill-primary" />
                    )}
                  </g>
                );
              })}

              {/* Linha de Base */}
              <line className="text-outline" stroke="currentColor" strokeWidth="1.5" x1="40" x2="660" y1="170" y2="170" />
            </svg>
          </div>

          {/* Legenda do Gráfico */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 mt-2 border-t border-surface-container-high">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-primary inline-block" aria-hidden="true"></span>
                <span className="text-xs text-on-surface font-medium">Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-error inline-block" aria-hidden="true"></span>
                <span className="text-xs text-on-surface font-medium">Despesas</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                info
              </span>
              <span>Passe o cursor sobre os meses para inspecionar</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Tabela de Dados Acessível (WCAG 2.1 AA RF16) */}
      {activeTab === 'table' && (
        <div
          id="view-tabela"
          role="tabpanel"
          aria-labelledby="tab-btn-tabela"
          className="w-full overflow-x-auto"
        >
          <table
            className="w-full text-left text-sm border-collapse"
            aria-label="Tabela de Evolução Financeira Semestral Detalhada"
          >
            <caption className="sr-only">
              Tabela de dados equivalentes com receitas, despesas, resultado líquido e unidades tangíveis
            </caption>
            <thead className="bg-surface-container text-on-surface-variant uppercase font-mono text-[11px] font-bold">
              <tr>
                <th scope="col" className="py-2.5 px-3">Mês / Período</th>
                <th scope="col" className="py-2.5 px-3 text-right">Receitas (R$)</th>
                <th scope="col" className="py-2.5 px-3 text-right">Despesas (R$)</th>
                <th scope="col" className="py-2.5 px-3 text-right">Resultado Líquido</th>
                <th scope="col" className="py-2.5 px-3 text-right">Equiv. Tangível ({unitLabel})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-mono text-xs">
              {data.map((item) => (
                <tr
                  key={item.mes}
                  className={`hover:bg-surface-container/60 transition-colors ${
                    item.isCurrent ? 'bg-surface-container-high/60 font-semibold' : ''
                  }`}
                >
                  <th scope="row" className="py-2.5 px-3 text-on-surface font-sans font-medium">
                    {item.mes} {item.isCurrent ? '(Atual)' : ''}
                  </th>
                  <td className="py-2.5 px-3 text-right text-primary font-bold">
                    {formatCurrency(item.receita)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-error font-medium">
                    {formatCurrency(item.despesa)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-on-surface font-bold">
                    {formatCurrency(item.lucro)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-tertiary font-semibold">
                    {item.equivalenciaTexto}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
