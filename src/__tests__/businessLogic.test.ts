import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  calculateEquivalence,
  calculateGoalProgress,
  formatEquivalence,
} from '../services/equivalenceEngine';
import {
  analisarRegimeTributario,
  TETO_ANUAL_MEI,
  TETO_TOLERANCIA_MEI,
} from '../services/simplesNacionalService';
import { gerarRelatorioIA } from '../services/aiReportService';
import { calcularMetricas, SEED_DATA } from '../services/storage';

describe('Equivalence Engine (RF09, RF10, RF12)', () => {
  it('deve formatar moeda brasileira corretamente', () => {
    const formatado = formatCurrency(7500);
    // Deve conter R$ e 7.500,00
    expect(formatado).toContain('7.500,00');
  });

  it('deve calcular a quantidade de equivalência com precisão', () => {
    // 48.000 / 7.500 = 6,4
    const unidades = calculateEquivalence(48000, 7500);
    expect(unidades).toBeCloseTo(6.4, 1);
  });

  it('deve formatar texto de equivalência tangível', () => {
    const item = {
      id: 'item_01',
      empresaId: null,
      nome: 'iPhone 16 Pro 256GB',
      precoReferencia: 7500,
      icone: 'smartphone',
      categoriaObjeto: 'Eletrônicos',
    };
    const texto = formatEquivalence(48000, item);
    expect(texto).toContain('6,4');
    expect(texto).toContain('iPhone 16 Pro 256GB');
  });

  it('deve calcular progresso da meta tangível', () => {
    const meta = calculateGoalProgress(94850, 15, 11200);
    expect(meta.targetAmount).toBe(168000);
    expect(meta.currentUnits).toBeCloseTo(8.46, 1);
    expect(meta.percentage).toBeCloseTo(56.4, 0.5);
  });
});

describe('Motor Fiscal MEI & Simples Nacional (dicas-professor.txt)', () => {
  it('deve validar faturamento regular dentro do teto MEI', () => {
    const diag = analisarRegimeTributario('MEI', 45000);
    expect(diag.status).toBe('regular');
    expect(diag.tetoAnual).toBe(TETO_ANUAL_MEI);
    expect(diag.percentualTetoUtilizado).toBeCloseTo(55.6, 0.5);
  });

  it('deve alertar quando o faturamento MEI entrar na faixa de tolerância', () => {
    expect(TETO_TOLERANCIA_MEI).toBe(97200);
    const diag = analisarRegimeTributario('MEI', 85000);
    expect(diag.status).toBe('alerta');
    expect(diag.mensagem).toContain('faixa de tolerância');
  });

  it('deve alertar desenquadramento crítico quando exceder 20% do teto MEI', () => {
    const diag = analisarRegimeTributario('MEI', 100000);
    expect(diag.status).toBe('limite_ultrapassado');
    expect(diag.mensagem).toContain('excedeu em mais de 20%');
  });

  it('deve calcular enquadramento e estimativa DAS para Microempresa Simples Nacional', () => {
    const diag = analisarRegimeTributario('SIMPLES_NACIONAL', 240000);
    expect(diag.regime).toBe('SIMPLES_NACIONAL');
    expect(diag.status).toBe('regular');
    expect(diag.aliquotaEfetivaEstimada).toBeGreaterThan(0);
    expect(diag.valorEstimadoDAS).toBeGreaterThan(0);
  });
});

describe('Relatórios com IA e Privacidade LGPD (RF13, RNF04)', () => {
  it('deve gerar análise comparativa causal agregada sem expor dados pessoais', () => {
    const fallbackItem = SEED_DATA.itensEquivalencia[0];
    const rel = gerarRelatorioIA(
      '2026-11-01',
      '2026-11-30',
      '2026-10-01',
      '2026-10-31',
      SEED_DATA.lancamentos.filter((l) => l.data.startsWith('2026-11')),
      SEED_DATA.lancamentos.filter((l) => l.data.startsWith('2026-10')),
      SEED_DATA.categorias,
      fallbackItem,
      SEED_DATA.empresa.id
    );

    expect(rel.lucroAtual).toBeGreaterThan(0);
    expect(rel.causas.length).toBeGreaterThanOrEqual(1);
    expect(rel.dicasPraticas.length).toBeGreaterThanOrEqual(2);
    expect(rel.equivalenciaLucroTexto).toBeDefined();
    expect(rel.dadosAgregadosPorCategoria.length).toBe(SEED_DATA.categorias.length);
  });
});

describe('Métricas do Painel Financeiro (RF08)', () => {
  it('deve consolidar receita, despesa, lucro e saldo corretamente', () => {
    const metricas = calcularMetricas(SEED_DATA.lancamentos, SEED_DATA.contas);
    expect(metricas.receitaTotal).toBeGreaterThan(0);
    expect(metricas.despesaTotal).toBeGreaterThan(0);
    expect(metricas.lucroLiquido).toBe(metricas.receitaTotal - metricas.despesaTotal);
    expect(metricas.saldoConsolidado).toBeGreaterThan(0);
  });
});
