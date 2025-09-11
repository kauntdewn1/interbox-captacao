/**
 * API para Atualizar Inscrições INTERBØX 2025
 * Atualiza inscrições existentes no banco de dados Supabase
 */

import { createClient } from '@supabase/supabase-js';

// 🔗 Configuração Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://ymriypyyirnwctyitcsu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// 🔐 Verificação básica de autenticação
const isAuthorized = (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const apiKey = process.env.ADMIN_API_KEY || 'interbox2025';
  
  return authHeader === `Bearer ${apiKey}`;
};

// 🔍 Handler para requisições PUT (atualizar inscrições)
const handlePut = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS'
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

    // Parsear dados da requisição
    const updateData = JSON.parse(event.body);
    
    // Validar dados obrigatórios
    if (!updateData.email || !updateData.tipo) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Dados obrigatórios: email e tipo'
        })
      };
    }

    // Preparar dados para atualização
    const updateFields = {
      updated_at: new Date().toISOString()
    };

    // Adicionar campos que foram fornecidos
    if (updateData.correlationID) updateFields.correlation_id = updateData.correlationID;
    if (updateData.charge_id) updateFields.charge_id = updateData.charge_id;
    if (updateData.status) updateFields.status = updateData.status;
    if (updateData.data_confirmacao) updateFields.data_confirmacao = updateData.data_confirmacao;
    if (updateData.nome) updateFields.nome = updateData.nome;
    if (updateData.whatsapp) updateFields.whatsapp = updateData.whatsapp;
    if (updateData.cpf) updateFields.cpf = String(updateData.cpf).substring(0, 14); // Limitar a 14 caracteres
    if (updateData.valor !== undefined) updateFields.valor = updateData.valor;

    // Atualizar no Supabase
    const { data: inscricaoAtualizada, error: updateError } = await supabase
      .from('inscricoes')
      .update(updateFields)
      .eq('email', updateData.email)
      .eq('tipo', updateData.tipo)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar inscrição:', updateError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Erro ao atualizar inscrição no banco',
          details: updateError.message
        })
      };
    }

    console.log('✅ Inscrição atualizada com sucesso:', inscricaoAtualizada.id);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Inscrição atualizada com sucesso',
        inscricao: inscricaoAtualizada
      })
    };
  } catch (error) {
    console.error('Erro ao atualizar inscrição:', error);
    
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
        'Access-Control-Allow-Methods': 'PUT, OPTIONS'
      },
      body: ''
    };
  }

  // Roteamento baseado no método HTTP
  switch (event.httpMethod) {
    case 'PUT':
      return await handlePut(event);
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
