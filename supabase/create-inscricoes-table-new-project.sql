-- 📝 Criar Tabela Inscrições no Novo Projeto Supabase
-- Execute este SQL no SQL Editor do Supabase: https://vlwuwutoulfbbieznios.supabase.co

-- Criar tabela de inscrições
CREATE TABLE IF NOT EXISTS inscricoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Dados básicos
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  cpf VARCHAR(14),
  
  -- Tipo e status
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('judge', 'audiovisual', 'staff')),
  valor DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'cadastrado',
  
  -- Campos específicos por tipo
  portfolio TEXT,
  experiencia TEXT,
  disponibilidade TEXT,
  motivacao TEXT,
  certificacoes TEXT,
  
  -- Campos de pagamento (se aplicável)
  correlation_id VARCHAR(255),
  charge_id VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_inscricoes_email ON inscricoes(email);
CREATE INDEX IF NOT EXISTS idx_inscricoes_tipo ON inscricoes(tipo);
CREATE INDEX IF NOT EXISTS idx_inscricoes_status ON inscricoes(status);
CREATE INDEX IF NOT EXISTS idx_inscricoes_data_criacao ON inscricoes(data_criacao);
CREATE INDEX IF NOT EXISTS idx_inscricoes_cpf ON inscricoes(cpf);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_inscricoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_inscricoes_updated_at ON inscricoes;
CREATE TRIGGER update_inscricoes_updated_at 
  BEFORE UPDATE ON inscricoes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_inscricoes_updated_at();

-- Habilitar RLS
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
DROP POLICY IF EXISTS inscricoes_select_policy ON inscricoes;
CREATE POLICY inscricoes_select_policy ON inscricoes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS inscricoes_insert_policy ON inscricoes;
CREATE POLICY inscricoes_insert_policy ON inscricoes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS inscricoes_update_policy ON inscricoes;
CREATE POLICY inscricoes_update_policy ON inscricoes
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS inscricoes_delete_policy ON inscricoes;
CREATE POLICY inscricoes_delete_policy ON inscricoes
  FOR DELETE USING (true);

-- Inserir dados de exemplo para teste
INSERT INTO inscricoes (
  nome, 
  email, 
  whatsapp, 
  cpf, 
  tipo, 
  valor, 
  status,
  portfolio,
  experiencia,
  disponibilidade,
  motivacao,
  certificacoes
) VALUES 
(
  'João Silva Santos',
  'joao@email.com',
  '(11) 99999-9999',
  '123.456.789-00',
  'judge',
  0,
  'cadastrado',
  NULL,
  '5 anos como CrossFitter',
  'Finais de semana',
  'Quero contribuir para o evento',
  'CrossFit Level 1, Level 2'
),
(
  'Maria Oliveira Costa',
  'maria@email.com',
  '(21) 88888-8888',
  '987.654.321-00',
  'audiovisual',
  29.90,
  'pago',
  'https://maria-portfolio.com',
  '3 anos de fotografia esportiva',
  'Durante o evento',
  'Capturar momentos épicos',
  NULL
),
(
  'Pedro Santos Lima',
  'pedro@email.com',
  '(31) 77777-7777',
  '456.789.123-00',
  'staff',
  0,
  'cadastrado',
  NULL,
  '2 anos como staff em eventos',
  'Todo o evento',
  'Apoiar na organização',
  'Certificação em gestão de eventos'
);

-- Verificar se a tabela foi criada
SELECT 
  'Tabela inscricoes criada com sucesso!' as status,
  COUNT(*) as total_inscricoes,
  COUNT(CASE WHEN tipo = 'judge' THEN 1 END) as total_judges,
  COUNT(CASE WHEN tipo = 'audiovisual' THEN 1 END) as total_audiovisual,
  COUNT(CASE WHEN tipo = 'staff' THEN 1 END) as total_staff
FROM inscricoes;
