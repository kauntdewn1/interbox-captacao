/**
 * API para Salvar Inscrições INTERBØX 2025
 * Salva inscrições gratuitas e pagas no banco de dados Supabase
 */

import { createClient } from '@supabase/supabase-js';

// 🔗 Configuração Supabase
const supabaseUrl = 'https://vlwuwutoulfbbieznios.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);



// 🔐 Verificação básica de autenticação
const isAuthorized = (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const apiKey = process.env.ADMIN_API_KEY || 'interbox2025';
  
  return authHeader === `Bearer ${apiKey}`;
};

// 🔍 Handler para requisições GET (listar inscrições)
const handleGet = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  try {
    // Verificar autenticação
    if (!isAuthorized(event)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'Não autorizado',
          message: 'API Key inválida'
        })
      };
    }

    // Buscar inscrições no Supabase
    const { data: inscricoes, error: fetchError } = await supabase
      .from('inscricoes')
      .select('*')
      .order('data_criacao', { ascending: false });

    if (fetchError) {
      console.error('Erro ao buscar inscrições:', fetchError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Erro ao buscar inscrições'
        })
      };
    }

    // Calcular metadata
    const metadata = {
      ultima_atualizacao: new Date().toISOString(),
      total_inscricoes: inscricoes.length,
      tipos: {
        judge: inscricoes.filter(i => i.tipo === 'judge').length,
        audiovisual: inscricoes.filter(i => i.tipo === 'audiovisual').length,
        staff: inscricoes.filter(i => i.tipo === 'staff').length
      }
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        inscricoes: inscricoes || [],
        metadata
      })
    };
  } catch (error) {
    console.error('Erro ao listar inscrições:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erro ao listar inscrições'
      })
    };
  }
};

// 💾 Handler para requisições POST (criar/atualizar inscrições)
const handlePost = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  try {
    // Parsear dados da requisição
    const inscricaoData = JSON.parse(event.body);
    
    // Validar dados obrigatórios
    if (!inscricaoData.nome || !inscricaoData.email || !inscricaoData.tipo) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Dados obrigatórios: nome, email e tipo'
        })
      };
    }

    // Verificar se já existe inscrição com mesmo email e tipo
    const { data: inscricoesExistentes, error: checkError } = await supabase
      .from('inscricoes')
      .select('*')
      .eq('email', inscricaoData.email)
      .eq('tipo', inscricaoData.tipo);

    if (checkError) {
      console.error('Erro ao verificar inscrição existente:', checkError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Erro ao verificar inscrição existente'
        })
      };
    }

    if (inscricoesExistentes && inscricoesExistentes.length > 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ 
          error: 'Email já possui inscrição deste tipo'
        })
      };
    }

    // Preparar dados da inscrição
    const novaInscricao = {
      nome: inscricaoData.nome,
      email: inscricaoData.email,
      whatsapp: inscricaoData.whatsapp,
      cpf: inscricaoData.cpf || null,
      tipo: inscricaoData.tipo,
      valor: inscricaoData.valor || 0,
      status: 'cadastrado',
      data_criacao: new Date().toISOString(),
      // Campos específicos por tipo
      portfolio: inscricaoData.portfolio || null,
      experiencia: inscricaoData.experiencia || null,
      disponibilidade: inscricaoData.disponibilidade || null,
      motivacao: inscricaoData.motivacao || null,
      certificacoes: inscricaoData.certificacoes || null
    };

    // Inserir no Supabase
    const { data: inscricaoSalva, error: insertError } = await supabase
      .from('inscricoes')
      .insert([novaInscricao])
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao inserir inscrição:', insertError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Erro ao salvar inscrição no banco'
        })
      };
    }

    console.log('✅ Inscrição salva com sucesso:', inscricaoSalva.id);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Inscrição salva com sucesso',
        inscricao: inscricaoSalva
      })
    };
  } catch (error) {
    console.error('Erro ao salvar inscrição:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erro interno do servidor'
      })
    };
  }
};

// 🚀 Handler principal
export const handler = async (event, context) => {
  // Configurar CORS para requisições OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
      },
      body: ''
    };
  }

  // Roteamento baseado no método HTTP
  switch (event.httpMethod) {
    case 'GET':
      return await handleGet(event);
    case 'POST':
      return await handlePost(event);
    default:
      return {
        statusCode: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({ error: 'Método não permitido' })
      };
  }
};
