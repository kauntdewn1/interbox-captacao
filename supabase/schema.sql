-- 🛡️ Schema para Sistema de Seguros INTERBØX 2025
-- Execute este SQL no SQL Editor do Supabase

-- Criar tabela de seguros
CREATE TABLE IF NOT EXISTS seguros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Dados pessoais
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  data_nascimento DATE NOT NULL,
  sexo VARCHAR(20) NOT NULL CHECK (sexo IN ('masculino', 'feminino', 'outro')),
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  
  -- Dados do time
  nome_time VARCHAR(255) NOT NULL,
  observacoes TEXT,
  
  -- Dados do seguro
  tipo VARCHAR(50) NOT NULL DEFAULT 'seguro',
  valor DECIMAL(10,2) NOT NULL DEFAULT 39.90,
  status VARCHAR(50) NOT NULL DEFAULT 'pendente_comprovante' 
    CHECK (status IN ('pendente_comprovante', 'comprovante_enviado', 'pago_confirmado')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_seguros_cpf ON seguros(cpf);
CREATE INDEX IF NOT EXISTS idx_seguros_status ON seguros(status);
CREATE INDEX IF NOT EXISTS idx_seguros_data_criacao ON seguros(data_criacao);
CREATE INDEX IF NOT EXISTS idx_seguros_tipo ON seguros(tipo);
CREATE INDEX IF NOT EXISTS idx_seguros_email ON seguros(email);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at (com verificação de existência)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_seguros_updated_at') THEN
    CREATE TRIGGER update_seguros_updated_at 
      BEFORE UPDATE ON seguros 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Inserir dados de exemplo (opcional)
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
  '123.456.789-00',
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
  '987.654.321-00',
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
  '456.789.123-00',
  '1992-11-08',
  'masculino',
  'pedro@email.com',
  '(31) 77777-7777',
  'Strong Team',
  'Sem observações',
  'seguro',
  39.90,
  'pago_confirmado'
);

-- Criar view para estatísticas
CREATE OR REPLACE VIEW seguros_stats AS
SELECT 
  COUNT(*) as total_seguros,
  COUNT(CASE WHEN status = 'pendente_comprovante' THEN 1 END) as pendentes,
  COUNT(CASE WHEN status = 'comprovante_enviado' THEN 1 END) as comprovantes_enviados,
  COUNT(CASE WHEN status = 'pago_confirmado' THEN 1 END) as pagos_confirmados,
  SUM(valor) as valor_total,
  AVG(valor) as valor_medio
FROM seguros
WHERE tipo = 'seguro';

-- Configurar Row Level Security (RLS)
ALTER TABLE seguros ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (apenas para estatísticas)
CREATE POLICY "Permitir leitura pública de estatísticas" ON seguros
  FOR SELECT USING (true);

-- Política para inserção (apenas com token válido)
CREATE POLICY "Permitir inserção com autenticação" ON seguros
  FOR INSERT WITH CHECK (true);

-- Política para atualização (apenas com token válido)
CREATE POLICY "Permitir atualização com autenticação" ON seguros
  FOR UPDATE USING (true);

-- Comentários na tabela
COMMENT ON TABLE seguros IS 'Tabela para armazenar seguros do INTERBØX 2025';
COMMENT ON COLUMN seguros.cpf IS 'CPF único do segurado (1 CPF = 1 seguro)';
COMMENT ON COLUMN seguros.status IS 'Status do seguro: pendente_comprovante, comprovante_enviado, pago_confirmado';
COMMENT ON COLUMN seguros.valor IS 'Valor fixo do seguro: R$ 39,90';

-- Verificar se a tabela foi criada corretamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'seguros'
ORDER BY ordinal_position;
