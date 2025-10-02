/**
 * Logger Service - Sistema centralizado de logs
 * Responsabilidade única: gerenciar logs estruturados e observabilidade
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export interface LogContext {
	[key: string]: unknown;
}

export interface LogEntry {
	timestamp: string;
	level: LogLevel;
	message: string;
	context?: LogContext;
	error?: Error;
}

// ============================================================================
// Logger Service
// ============================================================================

export class LoggerService {
	private serviceName: string;
	private isProduction: boolean;

	constructor(serviceName: string = 'app') {
		this.serviceName = serviceName;
		this.isProduction = process.env.NODE_ENV === 'production';
	}

	/**
	 * Formata log entry para output estruturado
	 */
	private formatLog(entry: LogEntry): string {
		const { timestamp, level, message, context, error } = entry;

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
	private getLogPrefix(level: LogLevel): string {
		const prefixes: Record<LogLevel, string> = {
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
	private shouldLog(level: LogLevel): boolean {
		// Em produção, não logar debug
		if (this.isProduction && level === 'debug') {
			return false;
		}
		return true;
	}

	/**
	 * Log genérico
	 */
	private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
		if (!this.shouldLog(level)) return;

		const entry: LogEntry = {
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
	debug(message: string, context?: LogContext): void {
		this.log('debug', message, context);
	}

	/**
	 * Info log
	 */
	info(message: string, context?: LogContext): void {
		this.log('info', message, context);
	}

	/**
	 * Warning log
	 */
	warn(message: string, context?: LogContext): void {
		this.log('warn', message, context);
	}

	/**
	 * Error log
	 */
	error(message: string, error?: Error, context?: LogContext): void {
		this.log('error', message, context, error);
	}

	/**
	 * Success log
	 */
	success(message: string, context?: LogContext): void {
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

	chargeCreated(correlationID: string, amount: number, customer: string): void {
		this.success('Charge criado com sucesso', {
			correlationID,
			amount_cents: amount,
			customer,
		});
	}

	chargeFailed(correlationID: string, error: Error): void {
		this.error('Falha ao criar charge', error, { correlationID });
	}

	chargeStatusChanged(correlationID: string, oldStatus: string, newStatus: string): void {
		this.info('Status do charge alterado', {
			correlationID,
			old_status: oldStatus,
			new_status: newStatus,
		});
	}

	paymentReceived(correlationID: string, txid: string, amount: number): void {
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

	orderSaved(orderId: string, correlationID: string): void {
		this.success('Pedido salvo', { order_id: orderId, correlationID });
	}

	orderUpdated(orderId: string, oldStatus: string, newStatus: string): void {
		this.info('Pedido atualizado', {
			order_id: orderId,
			old_status: oldStatus,
			new_status: newStatus,
		});
	}

	reviewSaved(reviewId: string, produtoId: string, nota: number): void {
		this.success('Avaliação salva', {
			review_id: reviewId,
			produto_id: produtoId,
			nota,
		});
	}

	storageFailed(operation: string, file: string, error: Error): void {
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

	webhookReceived(event: string, correlationID?: string): void {
		this.info('Webhook recebido', {
			event,
			correlationID,
		});
	}

	webhookProcessed(event: string, correlationID?: string, duration?: number): void {
		this.success('Webhook processado', {
			event,
			correlationID,
			duration_ms: duration,
		});
	}

	webhookFailed(event: string, error: Error, correlationID?: string): void {
		this.error('Falha ao processar webhook', error, {
			event,
			correlationID,
		});
	}
}

// ============================================================================
// Singleton Instances
// ============================================================================

let paymentLogger: PaymentLogger | null = null;
let storageLogger: StorageLogger | null = null;
let webhookLogger: WebhookLogger | null = null;

export const getPaymentLogger = (): PaymentLogger => {
	if (!paymentLogger) {
		paymentLogger = new PaymentLogger();
	}
	return paymentLogger;
};

export const getStorageLogger = (): StorageLogger => {
	if (!storageLogger) {
		storageLogger = new StorageLogger();
	}
	return storageLogger;
};

export const getWebhookLogger = (): WebhookLogger => {
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
export const createLogger = (serviceName: string): LoggerService => {
	return new LoggerService(serviceName);
};

/**
 * Log rápido de erro com stack trace
 */
export const logError = (message: string, error: unknown, context?: LogContext): void => {
	const logger = new LoggerService('app');
	const err = error instanceof Error ? error : new Error(String(error));
	logger.error(message, err, context);
};

/**
 * Log rápido de sucesso
 */
export const logSuccess = (message: string, context?: LogContext): void => {
	const logger = new LoggerService('app');
	logger.success(message, context);
};

/**
 * Performance timer helper
 */
export class PerformanceTimer {
	private startTime: number;
	private logger: LoggerService;
	private operationName: string;

	constructor(operationName: string, logger?: LoggerService) {
		this.startTime = Date.now();
		this.operationName = operationName;
		this.logger = logger || new LoggerService('perf');
	}

	/**
	 * Finaliza timer e loga duração
	 */
	end(context?: LogContext): number {
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
export const measurePerformance = async <T>(
	operationName: string,
	fn: () => Promise<T>
): Promise<T> => {
	const timer = new PerformanceTimer(operationName);
	try {
		const result = await fn();
		timer.end({ status: 'success' });
		return result;
	} catch (error) {
		timer.end({ status: 'error' });
		throw error;
	}
};
