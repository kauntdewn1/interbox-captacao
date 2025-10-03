/**
 * Payment Service - Integração com OpenPix/Woovi
 * Responsabilidade única: gerenciar cobranças PIX
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface PaymentCustomer {
	name: string;
	email: string;
	phone?: string;
	taxID?: string; // CPF
}

export interface PaymentAdditionalInfo {
	key: string;
	value: string;
}

export interface PaymentChargeData {
	correlationID: string;
	value: number; // centavos
	comment: string;
	customer: PaymentCustomer;
	additionalInfo?: PaymentAdditionalInfo[];
}

export interface PaymentCharge {
	identifier?: string;
	correlationID: string;
	status: string;
	value: number;
	brCode?: string;
	qrCodeImage?: string;
	charge?: {
		identifier?: string;
		brCode?: string;
		qrCodeImage?: string;
		status?: string;
		additionalInfo?: PaymentAdditionalInfo[];
	};
}

export interface PaymentConfig {
	amount: number;
	description: string;
	comment: string;
}

// ============================================================================
// Payment Configs
// ============================================================================

export const PAYMENT_CONFIGS: Record<string, PaymentConfig> = {
	judge: {
		amount: 1990, // R$ 19,90
		description: 'Inscrição Judge INTERBØX 2025',
		comment: 'Taxa de inscrição para candidatura judge',
	},
	staff: {
		amount: 1990, // R$ 19,90
		description: 'Inscrição Staff INTERBØX 2025',
		comment: 'Taxa de inscrição para candidatura staff',
	},
} as const;

// ============================================================================
// OpenPix/Woovi API Client
// ============================================================================

export class PaymentService {
	private apiKey: string;
	private apiUrl: string;

	constructor(apiKey?: string, apiUrl?: string) {
		this.apiKey = apiKey || process.env.OPENPIX_API_KEY || '';
		this.apiUrl = apiUrl || process.env.API_BASE_URL || 'https://api.woovi.com';

		if (!this.apiKey) {
			throw new Error('OPENPIX_API_KEY não configurada');
		}
	}

	/**
	 * Cria uma cobrança PIX via OpenPix/Woovi
	 */
	async createCharge(chargeData: PaymentChargeData): Promise<PaymentCharge> {
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
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Erro desconhecido';
			throw new Error(`Falha ao criar charge: ${message}`);
		}
	}

	/**
	 * Consulta status de uma cobrança
	 */
	async getChargeStatus(correlationID: string): Promise<PaymentCharge | null> {
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
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Erro desconhecido';
			throw new Error(`Falha ao consultar charge: ${message}`);
		}
	}

	/**
	 * Constrói correlationID único
	 */
	static generateCorrelationID(prefix: string): string {
		return `interbox_${prefix}_${Date.now()}`;
	}

	/**
	 * Sanitiza CPF (remove formatação)
	 */
	static sanitizeCPF(cpf?: string): string {
		if (!cpf) return '';
		return cpf.replace(/\D/g, '');
	}
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Cria charge para inscrição (audiovisual/judge/staff)
 */
export const createInscricaoCharge = async (
	type: keyof typeof PAYMENT_CONFIGS,
	customer: PaymentCustomer
): Promise<PaymentCharge> => {
	const config = PAYMENT_CONFIGS[type];
	if (!config) {
		throw new Error(`Tipo de inscrição inválido: ${type}`);
	}

	const service = new PaymentService();
	const chargeData: PaymentChargeData = {
		correlationID: PaymentService.generateCorrelationID(type),
		value: config.amount,
		comment: config.comment,
		customer: {
			name: customer.name,
			email: customer.email,
			phone: customer.phone || '',
			taxID: PaymentService.sanitizeCPF(customer.taxID),
		},
		additionalInfo: [
			{ key: 'event', value: 'INTERBØX 2025' },
			{ key: 'type', value: type },
			{ key: 'customer_id', value: customer.email },
		],
	};

	return service.createCharge(chargeData);
};

/**
 * Cria charge para produto do catálogo
 */
export const createProductCharge = async (
	productId: string,
	productSlug: string,
	productName: string,
	productPrice: number,
	customer: PaymentCustomer,
	options?: {
		origin?: string;
		tag?: string;
	}
): Promise<PaymentCharge> => {
	const service = new PaymentService();
	const amountInCents = Math.round(productPrice * 100);

	const chargeData: PaymentChargeData = {
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
export const extractChargeInfo = (
	charge: PaymentCharge,
	key: string
): string | undefined => {
	const info = charge?.charge?.additionalInfo || [];
	return info.find((i) => i.key === key)?.value;
};

/**
 * Verifica se charge foi pago
 */
export const isChargePaid = (charge: PaymentCharge): boolean => {
	const status = charge?.charge?.status || charge?.status;
	return status === 'COMPLETED' || status === 'ACTIVE_PAID' || status === 'paid';
};
