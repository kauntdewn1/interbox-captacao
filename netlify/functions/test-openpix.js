/**
 * Teste de Conexão OpenPix/Woovi
 * Verifica se as credenciais estão funcionando
 */

export const handler = async (event, context) => {
  console.log('=== TESTE DE CONEXÃO OPENPIX/WOOVI ===');
  
  const openpixApiKey = process.env.OPENPIX_API_KEY;
  const openpixCorpId = process.env.OPENPIX_CORP_ID;
  const apiBaseUrl = process.env.API_BASE_URL || 'https://api.woovi.com';
  
  console.log('OPENPIX_API_KEY exists:', !!openpixApiKey);
  console.log('OPENPIX_CORP_ID exists:', !!openpixCorpId);
  console.log('API_BASE_URL:', apiBaseUrl);
  
  try {
    // Teste 1: Verificar se as variáveis estão configuradas
    if (!openpixApiKey || !openpixCorpId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Variáveis OpenPix não configuradas',
          details: {
            openpix_api_key_exists: !!openpixApiKey,
            openpix_corp_id_exists: !!openpixCorpId
          }
        })
      };
    }
    
    // Teste 2: Tentar fazer uma requisição para a API
    const testResponse = await fetch(`${apiBaseUrl}/api/v1/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openpixApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status da resposta:', testResponse.status);
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('Dados da API:', data);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Conexão OpenPix/Woovi funcionando!',
          api_status: testResponse.status,
          api_data: data,
          config: {
            api_base_url: apiBaseUrl,
            corp_id: openpixCorpId,
            api_key_length: openpixApiKey.length
          }
        })
      };
    } else {
      const errorText = await testResponse.text();
      console.error('Erro na API:', errorText);
      
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Erro na conexão com OpenPix/Woovi',
          details: {
            status: testResponse.status,
            status_text: testResponse.statusText,
            error_message: errorText
          }
        })
      };
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Erro interno no teste',
        details: {
          message: error.message,
          stack: error.stack
        }
      })
    };
  }
};
