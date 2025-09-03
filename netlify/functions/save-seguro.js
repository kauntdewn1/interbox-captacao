import { createClient } from '@supabase/supabase-js';

// Debug: Vamos ver todas as variáveis de ambiente disponíveis
console.log('All environment variables:', Object.keys(process.env));
console.log('NODE_ENV:', process.env.NODE_ENV);

const supabaseUrl = process.env.SUPABASE_URL || 'https://vlwuwutoulfbbieznios.supabase.co';
// Voltando para a chave de serviço que deve ter acesso total
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
  // Debug: Log das variáveis de ambiente
  console.log('=== DEBUG SAVE-SEGURO ===');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('SUPABASE_SERVICE_ROLE_KEY length:', process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // Verificar método HTTP
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    // Verificar autorização
    const authHeader = event.headers.authorization;
    if (!authHeader || authHeader !== 'Bearer interbox2025') {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Não autorizado' })
      };
    }

    // Parsear dados do seguro
    const seguroData = JSON.parse(event.body);
    console.log('Dados recebidos:', seguroData);
    
    // Validar campos obrigatórios
    const camposObrigatorios = ['nome', 'cpf', 'dataNascimento', 'sexo', 'email', 'telefone', 'nomeTime'];
    for (const campo of camposObrigatorios) {
      if (!seguroData[campo]) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Campo obrigatório não informado: ${campo}` })
        };
      }
    }

    console.log('Tentando conectar com Supabase...');
    
    // Verificar se já existe seguro com este CPF
    const { data: segurosExistentes, error: checkError } = await supabase
      .from('seguros')
      .select('*')
      .eq('cpf', seguroData.cpf)
      .eq('tipo', 'seguro');

    console.log('Resultado da verificação:', { segurosExistentes, checkError });

    if (checkError) {
      console.error('Erro ao verificar CPF:', checkError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro ao verificar CPF existente', details: checkError.message })
      };
    }

    if (segurosExistentes && segurosExistentes.length > 0) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'CPF já possui seguro contratado' })
      };
    }

    // Criar entrada no Supabase
    const { data: novoSeguro, error: insertError } = await supabase
      .from('seguros')
      .insert([
        {
          nome: seguroData.nome,
          cpf: seguroData.cpf,
          data_nascimento: seguroData.dataNascimento,
          sexo: seguroData.sexo,
          email: seguroData.email,
          telefone: seguroData.telefone,
          nome_time: seguroData.nomeTime,
          observacoes: seguroData.observacoes || null,
          tipo: 'seguro',
          valor: seguroData.valor,
          status: 'pendente_comprovante',
          data_criacao: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao inserir seguro:', insertError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro ao salvar seguro no banco' })
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
        message: 'Seguro registrado com sucesso',
        seguro: {
          id: novoSeguro.id,
          ...seguroData,
          status: 'pendente_comprovante',
          data_criacao: new Date().toISOString()
        }
      })
    };

  } catch (error) {
    console.error('Erro ao salvar seguro:', error);
    
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
