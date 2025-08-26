const { createCharge, PAYMENT_CONFIGS } = require('../../src/config/openpix-config.js');

exports.handler = async (event, context) => {
  // Habilitar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    // Verificar se é uma requisição POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método não permitido' })
      };
    }

    // Parsear dados da requisição
    const { type, customerData } = JSON.parse(event.body);

    // Validar tipo de pagamento
    if (!PAYMENT_CONFIGS[type]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Tipo de pagamento inválido' })
      };
    }

    // Configuração do pagamento
    const config = PAYMENT_CONFIGS[type];
    
    // Dados para criar a charge
    const chargeData = {
      correlationID: `interbox_${type}_${Date.now()}`,
      value: config.amount,
      comment: config.comment,
      customer: {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone || '',
        taxID: customerData.cpf || ''
      },
      additionalInfo: [
        {
          key: 'event',
          value: 'INTERBØX 2025'
        },
        {
          key: 'type',
          value: type
        }
      ]
    };

    // Criar charge via OpenPix/Woovi
    const charge = await createCharge(chargeData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        charge: charge,
        qrCode: charge.qrCode,
        pixCopyPaste: charge.pixCopyPaste
      })
    };

  } catch (error) {
    console.error('Erro ao criar charge:', error);
    
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
