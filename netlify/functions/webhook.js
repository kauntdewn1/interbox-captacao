// 🔧 Função auxiliar para extrair tipo da inscrição
const extractTypeFromCorrelationID = (correlationID) => {
  if (!correlationID) return 'audiovisual'; // Default
  
  const id = correlationID.toLowerCase();
  if (id.includes('audiovisual')) return 'audiovisual';
  if (id.includes('judge')) return 'judge';
  if (id.includes('staff')) return 'staff';
  if (id.includes('interbox')) return 'audiovisual'; // Default para INTERBØX
  return 'audiovisual'; // Default
};

// 🔧 Função para processar compra de produto
const processProductPurchase = async (transaction) => {
  try {
    console.log('🛍️ Processando compra de produto...');
    
    // Extrair informações do produto do correlationID
    const correlationID = transaction.correlationID;
    const productSlug = correlationID.split('_')[2]; // interbox_prod_SLUG_timestamp
    
    // Salvar pedido pago na tabela orders
    const orderData = {
      produto_id: correlationID, // Usar correlationID como ID único
      cliente_email: transaction.customer?.email || 'Email não informado',
      cor: transaction.customer?.cor || '',
      tamanho: transaction.customer?.tamanho || '',
      valor: transaction.value / 100, // Converter de centavos para reais
      charge_id: correlationID,
      status: 'pago',
      data_pagamento: new Date().toISOString()
    };
    
    // Salvar pedido via API
    const orderResponse = await fetch(`${process.env.URL || 'https://interbox-captacao.netlify.app'}/.netlify/functions/save-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    if (orderResponse.ok) {
      console.log('✅ Pedido de produto salvo com sucesso');
      
      // Enviar email de avaliação para o comprador
      await sendReviewEmail(transaction.customer?.email, productSlug);
    } else {
      console.error('❌ Erro ao salvar pedido de produto');
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar compra de produto:', error);
  }
};

// 🔧 Função para processar inscrição (código existente)
const processInscription = async (transaction) => {
  try {
    const updateData = {
      email: transaction.customer?.email || 'Email não informado',
      tipo: extractTypeFromCorrelationID(transaction.correlationID),
      status: 'pago',
      data_confirmacao: new Date().toISOString(),
      correlationID: transaction.correlationID,
      charge_id: transaction.correlationID
    };
    
    // Chamar API para atualizar
    const response = await fetch(`${process.env.URL || 'https://interbox-captacao.netlify.app'}/.netlify/functions/update-inscricao`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer interbox2025'
      },
      body: JSON.stringify(updateData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Inscrição atualizada para pago:', result.inscricao?.id);
    } else {
      console.error('❌ Erro ao atualizar inscrição para pago');
    }
  } catch (error) {
    console.error('Erro ao atualizar inscrição para pago:', error);
  }
};

// 🔧 Função para enviar email de avaliação (MOCK)
const sendReviewEmail = async (email, productSlug) => {
  try {
    console.log(`📧 Enviando email de avaliação para: ${email}`);
    console.log(`📦 Produto: ${productSlug}`);
    
    // MOCK: Simular envio de email
    // Em produção, integrar com SendGrid, AWS SES, ou similar
    const emailData = {
      to: email,
      subject: 'Avalie sua compra INTERBØX',
      template: 'review-request',
      data: {
        product_slug: productSlug,
        review_url: `https://interbox-captacao.netlify.app/avaliar/${productSlug}`
      }
    };
    
    console.log('📧 Dados do email (MOCK):', emailData);
    
    // TODO: Integrar com serviço de email real
    // await emailService.send(emailData);
    
  } catch (error) {
    console.error('❌ Erro ao enviar email de avaliação:', error);
  }
};

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

    // Parsear dados do webhook
    const webhookData = JSON.parse(event.body);
    
    // Log do webhook recebido
    console.log('Webhook OpenPix recebido:', JSON.stringify(webhookData, null, 2));

    // Verificar se é uma notificação de pagamento
    if (webhookData.event === 'OPENPIX:TRANSACTION_RECEIVED') {
      const { transaction } = webhookData;
      
      console.log(`Pagamento PIX recebido: ${transaction.correlationID}`);
      console.log(`Valor: R$ ${(transaction.value / 100).toFixed(2)}`);
      console.log(`End-to-End ID: ${transaction.transactionEndToEndId}`);
      
      // Determinar se é compra de produto ou inscrição
      const isProductPurchase = transaction.correlationID?.includes('prod_') || 
                               transaction.correlationID?.includes('interbox_prod_');
      
      if (isProductPurchase) {
        // PROCESSAR COMPRA DE PRODUTO
        await processProductPurchase(transaction);
      } else {
        // PROCESSAR INSCRIÇÃO (código existente)
        await processInscription(transaction);
      }
    }

    // Sempre retornar sucesso para o webhook
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Webhook processado com sucesso' 
      })
    };

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    
    // Mesmo com erro, retornar 200 para evitar reenvios
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Erro interno, mas webhook aceito' 
      })
    };
  }
};
