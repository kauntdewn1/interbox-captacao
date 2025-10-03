-- Schema consolidado para INTERBØX 2025
-- Postgres/Supabase

-- Extensões úteis (no Supabase a maioria já está ativa)
-- create extension if not exists "pgcrypto";
-- create extension if not exists "uuid-ossp";

-- =============================
-- TABELA: usuarios (opcional)
-- =============================
create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  whatsapp text,
  cpf text,
  created_at timestamptz not null default now(),
  unique (email),
  unique (cpf)
);

-- =============================
-- TABELA: inscricoes (judge/staff)
-- =============================
create table if not exists public.inscricoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios(id) on delete set null,
  nome text not null,
  email text not null,
  whatsapp text not null,
  cpf text,
  tipo text not null check (tipo in ('judge','staff')),
  valor integer not null default 0,
  status text not null default 'pendente',
  correlation_id text,
  charge_id text,
  data_criacao timestamptz not null default now(),
  data_atualizacao timestamptz,
  data_confirmacao timestamptz,
  portfolio text,
  experiencia text,
  disponibilidade text,
  motivacao text,
  certificacoes text
);

create index if not exists idx_inscricoes_tipo on public.inscricoes (tipo);
create index if not exists idx_inscricoes_status on public.inscricoes (status);
create index if not exists idx_inscricoes_correlation on public.inscricoes (correlation_id);
create index if not exists idx_inscricoes_charge on public.inscricoes (charge_id);

-- Histórico de mudanças de status de inscrições (opcional)
create table if not exists public.inscricoes_historico (
  id bigserial primary key,
  inscricao_id uuid not null references public.inscricoes(id) on delete cascade,
  novo_status text not null,
  criado_em timestamptz not null default now()
);

-- =============================
-- TABELA: seguros
-- =============================
create table if not exists public.seguros (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  whatsapp text not null,
  status text not null default 'pendente',
  created_at timestamptz not null default now()
);

create index if not exists idx_seguros_status on public.seguros (status);

-- =============================
-- TABELAS: vendas de produtos
-- =============================
create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  preco_centavos integer not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios(id) on delete set null,
  status text not null default 'PENDING' check (status in ('PENDING','CONFIRMED','CANCELLED','FAILED')),
  total_centavos integer not null default 0,
  correlation_id text,
  charge_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  confirmed_at timestamptz
);

create index if not exists idx_pedidos_status on public.pedidos (status);
create index if not exists idx_pedidos_charge on public.pedidos (charge_id);
create index if not exists idx_pedidos_correlation on public.pedidos (correlation_id);

create table if not exists public.pedido_itens (
  id bigserial primary key,
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  produto_id uuid not null references public.produtos(id),
  quantidade integer not null check (quantidade > 0),
  preco_unit_centavos integer not null,
  subtotal_centavos integer generated always as (quantidade * preco_unit_centavos) stored,
  unique (pedido_id, produto_id)
);

-- Histórico de pedidos (opcional)
create table if not exists public.pedidos_historico (
  id bigserial primary key,
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  novo_status text not null,
  criado_em timestamptz not null default now()
);

-- =============================
-- FUNÇÕES AUXILIARES
-- =============================

-- Atualiza status do pedido + histórico
create or replace function public.registrar_pagamento(p_pedido_id uuid, p_status text)
returns void
language plpgsql
as $$
declare
  v_now timestamptz := now();
begin
  if p_status not in ('PENDING','CONFIRMED','CANCELLED','FAILED') then
    raise exception 'Status inválido: %', p_status;
  end if;

  update public.pedidos
     set status = p_status,
         updated_at = v_now,
         confirmed_at = case when p_status = 'CONFIRMED' then v_now else confirmed_at end
   where id = p_pedido_id;

  if not found then
    raise exception 'Pedido % não encontrado', p_pedido_id;
  end if;

  insert into public.pedidos_historico (pedido_id, novo_status)
  values (p_pedido_id, p_status);
end;
$$;

-- Atualiza status da inscrição (por charge/correlation) + histórico
create or replace function public.registrar_pagamento_inscricao(p_charge_id text, p_status text)
returns void
language plpgsql
as $$
declare
  v_now timestamptz := now();
begin
  if p_status not in ('pendente','pago','cancelado','falha') then
    raise exception 'Status inválido: %', p_status;
  end if;

  update public.inscricoes
     set status = p_status,
         data_atualizacao = v_now,
         data_confirmacao = case when p_status = 'pago' then v_now else data_confirmacao end
   where charge_id = p_charge_id
      or correlation_id = p_charge_id;

  if not found then
    raise exception 'Inscrição não encontrada para charge/correlation_id: %', p_charge_id;
  end if;

  insert into public.inscricoes_historico (inscricao_id, novo_status, criado_em)
  select i.id, p_status, v_now
    from public.inscricoes i
   where i.charge_id = p_charge_id
      or i.correlation_id = p_charge_id;
end;
$$;

-- =============================
-- VIEWS/CONSULTAS ÚTEIS (opcional)
-- =============================

-- Inscrições por mês (exemplo)
create or replace view public.vw_inscricoes_por_mes as
select to_char(date_trunc('month', data_criacao), 'YYYY-MM') as mes,
       count(*) as total
  from public.inscricoes
 group by 1
 order by 1;

