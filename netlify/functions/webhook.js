// 🔧 Função auxiliar para extrair tipo da inscrição
const extractTypeFromCorrelationID = (correlationID) => {
  if (correlationID.includes('judge')) return 'judge';
  if (correlationID.includes('audiovisual')) return 'audiovisual';
  if (correlationID.includes('staff')) return 'staff';
  return 'desconhecido';
};

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

    // Parsear dados do webhook
    const webhookData = JSON.parse(event.body);
    
    // Log do webhook recebido
    console.log('Webhook OpenPix recebido:', JSON.stringify(webhookData, null, 2));

    // Verificar se é uma notificação de pagamento
    if (webhookData.event === 'charge.confirmed') {
      const { charge } = webhookData;
      
      console.log(`Pagamento confirmado para charge: ${charge.correlationID}`);
      console.log(`Valor: R$ ${(charge.value / 100).toFixed(2)}`);
      console.log(`Status: ${charge.status}`);
      
      // Salvar inscrição confirmada via API
      try {
        const inscricaoData = {
          nome: charge.customer?.name || 'Nome não informado',
          email: charge.customer?.email || 'Email não informado',
          whatsapp: charge.customer?.phone || 'WhatsApp não informado',
          cpf: charge.customer?.taxID || 'CPF não informado',
          tipo: extractTypeFromCorrelationID(charge.correlationID),
          valor: charge.value / 100, // Converter de centavos para reais
          status: 'pago',
          correlationID: charge.correlationID,
          charge_id: charge.identifier || charge.correlationID,
          data_criacao: new Date(charge.createdAt).toISOString(),
          data_atualizacao: new Date().toISOString()
        };
        
        // Chamar API para salvar
        const response = await fetch(`${process.env.URL || 'https://interbox-captacao.netlify.app'}/.netlify/functions/save-inscricao`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer interbox2025'
          },
          body: JSON.stringify(inscricaoData)
        });
        
        if (response.ok) {
          console.log('✅ Inscrição paga salva via API:', inscricaoData.nome);
        } else {
          console.error('❌ Erro ao salvar inscrição paga via API');
        }
      } catch (error) {
        console.error('Erro ao salvar inscrição paga:', error);
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
