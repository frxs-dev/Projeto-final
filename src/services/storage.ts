import {
  Empresa,
  Usuario,
  ContaFinanceira,
  Categoria,
  Lancamento,
  ItemEquivalencia,
  ConfigEquivalencia,
  RelatorioIA,
  MetricasFinanceiras,
} from '../types';

const STORAGE_KEY = 'finance_tangivel_v1_store';
const AUTH_ACCOUNTS_KEY = 'finance_tangivel_v1_accounts';
const AUTH_SESSION_KEY = 'finance_tangivel_v1_session';
const DEMO_USER_ID = 'usr_001';

export interface AuthAccount {
  id: string;
  empresaId: string;
  nome: string;
  email: string;
  senha: string;
  nomeEmpresa: string;
  cnpj: string;
  regimeTributario: Empresa['regimeTributario'];
}

export interface AppState {
  empresa: Empresa;
  usuario: Usuario;
  contas: ContaFinanceira[];
  categorias: Categoria[];
  lancamentos: Lancamento[];
  itensEquivalencia: ItemEquivalencia[];
  configsEquivalencia: ConfigEquivalencia[];
  relatorios: RelatorioIA[];
  metaLucroUnidades: number;
}

export const SEED_DATA: AppState = {
  empresa: {
    id: 'emp_001',
    nome: 'TechCorp Soluções Tecnológicas Ltda',
    cnpj: '12.345.678/0001-90',
    regimeTributario: 'SIMPLES_NACIONAL',
    faturamentoAnualEstimado: 340000.00,
    criadoEm: '2026-01-10T10:00:00.000Z',
  },
  usuario: {
    id: 'usr_001',
    empresaId: 'emp_001',
    nome: 'Filipe A. Reis',
    email: 'filipe@gmail.com',
    papel: 'ADMIN',
    tamanhoFonte: 100,
    tema: 'ESCURO',
    reduzirAnimacoes: false,
  },
  contas: [
    {
      id: 'cta_001',
      empresaId: 'emp_001',
      nome: 'Banco Itaú PJ',
      tipo: 'BANCO',
      instituicao: 'Itaú Unibanco',
      saldoInicial: 140000.00,
      ativa: true,
    },
    {
      id: 'cta_002',
      empresaId: 'emp_001',
      nome: 'Nubank PJ',
      tipo: 'BANCO',
      instituicao: 'Nubank Pagamentos',
      saldoInicial: 65000.00,
      ativa: true,
    },
    {
      id: 'cta_003',
      empresaId: 'emp_001',
      nome: 'Cartão Black Corp',
      tipo: 'CARTAO',
      instituicao: 'Itaú Cartões',
      saldoInicial: 0.00,
      ativa: true,
    },
    {
      id: 'cta_004',
      empresaId: 'emp_001',
      nome: 'Caixa Operacional',
      tipo: 'CAIXA',
      instituicao: 'Cofre Empresa',
      saldoInicial: 13420.00,
      ativa: true,
    },
  ],
  categorias: [
    { id: 'cat_rec_01', empresaId: 'emp_001', nome: 'Vendas & Serviços', tipo: 'RECEITA', cor: '#00e599', icone: 'payments', ativa: true },
    { id: 'cat_rec_02', empresaId: 'emp_001', nome: 'Licenças SaaS', tipo: 'RECEITA', cor: '#4dffb2', icone: 'cloud_done', ativa: true },
    { id: 'cat_rec_03', empresaId: 'emp_001', nome: 'Consultoria & Projetos', tipo: 'RECEITA', cor: '#00d084', icone: 'psychology', ativa: true },
    { id: 'cat_desp_01', empresaId: 'emp_001', nome: 'Infraestrutura & Cloud', tipo: 'DESPESA', cor: '#f43f5e', icone: 'cloud', ativa: true },
    { id: 'cat_desp_02', empresaId: 'emp_001', nome: 'Operacional & Licenças', tipo: 'DESPESA', cor: '#ff6b6b', icone: 'computer', ativa: true },
    { id: 'cat_desp_03', empresaId: 'emp_001', nome: 'Folha de Salários / PJ', tipo: 'DESPESA', cor: '#f59e0b', icone: 'badge', ativa: true },
    { id: 'cat_desp_04', empresaId: 'emp_001', nome: 'Tributos & DAS', tipo: 'DESPESA', cor: '#c3c0ff', icone: 'receipt', ativa: true },
  ],
  itensEquivalencia: [
    {
      id: 'item_01',
      empresaId: null,
      nome: 'iPhone 16 Pro 256GB',
      subtitulo: 'Eletrônicos Premium • Ref. Apple BR',
      precoReferencia: 7500.00,
      icone: 'smartphone',
      categoriaObjeto: 'Eletrônicos',
    },
    {
      id: 'item_02',
      empresaId: null,
      nome: 'Notebook Dell XPS 15',
      subtitulo: 'Dell XPS 32GB RAM • Padrão Engenharia',
      precoReferencia: 11200.00,
      icone: 'laptop_mac',
      categoriaObjeto: 'Computadores',
    },
    {
      id: 'item_03',
      empresaId: null,
      nome: 'Salário Mínimo Vigente',
      subtitulo: 'Legislação Nacional • Brasil 2024/2026',
      precoReferencia: 1412.00,
      icone: 'payments',
      categoriaObjeto: 'Economia',
    },
    {
      id: 'item_04',
      empresaId: null,
      nome: 'Cesta Básica Corporativa',
      subtitulo: 'Benefício Médio DIEESE / FIPE',
      precoReferencia: 850.00,
      icone: 'shopping_basket',
      categoriaObjeto: 'Alimentação',
    },
    {
      id: 'item_05',
      empresaId: 'emp_001',
      nome: 'Máquina de Café Industrial',
      subtitulo: 'Equipamento Escritório • Ativo Imobilizado',
      precoReferencia: 4200.00,
      icone: 'coffee_maker',
      categoriaObjeto: 'Equipamentos',
    },
    {
      id: 'item_06',
      empresaId: 'emp_001',
      nome: 'Servidor Rack Dell PowerEdge',
      subtitulo: 'Infraestrutura On-Premise • 64 Cores',
      precoReferencia: 32000.00,
      icone: 'dns',
      categoriaObjeto: 'Servidores',
    },
  ],
  configsEquivalencia: [
    {
      id: 'cfg_01',
      empresaId: 'emp_001',
      itemId: 'item_01', // iPhone para despesas
      aplicacao: 'DESPESA',
      atualizadoEm: '2026-11-20T10:00:00.000Z',
    },
    {
      id: 'cfg_02',
      empresaId: 'emp_001',
      itemId: 'item_02', // Notebook Dell XPS para lucro
      aplicacao: 'LUCRO',
      atualizadoEm: '2026-11-20T10:00:00.000Z',
    },
  ],
  metaLucroUnidades: 15, // 15 Notebooks de meta mensal
  lancamentos: [
    {
      id: 'lanc_01',
      empresaId: 'emp_001',
      contaId: 'cta_001',
      categoriaId: 'cat_rec_03',
      tipo: 'RECEITA',
      valor: 37500.00,
      data: '2026-11-12',
      descricao: 'Mensalidade Contrato Empresa Alpha',
      numeroDocumento: 'DOC-AL-9842',
    },
    {
      id: 'lanc_02',
      empresaId: 'emp_001',
      contaId: 'cta_003',
      categoriaId: 'cat_desp_01',
      tipo: 'DESPESA',
      valor: 4800.00,
      data: '2026-11-11',
      descricao: 'Servidores Cloud AWS & Infraestrutura',
      numeroDocumento: 'AWS-INV-860',
    },
    {
      id: 'lanc_03',
      empresaId: 'emp_001',
      contaId: 'cta_002',
      categoriaId: 'cat_desp_02',
      tipo: 'DESPESA',
      valor: 1500.00,
      data: '2026-11-10',
      descricao: 'Licenças de Software Microsoft 365',
      numeroDocumento: 'MSFT-REC-25',
    },
    {
      id: 'lanc_04',
      empresaId: 'emp_001',
      contaId: 'cta_001',
      categoriaId: 'cat_rec_03',
      tipo: 'RECEITA',
      valor: 22000.00,
      data: '2026-11-08',
      descricao: 'Consultoria de Implementação ERP',
      numeroDocumento: 'ERP-BETA-02',
    },
    {
      id: 'lanc_05',
      empresaId: 'emp_001',
      contaId: 'cta_001',
      categoriaId: 'cat_desp_03',
      tipo: 'DESPESA',
      valor: 28500.00,
      data: '2026-11-05',
      descricao: 'Folha Adiantamento Salarial PJ',
      numeroDocumento: 'FOLHA-LOTE-1',
    },
    {
      id: 'lanc_06',
      empresaId: 'emp_001',
      contaId: 'cta_002',
      categoriaId: 'cat_rec_02',
      tipo: 'RECEITA',
      valor: 54400.00,
      data: '2026-11-04',
      descricao: 'Assinaturas Recorrentes Plataforma SaaS',
      numeroDocumento: 'SAAS-RECURR-NOV',
    },
    {
      id: 'lanc_07',
      empresaId: 'emp_001',
      contaId: 'cta_001',
      categoriaId: 'cat_rec_01',
      tipo: 'RECEITA',
      valor: 28950.00,
      data: '2026-11-03',
      descricao: 'Desenvolvimento e Manutenção Sob Demanda',
      numeroDocumento: 'DEV-ON-DEM-44',
    },
    {
      id: 'lanc_08',
      empresaId: 'emp_001',
      contaId: 'cta_002',
      categoriaId: 'cat_desp_01',
      tipo: 'DESPESA',
      valor: 8200.00,
      data: '2026-11-02',
      descricao: 'Aluguel do Espaço Físico & Escritório',
      numeroDocumento: 'ALUG-NOV-2026',
    },
    {
      id: 'lanc_09',
      empresaId: 'emp_001',
      contaId: 'cta_001',
      categoriaId: 'cat_desp_04',
      tipo: 'DESPESA',
      valor: 5000.00,
      data: '2026-11-01',
      descricao: 'Guia DAS Simples Nacional',
      numeroDocumento: 'DAS-SIMPLES-10',
    },
    // Dados de Outubro 2026 para comparativo histórico imediato
    {
      id: 'lanc_out_01',
      empresaId: 'emp_001',
      contaId: 'cta_001',
      categoriaId: 'cat_rec_03',
      tipo: 'RECEITA',
      valor: 88000.00,
      data: '2026-10-15',
      descricao: 'Contratos de Consultoria Outubro',
    },
    {
      id: 'lanc_out_02',
      empresaId: 'emp_001',
      contaId: 'cta_002',
      categoriaId: 'cat_rec_02',
      tipo: 'RECEITA',
      valor: 44000.00,
      data: '2026-10-10',
      descricao: 'Licenças SaaS Outubro',
    },
    {
      id: 'lanc_out_03',
      empresaId: 'emp_001',
      contaId: 'cta_001',
      categoriaId: 'cat_desp_03',
      tipo: 'DESPESA',
      valor: 72000.00,
      data: '2026-10-05',
      descricao: 'Folha Salarial Integral Outubro',
    },
    {
      id: 'lanc_out_04',
      empresaId: 'emp_001',
      contaId: 'cta_003',
      categoriaId: 'cat_desp_01',
      tipo: 'DESPESA',
      valor: 30400.00,
      data: '2026-10-04',
      descricao: 'Cloud Servers e Banco de Dados Outubro',
    },
  ],
  relatorios: [
    {
      id: 'rel_001',
      empresaId: 'emp_001',
      periodoInicio: '2026-11-01',
      periodoFim: '2026-11-30',
      titulo: 'Outubro vs Novembro 2026',
      lucroAtual: 94850.00,
      lucroAnterior: 74100.00,
      receitaTotal: 142850.00,
      despesaTotal: 48000.00,
      variacaoPercentual: 28.0,
      equivalenciaLucroTexto: '"O lucro deste mês equivale a +2,7 iPhones 16 Pro a mais que o mês anterior."',
      analiseCausal: 'A TechCorp apresentou expansão sólida impulsionada pelo contrato Alpha (+35% em receita de consultoria) somada a uma redução de 10,5% nos custos de computação em nuvem após reserva de instâncias ociosas.',
      causas: [
        {
          titulo: 'Causa Principal (Receita em Expansão)',
          descricao: 'O faturamento com serviços de consultoria subiu 35% graças ao fechamento do contrato Alpha, injetando R$ 37.500,00 adicionais no caixa.',
          impacto: '+35%',
          tipo: 'positivo',
        },
        {
          titulo: 'Controle de Despesas (Eficiência Operacional)',
          descricao: 'Os gastos com infraestrutura de nuvem foram reduzidos em R$ 3.200,00 após a otimização de instâncias de teste que estavam ociosas.',
          impacto: 'Infraestrutura',
          tipo: 'positivo',
        },
        {
          titulo: 'Atenção / Oportunidade de Melhoria',
          descricao: 'As despesas com licenças recorrentes de softwares representam 3,1% do custo total e podem ser consolidadas anualmente para obter 15% de desconto.',
          impacto: 'Alerta Brando',
          tipo: 'alerta',
        },
      ],
      dicasPraticas: [
        {
          titulo: '1. Renegociação AWS Savings Plans',
          descricao: 'Negocie o plano anual com Savings Plans para travar uma economia recorrente de R$ 700,00/mês.',
          acao: 'Aplicar ao Planejamento',
          impactoEstimado: 'Economia de R$ 8.400/ano',
        },
        {
          titulo: '2. Reserva Estratégica de Liquidez',
          descricao: 'Reserve 10% do excedente de liquidez (R$ 9.485,00) em fundo de resgate diário com rendimento 100% CDI.',
          acao: 'Programar Transferência',
          impactoEstimado: '1,2 iPhones guardados',
        },
      ],
      dadosAgregadosPorCategoria: [
        { categoriaNome: 'Consultoria (Receita)', tipo: 'RECEITA', valorAnterior: 88000, valorAtual: 125500, variacaoValor: 37500, variacaoPercentual: 42.6 },
        { categoriaNome: 'Licenças SaaS (Receita)', tipo: 'RECEITA', valorAnterior: 44000, valorAtual: 54400, variacaoValor: 10400, variacaoPercentual: 23.6 },
        { categoriaNome: 'Cloud / Nuvem (Despesa)', tipo: 'DESPESA', valorAnterior: 30400, valorAtual: 27200, variacaoValor: -3200, variacaoPercentual: -10.5 },
        { categoriaNome: 'Folha Salarial (Despesa)', tipo: 'DESPESA', valorAnterior: 72000, valorAtual: 72000, variacaoValor: 0, variacaoPercentual: 0 },
      ],
      geradoEm: '2026-11-20T09:42:00.000Z',
    },
    {
      id: 'rel_002',
      empresaId: 'emp_001',
      periodoInicio: '2026-10-01',
      periodoFim: '2026-10-31',
      titulo: 'Setembro vs Outubro 2026',
      lucroAtual: 74100.00,
      lucroAnterior: 66500.00,
      receitaTotal: 135000.00,
      despesaTotal: 60900.00,
      variacaoPercentual: 11.4,
      equivalenciaLucroTexto: '"O lucro deste mês equivale a +1,1 iPhones a mais que o mês anterior."',
      analiseCausal: 'Crescimento consistente impulsionado por novas assinaturas da plataforma SaaS no fechamento do terceiro trimestre.',
      causas: [],
      dicasPraticas: [],
      dadosAgregadosPorCategoria: [],
      geradoEm: '2026-11-01T10:00:00.000Z',
    },
    {
      id: 'rel_003',
      empresaId: 'emp_001',
      periodoInicio: '2026-09-01',
      periodoFim: '2026-09-30',
      titulo: 'Agosto vs Setembro 2026',
      lucroAtual: 66500.00,
      lucroAnterior: 69400.00,
      receitaTotal: 120000.00,
      despesaTotal: 53500.00,
      variacaoPercentual: -4.2,
      equivalenciaLucroTexto: '"O lucro deste mês recuou o equivalente a 0,4 iPhones."',
      analiseCausal: 'Leve retração pontual devido à compra de equipamentos de escritório para expansão do time de design.',
      causas: [],
      dicasPraticas: [],
      dadosAgregadosPorCategoria: [],
      geradoEm: '2026-10-01T10:00:00.000Z',
    },
  ],
};

