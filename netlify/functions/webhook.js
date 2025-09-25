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
      
      // Atualizar inscrição existente no Supabase
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
