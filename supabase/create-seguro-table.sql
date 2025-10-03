-- 🛡️ Criar Tabela de Solicitações de Seguro no Supabase

-- Tabela principal
CREATE TABLE IF NOT EXISTS seguro_solicitacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Dados do solicitante
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  cpf VARCHAR(14),

  -- Dados do seguro
  plano VARCHAR(100),              -- Ex.: básico, premium, etc.
  cobertura TEXT,                  -- Descrição da cobertura desejada
  observacoes TEXT,                -- Observações adicionais
  status VARCHAR(50) DEFAULT 'novo', -- novo | em_analise | aprovado | rejeitado

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_seguro_email ON seguro_solicitacoes(email);
CREATE INDEX IF NOT EXISTS idx_seguro_status ON seguro_solicitacoes(status);
CREATE INDEX IF NOT EXISTS idx_seguro_created_at ON seguro_solicitacoes(created_at);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_seguro_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_seguro_updated_at ON seguro_solicitacoes;
CREATE TRIGGER update_seguro_updated_at
  BEFORE UPDATE ON seguro_solicitacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_seguro_updated_at();

-- Habilitar RLS
ALTER TABLE seguro_solicitacoes ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajuste conforme necessidade)
DROP POLICY IF EXISTS seguro_select_policy ON seguro_solicitacoes;
CREATE POLICY seguro_select_policy ON seguro_solicitacoes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS seguro_insert_policy ON seguro_solicitacoes;
CREATE POLICY seguro_insert_policy ON seguro_solicitacoes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS seguro_update_policy ON seguro_solicitacoes;
CREATE POLICY seguro_update_policy ON seguro_solicitacoes
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS seguro_delete_policy ON seguro_solicitacoes;
CREATE POLICY seguro_delete_policy ON seguro_solicitacoes
  FOR DELETE USING (true);

-- Exemplos (opcional)
INSERT INTO seguro_solicitacoes (
  nome, email, whatsapp, cpf, plano, cobertura, observacoes, status
) VALUES
('Ana Paula', 'ana@example.com', '(11) 99999-0000', '123.456.789-00', 'básico', 'Cobertura padrão', 'Sem observações', 'novo'),
('Carlos Souza', 'carlos@example.com', '(21) 98888-1111', NULL, 'premium', 'Cobertura completa', 'Tem viagem marcada', 'em_analise');

-- Verificação
SELECT 'Tabela seguro_solicitacoes criada com sucesso!' AS status,
       COUNT(*) AS total_registros,
       COUNT(CASE WHEN status = 'novo' THEN 1 END) AS total_novos
FROM seguro_solicitacoes;

