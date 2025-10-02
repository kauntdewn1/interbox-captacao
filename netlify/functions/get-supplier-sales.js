/**
 * Netlify Function - Get Supplier Sales
 * Lista vendas de produtos por fornecedor com filtros e agregações
 */

import './_shared/fix-util-extend.js';
import { withCors, jsonResponse, CORS_PRESETS } from './_shared/cors.ts';
import { createStorage } from '../../src/utils/storage.ts';
import productsData from '../../data/products.json';

/**
 * Extrai gênero do produto baseado em tags
 */
const extractGender = (additionalInfo = []) => {
  const tags = additionalInfo.find((info) => info.key === 'tags')?.value || '';

  if (tags.includes('FEMININO')) return 'Feminino';
  if (tags.includes('MASCULINO')) return 'Masculino';
  if (tags.includes('UNISSEX')) return 'Unissex';

  return 'Unissex';
};

/**
 * Filtra pedidos por fornecedor e período
 */
const filterOrders = (orders, supplier, startDate, endDate, status, gender) => {
  return orders.filter((order) => {
    // Filtrar apenas pedidos de produtos (não inscrições)
    const isProduct = order.product_slug || order.product_id;
    if (!isProduct) return false;

    // Filtrar por status
    if (status && order.status !== status) return false;

    // Filtrar por data
    const orderDate = new Date(order.created_at || order.paid_at);
    if (startDate && orderDate < new Date(startDate)) return false;
    if (endDate && orderDate > new Date(endDate)) return false;

    // Filtrar por gênero (se fornecido)
    if (gender) {
      const orderGender = extractGender(order.additionalInfo);
      if (orderGender !== gender) return false;
    }

    // Por enquanto, todos os produtos são do fornecedor PlayK
    // No futuro, usar campo 'supplier' no pedido
    return true;
  });
};

/**
 * Enriquece pedidos com dados do produto
 */
const enrichOrders = (orders) => {
  return orders.map((order) => {
    const productId = order.product_id || order.product_slug;
    const product = productsData.find((p) => p.id === productId || p.slug === productId);

    return {
      id: order.id,
      correlationID: order.correlationID,
      identifier: order.identifier,
      status: order.status,
      amount_cents: order.amount_cents,
      amount_brl: order.amount_cents ? (order.amount_cents / 100).toFixed(2) : '0.00',
      product: {
        id: productId,
        name: product?.nome || 'Produto não encontrado',
        category: product?.categoria || 'Desconhecido',
        subcategory: product?.subcategoria || '',
        gender: extractGender(order.additionalInfo),
        image: product?.imagens?.[0] || '',
      },
      customer: {
        name: order.customer?.name || 'Cliente',
        email: order.customer?.email || '',
      },
      dates: {
        created: order.created_at,
        paid: order.paid_at,
      },
      origin: order.origin || 'site-interbox',
      tag: order.tag || 'default',
    };
  });
};

/**
 * Calcula estatísticas agregadas
 */
const calculateStats = (orders) => {
  const total = orders.reduce((sum, order) => sum + (order.amount_cents || 0), 0);
  const paidOrders = orders.filter((o) => o.status === 'paid');
  const pendingOrders = orders.filter((o) => o.status === 'pending');

  const byGender = orders.reduce((acc, order) => {
    const gender = order.product.gender;
    if (!acc[gender]) {
      acc[gender] = { count: 0, total: 0 };
    }
    acc[gender].count++;
    acc[gender].total += order.amount_cents || 0;
    return acc;
  }, {});

  const byProduct = orders.reduce((acc, order) => {
    const productId = order.product.id;
    if (!acc[productId]) {
      acc[productId] = {
        id: productId,
        name: order.product.name,
        count: 0,
        total: 0,
      };
    }
    acc[productId].count++;
    acc[productId].total += order.amount_cents || 0;
    return acc;
  }, {});

  return {
    total_orders: orders.length,
    paid_orders: paidOrders.length,
    pending_orders: pendingOrders.length,
    total_revenue_cents: total,
    total_revenue_brl: (total / 100).toFixed(2),
    by_gender: Object.entries(byGender).map(([gender, data]) => ({
      gender,
      count: data.count,
      total_cents: data.total,
      total_brl: (data.total / 100).toFixed(2),
    })),
    by_product: Object.values(byProduct).sort((a, b) => b.count - a.count),
  };
};

/**
 * Handler principal
 */
export const handler = withCors(async (event) => {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Método não permitido' });
  }

  try {
    // Extrair query parameters
    const params = event.queryStringParameters || {};
    const {
      supplier = 'playk',
      startDate,
      endDate,
      status,
      gender,
      limit = '100',
      offset = '0',
    } = params;

    // Ler pedidos do storage
    const storage = await createStorage();
    const allOrders = (await storage.read('orders.json')) || [];

    // Filtrar pedidos
    let filteredOrders = filterOrders(allOrders, supplier, startDate, endDate, status, gender);

    // Enriquecer com dados do produto
    const enrichedOrders = enrichOrders(filteredOrders);

    // Calcular estatísticas
    const stats = calculateStats(enrichedOrders);

    // Ordenar por data (mais recente primeiro)
    enrichedOrders.sort((a, b) => {
      const dateA = new Date(a.dates.paid || a.dates.created);
      const dateB = new Date(b.dates.paid || b.dates.created);
      return dateB - dateA;
    });

    // Paginação
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);
    const paginatedOrders = enrichedOrders.slice(offsetNum, offsetNum + limitNum);

    console.log(`📊 Vendas do fornecedor ${supplier}:`, {
      total: enrichedOrders.length,
      paid: stats.paid_orders,
      pending: stats.pending_orders,
      revenue: stats.total_revenue_brl,
    });

    return jsonResponse(200, {
      success: true,
      supplier,
      filters: {
        startDate,
        endDate,
        status,
        gender,
      },
      pagination: {
        total: enrichedOrders.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < enrichedOrders.length,
      },
      stats,
      orders: paginatedOrders,
    });

  } catch (error) {
    console.error('❌ Erro ao listar vendas do fornecedor:', error);

    return jsonResponse(500, {
      success: false,
      error: 'Erro interno do servidor',
      message: error.message || 'Erro desconhecido',
    });
  }
}, CORS_PRESETS.READ_ONLY);
