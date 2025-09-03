-- 🧹 Script para limpar tabela de backup desnecessária
-- Execute este SQL no SQL Editor do Supabase

-- Remover a tabela de backup que não precisamos
DROP TABLE IF EXISTS seguros_backup;

-- Verificar se foi removida
SELECT 
  schemaname,
  tablename
FROM pg_tables 
WHERE tablename LIKE '%backup%';
