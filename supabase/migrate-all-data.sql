-- 🚀 MIGRAÇÃO COMPLETA DE DADOS PARA SUPABASE
-- Execute este SQL no SQL Editor do Supabase: https://vlwuwutoulfbbieznios.supabase.co

-- 1️⃣ PRIMEIRO: Criar tabela inscricoes se não existir
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

-- 2️⃣ CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_inscricoes_email ON inscricoes(email);
CREATE INDEX IF NOT EXISTS idx_inscricoes_tipo ON inscricoes(tipo);
CREATE INDEX IF NOT EXISTS idx_inscricoes_status ON inscricoes(status);
CREATE INDEX IF NOT EXISTS idx_inscricoes_data_criacao ON inscricoes(data_criacao);
CREATE INDEX IF NOT EXISTS idx_inscricoes_cpf ON inscricoes(cpf);

-- 3️⃣ CRIAR FUNÇÃO E TRIGGER
CREATE OR REPLACE FUNCTION update_inscricoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_inscricoes_updated_at ON inscricoes;
CREATE TRIGGER update_inscricoes_updated_at 
  BEFORE UPDATE ON inscricoes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_inscricoes_updated_at();

-- 4️⃣ HABILITAR RLS
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;

-- 5️⃣ CRIAR POLÍTICAS RLS
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

-- 6️⃣ INSERIR DADOS EXISTENTES
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
  certificacoes,
  data_criacao
) VALUES 
(
  'Brenda Borges',
  'bree.enda@hotmail.com',
  '62981293120',
  '00974814164',
  'judge',
  0,
  'cadastrado',
  NULL,
  'já arbitrei cerrado e monstar várias vezes, JCB Crossfit, punk games.',
  'integral',
  'Porque além de gostar de ver os padrões dos movimentos de cada atleta, eu contribuo com a comunidade, desenvolvo um olhar técnico mais apurado, aprendo muito sobre os movimentos e vivo o Crossfit de perto.',
  'Curso de judge e scaling da CrossFit. Coach no box LiftZone CrossFit',
  '2025-09-03T14:38:59.519Z'
),
(
  'Teste Judge',
  'teste@judge.com',
  '11999999999',
  '12345678901',
  'judge',
  0,
  'cadastrado',
  NULL,
  'Teste',
  'Teste',
  'Teste',
  'Teste',
  '2025-09-03T14:38:22.341Z'
);

-- 7️⃣ VERIFICAR MIGRAÇÃO
SELECT 
  '✅ MIGRAÇÃO CONCLUÍDA!' as status,
  COUNT(*) as total_inscricoes,
  COUNT(CASE WHEN tipo = 'judge' THEN 1 END) as total_judges,
  COUNT(CASE WHEN tipo = 'audiovisual' THEN 1 END) as total_audiovisual,
  COUNT(CASE WHEN tipo = 'staff' THEN 1 END) as total_staff,
  MIN(data_criacao) as primeira_inscricao,
  MAX(data_criacao) as ultima_inscricao
FROM inscricoes;

-- 8️⃣ LISTAR TODAS AS INSCRIÇÕES
SELECT 
  nome,
  email,
  tipo,
  status,
  data_criacao
FROM inscricoes 
ORDER BY data_criacao DESC;
