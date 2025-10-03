-- RLS mínima e permissiva
-- Opção 2: manter simples, com leitura pública onde faz sentido
-- Ajuste conforme necessidade. Execute após o schema_full.sql

-- Habilitar RLS
alter table if exists public.usuarios enable row level security;
alter table if exists public.inscricoes enable row level security;
alter table if exists public.inscricoes_historico enable row level security;
alter table if exists public.seguros enable row level security;
alter table if exists public.produtos enable row level security;
alter table if exists public.pedidos enable row level security;
alter table if exists public.pedido_itens enable row level security;
alter table if exists public.pedidos_historico enable row level security;

-- Produtos: leitura pública, escrita por authenticated
drop policy if exists produtos_select_public on public.produtos;
create policy produtos_select_public
on public.produtos for select
to anon, authenticated
using (true);

drop policy if exists produtos_write_auth on public.produtos;
create policy produtos_write_auth
on public.produtos for all
to authenticated
using (true)
with check (true);

-- Inscrições: leitura pública (se quiser), escrita por authenticated
drop policy if exists inscricoes_select_public on public.inscricoes;
create policy inscricoes_select_public
on public.inscricoes for select
to anon, authenticated
using (true);

drop policy if exists inscricoes_write_auth on public.inscricoes;
create policy inscricoes_write_auth
on public.inscricoes for all
to authenticated
using (true)
with check (true);

-- Seguros: inserção pública (form) e leitura pública
drop policy if exists seguros_insert_public on public.seguros;
create policy seguros_insert_public
on public.seguros for insert
to anon, authenticated
with check (true);

drop policy if exists seguros_select_public on public.seguros;
create policy seguros_select_public
on public.seguros for select
to anon, authenticated
using (true);

-- Pedidos: leitura/escrita por authenticated (frontend) e service bypassa RLS
drop policy if exists pedidos_rw_auth on public.pedidos;
create policy pedidos_rw_auth
on public.pedidos for all
to authenticated
using (true)
with check (true);

-- Itens do pedido: leitura/escrita por authenticated
drop policy if exists pedido_itens_rw_auth on public.pedido_itens;
create policy pedido_itens_rw_auth
on public.pedido_itens for all
to authenticated
using (true)
with check (true);

-- Históricos: leitura pública
drop policy if exists inscricoes_hist_select_public on public.inscricoes_historico;
create policy inscricoes_hist_select_public
on public.inscricoes_historico for select
to anon, authenticated
using (true);

drop policy if exists pedidos_hist_select_public on public.pedidos_historico;
create policy pedidos_hist_select_public
on public.pedidos_historico for select
to anon, authenticated
using (true);

-- Observações:
-- - A service_key do Supabase ignora RLS, então o backend (Netlify Functions) mantém acesso total.
-- - Se quiser restringir alguma tabela depois, basta remover ou ajustar a policy correspondente.
