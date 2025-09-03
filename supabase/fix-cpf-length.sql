-- 🔧 CORRIGIR TAMANHO DO CAMPO CPF
-- Execute este SQL no SQL Editor do Supabase

-- 1️⃣ AUMENTAR TAMANHO DO CAMPO CPF
ALTER TABLE inscricoes ALTER COLUMN cpf TYPE VARCHAR(20);

-- 2️⃣ VERIFICAR ALTERAÇÃO
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'inscricoes' AND column_name = 'cpf';

-- 3️⃣ AGORA EXECUTE O SCRIPT DE MIGRAÇÃO COMPLETA
-- (supabase/migrate-complete-data.sql)
