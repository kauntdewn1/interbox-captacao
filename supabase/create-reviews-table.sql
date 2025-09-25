-- Criar tabela de avaliações (reviews)
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  produto_id VARCHAR(255) NOT NULL,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  cliente_email VARCHAR(255) NOT NULL,
  cor VARCHAR(100),
  tamanho VARCHAR(50),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_reviews_produto_id ON reviews(produto_id);
CREATE INDEX IF NOT EXISTS idx_reviews_cliente_email ON reviews(cliente_email);
CREATE INDEX IF NOT EXISTS idx_reviews_data_criacao ON reviews(data_criacao);

-- Comentários para documentação
COMMENT ON TABLE reviews IS 'Avaliações de produtos pelos clientes';
COMMENT ON COLUMN reviews.produto_id IS 'ID do produto avaliado';
COMMENT ON COLUMN reviews.nota IS 'Nota de 1 a 5 estrelas';
COMMENT ON COLUMN reviews.comentario IS 'Comentário opcional do cliente';
COMMENT ON COLUMN reviews.cliente_email IS 'Email do cliente que avaliou';
COMMENT ON COLUMN reviews.cor IS 'Cor do produto comprado';
COMMENT ON COLUMN reviews.tamanho IS 'Tamanho do produto comprado';
