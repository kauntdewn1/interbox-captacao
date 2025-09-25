-- Criar tabela de pedidos (orders)
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  produto_id VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255) NOT NULL,
  cor VARCHAR(100),
  tamanho VARCHAR(50),
  valor DECIMAL(10,2) NOT NULL,
  charge_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado', 'reembolsado')),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_pagamento TIMESTAMP WITH TIME ZONE
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_produto_id ON orders(produto_id);
CREATE INDEX IF NOT EXISTS idx_orders_cliente_email ON orders(cliente_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_data_pagamento ON orders(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_orders_charge_id ON orders(charge_id);

-- Comentários para documentação
COMMENT ON TABLE orders IS 'Pedidos de produtos';
COMMENT ON COLUMN orders.produto_id IS 'ID do produto comprado';
COMMENT ON COLUMN orders.cliente_email IS 'Email do cliente';
COMMENT ON COLUMN orders.cor IS 'Cor do produto comprado';
COMMENT ON COLUMN orders.tamanho IS 'Tamanho do produto comprado';
COMMENT ON COLUMN orders.valor IS 'Valor pago em reais';
COMMENT ON COLUMN orders.charge_id IS 'ID da charge do OpenPix/Woovi';
COMMENT ON COLUMN orders.status IS 'Status do pedido: pendente, pago, cancelado, reembolsado';
COMMENT ON COLUMN orders.data_pagamento IS 'Data e hora do pagamento confirmado';
