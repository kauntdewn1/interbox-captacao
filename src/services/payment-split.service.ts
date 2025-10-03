/**
 * Payment Split Service - INTERBØX 2025
 *
 * Service para split automático de pagamentos entre FlowPay e Fornecedores
 * Integração com OpenPix/Woovi e APIs de Pix
 */

// Helper para pegar env vars
const getEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  try {
    // @ts-ignore - import.meta só existe em contexto ESM
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key] as string | undefined;
    }
  } catch {
    // import.meta não disponível (CJS bundle)
  }
  return undefined;
};

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SplitRule {
  /** Percentual do split (0-100) */
  percentage: number;
  /** Nome do beneficiário */
  recipient: string;
  /** Chave PIX do beneficiário */
  pixKey: string;
  /** CNPJ do beneficiário (opcional) */
  cnpj?: string;
  /** Descrição do split */
  description?: string;
}

export interface SplitConfig {
  /** Total da transação em centavos */
  totalAmount: number;
  /** Regras de split */
  rules: SplitRule[];
  /** ID da transação original */
  transactionId: string;
  /** Dados do pedido */
  orderData?: {
    correlationID: string;
    productId: string;
    category: string;
  };
}

export interface SplitResult {
  /** Se o split foi bem-sucedido */
  success: boolean;
  /** Valor total processado */
  totalAmount: number;
  /** Splits executados */
  splits: Array<{
    recipient: string;
    amount: number;
    pixKey: string;
    status: 'success' | 'failed' | 'pending';
    transactionId?: string;
    error?: string;
  }>;
  /** Erros ocorridos */
  errors?: string[];
}

export interface PixTransferRequest {
  /** Chave PIX do destinatário */
  pixKey: string;
  /** Valor em centavos */
  amount: number;
  /** Descrição da transferência */
  description: string;
  /** ID único da transação */
  idempotencyKey: string;
}

// ============================================================================
// Configurações Padrão
// ============================================================================

/**
 * Configuração padrão de split FlowPay x Fornecedores
 */
export const DEFAULT_SPLIT_RULES: Record<string, SplitRule[]> = {
  playk: [
  {
  percentage: 10,
  recipient: 'FlowPay',
  pixKey: getEnv('VITE_FLOWPAY_PIX_KEY') || '',
  description: 'Comissão FlowPay',
  },
  {
  percentage: 90,
  recipient: 'PlayK',
  pixKey: '34886756000100',
  cnpj: '34.886.756/0001-00',
  description: 'Repasse Fornecedor PlayK',
  },
  ],
  };

// ============================================================================
// Payment Split Service Class
// ============================================================================

export class PaymentSplitService {
  private apiUrl: string;
  private apiKey: string;

  constructor(config?: { apiUrl?: string; apiKey?: string }) {
    const envApiUrl = getEnv('VITE_OPENPIX_API_URL') || getEnv('API_BASE_URL');
    const envApiKey = getEnv('VITE_OPENPIX_API_KEY') || getEnv('OPENPIX_API_KEY');

    this.apiUrl = config?.apiUrl ?? envApiUrl ?? 'https://api.woovi.com';
    this.apiKey = config?.apiKey ?? envApiKey ?? '';

    if (!this.apiKey) {
      console.warn('⚠️ PaymentSplitService: API Key não configurada');
    }
  }

  /**
   * Calcula valores de split baseado em regras
   */
  calculateSplitAmounts(totalAmount: number, rules: SplitRule[]): Array<{ rule: SplitRule; amount: number }> {
    const totalPercentage = rules.reduce((sum, rule) => sum + rule.percentage, 0);

    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error(`Percentuais de split devem somar 100% (atual: ${totalPercentage}%)`);
    }

