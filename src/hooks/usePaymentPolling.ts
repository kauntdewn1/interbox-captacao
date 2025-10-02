/**
 * usePaymentPolling Hook
 * Hook reutilizável para polling de status de pagamento PIX
 *
 * Consolida lógica duplicada de ProdutoDetalhes.tsx e CheckoutCard.tsx
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type PaymentStatus = 'pending' | 'paid' | 'expired' | 'active' | 'completed';

export interface PaymentPollingOptions {
	/**
	 * Intervalo de polling em milissegundos
	 * @default 5000 (5 segundos)
	 */
	intervalMs?: number;

	/**
	 * Timeout máximo em milissegundos
	 * @default 300000 (5 minutos)
	 */
	timeoutMs?: number;

	/**
	 * URL base para verificar status
	 * @default '/.netlify/functions/get-payment-status'
	 */
	statusUrl?: string;

	/**
	 * Habilitar logs de debug
	 * @default false
	 */
	debug?: boolean;

	/**
	 * Callback quando pagamento é confirmado
	 */
	onSuccess?: (data: unknown) => void;

	/**
	 * Callback quando polling expira
	 */
	onTimeout?: () => void;

	/**
	 * Callback quando ocorre erro
	 */
	onError?: (error: Error) => void;
}

export interface PaymentPollingResult {
	/** Status atual do pagamento */
	status: PaymentStatus;

	/** Se está ativamente fazendo polling */
	isPolling: boolean;

	/** Se houve timeout */
	isTimedOut: boolean;

	/** Último erro ocorrido */
	error: Error | null;

	/** Inicia o polling manualmente */
	startPolling: () => void;

	/** Para o polling manualmente */
	stopPolling: () => void;

	/** Reseta o estado */
	reset: () => void;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook para fazer polling de status de pagamento PIX
 *
 * @example
 * ```tsx
 * const { status, isPolling } = usePaymentPolling(
 *   { identifier: 'charge_123' },
 *   {
 *     intervalMs: 5000,
 *     onSuccess: (data) => console.log('Pago!', data),
 *     onTimeout: () => console.log('Expirou'),
 *   }
 * );
 *
 * return <div>Status: {status}</div>;
 * ```
 */
export const usePaymentPolling = (
	identifiers: {
		identifier?: string;
		correlationID?: string;
	},
	options: PaymentPollingOptions = {}
): PaymentPollingResult => {
	const {
		intervalMs = 5000,
		timeoutMs = 300000, // 5 minutos
		statusUrl = '/.netlify/functions/get-payment-status',
		debug = false,
		onSuccess,
		onTimeout,
		onError,
	} = options;

	const [status, setStatus] = useState<PaymentStatus>('pending');
	const [isPolling, setIsPolling] = useState(false);
	const [isTimedOut, setIsTimedOut] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const startTimeRef = useRef<number>(0);
	const isActiveRef = useRef(false);

	const log = useCallback(
		(...args: unknown[]) => {
			if (debug) {
				console.log('[usePaymentPolling]', ...args);
			}
		},
		[debug]
	);

	/**
	 * Verifica status do pagamento
	 */
	const checkPaymentStatus = useCallback(async (): Promise<void> => {
		const { identifier, correlationID } = identifiers;

		if (!identifier && !correlationID) {
			log('Nenhum identificador fornecido');
			return;
		}

		try {
			// Montar query string
			const qs = identifier
				? `identifier=${encodeURIComponent(identifier)}`
				: `correlationID=${encodeURIComponent(correlationID!)}`;

			log('Verificando status:', { identifier, correlationID });

			const response = await fetch(`${statusUrl}?${qs}`);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();

			log('Resposta recebida:', data);

			// Normalizar status de diferentes APIs
			const normalizedStatus = normalizeStatus(data?.status || data?.charge?.status);

			log('Status normalizado:', normalizedStatus);

			// Atualizar status
			setStatus(normalizedStatus);

			// Verificar se foi pago
			if (isPaidStatus(normalizedStatus)) {
				log('✅ Pagamento confirmado!');
				stopPolling();
				onSuccess?.(data);
			}
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err));
			log('❌ Erro ao verificar status:', error.message);
			setError(error);
			onError?.(error);
		}
	}, [identifiers, statusUrl, log, onSuccess, onError]);

	/**
	 * Inicia o polling
	 */
	const startPolling = useCallback(() => {
		if (isActiveRef.current) {
			log('Polling já está ativo');
			return;
		}

		log('🚀 Iniciando polling');

		isActiveRef.current = true;
		setIsPolling(true);
		setIsTimedOut(false);
		setError(null);
		startTimeRef.current = Date.now();

		// Primeira verificação imediata
		checkPaymentStatus();

		// Polling periódico
		intervalRef.current = setInterval(() => {
			const elapsed = Date.now() - startTimeRef.current;

			// Verificar timeout
			if (elapsed > timeoutMs) {
				log('⏰ Timeout atingido');
				stopPolling();
				setStatus('expired');
				setIsTimedOut(true);
				onTimeout?.();
				return;
			}

			// Verificar status
			checkPaymentStatus();
		}, intervalMs);
	}, [checkPaymentStatus, intervalMs, timeoutMs, log, onTimeout]);

	/**
	 * Para o polling
	 */
	const stopPolling = useCallback(() => {
		log('🛑 Parando polling');

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		isActiveRef.current = false;
		setIsPolling(false);
	}, [log]);

	/**
	 * Reseta o estado
	 */
	const reset = useCallback(() => {
		log('🔄 Resetando estado');
		stopPolling();
		setStatus('pending');
		setIsTimedOut(false);
		setError(null);
	}, [stopPolling, log]);

	/**
	 * Cleanup ao desmontar
	 */
	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	/**
	 * Auto-start quando identificadores mudarem
	 */
	useEffect(() => {
		const { identifier, correlationID } = identifiers;

		if ((identifier || correlationID) && !isActiveRef.current) {
			startPolling();
		}

		return () => {
			// Não fazer stopPolling aqui para evitar interromper polling ativo
		};
	}, [identifiers.identifier, identifiers.correlationID, startPolling]);

	return {
		status,
		isPolling,
		isTimedOut,
		error,
		startPolling,
		stopPolling,
		reset,
	};
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normaliza status de diferentes APIs para padrão comum
 */
