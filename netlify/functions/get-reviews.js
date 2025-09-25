/**
 * Netlify Function para buscar avaliações de produtos
 * Endpoint: GET /.netlify/functions/get-reviews?produto_id=xxx
 * Busca avaliações de um produto específico no Supabase
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

    // Buscar avaliações do produto
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('produto_id', produto_id)
      .order('data_criacao', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar avaliações:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Erro ao buscar avaliações',
          details: error.message
        })
      };
    }

    // Calcular estatísticas
    const totalReviews = reviews.length;
    const mediaNotas = totalReviews > 0 
      ? (reviews.reduce((sum, review) => sum + review.nota, 0) / totalReviews).toFixed(1)
      : 0;

    // Calcular distribuição de notas
    const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      distribuicao[review.nota]++;
    });

    console.log(`✅ ${totalReviews} avaliações encontradas para produto ${produto_id}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        produto_id,
        total: totalReviews,
        media: parseFloat(mediaNotas),
        distribuicao,
        reviews
      })
    };

  } catch (error) {
    console.error('❌ Erro ao processar busca de avaliações:', error);
    
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