/**
 * Carrega o estado salvo para a conta; os dados de demonstração pertencem apenas ao usuário seed.
 */
export function loadAppState(userId?: string, account?: AuthAccount): AppState {
  try {
    if (!userId) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return SEED_DATA;
      return { ...SEED_DATA, ...JSON.parse(raw) };
    }

    const userStorageKey = `${STORAGE_KEY}_${userId}`;
    const raw = localStorage.getItem(userStorageKey);
    if (raw) return { ...SEED_DATA, ...JSON.parse(raw) };

    if (userId === DEMO_USER_ID) {
      const legacyState = localStorage.getItem(STORAGE_KEY);
      const demoState = legacyState
        ? { ...SEED_DATA, ...JSON.parse(legacyState) }
        : SEED_DATA;
      demoState.usuario = { ...demoState.usuario, id: DEMO_USER_ID, email: 'filipe@gmail.com' };
      saveAppState(demoState, userId);
      return demoState;
    }

    const initialState = createEmptyAppState(account);
    saveAppState(initialState, userId);
    return initialState;
  } catch (err) {
    console.error('Falha ao ler estado do localStorage:', err);
    return account ? createEmptyAppState(account) : SEED_DATA;
  }
}

/**
 * Salva o estado completo no armazenamento isolado da conta.
 */
