export const handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const { correlationID, identifier } = event.queryStringParameters || {};
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
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Falha ao consultar status', message: e.message }) };
  }
};
