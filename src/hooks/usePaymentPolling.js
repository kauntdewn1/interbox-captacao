/**
 * usePaymentPolling Hook
 * Hook reutilizável para polling de status de pagamento PIX
 *
 * Consolida lógica duplicada de ProdutoDetalhes.tsx e CheckoutCard.tsx
 */
import { useEffect, useRef, useState, useCallback } from 'react';
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
export const usePaymentPolling = (identifiers, options = {}) => {
    const { intervalMs = 5000, timeoutMs = 300000, // 5 minutos
    statusUrl = '/.netlify/functions/get-payment-status', debug = false, onSuccess, onTimeout, onError, } = options;
    const [status, setStatus] = useState('pending');
    const [isPolling, setIsPolling] = useState(false);
    const [isTimedOut, setIsTimedOut] = useState(false);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);
    const startTimeRef = useRef(0);
    const isActiveRef = useRef(false);
    const log = useCallback((...args) => {
        if (debug) {
            console.log('[usePaymentPolling]', ...args);
        }
    }, [debug]);
    /**
     * Verifica status do pagamento
     */
    const checkPaymentStatus = useCallback(async () => {
        const { identifier, correlationID } = identifiers;
        if (!identifier && !correlationID) {
            log('Nenhum identificador fornecido');
            return;
        }
        try {
            // Montar query string
            const qs = identifier
                ? `identifier=${encodeURIComponent(identifier)}`
                : `correlationID=${encodeURIComponent(correlationID)}`;
            log('Verificando status:', { identifier, correlationID });
            const response = await fetch(`${statusUrl}?${qs}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.toLowerCase().includes('application/json')) {
                const rawText = await response.text();
                // incluir um trecho do body para facilitar debug
                const snippet = rawText.slice(0, 120).replace(/\s+/g, ' ').trim();
                throw new Error(`Resposta não-JSON recebida (content-type: ${contentType}). Trecho: ${snippet}`);
            }
            let data;
            try {
                data = (await response.json());
            }
            catch {
                const rawText = await response.text();
                const snippet = rawText.slice(0, 120).replace(/\s+/g, ' ').trim();
                throw new Error(`Falha ao parsear JSON. Trecho: ${snippet}`);
            }
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
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            log('❌ Erro ao verificar status:', error.message);
            setError(error);
            onError?.(error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
function normalizeStatus(status) {
    if (!status)
        return 'pending';
    const normalized = status.toLowerCase();
    // Status de sucesso
    if (normalized === 'paid' ||
        normalized === 'completed' ||
        normalized === 'active_paid' ||
        normalized === 'confirmed') {
        return 'paid';
    }
    // Status expirado/cancelado
    if (normalized === 'expired' ||
        normalized === 'cancelled' ||
        normalized === 'failed' ||
        normalized === 'rejected') {
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
function isPaidStatus(status) {
    return status === 'paid' || status === 'completed';
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
export const usePaymentPollingWithRedirect = (identifiers, options, navigate) => {
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
