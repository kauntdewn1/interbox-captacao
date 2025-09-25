/**
 * Netlify Function para salvar pedidos
 * Endpoint: POST /.netlify/functions/save-order
 * Salva pedido na tabela 'orders' do Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const handler = async (event, context) => {
  // Configurar CORS
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
    const { 
      produto_id, 
      cliente_email, 
      cor, 
      tamanho, 
      valor, 
      charge_id,
      status = 'pendente'
    } = JSON.parse(event.body);

    // Validação dos campos obrigatórios
    if (!produto_id || !cliente_email || !valor) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Campos obrigatórios: produto_id, cliente_email, valor'
        })
      };
    }

    // Criar dados do pedido
    const orderData = {
      produto_id,
      cliente_email,
      cor: cor || '',
      tamanho: tamanho || '',
      valor: parseFloat(valor),
      charge_id: charge_id || '',
      status,
      data_criacao: new Date().toISOString(),
      data_atualizacao: new Date().toISOString(),
      ...(status === 'pago' && { data_pagamento: new Date().toISOString() })
    };

    // Salvar no Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select();

    if (error) {
      console.error('❌ Erro ao salvar pedido no Supabase:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Erro ao salvar pedido',
          details: error.message
        })
      };
    }

    console.log(`✅ Pedido salvo: ${data[0].id} para produto ${produto_id}`);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        ok: true,
        order_id: data[0].id,
        message: 'Pedido salvo com sucesso'
      })
    };

  } catch (error) {
    console.error('❌ Erro ao processar pedido:', error);
    
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
