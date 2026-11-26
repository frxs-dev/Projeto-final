-- ==============================================================================
-- FINANCE - SISTEMA DE GESTÃO FINANCEIRA TANGÍVEL & INTELIGENTE
-- SENAI / Desenvolvimento de Sistemas
-- Schema Oficial PostgreSQL compatível com Supabase & RLS (Row Level Security)
-- ==============================================================================

-- Habilita extensão para UUID se necessário
create extension if not exists "uuid-ossp";

-- 1. TABELA EMPRESA (RF02)
create table if not exists public.empresa (
    id uuid primary key default gen_random_uuid(),
    nome varchar(255) not null,
    cnpj varchar(18) unique not null,
    regime_tributario varchar(50) not null default 'SIMPLES_NACIONAL' check (regime_tributario in ('MEI', 'SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO')),
    faturamento_anual_estimado numeric(15, 2) default 0.00,
    criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TABELA USUARIO (RF01, RF02, RF15)
create table if not exists public.usuario (
    id uuid primary key default gen_random_uuid(),
    empresa_id uuid not null references public.empresa(id) on delete cascade,
    nome varchar(255) not null,
    email varchar(255) unique not null,
    papel varchar(20) not null default 'ADMIN' check (papel in ('ADMIN', 'FINANCEIRO', 'LEITOR')),
    tamanho_fonte integer not null default 100 check (tamanho_fonte in (100, 125, 150)),
    tema varchar(20) not null default 'ESCURO' check (tema in ('CLARO', 'ESCURO', 'ALTO_CONTRASTE')),
    reduzir_animacoes boolean not null default false,
    criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TABELA CONTA_FINANCEIRA (RF03)
create table if not exists public.conta_financeira (
    id uuid primary key default gen_random_uuid(),
    empresa_id uuid not null references public.empresa(id) on delete cascade,
    nome varchar(100) not null,
    tipo varchar(20) not null check (tipo in ('CAIXA', 'BANCO', 'CARTAO')),
    instituicao varchar(100),
    saldo_inicial numeric(15, 2) not null default 0.00,
    ativa boolean not null default true,
    criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABELA CATEGORIA (RF04)
create table if not exists public.categoria (
    id uuid primary key default gen_random_uuid(),
    empresa_id uuid not null references public.empresa(id) on delete cascade,
    nome varchar(100) not null,
    tipo varchar(20) not null check (tipo in ('RECEITA', 'DESPESA')),
    cor varchar(7) default '#00e599',
    icone varchar(50) default 'sell',
    ativa boolean not null default true,
    criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TABELA ITEM_EQUIVALENCIA (RF09, RF11)
-- empresa_id nulo = item padrão do catálogo global
create table if not exists public.item_equivalencia (
    id uuid primary key default gen_random_uuid(),
    empresa_id uuid references public.empresa(id) on delete cascade,
    nome varchar(150) not null,
    subtitulo varchar(255),
    preco_referencia numeric(15, 2) not null check (preco_referencia > 0),
    icone varchar(50) not null default 'devices',
    categoria_objeto varchar(50) default 'Tecnologia',
    criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. TABELA CONFIG_EQUIVALENCIA (RF10)
create table if not exists public.config_equivalencia (
    id uuid primary key default gen_random_uuid(),
    empresa_id uuid not null references public.empresa(id) on delete cascade,
    item_id uuid not null references public.item_equivalencia(id) on delete cascade,
    aplicacao varchar(20) not null check (aplicacao in ('DESPESA', 'LUCRO')),
    atualizado_em timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (empresa_id, aplicacao)
);

-- 7. TABELA LANCAMENTO (RF05, RF06, RF07, RF12)
create table if not exists public.lancamento (
    id uuid primary key default gen_random_uuid(),
    empresa_id uuid not null references public.empresa(id) on delete cascade,
    conta_id uuid not null references public.conta_financeira(id) on delete restrict,
    categoria_id uuid not null references public.categoria(id) on delete restrict,
    criado_por uuid references public.usuario(id) on delete set null,
    tipo varchar(20) not null check (tipo in ('RECEITA', 'DESPESA')),
    valor numeric(15, 2) not null check (valor > 0),
    data date not null default current_date,
    descricao varchar(255) not null,
    comprovante_url text,
    numero_documento varchar(100),
    criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. TABELA RELATORIO (RF13, RF14, RNF04)
create table if not exists public.relatorio (
    id uuid primary key default gen_random_uuid(),
    empresa_id uuid not null references public.empresa(id) on delete cascade,
    periodo_inicio date not null,
    periodo_fim date not null,
    lucro_atual numeric(15, 2) not null,
    lucro_anterior numeric(15, 2) not null,
    receita_total numeric(15, 2) not null default 0.00,
    despesa_total numeric(15, 2) not null default 0.00,
    variacao_percentual numeric(6, 2) not null default 0.00,
    equivalencia_lucro_texto varchar(255),
    analise text not null, -- Análise causal com dicas em linguagem simples
    dados_agregados jsonb default '{}'::jsonb, -- Anonimização e LGPD conforme RNF04
    gerado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ÍNDICES PARA ALTA PERFORMANCE (RNF02)
create index if not exists idx_lancamento_empresa_data on public.lancamento (empresa_id, data desc);
create index if not exists idx_lancamento_tipo on public.lancamento (tipo);
create index if not exists idx_categoria_empresa on public.categoria (empresa_id, tipo);
create index if not exists idx_conta_empresa on public.conta_financeira (empresa_id);
create index if not exists idx_relatorio_empresa_data on public.relatorio (empresa_id, gerado_em desc);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - RNF03
-- ==============================================================================

alter table public.empresa enable row level security;
alter table public.usuario enable row level security;
alter table public.conta_financeira enable row level security;
alter table public.categoria enable row level security;
alter table public.lancamento enable row level security;
alter table public.item_equivalencia enable row level security;
alter table public.config_equivalencia enable row level security;
alter table public.relatorio enable row level security;

-- Política de isolamento por empresa
create policy "Acesso a empresa do usuario logado"
    on public.empresa for select
    using (id in (select empresa_id from public.usuario where usuario.id = auth.uid()));

create policy "Acesso aos usuarios da mesma empresa"
    on public.usuario for select
    using (empresa_id in (select empresa_id from public.usuario where usuario.id = auth.uid()));

create policy "Acesso a contas da empresa"
    on public.conta_financeira for all
    using (empresa_id in (select empresa_id from public.usuario where usuario.id = auth.uid()));

create policy "Acesso a categorias da empresa"
    on public.categoria for all
    using (empresa_id in (select empresa_id from public.usuario where usuario.id = auth.uid()));

create policy "Acesso a lancamentos da empresa"
    on public.lancamento for all
    using (empresa_id in (select empresa_id from public.usuario where usuario.id = auth.uid()));

create policy "Acesso a itens de equivalencia padrao ou da empresa"
    on public.item_equivalencia for all
    using (empresa_id is null or empresa_id in (select empresa_id from public.usuario where usuario.id = auth.uid()));

create policy "Acesso a config equivalencia da empresa"
    on public.config_equivalencia for all
    using (empresa_id in (select empresa_id from public.usuario where usuario.id = auth.uid()));

create policy "Acesso a relatorios da empresa"
    on public.relatorio for all
    using (empresa_id in (select empresa_id from public.usuario where usuario.id = auth.uid()));

-- ==============================================================================
-- SEED DE DADOS INICIAIS (CATÁLOGO PADRÃO DE EQUIVALÊNCIAS - RF09)
-- ==============================================================================

insert into public.item_equivalencia (id, empresa_id, nome, subtitulo, preco_referencia, icone, categoria_objeto)
values
    ('10000000-0000-0000-0000-000000000001', null, 'iPhone 16 Pro 256GB', 'Eletrônicos Premium • Ref. Apple BR', 7500.00, 'smartphone', 'Eletrônicos'),
    ('10000000-0000-0000-0000-000000000002', null, 'Notebook Dell XPS 15', 'Dell XPS 32GB RAM • Padrão Engenharia', 11200.00, 'laptop_mac', 'Computadores'),
    ('10000000-0000-0000-0000-000000000003', null, 'Salário Mínimo Vigente', 'Legislação Nacional • Brasil 2024/2026', 1412.00, 'payments', 'Economia'),
    ('10000000-0000-0000-0000-000000000004', null, 'Cesta Básica Corporativa', 'Benefício Médio DIEESE / FIPE', 850.00, 'shopping_basket', 'Alimentação'),
    ('10000000-0000-0000-0000-000000000005', null, 'Máquina de Café Industrial', 'Ativo Imobilizado Escritório', 4200.00, 'coffee_maker', 'Equipamentos'),
    ('10000000-0000-0000-0000-000000000006', null, 'Servidor Rack Dell PowerEdge', 'Infraestrutura On-Premise 64 Cores', 32000.00, 'dns', 'Servidores')
on conflict (id) do nothing;