function normalizeStatus(status: string | undefined): PaymentStatus {
	if (!status) return 'pending';

	const normalized = status.toLowerCase();

	// Status de sucesso
	if (
		normalized === 'paid' ||
		normalized === 'completed' ||
		normalized === 'active_paid' ||
		normalized === 'confirmed'
	) {
		return 'paid';
	}

	// Status expirado/cancelado
	if (
		normalized === 'expired' ||
		normalized === 'cancelled' ||
		normalized === 'failed' ||
		normalized === 'rejected'
	) {
		return 'expired';
	}

	// Status ativo/pendente
	if (normalized === 'active' || normalized === 'pending' || normalized === 'waiting') {
		return 'pending';
	}

	return 'pending';
}

/**
 * Verifica se status indica pagamento confirmado
 */
function isPaidStatus(status: PaymentStatus): boolean {
	return status === 'paid' || status === 'completed';
}

// ============================================================================
// Variação com Auto-redirect
// ============================================================================

export interface UsePaymentPollingWithRedirectOptions
	extends Omit<PaymentPollingOptions, 'onSuccess'> {
	/** Path para redirecionar após pagamento */
	successPath: string;

	/** State para passar no redirect */
	successState?: Record<string, unknown>;
}

/**
 * Variação do hook que faz redirect automático após pagamento
 *
 * @example
 * ```tsx
 * usePaymentPollingWithRedirect(
 *   { identifier: 'charge_123' },
 *   {
 *     successPath: '/success',
 *     successState: { orderId: '123' }
 *   },
 *   navigate
 * );
 * ```
 */
export const usePaymentPollingWithRedirect = (
	identifiers: {
		identifier?: string;
		correlationID?: string;
	},
	options: UsePaymentPollingWithRedirectOptions,
	navigate: (path: string, options?: { state?: unknown }) => void
): Omit<PaymentPollingResult, 'startPolling' | 'stopPolling'> => {
	const { successPath, successState, ...pollingOptions } = options;

	const result = usePaymentPolling(identifiers, {
		...pollingOptions,
		onSuccess: (data) => {
			navigate(successPath, {
				state: {
					...successState,
					paymentData: data,
				},
			});
		},
	});

	return {
		status: result.status,
		isPolling: result.isPolling,
		isTimedOut: result.isTimedOut,
		error: result.error,
		reset: result.reset,
	};
};
