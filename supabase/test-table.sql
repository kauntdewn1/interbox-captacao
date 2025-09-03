-- 🧪 Script para testar tabela seguros
-- Execute este SQL no SQL Editor do Supabase

-- 1. Verificar dados existentes
SELECT 
  'Dados atuais' as status,
  COUNT(*) as total_registros,
  COUNT(DISTINCT cpf) as cpfs_unicos
FROM seguros;

-- 2. Listar todos os registros
SELECT 
  id,
  nome,
  cpf,
  status,
  data_criacao
FROM seguros 
ORDER BY data_criacao DESC;

-- 3. Teste de inserção de novo registro
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
  'Teste Sistema',
  '999.888.777-66',
  '1990-01-01',
  'masculino',
  'teste@sistema.com',
  '(11) 99999-9999',
  'Time Teste',
  'Registro de teste do sistema',
  'seguro',
  39.90,
  'pendente_comprovante'
)
RETURNING id, nome, cpf, status;

-- 4. Verificar se o novo registro foi inserido
SELECT 
  'Após inserção' as status,
  COUNT(*) as total_registros,
  COUNT(DISTINCT cpf) as cpfs_unicos
FROM seguros;

-- 5. Teste de atualização de status
UPDATE seguros 
SET status = 'comprovante_enviado'
WHERE cpf = '999.888.777-66'
RETURNING id, nome, cpf, status;

-- 6. Verificar se a atualização funcionou
SELECT 
  id,
  nome,
  cpf,
  status,
  updated_at
FROM seguros 
WHERE cpf = '999.888.777-66';

-- 7. Teste de busca por CPF
SELECT 
  id,
  nome,
  cpf,
  status,
  data_criacao
FROM seguros 
WHERE cpf = '111.222.333-44';

-- 8. Estatísticas finais
SELECT 
  'Estatísticas finais' as status,
  COUNT(*) as total_seguros,
  COUNT(CASE WHEN status = 'pendente_comprovante' THEN 1 END) as pendentes,
  COUNT(CASE WHEN status = 'comprovante_enviado' THEN 1 END) as comprovantes_enviados,
  COUNT(CASE WHEN status = 'pago_confirmado' THEN 1 END) as pagos_confirmados,
  SUM(valor) as valor_total
FROM seguros;
