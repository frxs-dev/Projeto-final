import { Lancamento, Categoria, ItemEquivalencia, RelatorioIA } from '../types';
import { formatCurrency, calculateEquivalence } from './equivalenceEngine';

/**
 * Agrupa lançamentos por categoria e calcula totais
 * Respeita RNF04 (LGPD): Nenhum dado individual, nome de cliente ou fornecedor é transmitido
 */
export function agregarDadosPorCategoria(
  lancamentos: Lancamento[],
  categorias: Categoria[]
): Map<string, { total: number; tipo: 'RECEITA' | 'DESPESA'; nome: string }> {
  const map = new Map<string, { total: number; tipo: 'RECEITA' | 'DESPESA'; nome: string }>();

  // Inicializa com todas as categorias cadastradas
  categorias.forEach((c) => {
    map.set(c.id, { total: 0, tipo: c.tipo, nome: c.nome });
  });

  lancamentos.forEach((l) => {
    const entry = map.get(l.categoriaId);
    if (entry) {
      entry.total += l.valor;
    } else {
      map.set(l.categoriaId, {
        total: l.valor,
        tipo: l.tipo,
        nome: 'Outros',
      });
    }
  });

  return map;
}

/**
 * Gera um relatório causal de análise comparando período atual vs anterior (RF13)
 */
