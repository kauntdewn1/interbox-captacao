/**
 * Netlify Function - Estatísticas de Vendas
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
		const orders = await storage.read('orders.json');

		// Estatísticas gerais
		const totalVendas = orders.length;
		const totalFaturamento = orders.reduce((sum, order) => sum + order.valor, 0);
		
		// Vendas por produto
		const vendasPorProduto = orders.reduce((acc, order) => {
			const produto = order.produto_id;
			if (!acc[produto]) {
				acc[produto] = { total: 0, faturamento: 0, cores: {}, tamanhos: {} };
			}
			acc[produto].total += 1;
			acc[produto].faturamento += order.valor;
			
			// Cores mais vendidas
			const cor = order.cor;
			acc[produto].cores[cor] = (acc[produto].cores[cor] || 0) + 1;
			
			// Tamanhos mais vendidos
			const tamanho = order.tamanho;
			acc[produto].tamanhos[tamanho] = (acc[produto].tamanhos[tamanho] || 0) + 1;
			
			return acc;
		}, {});

		// Vendas por período (últimos 30 dias)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		
		const vendasRecentes = orders.filter(order => 
			new Date(order.data) >= thirtyDaysAgo
		);

		// Vendas por dia (últimos 7 dias)
		const vendasPorDia = {};
		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const dateStr = date.toISOString().split('T')[0];
			vendasPorDia[dateStr] = 0;
		}

		orders.forEach(order => {
			const orderDate = order.data.split('T')[0];
			if (vendasPorDia.hasOwnProperty(orderDate)) {
				vendasPorDia[orderDate] += 1;
			}
		});

		// Top clientes (por email)
		const clientesFrequentes = orders.reduce((acc, order) => {
			const email = order.cliente_email;
			acc[email] = (acc[email] || 0) + 1;
			return acc;
		}, {});

		const topClientes = Object.entries(clientesFrequentes)
			.map(([email, count]) => ({ email, compras: count }))
			.sort((a, b) => b.compras - a.compras)
			.slice(0, 10);

		const stats = {
			geral: {
				total_vendas: totalVendas,
				total_faturamento: totalFaturamento,
				faturamento_medio: totalVendas > 0 ? Math.round(totalFaturamento / totalVendas) : 0,
				vendas_ultimos_30_dias: vendasRecentes.length
			},
			por_produto: vendasPorProduto,
			vendas_por_dia: vendasPorDia,
			top_clientes: topClientes,
			ultima_atualizacao: new Date().toISOString()
		};

		return {
			statusCode: 200,
			headers: { ...headers, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				success: true,
				stats
			})
		};

	} catch (error) {
		console.error('❌ Erro ao buscar estatísticas:', error);
		
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
