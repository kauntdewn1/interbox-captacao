-- 🔑 Script para verificar acesso da chave de serviço
-- Execute este SQL no SQL Editor do Supabase

-- 1. Verificar se estamos logados como service_role
SELECT 
  current_user as usuario_atual,
  current_setting('role') as role_atual;

-- 2. Verificar se conseguimos acessar a tabela seguros
SELECT 
  'Acesso à tabela' as status,
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename = 'seguros';

-- 3. Verificar permissões na tabela
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'seguros';

-- 4. Verificar se conseguimos fazer operações CRUD
-- Teste de SELECT
SELECT 
  'Teste SELECT' as operacao,
  COUNT(*) as registros
FROM seguros;

-- 5. Verificar se RLS está funcionando
SELECT 
  'RLS Status' as status,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'seguros';