export function gerarRelatorioIA(
  periodoInicioAtual: string,
  periodoFimAtual: string,
  periodoInicioAnterior: string,
  periodoFimAnterior: string,
  lancamentosAtuais: Lancamento[],
  lancamentosAnteriores: Lancamento[],
  categorias: Categoria[],
  itemEquivalenciaLucro: ItemEquivalencia,
  empresaId: string
): RelatorioIA {
  // 1. Totais Período Atual
  const receitaAtual = lancamentosAtuais
    .filter((l) => l.tipo === 'RECEITA')
    .reduce((acc, l) => acc + l.valor, 0);
  const despesaAtual = lancamentosAtuais
    .filter((l) => l.tipo === 'DESPESA')
    .reduce((acc, l) => acc + l.valor, 0);
  const lucroAtual = receitaAtual - despesaAtual;

  // 2. Totais Período Anterior
  const receitaAnterior = lancamentosAnteriores
    .filter((l) => l.tipo === 'RECEITA')
    .reduce((acc, l) => acc + l.valor, 0);
  const despesaAnterior = lancamentosAnteriores
    .filter((l) => l.tipo === 'DESPESA')
    .reduce((acc, l) => acc + l.valor, 0);
  const lucroAnterior = receitaAnterior - despesaAnterior;

  // 3. Variação
  const variacaoLucro = lucroAtual - lucroAnterior;
  const variacaoPercentual =
    lucroAnterior !== 0
      ? Math.round(((lucroAtual - lucroAnterior) / Math.abs(lucroAnterior)) * 1000) / 10
      : 0;

  // 4. Equivalência Tangível da variação (RF12 / RF13)
  const unitPrice = itemEquivalenciaLucro.precoReferencia || 1;
  const deltaUnits = calculateEquivalence(variacaoLucro, unitPrice);
  const formattedDeltaUnits = deltaUnits.toFixed(1).replace('.', ',');
  const sinalTexto = variacaoLucro >= 0 ? '+' : '-';
  const sentidoTexto = variacaoLucro >= 0 ? 'a mais que' : 'a menos que';

  const equivalenciaLucroTexto = `"O lucro deste período equivale a ${sinalTexto}${formattedDeltaUnits} ${itemEquivalenciaLucro.nome} ${sentidoTexto} o período anterior."`;

  // 5. Comparativo por categorias (LGPD: dados agregados)
  const catAtual = agregarDadosPorCategoria(lancamentosAtuais, categorias);
  const catAnterior = agregarDadosPorCategoria(lancamentosAnteriores, categorias);

  const dadosAgregados: RelatorioIA['dadosAgregadosPorCategoria'] = [];

  categorias.forEach((cat) => {
    const vAtual = catAtual.get(cat.id)?.total || 0;
    const vAnterior = catAnterior.get(cat.id)?.total || 0;
    const delta = vAtual - vAnterior;
    const pct = vAnterior !== 0 ? Math.round((delta / vAnterior) * 1000) / 10 : (vAtual > 0 ? 100 : 0);

    dadosAgregados.push({
      categoriaNome: cat.nome,
      tipo: cat.tipo,
      valorAnterior: vAnterior,
      valorAtual: vAtual,
      variacaoValor: delta,
      variacaoPercentual: pct,
    });
  });

  // Identifica maiores impulsionadores
  const receitasComMaiorGanho = [...dadosAgregados]
    .filter((d) => d.tipo === 'RECEITA')
    .sort((a, b) => b.variacaoValor - a.variacaoValor);

  const despesasComMaiorReducao = [...dadosAgregados]
    .filter((d) => d.tipo === 'DESPESA')
    .sort((a, b) => a.variacaoValor - b.variacaoValor); // Quanto mais negativo, maior a economia

  const despesasComMaiorAumento = [...dadosAgregados]
    .filter((d) => d.tipo === 'DESPESA')
    .sort((a, b) => b.variacaoValor - a.variacaoValor);

  const topReceita = receitasComMaiorGanho[0];
  const topEconomia = despesasComMaiorReducao[0];
  const topDespesaAlerta = despesasComMaiorAumento[0];

  // 6. Geração Causal Inteligente (sem jargões)
  const causas: RelatorioIA['causas'] = [];

  if (topReceita && topReceita.variacaoValor > 0) {
    causas.push({
      titulo: 'Causa Principal (Receita em Expansão)',
      descricao: `O faturamento na categoria ${topReceita.categoriaNome} teve aumento de ${topReceita.variacaoPercentual > 0 ? '+' : ''}${topReceita.variacaoPercentual}% (${formatCurrency(topReceita.variacaoValor)} adicionais), sendo o motor primordial do superávit.`,
      impacto: `+${formatCurrency(topReceita.variacaoValor)}`,
      tipo: 'positivo',
    });
  } else {
    causas.push({
      titulo: 'Estabilidade na Entrada de Recursos',
      descricao: `A receita manteve volume controlado no período, consolidando ${formatCurrency(receitaAtual)} com margem estável.`,
      impacto: formatCurrency(receitaAtual),
      tipo: 'neutro',
    });
  }

  if (topEconomia && topEconomia.variacaoValor < 0) {
    causas.push({
      titulo: 'Controle de Despesas (Eficiência Operacional)',
      descricao: `Houve redução inteligente nos custos de ${topEconomia.categoriaNome}, economizando ${formatCurrency(Math.abs(topEconomia.variacaoValor))} (-${Math.abs(topEconomia.variacaoPercentual)}%).`,
      impacto: `Economia de ${formatCurrency(Math.abs(topEconomia.variacaoValor))}`,
      tipo: 'positivo',
    });
  } else {
    causas.push({
      titulo: 'Eficiência de Despesas Mantida',
      descricao: `Os custos operacionais somaram ${formatCurrency(despesaAtual)}, mantendo índice de cobertura sustentável.`,
      impacto: `${Math.round((despesaAtual / (receitaAtual || 1)) * 100)}% da receita`,
      tipo: 'neutro',
    });
  }

  if (topDespesaAlerta && topDespesaAlerta.variacaoValor > 0) {
    causas.push({
      titulo: 'Ponto de Atenção / Oportunidade de Otimização',
      descricao: `Os gastos com ${topDespesaAlerta.categoriaNome} subiram ${topDespesaAlerta.variacaoPercentual}%, representando acréscimo de ${formatCurrency(topDespesaAlerta.variacaoValor)}. Recomendada revisão contratual e consolidação de fornecedores.`,
      impacto: `Alerta: +${formatCurrency(topDespesaAlerta.variacaoValor)}`,
      tipo: 'alerta',
    });
  } else {
    causas.push({
      titulo: 'Margem Saudável para Reinvestimento',
      descricao: `Todos os centros de custo operaram dentro das metas sem desvios anômalos identificados.`,
      impacto: 'Excelente',
      tipo: 'positivo',
    });
  }

  // 7. Dicas Práticas & Acionáveis
  const dicasPraticas: RelatorioIA['dicasPraticas'] = [
    {
      titulo: '1. Renegociação de Contratos de Tecnologia & Nuvem',
      descricao: 'Negocie pagamentos antecipados ou planos anuais em serviços de infraestrutura para obter descontos médios de 12% a 15% ao ano.',
      acao: 'Aplicar ao Planejamento',
      impactoEstimado: 'Economia estimada de ~R$ 700,00/mês',
    },
    {
      titulo: '2. Reserva Estratégica de Liquidez Tangível',
      descricao: `Destine 10% do excedente de liquidez (${formatCurrency(Math.max(1000, lucroAtual * 0.1))}) em aplicação de resgate diário com rendimento 100% CDI.`,
      acao: 'Programar Transferência',
      impactoEstimado: `Garante autonomia de colchão financeiro`,
    },
    {
      titulo: '3. Conformidade Tributária Simples Nacional / DAS',
      descricao: 'Emita e agende o pagamento da guia DAS até o dia 20 para evitar juros Selic e multas de mora da Receita Federal.',
      acao: 'Verificar no Portal e-CAC',
      impactoEstimado: 'Sem risco de desenquadramento',
    },
  ];

  const tituloPeriodo = `Comparativo ${periodoInicioAtual.slice(5, 7)}/${periodoInicioAtual.slice(0, 4)} (${periodoInicioAtual} a ${periodoFimAtual}) vs ${periodoInicioAnterior.slice(5, 7)}/${periodoInicioAnterior.slice(0, 4)} (${periodoInicioAnterior} a ${periodoFimAnterior})`;

  return {
    id: `rel_${Date.now()}`,
    empresaId,
    periodoInicio: periodoInicioAtual,
    periodoFim: periodoFimAtual,
    titulo: tituloPeriodo,
    lucroAtual,
    lucroAnterior,
    receitaTotal: receitaAtual,
    despesaTotal: despesaAtual,
    variacaoPercentual,
    equivalenciaLucroTexto,
    analiseCausal: `No período analisado, o resultado operacional líquido alcançou ${formatCurrency(lucroAtual)}, representando uma variação de ${variacaoPercentual > 0 ? '+' : ''}${variacaoPercentual}% em relação ao período precedente.`,
    causas,
    dicasPraticas,
    dadosAgregadosPorCategoria: dadosAgregados,
    geradoEm: new Date().toISOString(),
  };
}
