const { getChargeStatus } = require('../../src/config/openpix-config.js');

exports.handler = async (event, context) => {
  // Habilitar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Verificar se é uma requisição GET
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método não permitido' })
      };
    }

    // Obter chargeId dos query parameters
    const { chargeId } = event.queryStringParameters || {};

    if (!chargeId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'chargeId é obrigatório' })
      };
    }

    // Verificar status da charge via OpenPix/Woovi
    const charge = await getChargeStatus(chargeId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        charge: charge,
        status: charge.status,
        paid: charge.status === 'CONFIRMED'
      })
    };

  } catch (error) {
    console.error('Erro ao verificar charge:', error);
    
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
