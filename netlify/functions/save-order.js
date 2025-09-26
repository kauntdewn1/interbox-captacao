/**
 * Netlify Function - Salvar Venda
 * Arquitetura descentralizada: JSON + Netlify Blobs
 * Zero lock-in, controle total
 */

// Usa o mesmo adapter/exports utilizados nas outras functions (import dinâmico do TS)
// Evita divergência de paths/extensões e mantém um único gateway de storage
let createStorage, validateOrder, generateId, sanitizeEmail;
const loadStorage = async () => {
  if (!createStorage) {
    const mod = await import('../../src/utils/storage.js');
    createStorage = mod.createStorage;
    validateOrder = mod.validateOrder;
    generateId = mod.generateId;
    sanitizeEmail = mod.sanitizeEmail;
  }
};

export const handler = async (event, context) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Apenas POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    await loadStorage();
    // Parse e validação
    const orderData = JSON.parse(event.body);
    
    if (!validateOrder(orderData)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Dados da venda inválidos',
          required: ['produto_id', 'cliente_email', 'cor', 'tamanho', 'valor']
        })
      };
    }

    // Sanitização
    const sanitizedOrder = {
      id: generateId('order'),
      produto_id: orderData.produto_id,
      cliente_email: sanitizeEmail(orderData.cliente_email),
      cor: orderData.cor,
      tamanho: orderData.tamanho,
      valor: parseInt(orderData.valor),
      status: 'pago',
      data: new Date().toISOString(),
      correlation_id: orderData.correlation_id || null,
      charge_id: orderData.charge_id || null
    };

    // Salvar via storage adapter
    const storage = createStorage();
    await storage.append('orders.json', sanitizedOrder);

    console.log('✅ Venda salva:', sanitizedOrder.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        order_id: sanitizedOrder.id,
        message: 'Venda registrada com sucesso'
      })
    };

  } catch (error) {
    console.error('❌ Erro ao salvar venda:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro interno do servidor',
        details: error.message
      })
    };
  }
};