export function saveAppState(state: AppState, userId?: string): void {
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (err) {
    console.error('Falha ao salvar no localStorage:', err);
  }
}

/**
 * Reseta o banco de dados local para o padrão de demonstração
 */
export function resetAppState(userId?: string, account?: AuthAccount): AppState {
  const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
  localStorage.removeItem(key);
  const reset = userId === DEMO_USER_ID ? loadAppState(userId) : createEmptyAppState(account);
  saveAppState(reset, userId);
  return reset;
}

function createEmptyAppState(account?: AuthAccount): AppState {
  if (!account) return SEED_DATA;
  const empresa: Empresa = {
    id: account.empresaId,
    nome: account.nomeEmpresa,
    cnpj: account.cnpj,
    regimeTributario: account.regimeTributario,
    criadoEm: new Date().toISOString(),
  };
  const usuario: Usuario = {
    id: account.id,
    empresaId: account.empresaId,
    nome: account.nome,
    email: account.email,
    papel: 'ADMIN',
    tamanhoFonte: 100,
    tema: 'ESCURO',
    reduzirAnimacoes: false,
  };
  return {
    empresa,
    usuario,
    contas: [],
    categorias: [],
    lancamentos: [],
    itensEquivalencia: SEED_DATA.itensEquivalencia.filter((item) => item.empresaId === null),
    configsEquivalencia: [],
    relatorios: [],
    metaLucroUnidades: 0,
  };
}

