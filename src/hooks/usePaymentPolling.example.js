import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Exemplos de Uso - usePaymentPolling Hook
 * Demonstra como usar o hook em diferentes cenários
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentPolling, usePaymentPollingWithRedirect, } from './usePaymentPolling';
// ============================================================================
// Exemplo 1: Uso Básico (ProdutoDetalhes)
// ============================================================================
export function ExemploBasico() {
    const { status, isPolling, isTimedOut } = usePaymentPolling({
        identifier: 'charge_abc123',
        correlationID: 'interbox_prod_camiseta_123',
    }, {
        intervalMs: 5000, // 5 segundos
        timeoutMs: 300000, // 5 minutos
        debug: true,
        onSuccess: (data) => {
            console.log('✅ Pagamento confirmado!', data);
            alert('Pagamento aprovado!');
        },
        onTimeout: () => {
            console.log('⏰ Pagamento expirou');
            alert('O tempo para pagamento expirou. Gere um novo PIX.');
        },
    });
    return (_jsxs("div", { children: [_jsx("h2", { children: "Status do Pagamento" }), isPolling && (_jsx("div", { className: "animate-pulse", children: "\u23F3 Aguardando confirma\u00E7\u00E3o..." })), status === 'paid' && (_jsx("div", { className: "text-green-500", children: "\u2705 Pagamento confirmado!" })), isTimedOut && (_jsx("div", { className: "text-red-500", children: "\u23F0 Pagamento expirado" })), _jsxs("p", { children: ["Status atual: ", _jsx("strong", { children: status })] })] }));
}
// ============================================================================
// Exemplo 2: Com Auto-Redirect (CheckoutCard)
// ============================================================================
export function ExemploComRedirect() {
    const navigate = useNavigate();
    const { status, isPolling } = usePaymentPollingWithRedirect({ correlationID: 'interbox_audiovisual_123' }, {
        intervalMs: 10000, // 10 segundos
        successPath: '/audiovisual/success',
        successState: {
            amount: 2990,
            type: 'audiovisual',
        },
    }, navigate);
    return (_jsxs("div", { children: [isPolling && _jsx("p", { children: "\u23F3 Verificando pagamento automaticamente..." }), _jsxs("p", { children: ["Status: ", status] })] }));
}
// ============================================================================
// Exemplo 3: Controle Manual (Avançado)
// ============================================================================
export function ExemploControleManual() {
    const { status, isPolling, error, startPolling, stopPolling, reset, } = usePaymentPolling({ identifier: '' }, // Vazio inicialmente
    {
        intervalMs: 5000,
        debug: true,
    });
    const handleGerarPIX = () => {
        // Após gerar PIX, iniciar polling manualmente
        // (normalmente os identificadores viriam da API)
        startPolling();
    };
    return (_jsxs("div", { children: [_jsx("button", { onClick: handleGerarPIX, disabled: isPolling, children: "Gerar PIX" }), _jsx("button", { onClick: stopPolling, disabled: !isPolling, children: "Parar Verifica\u00E7\u00E3o" }), _jsx("button", { onClick: reset, children: "Resetar" }), _jsxs("div", { children: [_jsxs("p", { children: ["Status: ", status] }), _jsxs("p", { children: ["Polling: ", isPolling ? 'Ativo' : 'Inativo'] }), error && _jsxs("p", { className: "text-red-500", children: ["Erro: ", error.message] })] })] }));
}
// ============================================================================
// Exemplo 4: Com Loading States Customizados
// ============================================================================
export function ExemploLoadingStates() {
    const { status, isPolling, isTimedOut } = usePaymentPolling({ correlationID: 'interbox_123' }, {
        intervalMs: 5000,
        onSuccess: () => {
            // Redirect ou ação customizada
        },
    });
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'pending':
                return {
                    icon: '⏳',
                    text: 'Aguardando pagamento',
                    color: 'text-yellow-500',
                };
            case 'paid':
                return {
                    icon: '✅',
                    text: 'Pagamento confirmado!',
                    color: 'text-green-500',
                };
            case 'expired':
                return {
                    icon: '❌',
                    text: 'Pagamento expirou',
                    color: 'text-red-500',
                };
            default:
                return {
                    icon: '❓',
                    text: 'Status desconhecido',
                    color: 'text-gray-500',
                };
        }
    };
    const display = getStatusDisplay(status);
    return (_jsxs("div", { className: "p-6 bg-white rounded-lg shadow", children: [_jsxs("div", { className: `text-2xl ${display.color}`, children: [display.icon, " ", display.text] }), isPolling && (_jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-500 h-2 rounded-full animate-pulse w-1/2" }) }), _jsx("p", { className: "text-sm text-gray-600 mt-2", children: "Verificando automaticamente..." })] })), isTimedOut && (_jsxs("div", { className: "mt-4 p-4 bg-red-100 rounded", children: [_jsx("p", { className: "text-red-800", children: "O tempo para pagamento expirou. Por favor, gere um novo PIX." }), _jsx("button", { className: "mt-2 px-4 py-2 bg-red-600 text-white rounded", children: "Gerar Novo PIX" })] }))] }));
}
// ============================================================================
// Exemplo 5: Múltiplos Pagamentos (Array de Charges)
// ============================================================================
export function ExemploMultiplosPagamentos() {
    const charges = [
        { id: '1', correlationID: 'interbox_123' },
        { id: '2', correlationID: 'interbox_456' },
        { id: '3', correlationID: 'interbox_789' },
    ];
    return (_jsxs("div", { children: [_jsx("h2", { children: "Status de M\u00FAltiplos Pagamentos" }), charges.map((charge) => (_jsx(ChargeStatusItem, { correlationID: charge.correlationID }, charge.id)))] }));
}
function ChargeStatusItem({ correlationID }) {
    const { status, isPolling } = usePaymentPolling({ correlationID }, {
        intervalMs: 10000,
        onSuccess: () => {
            console.log(`✅ ${correlationID} pago!`);
        },
    });
    return (_jsxs("div", { className: "border p-4 mb-2 rounded", children: [_jsx("p", { className: "font-mono text-sm", children: correlationID }), _jsxs("p", { className: "text-lg", children: ["Status: ", _jsx("span", { className: "font-bold", children: status })] }), isPolling && _jsx("span", { className: "text-blue-500", children: "\uD83D\uDD04 Verificando..." })] }));
}
// ============================================================================
// Exemplo 6: Com Notificações Toast
// ============================================================================
export function ExemploComToast() {
    // Assumindo que você tem um sistema de toast
    const showToast = (message, type) => {
        console.log(`[${type}] ${message}`);
        // toast.show(message, type);
    };
    const { status } = usePaymentPolling({ correlationID: 'interbox_123' }, {
        intervalMs: 5000,
        onSuccess: () => {
            showToast('Pagamento confirmado! 🎉', 'success');
        },
        onTimeout: () => {
            showToast('Pagamento expirou. Gere um novo PIX.', 'error');
        },
        onError: (error) => {
            showToast(`Erro: ${error.message}`, 'error');
        },
    });
    return (_jsx("div", { children: _jsxs("p", { children: ["Status: ", status] }) }));
}
// ============================================================================
// Exemplo 7: Condicional (Só pollar se houver PIX gerado)
// ============================================================================
export function ExemploCondicional() {
    const [pixGerado, setPixGerado] = useState(false);
    const [chargeData, setChargeData] = useState({});
    const { status, isPolling } = usePaymentPolling({
        correlationID: pixGerado ? chargeData.correlationID : undefined,
    }, {
        intervalMs: 5000,
        onSuccess: () => {
            alert('Pagamento confirmado!');
        },
    });
    const handleGerarPIX = async () => {
        // Chamar API para gerar PIX
        const response = await fetch('/.netlify/functions/create-charge', {
            method: 'POST',
            body: JSON.stringify({ /* ... */}),
        });
        const data = await response.json();
        setChargeData({ correlationID: data.charge.correlationID });
        setPixGerado(true);
    };
    return (_jsx("div", { children: !pixGerado ? (_jsx("button", { onClick: handleGerarPIX, children: "Gerar PIX" })) : (_jsxs("div", { children: [_jsx("p", { children: "PIX gerado! Aguardando pagamento..." }), _jsxs("p", { children: ["Status: ", status] }), isPolling && _jsx("p", { children: "\uD83D\uDD04 Verificando..." })] })) }));
}
