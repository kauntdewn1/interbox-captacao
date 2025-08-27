/**
 * Netlify Function para verificar status de charges OpenPix/Woovi
 * Implementa verificação de pagamentos para INTERBØX 2025
 */

// 🔧 Função para verificar charge via OpenPix/Woovi
const checkOpenPixCharge = async (chargeId) => {
  const apiKey = process.env.OPENPIX_API_KEY;
  const apiUrl = process.env.API_BASE_URL || 'https://api.woovi.com';
  
  if (!apiKey) {
    throw new Error('OPENPIX_API_KEY não configurada');
  }

  try {


    const response = await fetch(`${apiUrl}/api/v1/charge/${chargeId}`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`OpenPix API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar charge OpenPix:', error);
    throw error;
  }
};



// 🚀 Handler principal da Netlify Function
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
        body: JSON.stringify({ 
          error: 'chargeId é obrigatório',
          example: '?chargeId=interbox_judge_1234567890'
        })
      };
    }

    try {
      // Tentar verificar status via OpenPix/Woovi
      const charge = await checkOpenPixCharge(chargeId);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          charge: charge,
          status: charge.status,
          paid: charge.status === 'CONFIRMED' || charge.status === 'COMPLETED',
          fallback: false,
          message: 'Status verificado com sucesso'
        })
      };
    } catch (apiError) {
      console.error('❌ Erro na API OpenPix:', apiError.message);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Erro na API OpenPix',
          message: apiError.message
        })
      };
    }

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