export function getAuthAccounts(): AuthAccount[] {
  const demoAccount: AuthAccount = {
    id: DEMO_USER_ID,
    empresaId: 'emp_001',
    nome: 'Filipe A. Reis',
    email: 'filipe@gmail.com',
    senha: '123456',
    nomeEmpresa: SEED_DATA.empresa.nome,
    cnpj: SEED_DATA.empresa.cnpj,
    regimeTributario: SEED_DATA.empresa.regimeTributario,
  };
  try {
    const stored = localStorage.getItem(AUTH_ACCOUNTS_KEY);
    const accounts: AuthAccount[] = stored ? JSON.parse(stored) : [];
    return [demoAccount, ...accounts.filter((account) => account.id !== DEMO_USER_ID)];
  } catch (err) {
    console.error('Falha ao ler contas cadastradas:', err);
    return [demoAccount];
  }
}

export function authenticateAccount(email: string, senha: string): AuthAccount | null {
  const normalizedEmail = email.trim().toLowerCase();
  return getAuthAccounts().find(
    (account) => account.email.toLowerCase() === normalizedEmail && account.senha === senha
  ) || null;
}

export function registerAccount(
  details: Omit<AuthAccount, 'id' | 'empresaId'>
): AuthAccount {
  const accounts = getAuthAccounts();
  if (accounts.some((account) => account.email.toLowerCase() === details.email.trim().toLowerCase())) {
    throw new Error('Este e-mail já possui uma conta. Faça login ou use outro e-mail.');
  }

  const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const account: AuthAccount = {
    ...details,
    id,
    empresaId: `emp_${id}`,
    email: details.email.trim().toLowerCase(),
  };
  const registeredAccounts = accounts.filter((entry) => entry.id !== DEMO_USER_ID);
  registeredAccounts.push(account);
  localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(registeredAccounts));
  return account;
}

