import { RegimeTributario } from '../types';

export interface SimplesNacionalDiagnosis {
  regime: RegimeTributario;
  tetoAnual: number;
  faturamentoAcumulado: number;
  percentualTetoUtilizado: number;
  faixaAtingida: string;
  aliquotaEfetivaEstimada: number;
  valorEstimadoDAS: number;
  status: 'regular' | 'alerta' | 'limite_ultrapassado';
  mensagem: string;
  dicasMEI: string[];
}

// Limites legais vigentes no Brasil
export const TETO_ANUAL_MEI = 81000.00; // R$ 81.000,00
export const TETO_TOLERANCIA_MEI = 97200.00; // R$ 97.200,00 (+20%)
export const TETO_ANUAL_MICROEMPRESA = 360000.00; // R$ 360.000,00
export const DAS_FIXO_MEI_ESTIMADO = 75.60; // INSS + ICMS/ISS

/**
 * Analisa a situação tributária da empresa para MEI ou Microempresa (Simples Nacional)
 */
export function analisarRegimeTributario(
  regime: RegimeTributario,
  faturamentoAcumuladoAno: number
): SimplesNacionalDiagnosis {
  if (regime === 'MEI') {
    const percentual = (faturamentoAcumuladoAno / TETO_ANUAL_MEI) * 100;
    let status: 'regular' | 'alerta' | 'limite_ultrapassado' = 'regular';
    let mensagem = 'Faturamento dentro do limite anual do MEI (R$ 81.000/ano).';

    if (faturamentoAcumuladoAno > TETO_TOLERANCIA_MEI) {
      status = 'limite_ultrapassado';
      mensagem = 'Atenção Crítica: Faturamento excedeu em mais de 20% o teto do MEI! Necessário transição imediata para Microempresa (Simples Nacional).';
    } else if (faturamentoAcumuladoAno > TETO_ANUAL_MEI) {
      status = 'alerta';
      mensagem = 'Atenção: Limite do MEI ultrapassado na faixa de tolerância (até 20%). Desenquadramento agendado para o próximo ano-calendário com DAS complementar.';
    } else if (percentual >= 80) {
      status = 'alerta';
      mensagem = `Alerta Preventivo: Você atingiu ${percentual.toFixed(1)}% do teto anual do MEI. Planeje a migração com seu contador.`;
    }

    return {
      regime: 'MEI',
      tetoAnual: TETO_ANUAL_MEI,
      faturamentoAcumulado: faturamentoAcumuladoAno,
      percentualTetoUtilizado: Math.min(100, Math.round(percentual * 10) / 10),
      faixaAtingida: 'MEI - Fixo Municipal/Estadual',
      aliquotaEfetivaEstimada: 0,
      valorEstimadoDAS: DAS_FIXO_MEI_ESTIMADO,
      status,
      mensagem,
      dicasMEI: [
        'Mantenha o Relatório Mensal de Receitas Brutas preenchido até o dia 20 de cada mês.',
        'Emita a Guia DAS mensalmente e mantenha os comprovantes arquivados por 5 anos.',
        'Ao ultrapassar R$ 81.000/ano, não cancele o CNPJ: solicite a alteração de MEI para ME na Junta Comercial.',
      ],
    };
  }

  // Microempresa (Simples Nacional)
  const percentual = (faturamentoAcumuladoAno / TETO_ANUAL_MICROEMPRESA) * 100;
  let status: 'regular' | 'alerta' | 'limite_ultrapassado' = 'regular';
  let mensagem = 'Faturamento enquadrado nos limites de Microempresa (ME) no Simples Nacional.';
  let faixa = 'Anexo III - Faixa 1 (até R$ 180.000)';
  let aliquota = 6.0; // 6% básico serviços

  if (faturamentoAcumuladoAno > TETO_ANUAL_MICROEMPRESA) {
    status = 'limite_ultrapassado';
    mensagem = 'Faturamento ultrapassou o teto de Microempresa (R$ 360.000). A empresa passa a ser classificada como EPP (Empresa de Pequeno Porte).';
    faixa = 'EPP - Faixas Superiores';
    aliquota = 11.2;
  } else if (faturamentoAcumuladoAno > 180000) {
    faixa = 'Anexo III - Faixa 2 (R$ 180.000 a R$ 360.000)';
    aliquota = 8.21;
  }

  const valorDAS = (faturamentoAcumuladoAno / 12) * (aliquota / 100);

  return {
    regime: 'SIMPLES_NACIONAL',
    tetoAnual: TETO_ANUAL_MICROEMPRESA,
    faturamentoAcumulado: faturamentoAcumuladoAno,
    percentualTetoUtilizado: Math.min(100, Math.round(percentual * 10) / 10),
    faixaAtingida: faixa,
    aliquotaEfetivaEstimada: aliquota,
    valorEstimadoDAS: valorDAS,
    status,
    mensagem,
    dicasMEI: [
      'O Simples Nacional unifica 8 tributos (IRPJ, CSLL, PIS, COFINS, IPI, ICMS, ISS e CPP) em uma única guia.',
      'Fique atento ao Fator R (relação folha de salários / receita) para manter alíquotas reduzidas de serviços no Anexo III.',
      'Faça a conciliação bancária mensal para garantir que o extrato fiscal bata exatamente com os lançamentos.',
    ],
  };
}
