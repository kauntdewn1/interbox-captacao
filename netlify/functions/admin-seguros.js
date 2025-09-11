import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ymriypyyirnwctyitcsu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug logs
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('supabaseUrl:', supabaseUrl);
console.log('supabaseKey length:', supabaseKey ? supabaseKey.length : 0);

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
    // Por enquanto, aceitamos qualquer Bearer token
    if (!apiKey) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'API Key inválida' })
      };
    }

    // Buscar todos os seguros
    const { data: seguros, error: fetchError } = await supabase
      .from('seguros')
      .select('*')
      .eq('tipo', 'seguro')
      .order('data_criacao', { ascending: false });

    if (fetchError) {
      console.error('Erro ao buscar seguros:', fetchError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro ao buscar seguros' })
      };
    }

    // Mapear dados dos seguros
    const segurosMapeados = seguros.map(seguro => {
      return {
        id: seguro.id,
        nome: seguro.nome || '',
        cpf: seguro.cpf || '',
        dataNascimento: seguro.data_nascimento || '',
        sexo: seguro.sexo || '',
        email: seguro.email || '',
        telefone: seguro.telefone || '',
        nomeTime: seguro.nome_time || '',
        observacoes: seguro.observacoes || '',
        tipo: 'seguro',
        valor: seguro.valor || 0,
        status: mapearStatus(seguro.status),
        data_criacao: seguro.data_criacao || seguro.created_at,
        data_atualizacao: seguro.updated_at
      };
    });

    // Calcular estatísticas
    const estatisticas = {
      total_seguros: segurosMapeados.length,
      pendentes: segurosMapeados.filter(s => s.status === 'pendente_comprovante').length,
      comprovantes_enviados: segurosMapeados.filter(s => s.status === 'comprovante_enviado').length,
      pagos_confirmados: segurosMapeados.filter(s => s.status === 'pago_confirmado').length,
      valor_total: segurosMapeados.reduce((acc, s) => acc + s.valor, 0)
    };

    // Retornar dados
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({
        success: true,
        seguros: segurosMapeados,
        estatisticas
      })
    };

  } catch (error) {
    console.error('Erro ao buscar seguros:', error);
    
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

// Função para mapear status do Supabase para o sistema
function mapearStatus(statusSupabase) {
  switch (statusSupabase) {
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
