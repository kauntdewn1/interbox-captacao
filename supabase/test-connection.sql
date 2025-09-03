-- 🔑 Script para testar conexão com Supabase
-- Execute este SQL no SQL Editor do Supabase

-- 1. Verificar se a tabela seguros está acessível
SELECT 
  'Teste de conexão' as status,
  COUNT(*) as total_registros
FROM seguros;

-- 2. Verificar se conseguimos inserir um registro de teste
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
  'Teste Conexão',
  '000.111.222-33',
  '1990-01-01',
  'masculino',
  'teste@conexao.com',
  '(11) 00000-0000',
  'Time Teste',
  'Teste de conexão direta',
  'seguro',
  39.90,
  'pendente_comprovante'
)
RETURNING id, nome, cpf, status;

-- 3. Verificar se o registro foi inserido
SELECT 
  'Após inserção' as status,
  COUNT(*) as total_registros
FROM seguros;

-- 4. Remover o registro de teste
DELETE FROM seguros WHERE cpf = '000.111.222-33';

-- 5. Verificar se foi removido
SELECT 
  'Após remoção' as status,
  COUNT(*) as total_registros
FROM seguros;
