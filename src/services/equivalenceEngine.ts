import { ItemEquivalencia } from '../types';

/**
 * Formata um número como moeda brasileira (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Calcula a quantidade de unidades de equivalência
 */
export function calculateEquivalence(amount: number, unitPrice: number): number {
  if (!unitPrice || unitPrice <= 0) return 0;
  return Math.abs(amount) / unitPrice;
}

/**
 * Formata a quantidade em string com vírgula decimal brasileira
 */
export function formatEquivalenceValue(qty: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(qty);
}

/**
 * Formata o texto descritivo de equivalência tangível (RF12)
 * Ex: "≈ 6,4 iPhones 16 Pro"
 */
export function formatEquivalence(amount: number, item?: ItemEquivalencia | null): string {
  if (!item || !item.precoReferencia || item.precoReferencia <= 0) {
    return '—';
  }
  const qty = calculateEquivalence(amount, item.precoReferencia);
  const formattedQty = formatEquivalenceValue(qty);
  
  // Pluralização simples
  const nomeItem = item.nome;
  return `≈ ${formattedQty} ${nomeItem}`;
}

/**
 * Retorna cálculo de progresso de meta tangível
 */
export function calculateGoalProgress(
  currentProfit: number,
  targetQuantity: number,
  unitPrice: number
): {
  targetAmount: number;
  currentUnits: number;
  percentage: number;
  isComplete: boolean;
} {
  const targetAmount = targetQuantity * unitPrice;
  const currentUnits = calculateEquivalence(Math.max(0, currentProfit), unitPrice);
  const percentage = targetQuantity > 0 ? Math.min(100, Math.round((currentUnits / targetQuantity) * 1000) / 10) : 0;

  return {
    targetAmount,
    currentUnits,
    percentage,
    isComplete: percentage >= 100,
  };
}
