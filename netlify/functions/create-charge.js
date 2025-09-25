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
export const handler = async (event, context) => {
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
    const body = JSON.parse(event.body);
    const { type, customerData, productId, productSlug } = body;

    // Determinar se é compra de produto (catálogo) ou inscrição
    const isProductFlow = Boolean(productId || productSlug);

    // Validar fluxo de inscrição quando não for produto
    if (!isProductFlow && !PAYMENT_CONFIGS[type]) {
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
    let config;
    let chargeData;

    if (isProductFlow) {
      // Carregar produto do catálogo JSON
      const fs = await import('node:fs');
      const path = await import('node:path');
      const filePath = path.resolve(__dirname, '../../data/products.json');
      let products = [];
      try {
        const data = fs.readFileSync(filePath, 'utf-8');
        products = JSON.parse(data);
      } catch (e) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao ler catálogo de produtos' })
        };
      }

      const product = products.find(
        (p) => p.id === productId || p.slug === productSlug || p.slug === productId
      );

      if (!product) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Produto não encontrado' })
        };
      }

      const amountInCents = Math.round(Number(product.preco) * 100);
      config = {
        amount: amountInCents,
        description: `${product.nome} - INTERBØX`,
        comment: `Compra produto: ${product.nome}`
      };

      chargeData = {
        correlationID: `interbox_prod_${product.slug || product.id}_${Date.now()}`,
        value: config.amount,
        comment: config.comment,
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone || '',
          taxID: customerData.cpf ? customerData.cpf.replace(/\D/g, '') : ''
        },
        additionalInfo: [
          { key: 'event', value: 'INTERBØX 2025' },
          { key: 'flow', value: 'product' },
          { key: 'product_id', value: product.id },
          { key: 'product_slug', value: product.slug }
        ]
      };
    } else {
      config = PAYMENT_CONFIGS[type];
      chargeData = {
        correlationID: `interbox_${type}_${Date.now()}`,
        value: config.amount,
        comment: config.comment,
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone || '',
          taxID: customerData.cpf ? customerData.cpf.replace(/\D/g, '') : ''
        },
        additionalInfo: [
          { key: 'event', value: 'INTERBØX 2025' },
          { key: 'type', value: type },
          { key: 'customer_id', value: customerData.email }
        ]
      };
    }

    try {
      // Tentar criar charge via OpenPix/Woovi
      const charge = await createOpenPixCharge(chargeData);
      
      // Registro local para observabilidade (webhook fará persistência quando aprovado)
      try {
        const meta = {
          nome: customerData.name,
          email: customerData.email,
          whatsapp: customerData.phone,
          cpf: customerData.cpf,
          fluxo: isProductFlow ? 'produto' : 'inscricao',
          tipo_ou_produto: isProductFlow ? (productId || productSlug) : type,
          valor: chargeData.value,
          correlationID: chargeData.correlationID,
          status: 'pendente',
          charge_id: charge.identifier || charge.correlationID,
          data_criacao: new Date().toISOString()
        };
        console.log('✅ Metadados de criação de charge:', meta);
      } catch {}
      
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
