-- 🆕 Script para criar tabela seguros no NOVO projeto Supabase
-- Execute este SQL no SQL Editor do Supabase: https://vlwuwutoulfbbieznios.supabase.co

-- 1. Criar tabela de seguros
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

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_seguros_cpf ON seguros(cpf);
CREATE INDEX IF NOT EXISTS idx_seguros_status ON seguros(status);
CREATE INDEX IF NOT EXISTS idx_seguros_data_criacao ON seguros(data_criacao);
CREATE INDEX IF NOT EXISTS idx_seguros_tipo ON seguros(tipo);
CREATE INDEX IF NOT EXISTS idx_seguros_email ON seguros(email);

-- 3. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql' SET search_path = 'public';

-- 4. Criar trigger para atualizar updated_at
CREATE TRIGGER update_seguros_updated_at 
  BEFORE UPDATE ON seguros 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Habilitar RLS
ALTER TABLE seguros ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS básicas
CREATE POLICY "seguros_select_policy" ON seguros FOR SELECT USING (true);
CREATE POLICY "seguros_insert_policy" ON seguros FOR INSERT WITH CHECK (true);
CREATE POLICY "seguros_update_policy" ON seguros FOR UPDATE USING (true);
CREATE POLICY "seguros_delete_policy" ON seguros FOR DELETE USING (true);

-- 7. Inserir dados de exemplo
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
);

-- 8. Verificar se foi criado
SELECT 
  'Tabela criada com sucesso!' as status,
  COUNT(*) as total_registros
FROM seguros;
