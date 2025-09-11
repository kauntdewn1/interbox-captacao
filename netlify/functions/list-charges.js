/**
 * Netlify Function para listar charges do OpenPix/Woovi
 * Lista todas as charges para sincronização
 */

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const apiKey = process.env.OPENPIX_API_KEY;
    const apiUrl = process.env.API_BASE_URL || 'https://api.woovi.com';
    
    if (!apiKey) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'OPENPIX_API_KEY não configurada'
        })
      };
    }

    // Listar charges do OpenPix
    const response = await fetch(`${apiUrl}/api/v1/charge`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Erro na API OpenPix',
          details: errorText
        })
      };
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        charges: data.charges || data,
        total: data.charges?.length || 0,
        message: 'Charges listadas com sucesso'
      })
    };

  } catch (error) {
    console.error('Erro ao listar charges:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erro interno',
        details: error.message
      })
    };
  }
};
