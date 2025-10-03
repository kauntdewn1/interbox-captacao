/**
 * Logger Service - Sistema centralizado de logs
 * Responsabilidade única: gerenciar logs estruturados e observabilidade
 */
// ============================================================================
// Logger Service
// ============================================================================
export class LoggerService {
    serviceName;
    isProduction;
    constructor(serviceName = 'app') {
        this.serviceName = serviceName;
        this.isProduction = process.env.NODE_ENV === 'production';
    }
    /**
     * Formata log entry para output estruturado
     */
    formatLog(entry) {
        const { level, message, context, error } = entry;
        const prefix = this.getLogPrefix(level);
        const service = `[${this.serviceName}]`;
        let output = `${prefix} ${service} ${message}`;
        if (context && Object.keys(context).length > 0) {
            output += `\n  Context: ${JSON.stringify(context, null, 2)}`;
        }
        if (error) {
            output += `\n  Error: ${error.message}`;
            if (error.stack && !this.isProduction) {
                output += `\n  Stack: ${error.stack}`;
            }
        }
        return output;
    }
    /**
     * Retorna emoji/prefix baseado no level
     */
    getLogPrefix(level) {
        const prefixes = {
            debug: '🔍',
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
            success: '✅',
        };
        return prefixes[level] || 'ℹ️';
    }
    /**
     * Decide se deve logar baseado no level e ambiente
     */
    shouldLog(level) {
        // Em produção, não logar debug
        if (this.isProduction && level === 'debug') {
            return false;
        }
        return true;
    }
    /**
     * Log genérico
     */
    log(level, message, context, error) {
        if (!this.shouldLog(level))
            return;
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            error,
        };
        const formatted = this.formatLog(entry);
        // Output para console apropriado
        switch (level) {
            case 'error':
                console.error(formatted);
                break;
            case 'warn':
                console.warn(formatted);
                break;
            case 'debug':
                console.debug(formatted);
                break;
            default:
                console.log(formatted);
        }
    }
    /**
     * Debug log (apenas em desenvolvimento)
     */
    debug(message, context) {
        this.log('debug', message, context);
    }
    /**
     * Info log
     */
    info(message, context) {
        this.log('info', message, context);
    }
    /**
     * Warning log
     */
    warn(message, context) {
        this.log('warn', message, context);
    }
    /**
     * Error log
     */
    error(message, error, context) {
        this.log('error', message, context, error);
    }
    /**
     * Success log
     */
    success(message, context) {
        this.log('success', message, context);
    }
}
// ============================================================================
// Domain-Specific Loggers
// ============================================================================
/**
 * Logger específico para pagamentos
 */
export class PaymentLogger extends LoggerService {
    constructor() {
        super('payment');
    }
    chargeCreated(correlationID, amount, customer) {
        this.success('Charge criado com sucesso', {
            correlationID,
            amount_cents: amount,
            customer,
        });
    }
    chargeFailed(correlationID, error) {
        this.error('Falha ao criar charge', error, { correlationID });
    }
    chargeStatusChanged(correlationID, oldStatus, newStatus) {
        this.info('Status do charge alterado', {
            correlationID,
            old_status: oldStatus,
            new_status: newStatus,
        });
    }
    paymentReceived(correlationID, txid, amount) {
        this.success('Pagamento PIX recebido', {
            correlationID,
            txid,
            amount_cents: amount,
        });
    }
}
/**
 * Logger específico para storage
 */
export class StorageLogger extends LoggerService {
    constructor() {
        super('storage');
    }
    orderSaved(orderId, correlationID) {
        this.success('Pedido salvo', { order_id: orderId, correlationID });
    }
    orderUpdated(orderId, oldStatus, newStatus) {
        this.info('Pedido atualizado', {
            order_id: orderId,
            old_status: oldStatus,
            new_status: newStatus,
        });
    }
    reviewSaved(reviewId, produtoId, nota) {
        this.success('Avaliação salva', {
            review_id: reviewId,
            produto_id: produtoId,
            nota,
        });
    }
    storageFailed(operation, file, error) {
        this.error(`Falha em ${operation}`, error, { file });
    }
}
/**
 * Logger específico para webhooks
 */
export class WebhookLogger extends LoggerService {
    constructor() {
        super('webhook');
    }
    webhookReceived(event, correlationID) {
        this.info('Webhook recebido', {
            event,
            correlationID,
        });
    }
    webhookProcessed(event, correlationID, duration) {
        this.success('Webhook processado', {
            event,
            correlationID,
            duration_ms: duration,
        });
    }
    webhookFailed(event, error, correlationID) {
        this.error('Falha ao processar webhook', error, {
            event,
            correlationID,
        });
    }
}
// ============================================================================
// Singleton Instances
// ============================================================================
let paymentLogger = null;
let storageLogger = null;
let webhookLogger = null;
export const getPaymentLogger = () => {
    if (!paymentLogger) {
        paymentLogger = new PaymentLogger();
    }
    return paymentLogger;
};
export const getStorageLogger = () => {
    if (!storageLogger) {
        storageLogger = new StorageLogger();
    }
    return storageLogger;
};
export const getWebhookLogger = () => {
    if (!webhookLogger) {
        webhookLogger = new WebhookLogger();
    }
    return webhookLogger;
};
// ============================================================================
// Utility Functions
// ============================================================================
/**
 * Cria logger customizado para um serviço específico
 */
export const createLogger = (serviceName) => {
    return new LoggerService(serviceName);
};
/**
 * Log rápido de erro com stack trace
 */
export const logError = (message, error, context) => {
    const logger = new LoggerService('app');
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(message, err, context);
};
/**
 * Log rápido de sucesso
 */
export const logSuccess = (message, context) => {
    const logger = new LoggerService('app');
    logger.success(message, context);
};
/**
 * Performance timer helper
 */
export class PerformanceTimer {
    startTime;
    logger;
    operationName;
    constructor(operationName, logger) {
        this.startTime = Date.now();
        this.operationName = operationName;
        this.logger = logger || new LoggerService('perf');
    }
    /**
     * Finaliza timer e loga duração
     */
    end(context) {
        const duration = Date.now() - this.startTime;
        this.logger.debug(`${this.operationName} completed`, {
            ...context,
            duration_ms: duration,
        });
        return duration;
    }
}
/**
 * Helper para medir performance de funções
 */
export const measurePerformance = async (operationName, fn) => {
    const timer = new PerformanceTimer(operationName);
    try {
        const result = await fn();
        timer.end({ status: 'success' });
        return result;
    }
    catch (error) {
        timer.end({ status: 'error' });
        throw error;
    }
};
