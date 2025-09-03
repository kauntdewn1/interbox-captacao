-- 🧪 Script simples para testar operações básicas
-- Execute este SQL no SQL Editor do Supabase

-- 1. Teste básico de SELECT
SELECT 
  'Teste SELECT' as operacao,
  COUNT(*) as total_registros
FROM seguros;

-- 2. Teste de INSERT (se funcionar, vamos remover depois)
INSERT INTO seguros (
  nome, 
  cpf, 
  data_nascimento, 
  sexo, 
  email, 
  telefone, 
  nome_time, 
  observacoes, 
  tipo, 
  valor, 
  status
) VALUES 
(
  'Teste Simples',
  '999.888.777-66',
  '1990-01-01',
  'masculino',
  'teste@simples.com',
  '(11) 99999-9999',
  'Time Simples',
  'Teste de operações básicas',
  'seguro',
  39.90,
  'pendente_comprovante'
)
RETURNING id, nome, cpf, status;

-- 3. Verificar se foi inserido
SELECT 
  'Após INSERT' as status,
  COUNT(*) as total_registros
FROM seguros;

-- 4. Remover o registro de teste
DELETE FROM seguros WHERE cpf = '999.888.777-66';

-- 5. Verificar se foi removido
SELECT 
  'Após DELETE' as status,
  COUNT(*) as total_registros
FROM seguros;
