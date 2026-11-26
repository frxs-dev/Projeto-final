import { Lancamento, Categoria, ContaFinanceira, ItemEquivalencia } from '../types';
import { formatCurrency, formatEquivalence } from './equivalenceEngine';

/**
 * Exporta lançamentos em formato CSV conforme RF17
 */
export function exportLancamentosToCSV(
  lancamentos: Lancamento[],
  categorias: Categoria[],
  contas: ContaFinanceira[],
  itemEquivalencia?: ItemEquivalencia | null
): void {
  const catMap = new Map(categorias.map((c) => [c.id, c.nome]));
  const contaMap = new Map(contas.map((c) => [c.id, c.nome]));

  // Cabeçalho CSV com BOM UTF-8 para compatibilidade perfeita com Excel no Brasil
  const headers = [
    'Data',
    'Tipo',
    'Descricao',
    'Categoria',
    'Conta Financeira',
    'Valor (R$)',
    'Equivalencia Tangivel',
    'Documento'
  ];

  const rows = lancamentos.map((l) => {
    const dataFormatada = l.data.split('-').reverse().join('/');
    const catNome = catMap.get(l.categoriaId) || 'Geral';
    const contaNome = contaMap.get(l.contaId) || 'Principal';
    const sinal = l.tipo === 'RECEITA' ? '+' : '-';
    const valorFormatado = `${sinal}${formatCurrency(l.valor)}`;
    const equiv = itemEquivalencia ? formatEquivalence(l.valor, itemEquivalencia) : '—';
    const doc = l.numeroDocumento || '';

    return [
      `"${dataFormatada}"`,
      `"${l.tipo}"`,
      `"${l.descricao.replace(/"/g, '""')}"`,
      `"${catNome}"`,
      `"${contaNome}"`,
      `"${valorFormatado}"`,
      `"${equiv}"`,
      `"${doc}"`
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  const now = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `finance_lancamentos_${now}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
