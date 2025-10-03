/**
 * Storage Service - Camada de abstração para operações de storage
 * Responsabilidade única: gerenciar persistência de dados
 */
import { createStorage } from '../utils/storage';
// ============================================================================
// Storage Service
// ============================================================================
export class StorageService {
    storage;
    constructor(storage) {
        this.storage = storage || createStorage();
    }
    /**
     * Salva pedido pendente (aguardando pagamento)
     */
    async savePendingOrder(charge, customer, options) {
        const orders = (await this.storage.read('orders.json')) || [];
        const info = charge?.charge?.additionalInfo || [];
        const findInfo = (k) => info.find((i) => i.key === k)?.value;
        const pendingOrder = {
            id: `ord_${Date.now()}`,
            status: 'pending',
            amount_cents: charge?.charge?.value || charge?.value || 0,
            correlationID: charge.correlationID,
            identifier: charge?.charge?.identifier || charge?.identifier,
            product_id: options?.product_id || findInfo('product_id'),
            product_slug: options?.product_slug || findInfo('product_slug'),
            origin: options?.origin || findInfo('origin') || 'site-interbox',
            tag: options?.tag || findInfo('tag') || 'default',
            customer: {
                email: customer.email,
                name: customer.name,
            },
            created_at: new Date().toISOString(),
        };
        // Evitar duplicatas por identifier
        const exists = orders.some((o) => o.identifier === pendingOrder.identifier);
        if (!exists) {
            orders.push(pendingOrder);
            await this.storage.write('orders.json', orders);
        }
        return pendingOrder;
    }
    /**
     * Atualiza pedido de pending para paid
     */
    async updateOrderStatus(identifiers, newStatus, options) {
        const orders = (await this.storage.read('orders.json')) || [];
        const idx = orders.findIndex((o) => (identifiers.identifier && o.identifier === identifiers.identifier) ||
            (identifiers.correlationID && o.correlationID === identifiers.correlationID) ||
            (identifiers.txid && o.txid === identifiers.txid) ||
            (identifiers.product_slug &&
                identifiers.customer_email &&
                o.product_slug === identifiers.product_slug &&
                o.customer?.email.toLowerCase() === identifiers.customer_email.toLowerCase()));
        if (idx === -1) {
            return null;
        }
        orders[idx].status = newStatus;
        orders[idx].txid = options?.txid || orders[idx].txid || `tx_${Date.now()}`;
        orders[idx].paid_at = new Date().toISOString();
        orders[idx].origin = orders[idx].origin || options?.origin || 'site-interbox';
        orders[idx].tag = orders[idx].tag || options?.tag || 'default';
        await this.storage.write('orders.json', orders);
        return orders[idx];
    }
    /**
     * Busca pedido por identificadores
     */
    async findOrder(identifiers) {
        const orders = (await this.storage.read('orders.json')) || [];
        const order = orders
            .slice()
            .reverse()
            .find((o) => (identifiers.identifier && o.identifier === identifiers.identifier) ||
            (identifiers.correlationID && o.correlationID === identifiers.correlationID));
        return order || null;
    }
    /**
     * Salva avaliação de produto
     */
    async saveReview(review) {
        const newReview = {
            ...review,
            id: `review_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            data: new Date().toISOString(),
        };
        await this.storage.append('reviews.json', newReview);
        return newReview;
    }
    /**
     * Busca avaliações de um produto
     */
    async getProductReviews(produtoId, filters) {
        let reviews = (await this.storage.read('reviews.json')) || [];
        // Filtrar por produto
        reviews = reviews.filter((r) => r.produto_id === produtoId);
        // Filtrar por aprovação
        if (filters?.aprovado !== undefined) {
            reviews = reviews.filter((r) => r.aprovado === filters.aprovado);
        }
        // Ordenar por data (mais recentes primeiro)
        reviews.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        // Paginação
        if (filters?.offset || filters?.limit) {
            const offset = filters.offset || 0;
            const limit = filters.limit || 20;
            reviews = reviews.slice(offset, offset + limit);
        }
        return reviews;
    }
    /**
     * Calcula rating de um produto
     */
    async calculateProductRating(produtoId) {
        const reviews = await this.getProductReviews(produtoId, { aprovado: true });
        if (reviews.length === 0) {
            return {
                media: 0,
                total: 0,
                distribuicao: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                ultima_atualizacao: new Date().toISOString(),
            };
        }
        const media = reviews.reduce((sum, r) => sum + r.nota, 0) / reviews.length;
        const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((r) => {
            distribuicao[r.nota] = (distribuicao[r.nota] || 0) + 1;
        });
        return {
            media: Math.round(media * 10) / 10,
            total: reviews.length,
            distribuicao,
            ultima_atualizacao: new Date().toISOString(),
        };
    }
    /**
     * Salva rating calculado
     */
    async saveProductRating(produtoId, rating) {
        const statsFile = `product-ratings-${produtoId}.json`;
        await this.storage.write(statsFile, rating);
    }
    /**
     * Estatísticas de vendas
     */
    async getSalesStats() {
        const orders = (await this.storage.read('orders.json')) || [];
        const paid = orders.filter((o) => o.status === 'paid');
        const pending = orders.filter((o) => o.status === 'pending');
        const revenue = paid.reduce((sum, o) => sum + (o.amount_cents || 0), 0);
        return {
            total_orders: orders.length,
            total_paid: paid.length,
            total_pending: pending.length,
            total_revenue_cents: revenue,
        };
    }
}
// ============================================================================
// Singleton Instance
// ============================================================================
let instance = null;
export const getStorageService = () => {
    if (!instance) {
        instance = new StorageService();
    }
    return instance;
};
