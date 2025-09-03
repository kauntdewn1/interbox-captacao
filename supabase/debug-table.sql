-- 🔍 Script de diagnóstico para tabela seguros
-- Execute este SQL no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'seguros' 
ORDER BY ordinal_position;

-- 2. Verificar constraints existentes
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'seguros';

-- 3. Verificar dados existentes
SELECT 
  id,
  nome,
  cpf,
  status,
  created_at,
  data_criacao
FROM seguros 
ORDER BY created_at DESC;

-- 4. Verificar CPFs duplicados (se houver)
SELECT 
  cpf, 
  COUNT(*) AS ocorrencias
FROM seguros 
GROUP BY cpf 
HAVING COUNT(*) > 1;

-- 5. Verificar total de registros
SELECT COUNT(*) as total_registros FROM seguros;

-- 6. Verificar se a constraint UNIQUE está ativa
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  tc.is_deferrable,
  tc.initially_deferred
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'seguros' 
  AND tc.constraint_type = 'UNIQUE';
