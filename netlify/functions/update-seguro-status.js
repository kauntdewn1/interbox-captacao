import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ymriypyyirnwctyitcsu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const handler = async (event, context) => {
  // Verificar método HTTP
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    // Verificar autorização (API Key do parceiro Saga)
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'API Key não fornecida' })
      };
    }

    const apiKey = authHeader.replace('Bearer ', '');
    
    // Aqui você pode implementar validação específica da API Key do Saga
    if (!apiKey) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'API Key inválida' })
      };
    }

    // Parsear dados da requisição
    const { seguroId, status } = JSON.parse(event.body);
    
    if (!seguroId || !status) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'ID do seguro e status são obrigatórios' })
      };
    }

    // Validar status
    const statusValidos = ['pendente_comprovante', 'comprovante_enviado', 'pago_confirmado'];
    if (!statusValidos.includes(status)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Status inválido' })
      };
    }

    // Atualizar status no Supabase
    const { data: seguroAtualizado, error: updateError } = await supabase
      .from('seguros')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', seguroId)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro ao atualizar status' })
      };
    }

    // Retornar sucesso
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({
        success: true,
        message: 'Status atualizado com sucesso',
        seguroId,
        status,
        data_atualizacao: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Erro ao atualizar status do seguro:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({
        error: 'Erro interno do servidor',
        details: error.message
      })
    };
  }
};

// Função para mapear status do sistema para o Supabase
function mapearStatusParaSupabase(status) {
  switch (status) {
    case 'pendente_comprovante':
      return 'pendente_comprovante';
    case 'comprovante_enviado':
      return 'comprovante_enviado';
    case 'pago_confirmado':
      return 'pago_confirmado';
    default:
      return 'pendente_comprovante';
  }
}
