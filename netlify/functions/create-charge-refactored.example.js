/**
 * Netlify Function - Create Charge (REFATORADO)
 *
 * ✅ ANTES: 315 linhas com 3 responsabilidades misturadas
 * ✅ DEPOIS: ~100 linhas com responsabilidades separadas
 *
 * Separação de responsabilidades:
 * - PaymentService: gerencia cobranças PIX
 * - StorageService: gerencia persistência
 * - LoggerService: gerencia logs estruturados
 */

import { withCors, jsonResponse } from './_shared/cors.ts';
import {
	createInscricaoCharge,
	createProductCharge,
	PAYMENT_CONFIGS,
} from '../../src/services/payment.service.ts';
import { getStorageService } from '../../src/services/storage.service.ts';
import { getPaymentLogger } from '../../src/services/logger.service.ts';
import productsData from '../../data/products.json';

// ============================================================================
// Handler
// ============================================================================

export const handler = withCors(async (event) => {
	const logger = getPaymentLogger();
	const storageService = getStorageService();

	// Validar método
	if (event.httpMethod !== 'POST') {
		return jsonResponse(405, { error: 'Método não permitido' });
	}

	try {
		// Parse request body
		const body = JSON.parse(event.body);
		const { type, customerData, productId, productSlug, tag, origin } = body;

		// Validar dados do cliente
		if (!customerData?.name || !customerData?.email) {
			return jsonResponse(400, {
				error: 'Dados do cliente obrigatórios: name e email',
			});
		}

		const customer = {
			name: customerData.name,
			email: customerData.email,
			phone: customerData.phone || '',
			taxID: customerData.cpf || '',
		};

		// Determinar fluxo: produto ou inscrição
		const isProductFlow = Boolean(productId || productSlug);

		let charge;

		// ========================================================================
		// FLUXO: PRODUTO
		// ========================================================================
		if (isProductFlow) {
			const product = productsData.find(
				(p) => p.id === productId || p.slug === productSlug || p.slug === productId
			);

			if (!product) {
				logger.warn('Produto não encontrado', { productId, productSlug });
				return jsonResponse(404, { error: 'Produto não encontrado' });
			}

			logger.debug('Criando charge para produto', {
				product_id: product.id,
				product_name: product.nome,
				price: product.preco,
			});

			// Criar charge via PaymentService
			charge = await createProductCharge(
				product.id,
				product.slug,
				product.nome,
				product.preco,
				customer,
				{ origin, tag }
			);

			logger.chargeCreated(charge.correlationID, Math.round(product.preco * 100), customer.email);
		}
		// ========================================================================
		// FLUXO: INSCRIÇÃO
		// ========================================================================
		else {
			// Validar tipo de inscrição
			if (!PAYMENT_CONFIGS[type]) {
				return jsonResponse(400, {
					error: 'Tipo de pagamento inválido',
					validTypes: Object.keys(PAYMENT_CONFIGS),
				});
			}

			logger.debug('Criando charge para inscrição', {
				type,
				customer: customer.email,
			});

			// Criar charge via PaymentService
			charge = await createInscricaoCharge(type, customer);

			logger.chargeCreated(charge.correlationID, PAYMENT_CONFIGS[type].amount, customer.email);
		}

		// ========================================================================
		// SALVAR PEDIDO PENDENTE
		// ========================================================================
		try {
			await storageService.savePendingOrder(charge, customer, {
				product_id: productId,
				product_slug: productSlug,
				origin,
				tag,
			});

			logger.debug('Pedido pendente salvo', {
				correlationID: charge.correlationID,
			});
		} catch (storageError) {
			// Não bloquear fluxo se storage falhar
			logger.warn('Falha ao salvar pedido pendente (continuando)', {
				error: storageError.message,
			});
		}

		// ========================================================================
		// RESPOSTA DE SUCESSO
		// ========================================================================
		logger.success('Charge processado com sucesso', {
			correlationID: charge.correlationID,
			identifier: charge?.charge?.identifier || charge?.identifier,
			has_qr_code: Boolean(charge?.charge?.qrCodeImage || charge?.qrCodeImage),
		});

		return jsonResponse(200, {
			success: true,
			charge: charge,
			qrCode: charge?.charge?.qrCodeImage || charge?.qrCodeImage,
			pixCopyPaste: charge?.charge?.brCode || charge?.brCode,
			message: 'Pagamento processado com sucesso',
		});
	} catch (error) {
		// Error handling centralizado
		const logger = getPaymentLogger();
		logger.error('Erro ao processar criação de charge', error, {
			method: event.httpMethod,
			path: event.path,
		});

		return jsonResponse(500, {
			success: false,
			error: 'Erro ao processar pagamento',
			message: error.message || 'Erro desconhecido',
		});
	}
});
