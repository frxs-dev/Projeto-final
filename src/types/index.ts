export type PapelUsuario = 'ADMIN' | 'FINANCEIRO' | 'LEITOR';
export type Tema = 'CLARO' | 'ESCURO' | 'ALTO_CONTRASTE';
export type TipoConta = 'CAIXA' | 'BANCO' | 'CARTAO';
export type TipoCategoria = 'RECEITA' | 'DESPESA';
export type TipoLancamento = 'RECEITA' | 'DESPESA';
export type RegimeTributario = 'MEI' | 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO';

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  regimeTributario: RegimeTributario;
  faturamentoAnualEstimado?: number;
  criadoEm: string;
}

export interface Usuario {
  id: string;
  empresaId: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  tamanhoFonte: number; // 100, 125, 150
  tema: Tema;
  reduzirAnimacoes: boolean;
}

export interface ContaFinanceira {
  id: string;
  empresaId: string;
  nome: string;
  tipo: TipoConta;
  instituicao?: string;
  saldoInicial: number;
  saldoAtual?: number;
  ativa: boolean;
}

export interface Categoria {
  id: string;
  empresaId: string;
  nome: string;
  tipo: TipoCategoria;
  cor?: string;
  icone?: string;
  ativa: boolean;
}

export interface Lancamento {
  id: string;
  empresaId: string;
  contaId: string;
  categoriaId: string;
  criadoPor?: string;
  tipo: TipoLancamento;
  valor: number;
  data: string; // YYYY-MM-DD
  descricao: string;
  numeroDocumento?: string;
  comprovanteUrl?: string;
}

export interface ItemEquivalencia {
  id: string;
  empresaId: string | null; // null = catálogo padrão global
  nome: string;
  subtitulo?: string;
  precoReferencia: number;
  icone: string;
  categoriaObjeto: string;
}

export interface ConfigEquivalencia {
  id: string;
  empresaId: string;
  itemId: string;
  aplicacao: 'DESPESA' | 'LUCRO';
  atualizadoEm: string;
}

export interface RelatorioIA {
  id: string;
  empresaId: string;
  periodoInicio: string;
  periodoFim: string;
  titulo: string;
  lucroAtual: number;
  lucroAnterior: number;
  receitaTotal: number;
  despesaTotal: number;
  variacaoPercentual: number;
  equivalenciaLucroTexto: string;
  analiseCausal: string;
  causas: {
    titulo: string;
    descricao: string;
    impacto: string;
    tipo: 'positivo' | 'neutro' | 'alerta';
  }[];
  dicasPraticas: {
    titulo: string;
    descricao: string;
    acao: string;
    impactoEstimado?: string;
  }[];
  dadosAgregadosPorCategoria: {
    categoriaNome: string;
    tipo: TipoCategoria;
    valorAnterior: number;
    valorAtual: number;
    variacaoValor: number;
    variacaoPercentual: number;
  }[];
  geradoEm: string;
}

export interface MetricasFinanceiras {
  receitaTotal: number;
  despesaTotal: number;
  lucroLiquido: number;
  margemLucro: number;
  saldoConsolidado: number;
  runwayMeses: number;
  variacaoReceitaPercentual: number;
  variacaoDespesaPercentual: number;
  variacaoLucroPercentual: number;
}
