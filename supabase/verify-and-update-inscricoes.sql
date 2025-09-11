-- 🔍 Verificar e Atualizar Tabela de Inscrições INTERBØX 2025
-- Execute este SQL no SQL Editor do Supabase

-- 1. Verificar estrutura atual da tabela
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'inscricoes'
ORDER BY ordinal_position;

-- 2. Adicionar campo data_confirmacao se não existir
ALTER TABLE inscricoes 
ADD COLUMN IF NOT EXISTS data_confirmacao TIMESTAMP WITH TIME ZONE;

-- 3. Adicionar comentários nas colunas importantes
COMMENT ON COLUMN inscricoes.data_confirmacao IS 'Data e hora da confirmação do pagamento';
COMMENT ON COLUMN inscricoes.correlation_id IS 'ID de correlação do OpenPix/Woovi';
COMMENT ON COLUMN inscricoes.charge_id IS 'ID da charge do OpenPix/Woovi';
COMMENT ON COLUMN inscricoes.status IS 'Status da inscrição: cadastrado, pendente, pago, cancelado';

-- 4. Verificar se existem dados na tabela
SELECT 
  COUNT(*) as total_inscricoes,
  COUNT(CASE WHEN tipo = 'judge' THEN 1 END) as total_judges,
  COUNT(CASE WHEN tipo = 'audiovisual' THEN 1 END) as total_audiovisual,
  COUNT(CASE WHEN tipo = 'staff' THEN 1 END) as total_staff,
  COUNT(CASE WHEN status = 'cadastrado' THEN 1 END) as cadastrados,
  COUNT(CASE WHEN status = 'pago' THEN 1 END) as pagos
FROM inscricoes;

-- 5. Verificar estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'inscricoes'
ORDER BY ordinal_position;
