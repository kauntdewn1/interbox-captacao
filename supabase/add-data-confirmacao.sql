-- 🆕 Adicionar campo data_confirmacao na tabela inscricoes
-- Execute este SQL no SQL Editor do Supabase

-- Adicionar coluna data_confirmacao se não existir
ALTER TABLE inscricoes 
ADD COLUMN IF NOT EXISTS data_confirmacao TIMESTAMP WITH TIME ZONE;

-- Adicionar comentário na coluna
COMMENT ON COLUMN inscricoes.data_confirmacao IS 'Data e hora da confirmação do pagamento';

-- Verificar se a coluna foi adicionada
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'inscricoes' 
  AND column_name = 'data_confirmacao';