    return rules.map((rule) => ({
      rule,
      amount: Math.round((totalAmount * rule.percentage) / 100),
    }));
  }

  /**
   * Executa split usando OpenPix/Woovi API
   * (Método preferencial se API suportar split direto)
   */
  async executeSplitViaAPI(config: SplitConfig): Promise<SplitResult> {
    try {
      const splitAmounts = this.calculateSplitAmounts(config.totalAmount, config.rules);

      console.log('🔄 Executando split via OpenPix API:', {
        transactionId: config.transactionId,
        totalAmount: config.totalAmount,
        rules: splitAmounts,
      });

      // Verificar se OpenPix suporta split direto
      const response = await fetch(`${this.apiUrl}/api/v1/charge/${config.transactionId}/split`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.apiKey,
        },
        body: JSON.stringify({
          splits: splitAmounts.map(({ rule, amount }) => ({
            recipient: rule.pixKey,
            amount,
            description: rule.description,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenPix Split API Error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        totalAmount: config.totalAmount,
        splits: splitAmounts.map(({ rule, amount }) => ({
          recipient: rule.recipient,
          amount,
          pixKey: rule.pixKey,
          status: 'success',
          transactionId: data?.splits?.[rule.pixKey]?.id,
        })),
      };
    } catch (error) {
      console.error('❌ Erro ao executar split via API:', error);

      // Fallback para split manual
      console.log('🔄 Tentando split manual como fallback...');
      return this.executeSplitManual(config);
    }
  }

  /**
   * Executa split manual via transferências PIX individuais
   * (Usado quando API não suporta split ou como fallback)
   */
  async executeSplitManual(config: SplitConfig): Promise<SplitResult> {
    const splitAmounts = this.calculateSplitAmounts(config.totalAmount, config.rules);
    const results: SplitResult['splits'] = [];
    const errors: string[] = [];

    console.log('💰 Executando split manual via PIX:', {
      transactionId: config.transactionId,
      totalAmount: config.totalAmount,
      splits: splitAmounts.length,
    });

    for (const { rule, amount } of splitAmounts) {
      try {
        // FlowPay já recebeu o pagamento completo, então só fazemos repasse para fornecedores
        if (rule.recipient === 'FlowPay') {
          console.log(`✅ FlowPay (${rule.percentage}%): R$ ${(amount / 100).toFixed(2)} - já recebido`);
          results.push({
            recipient: rule.recipient,
            amount,
            pixKey: rule.pixKey,
            status: 'success',
            transactionId: config.transactionId,
          });
          continue;
        }

        // Executar transferência PIX para fornecedor
        console.log(`🔄 Transferindo para ${rule.recipient} (${rule.percentage}%): R$ ${(amount / 100).toFixed(2)}`);

        const transferResult = await this.executePixTransfer({
          pixKey: rule.pixKey,
          amount,
          description: `${rule.description} - Pedido ${config.orderData?.correlationID || config.transactionId}`,
          idempotencyKey: `split_${config.transactionId}_${rule.pixKey}_${Date.now()}`,
        });

        results.push({
          recipient: rule.recipient,
          amount,
          pixKey: rule.pixKey,
          status: transferResult.success ? 'success' : 'failed',
          transactionId: transferResult.transactionId,
          error: transferResult.error,
        });

        if (!transferResult.success) {
          errors.push(`Erro ao transferir para ${rule.recipient}: ${transferResult.error}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Erro ao processar split para ${rule.recipient}:`, errorMessage);

        results.push({
          recipient: rule.recipient,
          amount,
          pixKey: rule.pixKey,
          status: 'failed',
          error: errorMessage,
        });

        errors.push(`Erro ao transferir para ${rule.recipient}: ${errorMessage}`);
      }
    }

    const allSuccess = results.every((r) => r.status === 'success');

    return {
      success: allSuccess,
      totalAmount: config.totalAmount,
      splits: results,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Executa transferência PIX individual
   */
  async executePixTransfer(request: PixTransferRequest): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Tentar via OpenPix/Woovi PIX Transfer API
      const response = await fetch(`${this.apiUrl}/api/v1/pix/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.apiKey,
        },
        body: JSON.stringify({
          value: request.amount,
          pixKey: request.pixKey,
          description: request.description,
          correlationID: request.idempotencyKey,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PIX Transfer API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      console.log(`✅ Transferência PIX realizada: R$ ${(request.amount / 100).toFixed(2)} para ${request.pixKey}`);

      return {
        success: true,
        transactionId: data?.transaction?.transactionId || data?.id,
      };
    } catch (error) {
      console.error('❌ Erro ao executar transferência PIX:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Processa split para venda de produto PlayK
   */
  async processSplitForOrder(
    transactionId: string,
    totalAmount: number,
    orderData: {
      correlationID: string;
      productId: string;
      category: string;
    }
  ): Promise<SplitResult> {
    const rules = DEFAULT_SPLIT_RULES.playk;

    const config: SplitConfig = {
      totalAmount,
      rules,
      transactionId,
      orderData,
    };

    // Tentar split via API primeiro, se falhar usa split manual
    return this.executeSplitViaAPI(config);
  }

  /**
   * Registra split em storage para auditoria
   */
  async logSplitTransaction(splitResult: SplitResult, orderData?: Record<string, unknown>): Promise<void> {
    try {
      const { createStorage } = await import('../utils/storage');
      const storage = await createStorage();

      const splits = (await storage.read('splits.json')) ?? [];
      const splitRecord = {
        id: `split_${Date.now()}`,
        timestamp: new Date().toISOString(),
        success: splitResult.success,
        totalAmount: splitResult.totalAmount,
        splits: splitResult.splits,
        errors: splitResult.errors,
        orderData,
      };

      splits.push(splitRecord);
      await storage.write('splits.json', splits);

      console.log('📝 Split registrado em storage:', splitRecord.id);
    } catch (error) {
      console.error('⚠️ Erro ao registrar split em storage:', error);
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Cria instância do PaymentSplitService com configuração padrão
 */
export const createPaymentSplitService = (config?: { apiUrl?: string; apiKey?: string }): PaymentSplitService => {
  return new PaymentSplitService(config);
};

/**
 * Helper para processar split de pedido rapidamente
 */
export const processSplitForOrder = async (
  transactionId: string,
  totalAmount: number,
  orderData: {
    correlationID: string;
    productId: string;
    category: string;
  }
): Promise<SplitResult> => {
  const service = createPaymentSplitService();
  const result = await service.processSplitForOrder(transactionId, totalAmount, orderData);

  // Registrar em storage
  await service.logSplitTransaction(result, orderData);

  return result;
};

/**
 * Valida se split foi executado corretamente
 */
export const validateSplit = (splitResult: SplitResult): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];

  // Verificar se todos os splits foram bem-sucedidos
  const failedSplits = splitResult.splits.filter((s) => s.status !== 'success');
  if (failedSplits.length > 0) {
    issues.push(`${failedSplits.length} splits falharam`);
  }

  // Verificar se soma dos valores está correta
  const totalSplit = splitResult.splits.reduce((sum, s) => sum + s.amount, 0);
  if (Math.abs(totalSplit - splitResult.totalAmount) > 1) {
    // Tolerância de 1 centavo por arredondamento
    issues.push(`Soma dos splits (${totalSplit}) difere do total (${splitResult.totalAmount})`);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
};
