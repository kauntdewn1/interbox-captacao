-- 🧹 Script para limpar e recriar tabela seguros
-- Execute este SQL no SQL Editor do Supabase

-- 1. Limpar dados existentes
DELETE FROM seguros;

-- 2. Resetar a sequência de ID (se necessário)
-- ALTER SEQUENCE seguros_id_seq RESTART WITH 1;

-- 3. Inserir dados de exemplo únicos
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
  'João Silva Santos',
  '111.222.333-44',
  '1990-03-15',
  'masculino',
  'joao@email.com',
  '(11) 99999-9999',
  'CrossFit Champions',
  'Alergia a penicilina',
  'seguro',
  39.90,
  'pendente_comprovante'
),
(
  'Maria Oliveira Costa',
  '222.333.444-55',
  '1985-07-22',
  'feminino',
  'maria@email.com',
  '(21) 88888-8888',
  'Fitness Warriors',
  NULL,
  'seguro',
  39.90,
  'comprovante_enviado'
),
(
  'Pedro Santos Lima',
  '333.444.555-66',
  '1992-11-08',
  'masculino',
  'pedro@email.com',
  '(31) 77777-7777',
  'Power Team',
  'Atleta profissional',
  'seguro',
  39.90,
  'pago_confirmado'
),
(
  'Ana Paula Ferreira',
  '444.555.666-77',
  '1988-04-12',
  'feminino',
  'ana@email.com',
  '(41) 66666-6666',
  'Elite Fitness',
  'Primeira participação',
  'seguro',
  39.90,
  'pendente_comprovante'
),
(
  'Carlos Eduardo Rocha',
  '555.666.777-88',
  '1995-09-30',
  'masculino',
  'carlos@email.com',
  '(51) 55555-5555',
  'Strong Warriors',
  'Treinador certificado',
  'seguro',
  39.90,
  'pendente_comprovante'
);

-- 4. Verificar se foi criado corretamente
SELECT 
  id,
  nome,
  cpf,
  status,
  data_criacao
FROM seguros 
ORDER BY data_criacao DESC;

-- 5. Verificar estatísticas
SELECT 
  COUNT(*) as total_seguros,
  COUNT(CASE WHEN status = 'pendente_comprovante' THEN 1 END) as pendentes,
  COUNT(CASE WHEN status = 'comprovante_enviado' THEN 1 END) as comprovantes_enviados,
  COUNT(CASE WHEN status = 'pago_confirmado' THEN 1 END) as pagos_confirmados,
  SUM(valor) as valor_total
FROM seguros;
