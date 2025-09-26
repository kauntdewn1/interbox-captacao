  export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const { correlationID, identifier, export: exportOrders } = event.queryStringParameters || {};
    
    // Se for export de orders, retornar todos os pedidos
    if (exportOrders === 'orders') {
      const { createStorage } = await import('../../src/utils/storage.ts');
      const storage = await createStorage();
      const orders = (await storage.read('orders.json')) || [];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(orders)
      };
    }
    
    if (!correlationID && !identifier) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Informe correlationID ou identifier' }) };
    }

    const { createStorage } = await import('../../src/utils/storage.ts');
    const storage = await createStorage();
    const orders = (await storage.read('orders.json')) || [];
    const order = orders
      .slice()
      .reverse()
      .find(o => (identifier && o.identifier === identifier) || (correlationID && o.correlationID === correlationID));

    if (!order) {
      return { statusCode: 404, headers, body: JSON.stringify({ status: 'unknown' }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: order.status,
        paid_at: order.paid_at || null,
        correlationID: order.correlationID,
        identifier: order.identifier,
        product_slug: order.product_slug,
        tag: order.tag,
        origin: order.origin
      })
    };
  } catch (e) {
    console.error('Falha ao consultar status', e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Falha ao consultar status' }) };
  }
};
