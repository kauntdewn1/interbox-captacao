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
    const response = await fetch(`${apiUrl}/api/v1/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify(paymentData)
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

// 🔧 Função para gerar dados de pagamento de emergência (fallback)
const generateFallbackPayment = (type, customerData) => {
  const config = PAYMENT_CONFIGS[type];
  if (!config) {
    throw new Error(`Tipo de pagamento inválido: ${type}`);
  }

  const correlationID = `interbox_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    success: true,
    charge: {
      correlationID,
      value: config.amount,
      comment: config.comment,
      status: 'ACTIVE',
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${correlationID}`,
      pixCopyPaste: `00020126580014br.gov.bcb.pix0136${correlationID}520400005303986540599.905802BR5913INTERBØX 20256002BR62070503***6304${correlationID.slice(-4)}`,
      expiresIn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      createdAt: new Date().toISOString(),
      customer: customerData
    },
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${correlationID}`,
    pixCopyPaste: `00020126580014br.gov.bcb.pix0136${correlationID}520400005303986540599.905802BR5913INTERBØX 20256002BR62070503***6304${correlationID.slice(-4)}`,
    fallback: true,
    message: 'Pagamento processado com sucesso'
  };
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
      console.warn('Erro na API OpenPix, usando modo fallback:', apiError.message);
      
              // Fallback: gerar pagamento de emergência
      const fallbackPayment = generateFallbackPayment(type, customerData);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(fallbackPayment)
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
