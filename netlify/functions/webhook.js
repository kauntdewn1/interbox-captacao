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

// 🔧 Função auxiliar para detectar se é venda de produto
const isProductSale = (correlationID) => {
  if (!correlationID) return false;
  return correlationID.toLowerCase().includes('prod_');
};

// 🔧 Função auxiliar para extrair dados do produto da correlationID
const extractProductData = (correlationID) => {
  if (!correlationID) return null;
  
  // Formato: interbox_prod_{slug}_{timestamp}
  const parts = correlationID.split('_');
  if (parts.length >= 3 && parts[1] === 'prod') {
    return {
      slug: parts[2],
      timestamp: parts[3] || Date.now()
    };
  }
  return null;
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
      
      // Verificar se é venda de produto ou inscrição
      if (isProductSale(transaction.correlationID)) {
        // 🛍️ VENDA DE PRODUTO - Salvar via save-order.js
        try {
          const productData = extractProductData(transaction.correlationID);
          
          const orderData = {
            produto_id: productData?.slug || 'produto-desconhecido',
            cliente_email: transaction.customer?.email || 'cliente@interbox.com',
            cor: transaction.additionalInfo?.find(info => info.key === 'cor')?.value || 'Não informado',
            tamanho: transaction.additionalInfo?.find(info => info.key === 'tamanho')?.value || 'Não informado',
            valor: transaction.value,
            correlation_id: transaction.correlationID,
            charge_id: transaction.correlationID
          };
          
          const response = await fetch(`${process.env.URL || 'https://interbox-captacao.netlify.app'}/.netlify/functions/save-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Venda de produto salva:', result.order_id);
          } else {
            console.error('❌ Erro ao salvar venda de produto');
          }
        } catch (error) {
          console.error('Erro ao salvar venda de produto:', error);
        }
      } else {
        // 📝 INSCRIÇÃO - Atualizar via update-inscricao.js
        try {
          const updateData = {
            email: transaction.customer?.email || 'Email não informado',
            tipo: extractTypeFromCorrelationID(transaction.correlationID),
            status: 'pago',
            data_confirmacao: new Date().toISOString(),
            correlationID: transaction.correlationID,
            charge_id: transaction.correlationID
          };
          
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
