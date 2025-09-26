/**
 * Netlify Function - Salvar Avaliação
 * Arquitetura descentralizada: JSON + Netlify Blobs
 * Zero lock-in, controle total
 */

import { createStorage, validateReview, generateId, sanitizeEmail, sanitizeString } from '../../src/utils/storage.js';

export const handler = async (event, context) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Apenas POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    // Parse e validação
    const reviewData = JSON.parse(event.body);
    
    if (!validateReview(reviewData)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Dados da avaliação inválidos',
          required: ['produto_id', 'nota', 'cliente_email'],
          valid_nota: '1-5'
        })
      };
    }

    // Sanitização
    const sanitizedReview = {
      id: generateId('review'),
      produto_id: reviewData.produto_id,
      cliente_email: sanitizeEmail(reviewData.cliente_email),
      nota: parseInt(reviewData.nota),
      comentario: sanitizeString(reviewData.comentario || ''),
      data: new Date().toISOString(),
      aprovado: true,
      ip: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown'
    };

    // Verificar se já existe avaliação deste cliente para este produto
    const storage = createStorage();
    const existingReviews = await storage.read('reviews.json');
    
    const duplicateReview = existingReviews.find(review => 
      review.produto_id === sanitizedReview.produto_id && 
      review.cliente_email === sanitizedReview.cliente_email
    );

    if (duplicateReview) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: 'Você já avaliou este produto',
          existing_review_id: duplicateReview.id
        })
      };
    }

    // Salvar avaliação
    await storage.append('reviews.json', sanitizedReview);

    // Recalcular média do produto
    await updateProductRating(sanitizedReview.produto_id, storage);

    console.log('✅ Avaliação salva:', sanitizedReview.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        review_id: sanitizedReview.id,
        message: 'Avaliação registrada com sucesso'
      })
    };

  } catch (error) {
    console.error('❌ Erro ao salvar avaliação:', error);
    
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

/**
 * Recalcula a média de avaliações de um produto
 */
async function updateProductRating(produtoId, storage) {
  try {
    const reviews = await storage.read('reviews.json');
    const produtoReviews = reviews.filter(review => 
      review.produto_id === produtoId && review.aprovado
    );

    if (produtoReviews.length === 0) return;

    const media = produtoReviews.reduce((sum, review) => sum + review.nota, 0) / produtoReviews.length;
    const total = produtoReviews.length;

    // Distribuição das notas
    const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    produtoReviews.forEach(review => {
      distribuicao[review.nota] = (distribuicao[review.nota] || 0) + 1;
    });

    const ratingData = {
      media: Math.round(media * 10) / 10, // Arredondar para 1 casa decimal
      total,
      distribuicao,
      ultima_atualizacao: new Date().toISOString()
    };

    // Salvar estatísticas de avaliação
    const statsFile = `product-ratings-${produtoId}.json`;
    await storage.write(statsFile, ratingData);

    console.log(`📊 Rating atualizado para ${produtoId}:`, ratingData);

  } catch (error) {
    console.error('❌ Erro ao atualizar rating:', error);
  }
}