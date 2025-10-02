/**
 * Exemplos de Uso - usePaymentPolling Hook
 * Demonstra como usar o hook em diferentes cenários
 */

import { useNavigate } from 'react-router-dom';
import {
	usePaymentPolling,
	usePaymentPollingWithRedirect,
	type PaymentStatus,
} from './usePaymentPolling';

// ============================================================================
// Exemplo 1: Uso Básico (ProdutoDetalhes)
// ============================================================================

export function ExemploBasico() {
	const { status, isPolling, isTimedOut } = usePaymentPolling(
		{
			identifier: 'charge_abc123',
			correlationID: 'interbox_prod_camiseta_123',
		},
		{
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
		}
	);

	return (
		<div>
			<h2>Status do Pagamento</h2>

			{isPolling && (
				<div className="animate-pulse">
					⏳ Aguardando confirmação...
				</div>
			)}

			{status === 'paid' && (
				<div className="text-green-500">
					✅ Pagamento confirmado!
				</div>
			)}

			{isTimedOut && (
				<div className="text-red-500">
					⏰ Pagamento expirado
				</div>
			)}

			<p>Status atual: <strong>{status}</strong></p>
		</div>
	);
}

// ============================================================================
// Exemplo 2: Com Auto-Redirect (CheckoutCard)
// ============================================================================

export function ExemploComRedirect() {
	const navigate = useNavigate();

	const { status, isPolling } = usePaymentPollingWithRedirect(
		{ correlationID: 'interbox_audiovisual_123' },
		{
			intervalMs: 10000, // 10 segundos
			successPath: '/audiovisual/success',
			successState: {
				amount: 2990,
				type: 'audiovisual',
			},
		},
		navigate
	);

	return (
		<div>
			{isPolling && <p>⏳ Verificando pagamento automaticamente...</p>}
			<p>Status: {status}</p>
		</div>
	);
}

// ============================================================================
// Exemplo 3: Controle Manual (Avançado)
// ============================================================================

export function ExemploControleManual() {
	const {
		status,
		isPolling,
		error,
		startPolling,
		stopPolling,
		reset,
	} = usePaymentPolling(
		{ identifier: '' }, // Vazio inicialmente
		{
			intervalMs: 5000,
			debug: true,
		}
	);

	const handleGerarPIX = () => {
		// Após gerar PIX, iniciar polling manualmente
		// (normalmente os identificadores viriam da API)
		startPolling();
	};

	return (
		<div>
			<button onClick={handleGerarPIX} disabled={isPolling}>
				Gerar PIX
			</button>

			<button onClick={stopPolling} disabled={!isPolling}>
				Parar Verificação
			</button>

			<button onClick={reset}>
				Resetar
			</button>

			<div>
				<p>Status: {status}</p>
				<p>Polling: {isPolling ? 'Ativo' : 'Inativo'}</p>
				{error && <p className="text-red-500">Erro: {error.message}</p>}
			</div>
		</div>
	);
}

// ============================================================================
// Exemplo 4: Com Loading States Customizados
// ============================================================================

export function ExemploLoadingStates() {
	const { status, isPolling, isTimedOut } = usePaymentPolling(
		{ correlationID: 'interbox_123' },
		{
			intervalMs: 5000,
			onSuccess: () => {
				// Redirect ou ação customizada
			},
		}
	);

	const getStatusDisplay = (status: PaymentStatus) => {
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

	return (
		<div className="p-6 bg-white rounded-lg shadow">
			<div className={`text-2xl ${display.color}`}>
				{display.icon} {display.text}
			</div>

			{isPolling && (
				<div className="mt-4">
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div className="bg-blue-500 h-2 rounded-full animate-pulse w-1/2"></div>
					</div>
					<p className="text-sm text-gray-600 mt-2">
						Verificando automaticamente...
					</p>
				</div>
			)}

			{isTimedOut && (
				<div className="mt-4 p-4 bg-red-100 rounded">
					<p className="text-red-800">
						O tempo para pagamento expirou. Por favor, gere um novo PIX.
					</p>
					<button className="mt-2 px-4 py-2 bg-red-600 text-white rounded">
						Gerar Novo PIX
					</button>
				</div>
			)}
		</div>
	);
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

	return (
		<div>
			<h2>Status de Múltiplos Pagamentos</h2>
			{charges.map((charge) => (
				<ChargeStatusItem key={charge.id} correlationID={charge.correlationID} />
			))}
		</div>
	);
}

function ChargeStatusItem({ correlationID }: { correlationID: string }) {
	const { status, isPolling } = usePaymentPolling(
		{ correlationID },
		{
			intervalMs: 10000,
			onSuccess: () => {
				console.log(`✅ ${correlationID} pago!`);
			},
		}
	);

	return (
		<div className="border p-4 mb-2 rounded">
			<p className="font-mono text-sm">{correlationID}</p>
			<p className="text-lg">
				Status: <span className="font-bold">{status}</span>
			</p>
			{isPolling && <span className="text-blue-500">🔄 Verificando...</span>}
		</div>
	);
}

// ============================================================================
// Exemplo 6: Com Notificações Toast
// ============================================================================

export function ExemploComToast() {
	// Assumindo que você tem um sistema de toast
	const showToast = (message: string, type: 'success' | 'error' | 'info') => {
		console.log(`[${type}] ${message}`);
		// toast.show(message, type);
	};

	const { status } = usePaymentPolling(
		{ correlationID: 'interbox_123' },
		{
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
		}
	);

	return (
		<div>
			<p>Status: {status}</p>
		</div>
	);
}

// ============================================================================
// Exemplo 7: Condicional (Só pollar se houver PIX gerado)
// ============================================================================

export function ExemploCondicional() {
	const [pixGerado, setPixGerado] = useState(false);
	const [chargeData, setChargeData] = useState<{ correlationID?: string }>({});

	const { status, isPolling } = usePaymentPolling(
		{
			correlationID: pixGerado ? chargeData.correlationID : undefined,
		},
		{
			intervalMs: 5000,
			onSuccess: () => {
				alert('Pagamento confirmado!');
			},
		}
	);

	const handleGerarPIX = async () => {
		// Chamar API para gerar PIX
		const response = await fetch('/.netlify/functions/create-charge', {
			method: 'POST',
			body: JSON.stringify({ /* ... */ }),
		});

		const data = await response.json();

		setChargeData({ correlationID: data.charge.correlationID });
		setPixGerado(true);
	};

	return (
		<div>
			{!pixGerado ? (
				<button onClick={handleGerarPIX}>
					Gerar PIX
				</button>
			) : (
				<div>
					<p>PIX gerado! Aguardando pagamento...</p>
					<p>Status: {status}</p>
					{isPolling && <p>🔄 Verificando...</p>}
				</div>
			)}
		</div>
	);
}
