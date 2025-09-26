/**
 * Netlify Function - Buscar Avaliações
 * Arquitetura descentralizada: JSON + Netlify Blobs
 * Zero lock-in, controle total
 */

// Usa o adapter via import dinâmico do TS para manter consistência
let createStorage;
const loadStorage = async () => {
	if (!createStorage) {
		const mod = await import('../../src/utils/storage.ts');
		createStorage = mod.createStorage;
	}
};

export const handler = async (event, context) => {
	// CORS Headers
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Allow-Methods': 'GET, OPTIONS'
	};

	// Preflight
	if (event.httpMethod === 'OPTIONS') {
		return { statusCode: 200, headers, body: '' };
	}

	// Apenas GET
	if (event.httpMethod !== 'GET') {
		return {
			statusCode: 405,
			headers,
			body: JSON.stringify({ error: 'Método não permitido' })
		};
	}

	try {
		await loadStorage();
		const storage = createStorage();
		const { produto_id, limit = 20, offset = 0 } = event.queryStringParameters || {};

		// Buscar todas as avaliações
		let reviews = await storage.read('reviews.json');
		
		// Filtrar apenas aprovadas
		reviews = reviews.filter(review => review.aprovado);

		// Filtrar por produto se especificado
		if (produto_id) {
			reviews = reviews.filter(review => review.produto_id === produto_id);
		}

		// Ordenar por data (mais recentes primeiro)
		reviews.sort((a, b) => new Date(b.data) - new Date(a.data));

		// Paginação
		const total = reviews.length;
		const paginatedReviews = reviews.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

		// Calcular estatísticas se for um produto específico
		let stats = null;
		if (produto_id) {
			const produtoReviews = reviews.filter(review => review.produto_id === produto_id);
			
			if (produtoReviews.length > 0) {
				const media = produtoReviews.reduce((sum, review) => sum + review.nota, 0) / produtoReviews.length;
				const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
				
				produtoReviews.forEach(review => {
					distribuicao[review.nota] = (distribuicao[review.nota] || 0) + 1;
				});

				stats = {
					media: Math.round(media * 10) / 10,
					total: produtoReviews.length,
					distribuicao
				};
			}
		}

		// Sanitizar dados para resposta (remover emails por privacidade)
		const sanitizedReviews = paginatedReviews.map(review => {
			const [prefixo = ''] = (review.cliente_email ?? '').split('@');
			return {
				id: review.id,
				produto_id: review.produto_id,
				nota: review.nota,
				comentario: review.comentario,
				data: review.data,
				cliente_inicial: `${prefixo.slice(0, 2)}***`
			};
		});

		return {
			statusCode: 200,
			headers: { ...headers, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				success: true,
				reviews: sanitizedReviews,
				pagination: {
					total,
					limit: parseInt(limit),
					offset: parseInt(offset),
					has_more: parseInt(offset) + parseInt(limit) < total
				},
				stats
			})
		};

	} catch (error) {
		console.error('❌ Erro ao buscar avaliações:', error);
		
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