/**
 * Payment Service - Integração com OpenPix/Woovi
 * Responsabilidade única: gerenciar cobranças PIX
 */
// ============================================================================
// OpenPix/Woovi API Client
// ============================================================================
export class PaymentService {
    apiKey;
    apiUrl;
    constructor(apiKey, apiUrl) {
        this.apiKey = apiKey || '';
        this.apiUrl = apiUrl || 'https://api.woovi.com';
        if (!this.apiKey) {
            throw new Error('OPENPIX_API_KEY não configurada (defina VITE_OPENPIX_API_KEY no .env)');
        }
    }
    /**
     * Cria uma cobrança PIX via OpenPix/Woovi
     */
    async createCharge(chargeData) {
        try {
            const response = await fetch(`${this.apiUrl}/api/v1/charge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: this.apiKey,
                    Accept: 'application/json',
                },
                body: JSON.stringify(chargeData),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenPix API Error: ${response.status} - ${errorText}`);
            }
            return await response.json();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            throw new Error(`Falha ao criar charge: ${message}`);
        }
    }
    /**
     * Consulta status de uma cobrança
     */
    async getChargeStatus(correlationID) {
        try {
            const response = await fetch(`${this.apiUrl}/api/v1/charge/${correlationID}`, {
                method: 'GET',
                headers: {
                    Authorization: this.apiKey,
                    Accept: 'application/json',
                },
            });
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`OpenPix API Error: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            throw new Error(`Falha ao consultar charge: ${message}`);
        }
    }
    /**
     * Constrói correlationID único
     */
    static generateCorrelationID(prefix) {
        return `interbox_${prefix}_${Date.now()}`;
    }
    /**
     * Sanitiza CPF (remove formatação)
     */
    static sanitizeCPF(cpf) {
        if (!cpf)
            return '';
        return cpf.replace(/\D/g, '');
    }
}
// ============================================================================
// Helper Functions
// ============================================================================
/**
 * Cria charge para produto do catálogo
 */
export const createProductCharge = async (productId, productSlug, productName, productPrice, customer, options) => {
    const service = new PaymentService();
    const amountInCents = Math.round(productPrice * 100);
    const chargeData = {
        correlationID: PaymentService.generateCorrelationID(`prod_${productSlug}`),
        value: amountInCents,
        comment: `Compra produto: ${productName}`,
        customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || '',
            taxID: PaymentService.sanitizeCPF(customer.taxID),
        },
        additionalInfo: [
            { key: 'event', value: 'INTERBØX 2025' },
            { key: 'flow', value: 'product' },
            { key: 'product_id', value: productId },
            { key: 'product_slug', value: productSlug },
            { key: 'origin', value: options?.origin || 'site-interbox' },
            { key: 'tag', value: options?.tag || 'default' },
        ],
    };
    return service.createCharge(chargeData);
};
/**
 * Extrai informação adicional do charge
 */
export const extractChargeInfo = (charge, key) => {
    const info = charge?.charge?.additionalInfo || [];
    return info.find((i) => i.key === key)?.value;
};
/**
 * Verifica se charge foi pago
 */
export const isChargePaid = (charge) => {
    const status = charge?.charge?.status || charge?.status;
    return status === 'COMPLETED' || status === 'ACTIVE_PAID' || status === 'paid';
};
