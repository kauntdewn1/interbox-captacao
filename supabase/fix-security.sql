-- 🔒 Script para corrigir problemas de segurança
-- Execute este SQL no SQL Editor do Supabase

-- 1. Corrigir a função update_updated_at_column com search_path fixo
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql' SET search_path = 'public';

-- 2. Recriar o trigger com a função corrigida
DROP TRIGGER IF EXISTS update_seguros_updated_at ON seguros;

CREATE TRIGGER update_seguros_updated_at 
  BEFORE UPDATE ON seguros 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 3. Habilitar RLS na tabela seguros (se não estiver habilitado)
ALTER TABLE seguros ENABLE ROW LEVEL SECURITY;

-- 4. Criar política RLS para permitir operações CRUD
-- Política para inserção (qualquer usuário autenticado pode inserir)
CREATE POLICY "Permitir inserção de seguros" ON seguros
  FOR INSERT WITH CHECK (true);

-- Política para leitura (qualquer usuário autenticado pode ler)
CREATE POLICY "Permitir leitura de seguros" ON seguros
  FOR SELECT USING (true);

-- Política para atualização (qualquer usuário autenticado pode atualizar)
CREATE POLICY "Permitir atualização de seguros" ON seguros
  FOR UPDATE USING (true);

-- Política para exclusão (qualquer usuário autenticado pode excluir)
CREATE POLICY "Permitir exclusão de seguros" ON seguros
  FOR DELETE USING (true);

-- 5. Remover a tabela de backup (opcional - se não precisar)
-- DROP TABLE IF EXISTS seguros_backup;

-- 6. Verificar se as políticas RLS foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'seguros';

-- 7. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'seguros';

-- 8. Verificar se a função foi corrigida
SELECT 
  proname,
  prosrc,
  proconfig
FROM pg_proc 
WHERE proname = 'update_updated_at_column';
