/**
 * Netlify Function para buscar vendas de produtos
 * Endpoint: GET /.netlify/functions/get-sales?produto_id=xxx
 * Conta pedidos pagos de um produto específico no Supabase
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
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
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
    // Verificar se é uma requisição GET
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método não permitido' })
      };
    }

    // Extrair produto_id da query string
    const { produto_id } = event.queryStringParameters || {};

    // Validação do produto_id
    if (!produto_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Parâmetro produto_id é obrigatório'
        })
      };
    }

    // Buscar pedidos pagos do produto
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('produto_id', produto_id)
      .eq('status', 'pago')
      .order('data_pagamento', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar vendas:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Erro ao buscar vendas',
          details: error.message
        })
      };
    }

    const total = orders.length;

    // Calcular estatísticas por cor e tamanho
    const vendasPorCor = {};
    const vendasPorTamanho = {};
    
    orders.forEach(order => {
      // Contar por cor
      if (order.cor) {
        vendasPorCor[order.cor] = (vendasPorCor[order.cor] || 0) + 1;
      }
      
      // Contar por tamanho
      if (order.tamanho) {
        vendasPorTamanho[order.tamanho] = (vendasPorTamanho[order.tamanho] || 0) + 1;
      }
    });

    // Encontrar última venda
    const ultimaVenda = orders.length > 0 ? orders[0].data_pagamento : null;

    console.log(`✅ ${total} vendas encontradas para produto ${produto_id}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        produto_id,
        total,
        vendas_por_cor: vendasPorCor,
        vendas_por_tamanho: vendasPorTamanho,
        ultima_venda: ultimaVenda
      })
    };

  } catch (error) {
    console.error('❌ Erro ao processar busca de vendas:', error);
    
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
