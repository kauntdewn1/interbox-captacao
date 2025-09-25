/**
 * Netlify Function para salvar avaliações de produtos
 * Endpoint: POST /.netlify/functions/save-review
 * Salva avaliação na tabela 'reviews' do Supabase
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
    const { produto_id, nota, comentario, cliente_email, cor, tamanho } = JSON.parse(event.body);

    // Validação dos campos obrigatórios
    if (!produto_id || !nota || !cliente_email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Campos obrigatórios: produto_id, nota, cliente_email'
        })
      };
    }

    // Validação da nota (1-5)
    if (nota < 1 || nota > 5) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Nota deve ser entre 1 e 5'
        })
      };
    }

    // Criar dados da avaliação
    const reviewData = {
      produto_id,
      nota: parseInt(nota),
      comentario: comentario || '',
      cliente_email,
      cor: cor || '',
      tamanho: tamanho || '',
      data_criacao: new Date().toISOString(),
      data_atualizacao: new Date().toISOString()
    };

    // Salvar no Supabase
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select();

    if (error) {
      console.error('❌ Erro ao salvar avaliação no Supabase:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Erro ao salvar avaliação',
          details: error.message
        })
      };
    }

    console.log(`✅ Avaliação salva: ${data[0].id} para produto ${produto_id}`);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        ok: true,
        review_id: data[0].id,
        message: 'Avaliação salva com sucesso'
      })
    };

  } catch (error) {
    console.error('❌ Erro ao processar avaliação:', error);
    
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
