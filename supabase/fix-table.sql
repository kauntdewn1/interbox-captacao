-- 🛠️ Script para corrigir tabela seguros
-- Execute este SQL no SQL Editor do Supabase

-- 1. Fazer backup dos dados existentes (opcional)
CREATE TABLE IF NOT EXISTS seguros_backup AS 
SELECT * FROM seguros;

-- 2. Remover a constraint UNIQUE problemática (se existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'seguros' 
    AND constraint_name = 'seguros_cpf_key'
  ) THEN
    ALTER TABLE seguros DROP CONSTRAINT seguros_cpf_key;
    RAISE NOTICE 'Constraint seguros_cpf_key removida';
  ELSE
    RAISE NOTICE 'Constraint seguros_cpf_key não encontrada';
  END IF;
END $$;

-- 3. Limpar todos os dados existentes
TRUNCATE TABLE seguros RESTART IDENTITY CASCADE;

-- 4. Recriar a constraint UNIQUE corretamente
ALTER TABLE seguros ADD CONSTRAINT seguros_cpf_key UNIQUE (cpf);

-- 5. Inserir dados de exemplo únicos
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

-- 6. Verificar se tudo foi criado corretamente
SELECT 
  'Verificação da tabela' as status,
  COUNT(*) as total_registros,
  COUNT(DISTINCT cpf) as cpfs_unicos
FROM seguros;

-- 7. Verificar dados inseridos
SELECT 
  id,
  nome,
  cpf,
  status,
  data_criacao
FROM seguros 
ORDER BY data_criacao DESC;

-- 8. Verificar constraint UNIQUE
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'seguros' 
  AND constraint_type = 'UNIQUE';
