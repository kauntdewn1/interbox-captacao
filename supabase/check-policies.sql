-- 🔍 Script para verificar e limpar políticas RLS duplicadas
-- Execute este SQL no SQL Editor do Supabase

-- 1. Verificar todas as políticas existentes na tabela seguros
SELECT 
  polname AS policy_name,
  polrelid::regclass AS table_name,
  polpermissive AS permissive,
  polcmd AS command,
  polroles AS roles,
  polqual AS qual,
  polwithcheck AS with_check
FROM pg_policy
WHERE polrelid = 'public.seguros'::regclass
ORDER BY polname, polcmd;

-- 2. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'seguros';

-- 3. Remover todas as políticas existentes para recriar corretamente
DROP POLICY IF EXISTS "Permitir inserção de seguros" ON public.seguros;
DROP POLICY IF EXISTS "Permitir leitura de seguros" ON public.seguros;
DROP POLICY IF EXISTS "Permitir atualização de seguros" ON public.seguros;
DROP POLICY IF EXISTS "Permitir exclusão de seguros" ON public.seguros;

-- 4. Recriar as políticas RLS corretamente
-- Política para inserção
CREATE POLICY "seguros_insert_policy" ON seguros
  FOR INSERT WITH CHECK (true);

-- Política para leitura
CREATE POLICY "seguros_select_policy" ON seguros
  FOR SELECT USING (true);

-- Política para atualização
CREATE POLICY "seguros_update_policy" ON seguros
  FOR UPDATE USING (true);

-- Política para exclusão
CREATE POLICY "seguros_delete_policy" ON seguros
  FOR DELETE USING (true);

-- 5. Verificar se as novas políticas foram criadas
SELECT 
  polname AS policy_name,
  polrelid::regclass AS table_name,
  polpermissive AS permissive,
  polcmd AS command
FROM pg_policy
WHERE polrelid = 'public.seguros'::regclass
ORDER BY polname, polcmd;

-- 6. Verificar se RLS está funcionando
SELECT 
  'RLS Status' as status,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'seguros';
