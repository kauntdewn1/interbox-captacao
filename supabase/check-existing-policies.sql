-- 🔍 Script para verificar e limpar políticas RLS existentes
-- Execute este SQL no SQL Editor do Supabase

-- 1. Verificar todas as políticas existentes na tabela seguros
SELECT 
  polname AS policy_name,
  polrelid::regclass AS table_name,
  polpermissive AS permissive,
  polcmd AS command,
  polroles AS roles
FROM pg_policy
WHERE polrelid = 'public.seguros'::regclass
ORDER BY polname, polcmd;

-- 2. Remover todas as políticas existentes para recriar corretamente
DROP POLICY IF EXISTS "seguros_insert_policy" ON public.seguros;
DROP POLICY IF EXISTS "seguros_select_policy" ON public.seguros;
DROP POLICY IF EXISTS "seguros_update_policy" ON public.seguros;
DROP POLICY IF EXISTS "seguros_delete_policy" ON public.seguros;
DROP POLICY IF EXISTS "Permitir inserção de seguros" ON public.seguros;
DROP POLICY IF EXISTS "Permitir leitura de seguros" ON public.seguros;
DROP POLICY IF EXISTS "Permitir atualização de seguros" ON public.seguros;
DROP POLICY IF EXISTS "Permitir exclusão de seguros" ON public.seguros;

-- 3. Verificar se todas as políticas foram removidas
SELECT 
  'Políticas após remoção' as status,
  COUNT(*) as total_policies
FROM pg_policy
WHERE polrelid = 'public.seguros'::regclass;

-- 4. Verificar se RLS ainda está habilitado
SELECT 
  'RLS Status' as status,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'seguros';
