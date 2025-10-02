/**
 * Netlify Function - Process Payment Split
 * Executa split automático de pagamento entre FlowPay e Fornecedor
 */

import './_shared/fix-util-extend.js';
import { withCors, jsonResponse } from './_shared/cors.ts';
import { createPaymentSplitService, validateSplit } from '../../src/services/payment-split.service.ts';

/**
 * Handler principal
 */
export const handler = withCors(async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido' });
  }

  try {
    const body = JSON.parse(event.body);
    const {
      transactionId,
      totalAmount,
      correlationID,
      productId,
      category
    } = body;

    // Validações
    if (!transactionId || !totalAmount) {
      return jsonResponse(400, {
        error: 'Campos obrigatórios: transactionId, totalAmount',
      });
    }

    if (totalAmount <= 0) {
      return jsonResponse(400, {
        error: 'Valor total deve ser maior que zero',
      });
    }

    // Preparar dados do pedido
    const orderData = {
      correlationID: correlationID || transactionId,
      productId: productId || 'unknown',
      category: category || 'produto',
    };

    console.log('💰 Processando split de pagamento:', {
      transactionId,
      totalAmount: `R$ ${(totalAmount / 100).toFixed(2)}`,
      orderData,
    });

    // Criar service e executar split
    const splitService = createPaymentSplitService();
    const splitResult = await splitService.processSplitForOrder(
      transactionId,
      totalAmount,
      orderData
    );

    // Validar resultado
    const validation = validateSplit(splitResult);

    if (!validation.valid) {
      console.warn('⚠️ Split executado com problemas:', validation.issues);
    }

    // Log detalhado
    console.log('📊 Resultado do split:');
    splitResult.splits.forEach((split) => {
      const status = split.status === 'success' ? '✅' : '❌';
      console.log(
        `${status} ${split.recipient}: R$ ${(split.amount / 100).toFixed(2)} (${split.pixKey})`
      );
      if (split.error) {
        console.log(`   Erro: ${split.error}`);
      }
    });

    // Registrar em storage
    await splitService.logSplitTransaction(splitResult, orderData);

    // Retornar resultado
    return jsonResponse(splitResult.success ? 200 : 207, {
      success: splitResult.success,
      message: splitResult.success
        ? 'Split executado com sucesso'
        : 'Split executado parcialmente',
      validation: validation,
      totalAmount: splitResult.totalAmount,
      splits: splitResult.splits.map((s) => ({
        recipient: s.recipient,
        amount: s.amount,
        percentage: Math.round((s.amount / splitResult.totalAmount) * 100),
        status: s.status,
        transactionId: s.transactionId,
        error: s.error,
      })),
      errors: splitResult.errors,
    });

  } catch (error) {
    console.error('❌ Erro ao processar split:', error);

    return jsonResponse(500, {
      success: false,
      error: 'Erro interno do servidor',
      message: error.message || 'Erro desconhecido',
    });
  }
});
