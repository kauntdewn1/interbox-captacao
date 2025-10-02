/**
 * Netlify Function - Salvar Avaliação
 * Arquitetura descentralizada: JSON + Netlify Blobs
 * Zero lock-in, controle total
 */

import { withCors, jsonResponse } from './_shared/cors.ts';

// Usa o adapter via import dinâmico do TS para manter consistência
let createStorage, validateReview, generateId, sanitizeEmail, sanitizeString;
const loadStorage = async () => {
	if (!createStorage) {
		const mod = await import('../../src/utils/storage.ts');
		createStorage = mod.createStorage;
		validateReview = mod.validateReview;
		generateId = mod.generateId;
		sanitizeEmail = mod.sanitizeEmail;
		sanitizeString = mod.sanitizeString;
	}
};

export const handler = withCors(async (event) => {
	// Apenas POST
	if (event.httpMethod !== 'POST') {
		return jsonResponse(405, { error: 'Método não permitido' });
	}

	try {
		await loadStorage();
		// Parse e validação
		const reviewData = JSON.parse(event.body);

		if (!validateReview(reviewData)) {
			return jsonResponse(400, {
				error: 'Dados da avaliação inválidos',
				required: ['produto_id', 'nota', 'cliente_email'],
				valid_nota: '1-5'
			});
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
			return jsonResponse(409, {
				error: 'Você já avaliou este produto',
				existing_review_id: duplicateReview.id
			});
		}

		// Salvar avaliação
		await storage.append('reviews.json', sanitizedReview);

		// Recalcular média do produto
		await updateProductRating(sanitizedReview.produto_id, storage);

		console.log('✅ Avaliação salva:', sanitizedReview.id);

		return jsonResponse(200, {
			success: true,
			review_id: sanitizedReview.id,
			message: 'Avaliação registrada com sucesso'
		});

	} catch (error) {
		console.error('❌ Erro ao salvar avaliação:', error);
		return jsonResponse(500, {
			error: 'Erro interno do servidor',
			details: error.message
		});
	}
});

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
