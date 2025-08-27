/**
 * Netlify Function para criar charges OpenPix/Woovi
 * Implementa lógica de pagamento para INTERBØX 2025
 */

// 🔑 Configurações de pagamento
const PAYMENT_CONFIGS = {
  audiovisual: {
    amount: 2990, // R$ 29,90
    description: 'Inscrição Audiovisual INTERBØX 2025',
    comment: 'Taxa de inscrição para candidatura audiovisual'
  },
  judge: {
    amount: 1990, // R$ 19,90
    description: 'Inscrição Judge INTERBØX 2025',
    comment: 'Taxa de inscrição para candidatura judge'
  },
  staff: {
    amount: 1990, // R$ 19,90
    description: 'Inscrição Staff INTERBØX 2025',
    comment: 'Taxa de inscrição para candidatura staff'
  },

};

// 🔧 Função para criar charge via OpenPix/Woovi
const createOpenPixCharge = async (paymentData) => {
  const apiKey = process.env.OPENPIX_API_KEY;
  const apiUrl = process.env.API_BASE_URL || 'https://api.woovi.com';
  
  
  
  if (!apiKey) {
    throw new Error('OPENPIX_API_KEY não configurada');
  }

  try {
    // Estrutura correta conforme documentação Woovi
    const chargeData = {
      correlationID: paymentData.correlationID,
      value: paymentData.value,
      comment: paymentData.comment,
      customer: paymentData.customer,
      additionalInfo: paymentData.additionalInfo
    };

    console.log('🔑 Tentando criar charge via Woovi API:', {
      url: `${apiUrl}/api/v1/charge`,
      apiKey: apiKey ? 'Configurada' : 'NÃO CONFIGURADA',
      data: chargeData
    });

    const response = await fetch(`${apiUrl}/api/v1/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify(chargeData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenPix API Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar charge OpenPix:', error);
    throw error;
  }
};



// 🚀 Handler principal da Netlify Function
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
        body: JSON.stringify({ 
          error: 'Tipo de pagamento inválido',
          validTypes: Object.keys(PAYMENT_CONFIGS)
        })
      };
    }

    // Validar dados do cliente
    if (!customerData || !customerData.name || !customerData.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Dados do cliente obrigatórios: name e email'
        })
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
        },
        {
          key: 'customer_id',
          value: customerData.email
        }
      ]
    };

    try {
      // Tentar criar charge via OpenPix/Woovi
      const charge = await createOpenPixCharge(chargeData);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          charge: charge,
          qrCode: charge.qrCode,
          pixCopyPaste: charge.pixCopyPaste,
          fallback: false,
          message: 'Pagamento processado com sucesso'
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
    console.error('Erro ao processar criação de charge:', error);
    
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