export function loadAuthSession(): string | null {
  try {
    const userId = localStorage.getItem(AUTH_SESSION_KEY);
    return userId && getAuthAccounts().some((account) => account.id === userId) ? userId : null;
  } catch (err) {
    console.error('Falha ao ler sessão de autenticação:', err);
    return null;
  }
}

export function saveAuthSession(userId: string | null): void {
  if (userId) localStorage.setItem(AUTH_SESSION_KEY, userId);
  else localStorage.removeItem(AUTH_SESSION_KEY);
}

/**
 * Calcula métricas do painel financeiro (RF08)
 */
export function calcularMetricas(lancamentos: Lancamento[], contas: ContaFinanceira[]): MetricasFinanceiras {
  const receitaTotal = lancamentos
    .filter((l) => l.tipo === 'RECEITA')
    .reduce((acc, l) => acc + l.valor, 0);

  const despesaTotal = lancamentos
    .filter((l) => l.tipo === 'DESPESA')
    .reduce((acc, l) => acc + l.valor, 0);

  const lucroLiquido = receitaTotal - despesaTotal;
  const margemLucro = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

  // Saldo consolidado das contas financeiras ativas
  const saldoInicialContas = contas
    .filter((c) => c.ativa)
    .reduce((acc, c) => acc + c.saldoInicial, 0);

  const saldoConsolidado = saldoInicialContas + lucroLiquido;
  const runwayMeses = despesaTotal > 0 ? Math.round((saldoConsolidado / despesaTotal) * 10) / 10 : 12;

  return {
    receitaTotal,
    despesaTotal,
    lucroLiquido,
    margemLucro: Math.round(margemLucro * 10) / 10,
    saldoConsolidado,
    runwayMeses,
    variacaoReceitaPercentual: 14.2,
    variacaoDespesaPercentual: -5.0,
    variacaoLucroPercentual: 28.0,
  };
}
